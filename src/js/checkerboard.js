/**
 *
 * @param {number} width
 * @param {number} height
 * @return {Float32Array}
 */
export function makeCheckerboardArr(width, height) {
  const data = [];
  data.reverse(width * height * 4);

  const blockSize = width / 10.0;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const xStep = Math.floor(x / blockSize);
      const yStep = Math.floor(y / blockSize);

      let val = 0.0;
      if ((xStep + yStep) % 2 === 0) {
        val = 1.0;
      }

      data.push(val, val, val, 1.0);
    }
  }

  return new Float32Array(data);
}
