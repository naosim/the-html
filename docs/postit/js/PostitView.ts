import { DPostit } from "./domain/postit/DPostit.ts";
import { DPostits } from "./domain/postit/DPostits.ts";

type Pos = {x: number, y: number};
type Size = {width: number, height: number}

export class PostitView {
  isDiv = false;
  constructor(public readonly postitId: string) {
  }
  center: Pos = {x: 0, y: 0};
  #size: Size = {width: 0, height: 0};
  get size(): {width: number, height: number} {
    if(!this.isDiv) {
      console.log("zero!", this.postitId);
    }
    
    return this.#size;
  }

  /**
   * 
   * @param div 
   * @param postit 
   * @returns 変更があったらtrueを返す
   */
  updateSize(div: any, postit: DPostit): boolean {
    // console.log("updateSize", this.postitId);
    const currentWidth = this.#size.width;
    const currentHeight = this.#size.height;
    if(!div) {
      // throw new Error("サイズ未確定 " + this.id);
      this.#size.width = 0;
      this.#size.height = 0;
    } else {
      this.isDiv = true;
      this.#size.width = div.clientWidth;
      this.#size.height = div.clientHeight;
    }
    this.updateCenter(postit);

    return currentWidth != this.#size.width || currentHeight != this.#size.height;
  }
  getRightBottom(postit: DPostit) {
    return {
      x: postit.pos.x + this.size.width,
      y: postit.pos.y + this.size.height
    }
  }
  
  updateCenter(postit: DPostit) {
    this.center.x = postit.pos.x + this.size.width / 2;
    this.center.y = postit.pos.y + this.size.height / 2;
  }
}

export class PostitViewRepository {
  #map: {[key: string]: PostitView} = {}
  
  find(postitId: string): PostitView {
    if(PostitDummy.isDummyById(postitId)) {
      return new PostitView(postitId);
    }
    const result = this.#map[postitId];
    if(!result) {
      throw new Error(`not found: ${postitId}`);
    }
    return result;
  }

  add(postitView: PostitView) {
    this.#map[postitView.postitId] = postitView;
  }

  delete(postitId: string) {
    delete this.#map[postitId];
  }

  optimize(postits: DPostits) {
    Object.keys(this.#map).filter(id => !postits.isExist(id)).forEach(id => this.delete(id))
  }

}



export class PostitDummy extends DPostit {
  constructor() {
    super("dummy", "dummy", {x: 12, y: 12})
  }

  static isDummy(postit: DPostit) {
    return this.isDummyById(postit.id);
  }

  static isDummyById(postitId: string) {
    return postitId == "dummy"
  }

  static instance(): DPostit {
    return dummyPostit;
  }
}

const dummyPostit = new PostitDummy();

