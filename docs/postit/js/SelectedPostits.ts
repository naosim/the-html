import { DPostit } from "./domain/postit/DPostit.ts";


/**
 * 選択中の付箋
 */
export class SelectedPostits {
  values: DPostit[];
  #map: {[key: string]: DPostit};
  constructor(dummyPostit: DPostit) {
    this.values = [dummyPostit] // vueの$dataから参照されるため、初期値として何か1つ入れておく必要がある
    this.#map = {}
  }

  getSelectedIds(): string[] {
    return this.values.map(v => v.id);
  }

  /**
   * 選択する
   */
  select(postit: DPostit) {
    if(this.#map[postit.id]) {
      return;
    }
    this.values.push(postit);
    this.#map[postit.id] = postit;
  }
  clear() {
    while(this.values.pop()) {
      // nop;
    }
    this.#map = {}
  }

  /**
   * 1つだけ選択する
   * @param {Postit} postit 
   */
  selectOne(postit: DPostit) {
    this.clear();
    this.select(postit);
  }

  /**
   * 選択中か？
   */
  isSelected(postitId: string) {
    return !!this.#map[postitId]
  }

  isNoSelected() {
    return this.values.length == 0;
  }

  isMultiple() {
    return this.values.length >= 2;
  }

  /**
   * 選択中の付箋すべてを移動する
   * @param {number} diffX 
   * @param {number} diffY 
   */
  move(diffX: number, diffY: number) {
    this.values.forEach(v => v.moveWithDiff({diffX, diffY}))
  }

  /**
   * 選択中の付箋をキー操作で動かす
   * @param {*} event 
   */
  moveSelectedPostitIfKeyPressed(event: any) {
    /** @type SelectedPostits */
    const selectedPostits = this;
    if(event.code == "ArrowUp" && selectedPostits.isMultiple()) {
      selectedPostits.move(0, -16);
    } else if(event.code == "ArrowDown" && selectedPostits.isMultiple()) {
      selectedPostits.move(0, 16);
    } else if(event.code == "ArrowLeft" && selectedPostits.isMultiple()) {
      selectedPostits.move(-16, 0);
    } else if(event.code == "ArrowRight" && selectedPostits.isMultiple()) {
      selectedPostits.move(16, 0);
    } else if(
      event.key == "Shift" 
      || event.key == "Meta" 
      || event.key == "Alt" 
      || event.key == "Control"
      || event.key == "CapsLock"
    ) {
      // nop
      // 選択を解除しない
    } else {
      selectedPostits.clear();
    }
  }

  
  
}