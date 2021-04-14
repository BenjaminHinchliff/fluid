// wraps all the shader imports
import standardVertSrc from './standard.vert';
import quadFragSrc from './quad.frag';
import advectFragSrc from './advection.frag';
import forceFragSrc from './force.frag';
import jacobiFragSrc from './jacobi.frag';
import divergenceFragSrc from './divergence.frag';
import subtractFragSrc from './subtract.frag';
import boundaryFragSrc from './boundary.frag';
import colorFragSrc from './color.frag';

import {compileShader} from '../js/shader';

/**
 * compiles all shaders into a class
 */
export default class Shaders {
  /**
   * create a new shaders object
   * @param {WebGLRenderingContext} ctx
   */
  constructor(ctx) {
    this.vert = {};
    this.frag = {};

    this.vert.standard = compileShader(ctx, ctx.VERTEX_SHADER, standardVertSrc);

    const fragSrcs = [
      {
        name: 'quad',
        source: quadFragSrc,
      },
      {
        name: 'advect',
        source: advectFragSrc,
      },
      {
        name: 'force',
        source: forceFragSrc,
      },
      {
        name: 'jacobi',
        source: jacobiFragSrc,
      },
      {
        name: 'divergence',
        source: divergenceFragSrc,
      },
      {
        name: 'subtract',
        source: subtractFragSrc,
      },
      {
        name: 'boundary',
        source: boundaryFragSrc,
      },
      {
        name: 'color',
        source: colorFragSrc,
      },
    ];
    for (const src of fragSrcs) {
      this.frag[src.name] = compileShader(ctx, ctx.FRAGMENT_SHADER, src.source);
    }
  }
}
