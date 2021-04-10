import './index.css';
import standardVertSrc from './standard.vert';
import standardFragSrc from './standard.frag';

import * as shader from './shader';
import * as quad from './quad';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('fluid');

const gl = canvas.getContext('webgl');
if (gl === null) {
  alert('unable to initialize webgl');
  throw new Error('unable to initalize webgl');
}

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const standardVert = shader.compileShader(
    gl,
    gl.VERTEX_SHADER,
    standardVertSrc,
);
const standardFrag = shader.compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    standardFragSrc,
);

const standardProgram = shader.linkProgram(gl, [standardVert, standardFrag]);
gl.useProgram(standardProgram);

const quadBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
gl.bufferData(gl.ARRAY_BUFFER, quad.vertices, gl.STATIC_DRAW);

const quadIdxBuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIdxBuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, quad.indices, gl.STATIC_DRAW);

const quadIdxType = gl.UNSIGNED_SHORT;

const posAttrLoc = gl.getAttribLocation(standardProgram, 'aPosition');

gl.enableVertexAttribArray(posAttrLoc);

gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

gl.drawElements(gl.TRIANGLES, 6, quadIdxType, 0);
