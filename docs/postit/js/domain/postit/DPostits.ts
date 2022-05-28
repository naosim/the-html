import { DLinks } from "../link/DLinks.ts";
import { DPostit } from "./DPostit.ts";

export class DPostits {
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

  delete(postitId: string) {
    // 付箋の削除
    this.values
        .map((v, i) => v.id == postitId ? i : -1)
        .filter(v => v >= 0)
        .reverse() // 1つしかないはずだから意味ない
        .forEach(v => this.values.splice(v, 1))
      
      // linkの削除
      this.links.exclude(postitId);
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
}

