// eslint-disable-next-line no-unused-vars
import {vec3} from 'gl-matrix';

/**
 * convert hex color to vec3 in range 0.0 to 1.0
 * @param {string} hex
 * @return {vec3|null}
 */
function hexToVec3(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255.0,
    parseInt(result[2], 16) / 255.0,
    parseInt(result[3], 16) / 255.0,
  ] : null;
}

/**
 * keeps track of the state of all the controls and couples elements
 */
export default class Controls {
  /**
   * create a new controls management object
   * @param {HTMLElement} element the element that contains the controls
   */
  constructor(element) {
    const controls = document.getElementsByClassName('parameter-slider');
    const colorPicker = document.getElementById('dye-color');
    const setColor = () => {
      this.color = hexToVec3(colorPicker.value);
    };
    setColor();
    colorPicker.addEventListener('change', setColor);
    for (const control of controls) {
      const slider = control.getElementsByClassName('parameter')[0];
      const value = control.getElementsByClassName('value')[0];
      const syncValue = () => {
        if (slider.id === 'viscosity') {
          value.textContent = `1e${slider.value}`;
        } else {
          value.textContent = slider.value;
        }
      };
      syncValue();
      slider.addEventListener('input', syncValue);
      this[slider.id] = slider;
    }
  }
}
