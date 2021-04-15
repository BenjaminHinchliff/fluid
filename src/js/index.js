import '../css/index.css';

import {scale} from 'gl-matrix/vec2';

import Shaders from '../shaders/shaders';
import MouseListener from './mouse';
import * as quad from './quad';
import * as fluidOps from './fluid_passes';
import {RenderPass} from './render_pass';
import {FrameBuffer} from './framebuffer';
import {makeCheckerboardArr} from './checkerboard';
import Controls from './controls';

const controls = new Controls(document.getElementById('controls'));

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('fluid');
const {width, height} = canvas;

const ctx = canvas.getContext('webgl');
if (ctx === null) {
  alert('unable to initialize webgl');
  throw new Error('unable to initialize webgl');
}

ctx.getExtension('OES_texture_float');
ctx.getExtension('OES_texture_float_linear');
ctx.getExtension('WEBGL_color_buffer_float');

ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

const mouse = new MouseListener(canvas);

const shaders = new Shaders(ctx);

const quadPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.quad],
    ['uTex'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const advectPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.advect],
    ['uDeltaT', 'uColorFieldTex', 'uVecFieldTex'],
    'aPosition',
    quad.vertices,
    quad.indices);

const forcePass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.force],
    ['uDeltaT', 'uRho', 'uForce', 'uImpulsePos', 'uVelocityFieldTexture'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const jacobiPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.jacobi],
    ['uDeltaX', 'uAlpha', 'uRBeta', 'uX', 'uB'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const divergencePass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.divergence],
    ['uDeltaX', 'uW'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const subtractPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.subtract],
    ['uDeltaX', 'uP', 'uW'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const boundaryPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.boundary],
    ['uDeltaX', 'uScale', 'uX'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const colorPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.color],
    ['uColor', 'uImpulsePos', 'uColorFieldTexture'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const vorticityPass = new RenderPass(
    ctx,
    [shaders.vert.standard, shaders.frag.vorticity],
    ['uDeltaT', 'uDeltaX', 'uVorticity', 'uV'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

let curVelocityField = new FrameBuffer(ctx, width, height);
let nextVelocityField = new FrameBuffer(ctx, width, height);

let curPressureField = new FrameBuffer(ctx, width, height);
let nextPressureField = new FrameBuffer(ctx, width, height);

let divergenceFb = new FrameBuffer(ctx, width, height);

const colorData = makeCheckerboardArr(width, height);
let curColorField = new FrameBuffer(ctx, width, height, colorData);
let nextColorField = new FrameBuffer(ctx, width, height);

const rho = 1e-3;
let lastTime = null;
const drawFrame = (time) => {
  const timeS = time / 1000.0;
  let deltaT = timeS - lastTime;
  // prevent chaos with dt of 0 and jumps after tabbing in
  if (lastTime === null || (deltaT > 1.0 / 10.0)) {
    deltaT = 1.0 / 60.0;
  }
  lastTime = timeS;

  const deltaX = 1.0 / width;

  if (mouse.down) {
    // add test force
    let force = [0.0, 0.0];
    force = scale(force, mouse.velocity, controls.force.value);
    [curVelocityField, nextVelocityField] = fluidOps.force(
        ctx,
        forcePass,
        deltaT,
        rho,
        force,
        mouse.position,
        curVelocityField,
        nextVelocityField,
    );

    // add color
    [curColorField, nextColorField] = fluidOps.color(
        ctx,
        colorPass,
        [1.0, 0.6, 0.0],
        mouse.position,
        curColorField,
        nextColorField,
    );
  }


  // advect velocity field
  [curVelocityField, nextVelocityField] = fluidOps.advection(
      ctx,
      advectPass,
      deltaT,
      curVelocityField,
      curVelocityField,
      nextVelocityField,
  );

  // viscously diffuse vector field
  {
    const iter = controls.jacobi.value;
    const viscosity = Math.pow(10, controls.viscosity.value);
    const alpha = (deltaX * deltaX) / (viscosity * deltaT);
    const rBeta = 1.0 / (4.0 + alpha);

    const bufs = [curVelocityField, nextVelocityField];
    for (let i = 0; i < iter; i += 1) {
      const jCur = bufs[i % 2];
      const jNext = bufs[(i + 1) % 2];

      jNext.bind(ctx);
      fluidOps.jacobiIteration(
          ctx,
          jacobiPass,
          deltaX,
          alpha,
          rBeta,
          jCur,
          jCur,
      );
      jNext.unbind(ctx);
    }
  }

  {
    divergenceFb = fluidOps.divergence(
        ctx,
        divergencePass,
        deltaX,
        curVelocityField,
        divergenceFb,
    );

    const alpha = -(deltaX * deltaX);
    const rBeta = 0.25;

    [curPressureField, nextPressureField] = fluidOps.jacobiMethod(
        ctx,
        jacobiPass,
        controls.jacobi.value,
        deltaX,
        alpha,
        rBeta,
        curPressureField,
        divergenceFb,
        nextPressureField,
    );
  }

  // gradient subtraction
  {
    [curVelocityField, nextVelocityField] = fluidOps.subtract(
        ctx,
        subtractPass,
        deltaX,
        curPressureField,
        curVelocityField,
        nextVelocityField,
    );
  }

  // boundaries
  // vel
  [curVelocityField, nextVelocityField] = fluidOps.boundary(
      ctx,
      boundaryPass,
      deltaX,
      -1.0,
      curVelocityField,
      nextVelocityField,
  );

  // pressure
  [curPressureField, nextPressureField] = fluidOps.boundary(
      ctx,
      boundaryPass,
      deltaX,
      1.0,
      curPressureField,
      nextPressureField,
  );

  // approximate small vortices (vorticity confinement)
  [curVelocityField, nextVelocityField] = fluidOps.vorticity(
      ctx,
      vorticityPass,
      deltaT,
      deltaX,
      controls.vorticity.value,
      curVelocityField,
      nextVelocityField,
  );

  // advect color field
  [curColorField, nextColorField] = fluidOps.advection(
      ctx,
      advectPass,
      deltaT,
      curColorField,
      curVelocityField,
      nextColorField,
  );

  // render texture

  ctx.clearColor(0.3, 0.8, 0.0, 1.0);
  ctx.clear(ctx.COLOR_BUFFER_BIT);
  quadPass.useProgram(ctx);

  ctx.uniform1i(quadPass.uniforms.uTex, 0);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, curColorField.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, quadPass.vertBuffer);
  ctx.vertexAttribPointer(quadPass.attribLoc, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(quadPass.attribLoc);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, quadPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  requestAnimationFrame(drawFrame);
};

requestAnimationFrame(drawFrame);
