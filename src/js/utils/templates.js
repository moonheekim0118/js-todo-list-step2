/**
 * @param {string} title
 * @param {number} id
 * @param {boolean} complete
 * @returns {string}
 */

export const todoTemplate = (id, title, complete) => `
 <li data-id=${id} class=${complete ? 'completed' : ''}>
     <div class="view">
         <input class="toggle" type="checkbox" ${complete ? 'checked' : ''}/>
         <label class="label">${title}</label>
         <button class="destroy"></button>
     </div>
     <input class="edit"/>
 </li>`;

/**
 * @param {object[]} datas
 * @returns {string}
 */

export const todoListTemplate = (datas) => {
  let result = '';
  datas.map((v) => {
    result += todoTemplate(v.id, v.title, v.complete);
  });
  return result;
};

/**
 * @param {number} counter
 * @returns {string}
 */
export const todoCounterTemplate = (counter) =>
  `총 <strong>${counter}</strong> 개</span>`;

export const userTemplate = (userName) =>
  `<button class="ripple">${userName}</button>`;
