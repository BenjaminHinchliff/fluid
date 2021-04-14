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