precision mediump float;

uniform float uDeltaT;
uniform float uDeltaX;
uniform float uVorticity;
uniform sampler2D uV;

varying vec2 vTexCoord;

float getCurl(in float x, in float y) {
  float upX = texture2D(uV, vec2(x, y + uDeltaX)).x;
  float downX = texture2D(uV, vec2(x, y - uDeltaX)).x;
  float leftY = texture2D(uV, vec2(x - uDeltaX, y)).y;
  float rightY = texture2D(uV, vec2(x + uDeltaX, y)).y;

  return 0.5 * (upX - downX + leftY - rightY);
}

void main() {
  float x = vTexCoord.x;
  float y = vTexCoord.y;

  float dx = abs(getCurl(x, y - uDeltaX)) - abs(getCurl(x, y + uDeltaX));
  float dy = abs(getCurl(x + uDeltaX, y)) - abs(getCurl(x - uDeltaX, y));

  vec2 d = vec2(0.5 * dx, 0.5 * dy);
  float len = length(d) + 1e-9;
  d = uVorticity / len * d;

  gl_FragColor = texture2D(uV, vTexCoord) + uDeltaT * getCurl(x, y) * vec4(d, 0.0, 1.0);
}
