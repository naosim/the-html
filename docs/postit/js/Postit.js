export class Postit {
  #div;
  pos = {x: 0, y: 0};
  center = {x: 0, y: 0};
  isDiv = false; // vueに更新を気づいてもらうためのフラグ
  constructor(id, text, pos) {
    this.id = id;
    this.text = text;
    this.pos.x = pos.x;
    this.pos.y = pos.y;
  }

  get size() {
    if(!this.#div) {
      // throw new Error("サイズ未確定 " + this.id);
      return { width: 0, height: 0 }
    }
    return {
      width: this.#div.clientWidth,
      height: this.#div.clientHeight
    }
  }
  get rightBottom() {
    return {
      x: this.pos.x + this.size.width,
      y: this.pos.y + this.size.height
    }
  }
  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.updateCenter();    
  }
  setDiv(div) {
    if(!div) {
      throw new Error("div is undefined");
    }
    // console.log(div);
    this.#div = div;
    this.updateCenter();
    this.isDiv = true;
  }
  updateCenter() {
    this.center.x = this.pos.x + this.size.width / 2;
    this.center.y = this.pos.y + this.size.height / 2;
  }
}
export class PostitDummy extends Postit {
  constructor() {
    super("dummy", "dummy", {x: 12, y: 12})
  }
  get size() {
    return {
      width: 0,
      height: 0
    }
  }

  /**
   * 
   * @param {Postit} postit 
   * @returns 
   */
  static isDummy(postit) {
    return postit.id == "dummy"
  }

  /**
   * インスタンス取得
   * @returns {Postit}
   */
  static instance() {
    return dummyPostit;
  }
}

const dummyPostit = new PostitDummy();