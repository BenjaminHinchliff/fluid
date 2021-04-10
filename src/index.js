import './index.css';
import standardVertSrc from './standard.vert';
import standardFragSrc from './standard.frag';

import {compileShader} from './shader';
import {createVertBuf, createIdxBuf} from './quad';
import {ProgramInfo} from './program';

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

const standardVert = compileShader(
    gl,
    gl.VERTEX_SHADER,
    standardVertSrc,
);
const standardFrag = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    standardFragSrc,
);

const standardProgram = new ProgramInfo(
    gl,
    [standardVert, standardFrag],
    ['aPosition'],
    [],
);

standardProgram.use(gl);

createVertBuf(gl);
createIdxBuf(gl);

const posLoc = standardProgram.attribs.aPosition;
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(posLoc);

gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
