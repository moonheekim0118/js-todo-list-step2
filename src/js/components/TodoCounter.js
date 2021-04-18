import Observer from '../libs/Observer.js';
import { $ } from '../utils/dom.js';
import { SELECTOR } from '../utils/constant.js';
import { todoCounterTemplate } from '../utils/templates.js';

class TodoCounter extends Observer {
  constructor(store) {
    super();
    this.store = store;
    this.container = $(SELECTOR.TODO_COUNTER);
    this.render();
  }

  update() {
    this.render();
  }

  render() {
    const counter = this.store.renderTodoList.length;
    this.container.innerHTML = this.store.isLoading
      ? '로딩중..'
      : todoCounterTemplate(counter);
  }
}

export default TodoCounter;
