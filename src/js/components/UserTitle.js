import Observer from '../libs/Observer.js';
import { SELECTOR } from '../utils/constant.js';
import { userTitleTemplate } from '../utils/templates.js';

class UserTitle extends Observer {
  constructor(store) {
    super();
    this.store = store;
    this.container = document.querySelector(SELECTOR.USER_TITLE);
    this.render();
  }
  update() {
    this.render();
  }
  render() {
    this.container.innerHTML = userTitleTemplate(this.store.currentUserName);
  }
}

export default UserTitle;
