import '../css/index.css';
import standardVertSrc from '../shaders/standard.vert';
import quadFragSrc from '../shaders/quad.frag';

import {compileShader} from './shader';
import * as quad from './quad';
import {createVertBuf, createIdxBuf} from './buffers';
import {ProgramInfo} from './program';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('fluid');

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

const standardProgram = new ProgramInfo(
    gl,
    [standardVert, quadFrag],
    ['aPosition'],
    ['uTex'],
);

standardProgram.use(gl);

const vertBuf = createVertBuf(gl, quad.vertices);
const idxBuf = createIdxBuf(gl, quad.indices);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

const level = 0;
const internalFormat = gl.RGBA;
const srcFormat = gl.RGBA;
const srcType = gl.UNSIGNED_BYTE;
const tempData = new Uint8Array([0, 0, 255, 255]);
gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    1,
    1,
    0,
    srcFormat,
    srcType,
    tempData,
);

const drawFrame = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuf);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);

  const posLoc = standardProgram.attribs.aPosition;
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posLoc);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(standardProgram.uniforms.uTex, 0);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(drawFrame);
};

requestAnimationFrame(drawFrame);
