import '../css/index.css';
import standardVertSrc from '../shaders/standard.vert';
import quadFragSrc from '../shaders/quad.frag';
import advectFragSrc from '../shaders/advection.frag';
import forceFragSrc from '../shaders/force.frag';
import jacobiFragSrc from '../shaders/jacobi.frag';
import divergenceFragSrc from '../shaders/divergence.frag';
import subtractFragSrc from '../shaders/subtract.frag';
// import colorFragSrc from '../shaders/dye.frag';

import {compileShader} from './shader';
import * as quad from './quad';
import * as fluidOps from './fluid_passes';
import {RenderPass} from './render_pass';
import {FrameBuffer} from './framebuffer';
import {makeCheckerboardArr} from './checkerboard';

// temp sim settings
const SETTINGS = {
  viscosity: 1e-6,
  iterations: 20,
};

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('fluid');
const size = window.innerHeight;
const width = canvas.width = size;
const height = canvas.height = size;

const gl = canvas.getContext('webgl');
if (gl === null) {
  alert('unable to initialize webgl');
  throw new Error('unable to initialize webgl');
}

gl.getExtension('OES_texture_float');
gl.getExtension('OES_texture_float_linear');
gl.getExtension('WEBGL_color_buffer_float');

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const standardVert = compileShader(
    gl,
    gl.VERTEX_SHADER,
    standardVertSrc,
);

const quadFrag = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    quadFragSrc,
);

const quadPass = new RenderPass(
    gl,
    [standardVert, quadFrag],
    ['uTex'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const advectFrag = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    advectFragSrc,
);

const advectPass = new RenderPass(
    gl,
    [standardVert, advectFrag],
    ['uDeltaT', 'uColorFieldTex', 'uVecFieldTex'],
    'aPosition',
    quad.vertices,
    quad.indices);

const forceFrag = compileShader(gl, gl.FRAGMENT_SHADER, forceFragSrc);

const forcePass = new RenderPass(
    gl,
    [standardVert, forceFrag],
    ['uDeltaT', 'uRho', 'uForce', 'uImpulsePos', 'uVelocityFieldTexture'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const jacobiFrag = compileShader(gl, gl.FRAGMENT_SHADER, jacobiFragSrc);

const jacobiPass = new RenderPass(
    gl,
    [standardVert, jacobiFrag],
    ['uDeltaX', 'uAlpha', 'uRBeta', 'uX', 'uB'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const divergenceFrag = compileShader(gl, gl.FRAGMENT_SHADER, divergenceFragSrc);

const divergencePass = new RenderPass(
    gl,
    [standardVert, divergenceFrag],
    ['uDeltaX', 'uW'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

const subtractFrag = compileShader(gl, gl.FRAGMENT_SHADER, subtractFragSrc);

const subtractPass = new RenderPass(
    gl,
    [standardVert, subtractFrag],
    ['uDeltaX', 'uP', 'uW'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

// const colorFrag = compileShader(gl, gl.FRAGMENT_SHADER, colorFragSrc);

// const colorPass = new RenderPass(
//     gl,
//     [standardVert, colorFrag],
//     ['uDeltaT', 'uRho', 'uColor', 'uImpulsePos', 'uColorFieldTexture'],
//     'aPosition',
//     quad.vertices,
//     quad.indices,
// );

let curVelocityField = new FrameBuffer(gl, width, height);
let nextVelocityField = new FrameBuffer(gl, width, height);

let curPressureField = new FrameBuffer(gl, width, height);
let nextPressureField = new FrameBuffer(gl, width, height);

let divergenceFb = new FrameBuffer(gl, width, height);

const colorData = makeCheckerboardArr(width, height);
let curColorField = new FrameBuffer(gl, width, height, colorData);
let nextColorField = new FrameBuffer(gl, width, height);

const rho = 1e-3;
let lastTime = null;
const drawFrame = (time) => {
  const timeS = time / 1000.0;
  let deltaT = 1.0 / 60.0;
  // prevent chaos
  if (lastTime === null) {
    deltaT = 1.0 / 60.0;
  }
  lastTime = timeS;

  const deltaX = 1.0 / width;

  // advect velocity field
  [curVelocityField, nextVelocityField] = fluidOps.advection(
      gl,
      advectPass,
      deltaT,
      curVelocityField,
      curVelocityField,
      nextVelocityField,
  );

  // viscously diffuse vector field
  {
    const iter = SETTINGS.iterations;
    const viscosity = SETTINGS.viscosity;
    const alpha = (deltaX * deltaX) / (viscosity * deltaT);
    const rBeta = 1.0 / (4.0 + alpha);

    const bufs = [curVelocityField, nextVelocityField];
    for (let i = 0; i < iter; i += 1) {
      const jCur = bufs[i % 2];
      const jNext = bufs[(i + 1) % 2];

      jNext.bind(gl);
      fluidOps.jacobiIteration(
          gl,
          jacobiPass,
          deltaX,
          alpha,
          rBeta,
          jCur,
          jCur,
      );
      jNext.unbind(gl);
    }
  }

  // add test force
  [curVelocityField, nextVelocityField] = fluidOps.force(
      gl,
      forcePass,
      deltaT,
      rho,
      [1.0, 0.5],
      [0.5, 0.5],
      curVelocityField,
      nextVelocityField,
  );

  {
    divergenceFb = fluidOps.divergence(
        gl,
        divergencePass,
        deltaX,
        curVelocityField,
        divergenceFb,
    );

    const alpha = -(deltaX * deltaX);
    const rBeta = 0.25;

    [curPressureField, nextPressureField] = fluidOps.jacobiMethod(
        gl,
        jacobiPass,
        SETTINGS.iterations,
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
        gl,
        subtractPass,
        deltaX,
        curPressureField,
        curVelocityField,
        nextVelocityField,
    );
  }

  //   // dye pass
  //   [curColorField, nextColorField] = fluidOps.color(
  //       gl,
  //       colorPass,
  //       [0.0, 0.0, 1.0],
  //       [0.5, 0.5],
  //       curColorField,
  //       nextColorField,
  //   );

  // advect color field
  [curColorField, nextColorField] = fluidOps.advection(
      gl,
      advectPass,
      deltaT,
      curColorField,
      curVelocityField,
      nextColorField,
  );

  // render texture

  gl.clearColor(0.3, 0.8, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  quadPass.useProgram(gl);

  gl.uniform1i(quadPass.uniforms.uTex, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, curColorField.tex);

  gl.bindBuffer(gl.ARRAY_BUFFER, quadPass.vertBuffer);
  gl.vertexAttribPointer(quadPass.attribLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(quadPass.attribLoc);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadPass.indexBuffer);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(drawFrame);
};

requestAnimationFrame(drawFrame);
