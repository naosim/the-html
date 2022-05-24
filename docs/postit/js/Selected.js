export class Selected {
  /** @type {{id:string}[]} */
  values;
  #map;
  constructor(entity) {
    this.values = [entity] // vueの$dataから参照されるため、初期値として何か1つ入れておく必要がある
    this.#map = {}
  }

  /**
   * 選択する
   * @param {{id:string}[]} entity 
   * @returns 
   */
  select(entity) {
    if(this.#map[entity.id]) {
      return;
    }
    this.values.push(entity);
    this.#map[entity.id] = entity;
    console.log("selected", this.values.length);
  }
  clear() {
    console.log("clear");
    while(this.values.pop()) {
      // nop;
    }
    this.#map = {}
  }

  /**
   * 1つだけ選択する
   * @param {{id:string}[]} entity 
   */
  selectOne(entity) {
    this.clear();
    this.select(entity);
  }

  /**
   * 選択中か？
   * @param {{id:string}[]} entity 
   * @returns 
   */
  isSelected(entity) {
    return !!this.#map[entity.id]
  }

  isNoSelected() {
    return this.values.length == 0;
  }

  isMultiple() {
    return this.values.length >= 2;
  }

  forEach(cb) {
    this.values.forEach(cb);
  }
}