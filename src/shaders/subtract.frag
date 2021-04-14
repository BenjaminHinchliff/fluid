precision highp float;

uniform float uDeltaX;
uniform sampler2D uP;
uniform sampler2D uW;

varying vec2 vTexCoord;

void main() {
  float pLeft = texture2D(uP, vTexCoord - vec2(uDeltaX, 0.0)).x;
  float pRight = texture2D(uP, vTexCoord + vec2(uDeltaX, 0.0)).x;
  float pDown = texture2D(uP, vTexCoord - vec2(0.0, uDeltaX)).x;
  float pUp = texture2D(uP, vTexCoord + vec2(0.0, uDeltaX)).x;

  vec4 color = texture2D(uW, vTexCoord);
  float halfRdx = 1.0 / (2.0 * uDeltaX);
  color.xy -= halfRdx * vec2((pRight - pLeft), (pUp - pDown));

  gl_FragColor = color;
}
