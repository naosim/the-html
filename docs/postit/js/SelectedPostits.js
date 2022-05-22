import {Postit, PostitDummy} from "./Postit.js"

export class SelectedPostits {
  /** @type Postit[] */
  values;
  #map;
  constructor(dummyPostit) {
    this.values = [dummyPostit]
    this.#map = {}
  }
  select(postit) {
    if(this.#map[postit.id]) {
      return;
    }
    this.values.push(postit);
    this.#map[postit.id] = postit;
    console.log(this.values.length);
  }
  clear() {
    while(this.values.pop()) {
      // nop;
    }
    this.#map = {}
  }
  selectOne(postit) {
    this.clear();
    this.select(postit);
  }
  isSelected(postit) {
    return !!this.#map[postit.id]
  }
  isMultiple() {
    return this.values.length >= 2;
  }

  move(diffX, diffY) {
    this.values.forEach(v => v.setPos(v.pos.x + diffX, v.pos.y + diffY))
  }

  /**
   * 選択中のふせんをキー操作で動かす
   * @param {*} event 
   */
  moveSelectedPostitIfKeyPressed(event) {
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