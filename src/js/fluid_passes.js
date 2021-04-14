/* eslint-disable no-unused-vars */
import {RenderPass} from './render_pass';
import {FrameBuffer} from './framebuffer';
import {vec3, vec2} from 'gl-matrix';
/* eslint-enable no-unused-vars */

/**
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} advectPass
 * @param {number} deltaT
 * @param {FrameBuffer} srcColorField
 * @param {FrameBuffer} vectorField
 * @param {FrameBuffer} dstColorField
 * @return {[FrameBuffer, FrameBuffer]} the first is the transmuted source,
 * the second is the old source
 */
export function advection(
    ctx,
    advectPass,
    deltaT,
    srcColorField,
    vectorField,
    dstColorField,
) {
  dstColorField.bind(ctx);
  // dstColorField.clear(ctx);

  advectPass.useProgram(ctx);

  ctx.uniform1f(advectPass.uniforms.uDeltaT, deltaT);
  ctx.uniform1i(advectPass.uniforms.uColorFieldTex, 0);
  ctx.uniform1i(advectPass.uniforms.uVecFieldTex, 1);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, srcColorField.tex);

  ctx.activeTexture(ctx.TEXTURE1);
  ctx.bindTexture(ctx.TEXTURE_2D, vectorField.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, advectPass.vertBuffer);
  ctx.vertexAttribPointer(advectPass.attribLoc, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(advectPass.attribLoc);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, advectPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dstColorField.unbind(ctx);

  return [dstColorField, srcColorField];
}

/**
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} forcePass
 * @param {number} deltaT
 * @param {number} rho
 * @param {vec2} force
 * @param {vec2} impulsePos
 * @param {FrameBuffer} velocityFieldTexture
 * @param {FrameBuffer} dstTexture
 * @return {[FrameBuffer, FrameBuffer]}
 */
export function force(
    ctx,
    forcePass,
    deltaT,
    rho,
    force,
    impulsePos,
    velocityFieldTexture,
    dstTexture,
) {
  dstTexture.bind(ctx);

  forcePass.useProgram(ctx);

  ctx.uniform1f(forcePass.uniforms.uDeltaT, deltaT);
  ctx.uniform1f(forcePass.uniforms.uRho, rho);
  ctx.uniform2fv(forcePass.uniforms.uForce, force);
  ctx.uniform2fv(forcePass.uniforms.uImpulsePos, impulsePos);

  ctx.uniform1i(forcePass.uniforms.uVelocityFieldTexture, 0);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, velocityFieldTexture.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, forcePass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, forcePass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dstTexture.unbind(ctx);

  return [dstTexture, velocityFieldTexture];
}

/**
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} colorPass
 * @param {vec3} color
 * @param {vec2} impulsePos
 * @param {FrameBuffer} colorFieldTexture
 * @param {FrameBuffer} dstTexture
 * @return {[FrameBuffer, FrameBuffer]}
 */
export function color(
    ctx,
    colorPass,
    color,
    impulsePos,
    colorFieldTexture,
    dstTexture,
) {
  dstTexture.bind(ctx);
  colorPass.useProgram(ctx);

  ctx.uniform3fv(colorPass.uniforms.uColor, color);
  ctx.uniform2fv(colorPass.uniforms.uImpulsePos, impulsePos);

  ctx.uniform1i(colorPass.uniforms.uColorFieldTexTure, 0);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, colorFieldTexture.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, colorPass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, colorPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dstTexture.unbind(ctx);

  return [dstTexture, colorFieldTexture];
}

/**
 * run one iteration of jacobi iterative solving
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} jacobiPass
 * @param {number} deltaX
 * @param {number} alpha
 * @param {number} rBeta
 * @param {FrameBuffer} x
 * @param {FrameBuffer} b
 */
export function jacobiIteration(
    ctx,
    jacobiPass,
    deltaX,
    alpha,
    rBeta,
    x,
    b,
) {
  jacobiPass.useProgram(ctx);

  ctx.uniform1f(jacobiPass.uniforms.uDeltaX, deltaX);
  ctx.uniform1f(jacobiPass.uniforms.uAlpha, alpha);
  ctx.uniform1f(jacobiPass.uniforms.uRBeta, rBeta);

  ctx.uniform1i(jacobiPass.uniforms.uX, 0);
  ctx.uniform1i(jacobiPass.uniforms.uB, 1);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, x.tex);

  ctx.activeTexture(ctx.TEXTURE1);
  ctx.bindTexture(ctx.TEXTURE_2D, b.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, jacobiPass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, jacobiPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);
}

