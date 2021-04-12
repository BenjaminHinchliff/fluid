precision highp float;

uniform float uDeltaT;
uniform float uRho;
uniform vec3 uColor;
uniform vec2 uImpulsePos;
uniform sampler2D uColorFieldTexture;

varying vec2 vTexCoord;

void main() {
  vec4 origColor = texture2D(uColorFieldTexture, vTexCoord);

  float eps = 0.025;
  vec2 delta = vTexCoord - uImpulsePos;
  if (length(delta) < eps) {
    origColor.xyz = color;
  }

  gl_FragColor = origColor;
}
