import {linkProgram} from './shader';

/**
 * stores WebGL program and associated resources
 */
export class ProgramInfo {
  /**
   * create a new program
   * @param {WebGLRenderingContext} ctx
   * @param {[WebGLShader]} shaders
   * @param {[string]} attribs (as strings)
   * @param {[string]} uniforms (as strings)
   */
  constructor(ctx, shaders, attribs, uniforms) {
    this.program = linkProgram(ctx, shaders);
    this.attribs = attribs.reduce(
        (obj, attrib) => {
          return {
            ...obj,
            [attrib]: ctx.getAttribLocation(this.program, attrib),
          };
        }, {});
    this.uniforms = uniforms.reduce(
        (obj, uniform) => {
          return {
            ...obj,
            [uniform]: ctx.getUniformLocation(this.program, uniform),
          };
        },
        {});
  }

  /**
   * set the given program as active
   * @param {WebGLRenderingContext} ctx
   */
  use(ctx) {
    ctx.useProgram(this.program);
  }
}
