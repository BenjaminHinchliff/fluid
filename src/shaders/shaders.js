// wraps all the shader imports
import standardVertSrc from '../shaders/standard.vert';
import quadFragSrc from '../shaders/quad.frag';
import advectFragSrc from '../shaders/advection.frag';
import forceFragSrc from '../shaders/force.frag';
import jacobiFragSrc from '../shaders/jacobi.frag';
import divergenceFragSrc from '../shaders/divergence.frag';
import subtractFragSrc from '../shaders/subtract.frag';
import boundaryFragSrc from '../shaders/boundary.frag';
import colorFragSrc from '../shaders/dye.frag';

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
