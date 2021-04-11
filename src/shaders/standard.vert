precision mediump float;

attribute vec4 aPosition;

varying vec2 vTexCoord;

void main() {
  gl_Position = aPosition;
  // assume quad to generate tex coords
  vTexCoord = vec2((aPosition.x + 1.0) / 2.0, (aPosition.y + 1.0) / 2.0);
}
