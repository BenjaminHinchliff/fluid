precision highp float;

uniform float uDeltaX;
uniform float uAlpha;
uniform float uRBeta;
uniform sampler2D uX;
uniform sampler2D uB;

varying vec2 vTexCoord;

void main() {
  vec2 xLeft = texture2D(uX, vTexCoord - vec2(uDeltaX, 0.0)).xy;
  vec2 xRight = texture2D(uX, vTexCoord + vec2(uDeltaX, 0.0)).xy;
  vec2 xDown = texture2D(uX, vTexCoord - vec2(0.0, uDeltaX)).xy;
  vec2 xUp = texture2D(uX, vTexCoord + vec2(0.0, uDeltaX)).xy;

  vec2 bCenter = texture2D(uB, vTexCoord).xy;

  gl_FragColor = vec4(uRBeta * (xLeft + xRight + xUp + xDown + (uAlpha * bCenter)), 0.0, 1.0);
}
