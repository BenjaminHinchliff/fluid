precision mediump float;

uniform float uDeltaT;
uniform sampler2D uColorFieldTex;
uniform sampler2D uVecFieldTex;

varying vec2 vTexCoord;

void main() {
  vec2 u = texture2D(uVecFieldTex, vTexCoord).xy;
  vec2 sourceCoord = vTexCoord - (0.5 * uDeltaT * u);

  gl_FragColor = texture2D(uColorFieldTex, sourceCoord);
}
