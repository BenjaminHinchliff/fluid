/**
 * compile the given shader source into a WebGL shader
 * @param {WebGLRenderingContext} ctx
 * @param {number} shaderType
 * @param {string} source
 * @return {WebGLShader}
 */
export function compileShader(ctx, shaderType, source) {
  const shader = ctx.createShader(shaderType);
  ctx.shaderSource(shader, source);
  ctx.compileShader(shader);

  if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
    const infoLog = ctx.getShaderInfoLog(shader);
    throw new Error(`failed to compile shader: ${infoLog}`);
  }
  return shader;
}

/**
 * link one or more shaders info a shader program
 * @param {WebGLRenderingContext} ctx
 * @param {[WebGLShader]} shaders
 * @return {WebGLProgram}
 */
export function linkProgram(ctx, shaders) {
  const program = ctx.createProgram();

  for (const shader of shaders) {
    ctx.attachShader(program, shader);
  }

  ctx.linkProgram(program);

  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    const infoLog = ctx.getProgramInfoLog(program);
    throw new Error(`failed to link program: ${infoLog}`);
  }
  return program;
}
