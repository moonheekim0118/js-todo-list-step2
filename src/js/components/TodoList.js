import {
  SELECTOR,
  NODE_NAME,
  CLASS_NAME,
  KEY_NAME,
  PRIORITY,
  POPUP_MESSAGE,
} from '../utils/constant.js';
import {
  priorityTemplate,
  todoListTemplate,
  loaderTemplate,
} from '../utils/templates.js';
import { ERROR_HANDLER, ERROR_TYPE } from '../utils/errors.js';
import { isAvaliableTodo, isRemovableList } from '../utils/validations.js';
import { $, $all } from '../utils/dom.js';
import api from '../api/index.js';
import Observer from '../libs/Observer.js';

class TodoList extends Observer {
  constructor(store) {
    super();
    this.store = store;
    this.container = $(SELECTOR.TODO_LIST);
    this.userId = this.store.currentUserId;
    this.bindEvent();
    this.render();
  }

  bindEvent() {
    $(SELECTOR.CLEAR_ALL).addEventListener('click', (e) => this.onClearAll(e));
    this.container.addEventListener('click', (e) => this.onClick(e));
    this.container.addEventListener('dblclick', (e) => this.onDoubleClick(e));
    this.container.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  onClick({ target }) {
    const $li = target.closest(NODE_NAME.LIST);
    if (!$li) return;
    const { id: itemId, contents } = $li.dataset;

    const assignAction = {
      [CLASS_NAME.TOGGLE]: () => this.toggleComplete($li, itemId, target),
      [CLASS_NAME.DESTROY]: () =>
        confirm(POPUP_MESSAGE.REMOVE_TODO) && this.removeTodo(itemId),
      [CLASS_NAME.PRIORITY_SELECT]: () => {
        const priority = target.value;
        return (
          priority !== PRIORITY.NONE &&
          this.changePriority($li, itemId, contents, priority)
        );
      },
    };

    const className = target.className;
    return assignAction[className] && assignAction[className]();
  }

  onDoubleClick({ target }) {
    if (target.classList.contains(NODE_NAME.LABEL)) {
      return this.changeToEditMode(target);
    }
  }

  onKeyDown({ key }) {
    if (key === KEY_NAME.ENTER || key === KEY_NAME.ESC) {
      const $editList = $all(SELECTOR.EDIT_INPUT, this.container);
      const $activeInput = Array.from($editList).find(
        (element) => element === document.activeElement,
      );
      $activeInput && this.closeEditMode($activeInput, key);
    }
  }

  async onClearAll() {
    try {
      if (!confirm(POPUP_MESSAGE.REMOVE_TODO)) return;
      isRemovableList(this.store.originTodoList);
      await api.removeAllTodos(this.userId);
      this.store.setOriginList([]);
      this.store.setRenderList([]);
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
      return error === ERROR_TYPE.NO_TODO && this.reloadTodoList();
    }
  }

  changeToEditMode(target) {
    const $li = target.closest(NODE_NAME.LIST);
    if ($li.classList.contains(CLASS_NAME.COMPLETED)) return;
    const value = $li.dataset.contents;
    const $input = $(SELECTOR.EDIT_INPUT, $li);
    $li.classList.add(CLASS_NAME.EDITING);
    $input.value = value;
  }

  closeEditMode(target, key) {
    try {
      const $li = target.closest(NODE_NAME.LIST);
      const { contents, id, priority } = $li.dataset;
      const $label = $(NODE_NAME.LABEL, $li);
      const value = target.value;
      if (key === KEY_NAME.ENTER && value !== contents) {
        isAvaliableTodo(value);
        this.updateTodo(id, value);
        $li.dataset.contents = value;
        $label.innerHTML =
          (priorityTemplate[priority] ?? priorityTemplate.NONE) + value;
      }
      $li.classList.remove(CLASS_NAME.EDITING);
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
    }
  }

  async updateTodo(itemId, contents) {
    try {
      await api.updateTodo(this.userId, itemId, contents);
      const updatedList = this.store.originTodoList.map((data) => {
        if (data._id === itemId) {
          return { ...data, contents };
        }
        return data;
      });
      this.store.setOriginList(updatedList);
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
      return error === ERROR_TYPE.NO_TODO && this.reloadTodoList();
    }
  }

  async toggleComplete($li, itemId, target) {
    try {
      target.toggleAttribute('checked');
      $li.classList.toggle(CLASS_NAME.COMPLETED);
      await api.toggleTodoComplete(this.userId, itemId);
      const updatedData = this.store.originTodoList.map((data) => {
        if (data._id === itemId) {
          return { ...data, isCompleted: !data.isCompleted };
        }
        return data;
      });
      this.store.setOriginList(updatedData);
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
      return error === ERROR_TYPE.NO_TODO && this.reloadTodoList();
    }
  }

  async removeTodo(itemId) {
    try {
      await api.removeTodo(this.userId, itemId);
      const updatedRenderData = this.store.renderTodoList.filter(
        (todo) => todo._id !== itemId,
      );
      const updatedOriginData = this.store.originTodoList.filter(
        (todo) => todo._id !== itemId,
      );
      this.store.setOriginList(updatedOriginData);
      this.store.setRenderList(updatedRenderData);
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
      return error === ERROR_TYPE.NO_TODO && this.reloadTodoList();
    }
  }

  async changePriority($li, itemId, contents, priority) {
    try {
      await api.setTodoPriority(this.userId, itemId, priority);
      const label = $(NODE_NAME.LABEL, $li);
      label.innerHTML = priorityTemplate[priority] + contents;
    } catch (error) {
      const hanlder = ERROR_HANDLER[error];
      hanlder && hanlder();
      return error === ERROR_TYPE.NO_TODO && this.reloadTodoList();
    }
  }

  reloadTodoList() {
    this.store.initTodoList(this.userId);
  }

  update() {
    this.userId = this.store.currentUserId;
    this.render();
  }

  render() {
    this.container.innerHTML = this.store.isLoading
      ? loaderTemplate
      : todoListTemplate(this.store.renderTodoList);
  }
}

export default TodoList;
