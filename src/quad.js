const vertices = new Float32Array([
  1.0, 1.0, // top right
  -1.0, 1.0, // top left
  1.0, -1.0, // bottom right
  -1.0, -1.0, // bottom left
]);

/**
 * creates and binds the vertex buffer for a quad
 * @param {WebGLRenderingContext} ctx
 * @return {WebGLBuffer}
 */
export function createVertBuf(ctx) {
  const quadBuf = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, quadBuf);
  ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);
  return quadBuf;
}

const indices = new Uint16Array([
  0, 1, 2,
  1, 3, 2,
]);

/**
 * create the index buffer of a quad
 * @param {WebGLRenderingContext} ctx
 * @return {WebGLBuffer}
 */
export function createIdxBuf(ctx) {
  const idxBuf = ctx.createBuffer();
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, idxBuf);
  ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
  return idxBuf;
}
