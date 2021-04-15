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
    for (const control of controls) {
      const slider = control.getElementsByClassName('parameter')[0];
      const value = control.getElementsByClassName('value')[0];
      const syncValue = () => {
        value.textContent = slider.value;
      };
      syncValue();
      slider.addEventListener('input', syncValue);
      this[slider.id] = slider;
    }
  }
}
