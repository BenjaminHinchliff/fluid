precision highp float;

uniform float uDeltaX;
uniform float uScale;
uniform sampler2D uX;

varying vec2 vTexCoord;

void main() {
  float eps = uDeltaX;
  
  vec2 offset = vec2(0.0, 0.0);
  if (vTexCoord.x - 0.0 < eps) {
    offset = vec2(uDeltaX, 0.0);
  } else if (1.0 - vTexCoord.x < eps) {
    offset = vec2(-uDeltaX, 0.0);
  } else if (vTexCoord.y - 0.0 < eps) {
    offset = vec2(0.0, uDeltaX);
  } else if (1.0 - vTexCoord.y < eps) {
    offset = vec2(0.0, -uDeltaX);
  } else {
    // prevent scaling
    gl_FragColor = texture2D(uX, vTexCoord);
    return;
  }
  vec2 color = uScale * texture2D(uX, vTexCoord + offset).xy;
  gl_FragColor = vec4(color, 0.0, 1.0);
}
