import {Postit} from "./Postit.js"
import {calcCollisionPoint} from "./utils/calcCollisionPoint.js"

export class Link {
  /** @type Postit */
  startPostit;
  /** @type Postit */
  endPostit;

  /**
   * @param {Postit} startPostit 
   * @param {Postit} endPostit 
   */
  constructor(startPostit, endPostit) {
    this.startPostit = startPostit;
    this.endPostit = endPostit;
  }

  getEndPoint() {
    // console.log(this.endPostit.id);
    // console.log(this.endPostit);
    if(this.endPostit.size.width == 0 || this.endPostit.size.height == 0) {
      return this.endPostit.center
    }
    return calcCollisionPoint(this.startPostit.pos, this.endPostit);
  }

  getStartPoint() {
    if(this.startPostit.size.width == 0 || this.startPostit.size.height == 0) {
      return this.startPostit.center
    }
    return calcCollisionPoint(this.endPostit.pos, this.startPostit);
  }

  /**
   * 
   * @param {Postit} postit 
   * @returns {boolean} 含まれている場合はtrue
   */
  has(postit) {
    return this.startPostit.id == postit.id || this.endPostit.id == postit.id;
  }
}

export class Links {
  /** @type Link[] */
  values;
  #uniqMap = {}
  constructor(values) {
    this.values = values;
    this.updateMap();
  }
  updateMap() {
    this.#uniqMap = this.values.map(v => Links.uniqId(v)).reduce((memo, v) => {memo[v] = true; return memo}, {})
  }
  push(link) {
    if(this.#uniqMap[Links.uniqId(link)]) {
      console.log("同じ線がある");
      return;
    }
    this.values.push(link);
    this.#uniqMap[Links.uniqId(link)] = true;
  }
  exclude(postit) {
    const indexies = this.values
      .map((v, i) => v.has(postit) ? i : -1)
        .filter(v => v >= 0)
        .reverse();
      indexies.forEach(v => this.values.splice(v, 1))
    this.updateMap();
  }

  clear() {
    for(let i = this.values.length - 1; i >= 0; i--) {
      this.values.splice(i, 1)
    }
    this.updateMap();
  }

  /**
   * 引数の付箋から出る線が1つだけある場合はそれを返す。0または複数の場合はundefinedを返す。
   * @param {Postit} postit 
   */
  getOneEndPostit(postit) {
    const list = this.values.filter(v => v.startPostit.id == postit.id);
    return list.length == 1 ? list[0].endPostit : undefined;

  }

  static uniqId(link) {
    return `${link.startPostit.id}|${link.endPostit.id}`
  }
}