import { DPostit } from "./domain/postit/DPostit.ts";

type Pos = {x: number, y: number};
type Size = {width: number, height: number}

export class PostitView extends DPostit {
  center: Pos = {x: 0, y: 0};
  size: Size = {width: 0, height: 0};
  isDiv = false; // vueに更新を気づいてもらうためのフラグ
  updateSize(div: any) {
    if(!div) {
      // throw new Error("サイズ未確定 " + this.id);
      this.size.width = 0;
      this.size.height = 0;
    }
    
    this.size.width = div.clientWidth;
    this.size.height = div.clientHeight;
    this.updateCenter();
  }
  get rightBottom() {
    return {
      x: this.pos.x + this.size.width,
      y: this.pos.y + this.size.height
    }
  }
  setPos(x: number, y: number) {
    super.move({x, y});
    this.updateCenter();    
  }
  
  updateCenter() {
    this.center.x = this.pos.x + this.size.width / 2;
    this.center.y = this.pos.y + this.size.height / 2;
  }
}
export class PostitDummy extends PostitView {
  constructor() {
    super("dummy", "dummy", {x: 12, y: 12})
  }

  /**
   * 
   * @param {Postit} postit 
   * @returns 
   */
  static isDummy(postit: DPostit) {
    return postit.id == "dummy"
  }

  static instance(): PostitView {
    return dummyPostit;
  }
}

const dummyPostit = new PostitDummy();