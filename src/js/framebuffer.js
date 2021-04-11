/**
 * used to assist repeated rendering to textures
 */
export class FrameBuffer {
  /**
   * construct a new framebuffer object
   * @param {WebGLRenderingContext} ctx
   * @param {number} width
   * @param {number} height
   */
  constructor(ctx, width, height) {
    this.fb = ctx.createFramebuffer();
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, this.fb);

    this.c = this.createFloatTexture(ctx, width, height);

    ctx.framebufferTexture2D(
        ctx.FRAMEBUFFER, ctx.COLOR_ATTACHMENT0, ctx.TEXTURE_2D, this.c, 0);

    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  }

  /**
   * create an rgb texture that will be associated with a framebuffer
   * @param {WebGLRenderingContext} ctx
   * @param {number} width
   * @param {number} height
   * @return {WebGLTexture}
   */
  createFloatTexture(ctx, width, height) {
    const texture = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_2D, texture);

    ctx.texImage2D(
        ctx.TEXTURE_2D,
        0, ctx.RGBA,
        width,
        height,
        0,
        ctx.RGBA,
        ctx.FLOAT,
        null,
    );

    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);

    ctx.bindTexture(ctx.TEXTURE_2D, null);

    return texture;
  }

  /**
   * bind the framebuffer
   * @param {WebGLRenderingContext} ctx
   */
  bind(ctx) {
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, this.fb);
  }

  /**
   * unbind the framebuffer
   * @param {WebGLRenderingContext} ctx
   */
  unbind(ctx) {
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  }

  /**
   * clear this framebuffer
   * @param {WebGLRenderingContext} ctx
   */
  clear(ctx) {
    ctx.clearColor(0.0, 0.0, 0.0, 1.0);
    ctx.clear(ctx.COLOR_BUFFER_BIT);
  }
}
