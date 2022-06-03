import { DLinks } from "../link/DLinks.ts";
import { DLink } from "../link/DLink.ts";
import { DPostit } from "./DPostit.ts";
import { DPostitsRef } from "./DPostitsRef.ts";

export class DPostits implements DPostitsRef {
  readonly #map: {[key: string]: DPostit};
  constructor(
    public values: DPostit[],
    public links: DLinks
  ) {
    this.#map = values.reduce((memo, v) => {
      memo[v.id] = v;
      return memo;
    }, {} as {[key: string]: DPostit})
  }

  add(postit: DPostit) {
    this.values.push(postit);
    this.#map[postit.id] = postit;
  }

  /**
   * 付箋を削除する
   * @param postitId 
   * @returns 削除した付箋とリンクを返す
   */
  delete(postitId: string): {postit: DPostit, links: DLink[]} {
    const postit = this.find(postitId);
    // 付箋の削除
    this.values
        .map((v, i) => v.id == postitId ? i : -1)
        .filter(v => v >= 0)
        .reverse() // 1つしかないはずだから意味ない
        .forEach(v => this.values.splice(v, 1))
      
      // linkの削除
      const links = this.links.exclude(postitId);
      return {postit, links}
  }

  clearAll() {
    this.values
        .map((v, i) => ({v: v, i: i}))
        .reverse()
        .forEach((p, i) => {
          this.values.splice(p.i, 1);
          this.links.exclude(p.v.id);
        })
  }

  isExist(postitId: string): boolean {
    return !!this.#map[postitId];
  }

  move(postitId: string, pos: {x: number, y: number}){
    this.#map[postitId].move(pos);
  }

  moveWithDiff(postitId: string, diff: {diffX: number, diffY: number}){
    this.#map[postitId].moveWithDiff(diff);
  }

  updateText(postitId: string, text: string) {
    this.#map[postitId].updateText(text);
  }

  find(postitId: string): DPostit {
    return this.#map[postitId];
  }

  // addPostitsAndLinks(postits: DPostit[], links: DLink[]) {
  //   postits.forEach(v => this.add(v));
  //   links.forEach(v => this.links.add(v));
  // }
}

