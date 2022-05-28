import {Postit} from "./Postit.ts"
import {Link, Links} from "./Link.ts"

export class TextIOService {
  constructor(private postits: Postit[], private links: Links) {
  }

  /**
   * テキスト出力する
   * @returns {string}
   */
  outputText() {
    const postits = this.postits.map(v => ({
      id: v.id,
      text: v.text,
      pos: {x: v.pos.x, y: v.pos.y}
    }));

    const links = this.links.values.map(v => ({startId: v.startPostit.id, endId: v.endPostit.id}))
    const output = {postits, links};
    return JSON.stringify(output, null, '  ');
  }

  inputText(text: string) {
    const rawData = JSON.parse(text);
    const data = TextIOService.createInstance(rawData);
    const postits: Postit[] = data.postits;
    const links: Links = data.links; 
    postits.forEach(v => this.postits.push(v));
    links.values.forEach(v => this.links.push(v))
  }


  static createInstance(rawData: {postits: any[], links: any[]}) {
    const postits = rawData.postits.map(v => new Postit(v.id, v.text, v.pos));
    const postitMap = toMap(postits, v => v.id);
    const links = new Links(rawData.links.map(v => new Link(postitMap[v.startId], postitMap[v.endId])));
  
    return {postits, links};
  }
}

function toMap(list: any[], idFunc: (v:any) => string) {
  return list.reduce((memo, v) => {
    memo[idFunc(v)] = v;
    return memo;
  }, {})
}