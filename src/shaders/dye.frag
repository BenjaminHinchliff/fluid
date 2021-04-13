precision highp float;

uniform vec3 uColor;
uniform vec2 uImpulsePos;
uniform sampler2D uColorFieldTexture;

varying vec2 vTexCoord;

void main() {
  vec4 origColor = texture2D(uColorFieldTexture, vTexCoord);

  float eps = 0.025;
  vec2 delta = vTexCoord - uImpulsePos;
  if (length(delta) < eps) {
    origColor = vec4(uColor, 1.0);
  }

  gl_FragColor = origColor;
}
