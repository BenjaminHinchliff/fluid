/**
 * @param {WebGLRenderingContext} ctx
 * @param {Float32Array} vertices
 * @return {WebGLBuffer}
 */
export function createVertBuf(ctx, vertices) {
  const buf = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
  return buf;
}

/**
 * @param {WebGLRenderingContext} ctx
 * @param {Float32Array} indices
 * @return {WebGLBuffer}
 */
export function createIdxBuf(ctx, indices) {
  const buf = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buf);
  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
  return buf;
}
