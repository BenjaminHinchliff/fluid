import {linkProgram} from './shader';
import {createVertBuf, createIdxBuf} from './buffers';

/**
 *
 */
export class RenderPass {
  /**
   *
   * @param {WebGLRenderingContext} ctx
   * @param {[WebGLShader]} shaders
   * @param {[string]} uniformNames
   * @param {string} attribName
   * @param {Float32Array} verts
   * @param {Uint16Array} indices
   */
  constructor(ctx, shaders, uniformNames, attribName, verts, indices) {
    this.program = linkProgram(ctx, shaders);

    this.uniforms = uniformNames.reduce((obj, name) => {
      return {
        ...obj,
        [name]: ctx.getUniformLocation(this.program, name),
      };
    }, {});

    this.vertBuffer = createVertBuf(ctx, verts);
    this.indexBuffer = createIdxBuf(ctx, indices);

    this.attribLoc = ctx.getAttribLocation(this.program, attribName);
  }

  /**
   * @param {WebGLRenderingContext} ctx
   */
  useProgram(ctx) {
    ctx.useProgram(this.program);
  }
}
