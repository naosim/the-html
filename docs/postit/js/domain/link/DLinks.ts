import { DPostit } from "../postit/DPostit.ts";
import { DLink } from "./DLink.ts";

export class DLinks {
  #uniqMap: {[key: string]: boolean} = {}
  
  constructor(public values: DLink[]) {
    this.updateMap();
  }
  private updateMap() {
    this.#uniqMap = this.values.map(v => v.id).reduce((memo, v) => {memo[v] = true; return memo}, {} as {[key:string]: boolean})
  }

  add(link: DLink) {
    this.values.push(link);
    this.updateMap();
  }

  /**
   * 指定した付箋に関係するリンクを削除する
   */
  exclude(postitId: string) {
    const indexies = this.values
      .map((v, i) => v.has(postitId) ? i : -1)
        .filter(v => v >= 0)
        .reverse();
      indexies.forEach(v => this.values.splice(v, 1))
    this.updateMap();
  }

  delete(linkId: string) {
    var index = -1;
    for(let i = 0; i < this.values.length; i++) {
      if(this.values[i].id == linkId) {
        index = i;
        break;
      }
    }
    this.values.splice(index, 1);
    this.updateMap();
  }
}