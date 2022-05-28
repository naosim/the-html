type Entity = {id:string}
export class Selected {
  /** @type {Entity[]} */
  values;
  #map: {[key: string]: Entity};
  constructor(entity: Entity) {
    this.values = [entity] // vueの$dataから参照されるため、初期値として何か1つ入れておく必要がある
    this.#map = {}
  }

  /**
   * 選択する
   * @param {Entity[]} entity 
   * @returns 
   */
  select(entity: Entity) {
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
   * @param {Entity} entity 
   */
  selectOne(entity: Entity) {
    this.clear();
    this.select(entity);
  }

  /**
   * 選択中か？
   */
  isSelected(entity: Entity) {
    return !!this.#map[entity.id]
  }

  isNoSelected() {
    return this.values.length == 0;
  }

  isMultiple() {
    return this.values.length >= 2;
  }

  forEach<T extends Entity>(cb: (value: Entity, index: number, array: Entity[]) => void) {
    this.values.forEach(cb);
  }
} 