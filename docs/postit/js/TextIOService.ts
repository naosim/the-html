import { DLink } from "./domain/link/DLink.ts";
import { DLinks } from "./domain/link/DLinks.ts";
import { DPostit } from "./domain/postit/DPostit.ts";
import { DPostits } from "./domain/postit/DPostits.ts";

export class TextIOService {
  constructor(private postits: DPostits, private links: DLinks) {
  }
  /**
   * テキスト出力する
   * @returns {string}
   */
  outputText() {
    const postitDatas = this.postits.values.map(v => ({
      id: v.id,
      text: v.text,
      pos: {x: v.pos.x, y: v.pos.y}
    }));

    const linkDatas = this.links.values.map(v => ({startId: v.startPostit.id, endId: v.endPostit.id}))
    const output = {postits: postitDatas, links: linkDatas};
    return JSON.stringify(output, null, '  ');
  }

  // inputText(text: string) {
  //   const rawData = JSON.parse(text);
  //   const data = TextIOService.createInstance(rawData);
  //   const links = new DLinks(data.linkViews);
  //   const postits = new DPostits(data.postitViews, links);
  // }


  static createInstance(rawData: {postits: any[], links: any[]}): {postits: DPostits, links: DLinks} {
    const postitViews = rawData.postits.map(v => new DPostit(v.id, v.text, v.pos));
    const postitMap = toMap(postitViews, v => v.id);
    const links = new DLinks(rawData.links.map(v => new DLink(postitMap[v.startId], postitMap[v.endId])));
    const postits = new DPostits(postitViews, links);
    return {postits, links};
  }
}

function toMap(list: any[], idFunc: (v:any) => string) {
  return list.reduce((memo, v) => {
    memo[idFunc(v)] = v;
    return memo;
  }, {})
}