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

  findByStartPostit(startPostitId: string) {

  }

  add(link: DLink) {
    this.values.push(link);
    this.updateMap();
  }

  /**
   * 指定した付箋に関係するリンクを削除する
   * @param postitId 
   * @returns 削除したリンクを返す
   */
  exclude(postitId: string): DLink[] {
    const deletedLinks: DLink[] = [];
    const indexies = this.values
      .map((v, i) => v.has(postitId) ? i : -1)
        .filter(v => v >= 0)
        .reverse();
      indexies.forEach(v => {
        deletedLinks.push(this.values[v]);
        this.values.splice(v, 1);
      })
    this.updateMap();
    return deletedLinks;
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

  /**
   * 引数の付箋から出る線が1つだけある場合はそれを返す。0または複数の場合はundefinedを返す。
   */
   getOneEndPostit(startPostitId: string): DPostit | undefined {
    const list = this.values.filter(v => v.startPostit.id == startPostitId);
    return list.length == 1 ? list[0].endPostit : undefined;
  }
}