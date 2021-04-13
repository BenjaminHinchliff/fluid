import '../css/index.css';
import standardVertSrc from '../shaders/standard.vert';
import quadFragSrc from '../shaders/quad.frag';
import advectFragSrc from '../shaders/advection.frag';
import forceFragSrc from '../shaders/force.frag';
import colorFragSrc from '../shaders/dye.frag';

import {compileShader} from './shader';
import * as quad from './quad';
import * as fluidOps from './fluid_passes';
import {createVertBuf, createIdxBuf} from './buffers';
import {ProgramInfo} from './program';
import {RenderPass} from './render_pass';
import { FrameBuffer } from './framebuffer';
import { vec3 } from 'gl-matrix';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('fluid');
const {width, height} = canvas;

const gl = canvas.getContext('webgl');
if (gl === null) {
  alert('unable to initialize webgl');
  throw new Error('unable to initalize webgl');
}

gl.getExtension('OES_texture_float');
gl.getExtension('OES_texture_float_linear');

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

const colorFrag = compileShader(gl, gl.FRAGMENT_SHADER, colorFragSrc);

const colorPass = new RenderPass(
    gl,
    [standardVert, colorFrag],
    ['uDeltaT', 'uRho', 'uColor', 'uImpulsePos', 'uColorFieldTexture'],
    'aPosition',
    quad.vertices,
    quad.indices,
);

let curVelocityField = new FrameBuffer(gl, width, height);
let nextVelocityField = new FrameBuffer(gl, width, height);

let curColorField = new FrameBuffer(gl, width, height);
let nextColorField = new FrameBuffer(gl, width, height);

const rho = 1e-3;
let lastTime = null;
const drawFrame = (time) => {
  const timeS = time / 1000.0;
  if (lastTime === null) {
    lastTime = timeS;
  }
  const deltaT = timeS - lastTime;
  lastTime = timeS;

  // advect velocity field
  [curVelocityField, nextVelocityField] = fluidOps.advection(
      gl,
      advectPass,
      deltaT,
      curVelocityField,
      curVelocityField,
      nextVelocityField,
  );

  // add test force
  [curVelocityField, nextVelocityField] = fluidOps.force(
      gl,
      forcePass,
      deltaT,
      rho,
      [3.0, 0.0],
      [0.5, 0.5],
      curVelocityField,
      nextVelocityField,
  );

  // dye pass
  [curColorField, nextColorField] = fluidOps.color(
      gl,
      colorPass,
      [0.0, 0.0, 1.0],
      [0.5, 0.5],
      curColorField,
      nextColorField,
  );

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