/**
 * utility method to compute multiple jacobi iterations
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} jacobiPass
 * @param {number} iter
 * @param {number} deltaX
 * @param {number} alpha
 * @param {number} rBeta
 * @param {FrameBuffer} x
 * @param {FrameBuffer} b
 * @param {FrameBuffer} dst
 * @return {[FrameBuffer, FrameBuffer]}
 */
export function jacobiMethod(
    ctx,
    jacobiPass,
    iter,
    deltaX,
    alpha,
    rBeta,
    x,
    b,
    dst,
) {
  const bufs = [x, dst];
  for (let i = 0; i < iter; i += 1) {
    const jCur = bufs[i % bufs.length];
    const jDst = bufs[(i + 1) % bufs.length];

    jDst.bind(ctx);
    jacobiIteration(ctx, jacobiPass, deltaX, alpha, rBeta, jCur, b);
    jDst.unbind(ctx);
  }

  // TODO: make this guaranteed to run for `iter` iterations
  return [x, dst];
}

/**
 * provide starting numbers for divergence to be calculated with jacobi
 * iteration
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} divergencePass
 * @param {number} deltaX
 * @param {FrameBuffer} w
 * @param {FrameBuffer} dst
 * @return {FrameBuffer}
 */
export function divergence(
    ctx,
    divergencePass,
    deltaX,
    w,
    dst,
) {
  dst.bind(ctx);

  divergencePass.useProgram(ctx);

  ctx.uniform1f(divergencePass.uniforms.uDeltaX, deltaX);
  ctx.uniform1i(divergencePass.uniforms.uW, 0);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, w.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, divergencePass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, divergencePass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dst.unbind(ctx);

  return dst;
}

/**
 * subtract the calculated divergence from given framebuffer
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} subtractPass
 * @param {number} deltaX
 * @param {FrameBuffer} p
 * @param {FrameBuffer} w
 * @param {FrameBuffer} dst
 * @return {[FrameBuffer, FrameBuffer]}
 */
export function subtract(
    ctx,
    subtractPass,
    deltaX,
    p,
    w,
    dst,
) {
  dst.bind(ctx);

  subtractPass.useProgram(ctx);

  ctx.uniform1f(subtractPass.uniforms.uDeltaX, deltaX);

  ctx.uniform1i(subtractPass.uniforms.uP, 0);
  ctx.uniform1i(subtractPass.uniforms.uW, 1);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, p.tex);
  ctx.activeTexture(ctx.TEXTURE1);
  ctx.bindTexture(ctx.TEXTURE_2D, w.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, subtractPass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, subtractPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dst.unbind(ctx);

  return [dst, w];
}

/**
 * apply boundary conditions (walls) to a given framebuffer
 * @param {WebGLRenderingContext} ctx
 * @param {RenderPass} boundaryPass
 * @param {number} deltaX
 * @param {number} scale
 * @param {FrameBuffer} x
 * @param {FrameBuffer} dst
 * @return {[FrameBuffer, FrameBuffer]}
 */
export function boundary(
    ctx,
    boundaryPass,
    deltaX,
    scale,
    x,
    dst,
) {
  dst.bind(ctx);
  boundaryPass.useProgram(ctx);

  ctx.uniform1f(boundaryPass.uniforms.uDeltaX, deltaX);
  ctx.uniform1f(boundaryPass.uniforms.uScale, scale);

  ctx.uniform1i(boundaryPass.uniforms.uX, 0);

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.bindTexture(ctx.TEXTURE_2D, x.tex);

  ctx.bindBuffer(ctx.ARRAY_BUFFER, boundaryPass.vertBuffer);
  ctx.vertexAttribPointer(0, 2, ctx.FLOAT, false, 0, 0);
  ctx.enableVertexAttribArray(0);

  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, boundaryPass.indexBuffer);

  ctx.drawElements(ctx.TRIANGLES, 6, ctx.UNSIGNED_SHORT, 0);

  dst.unbind(ctx);

  return [dst, x];
}
