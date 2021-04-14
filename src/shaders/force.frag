precision highp float;

uniform float uDeltaT;
uniform float uRho;
uniform vec2 uForce;
uniform vec2 uImpulsePos;
uniform sampler2D uVelocityFieldTexture;

varying vec2 vTexCoord;

void main() {
  vec4 color = texture2D(uVelocityFieldTexture, vTexCoord);

  vec2 delta = vTexCoord - uImpulsePos;
  float scale = uDeltaT * exp(-((delta.x * delta.x) + (delta.y * delta.y)) / uRho);

  color.xy += scale * uForce;

  gl_FragColor = color;
}
