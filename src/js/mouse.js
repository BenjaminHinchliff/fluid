import {vec2} from 'gl-matrix';

/**
 * keeps track of the click state and velocity of a mouse for a given element
 */
export default class MouseListener {
  /**
   * create a new mouse listener
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.bounds = {left: 0.0, top: 0.0, width: 0.0, height: 0.0};
    this.position = null;
    this.velocity = [0.0, 0.0];
    this.down = false;

    const setBounds = () => {
      const {left, top, width, height} = element.getBoundingClientRect();
      this.bounds = {
        left: Math.floor(left),
        top: Math.floor(top),
        width,
        height,
      };
    };

    setBounds();
    window.addEventListener('resize', setBounds);

    element.addEventListener('mousemove', ({clientX, clientY}) => {
      const {left, top, width, height} = this.bounds;
      const relPos = [
        (clientX - left) / width,
        (height - (clientY - top)) / height,
      ];
      if (!this.position) {
        this.position = relPos;
      }
      this.velocity = vec2.sub(this.velocity, relPos, this.position);
      this.position = relPos;
    });

    element.addEventListener('mousedown', () => {
      this.down = true;
    });
    element.addEventListener('mouseup', () => {
      this.down = false;
    });
  }
}
