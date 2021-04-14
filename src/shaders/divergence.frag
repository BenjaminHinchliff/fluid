precision mediump float;

uniform float uDeltaX;
uniform sampler2D uW;

varying vec2 vTexCoord;

void main() {
  vec2 wLeft = texture2D(uW, vTexCoord - vec2(uDeltaX, 0.0)).xy;
  vec2 wRight = texture2D(uW, vTexCoord + vec2(uDeltaX, 0.0)).xy;
  vec2 wDown = texture2D(uW, vTexCoord - vec2(0.0, uDeltaX)).xy;
  vec2 wUp = texture2D(uW, vTexCoord + vec2(0.0, uDeltaX)).xy;

  float halfRdx = 1.0 / (2.0 * uDeltaX);
  gl_FragColor = vec4(halfRdx * ((wRight.x - wLeft.x) + (wUp.y - wDown.y)), 0.0, 0.0, 1.0);
}
