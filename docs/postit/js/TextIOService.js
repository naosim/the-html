import {Postit} from "./Postit.js"

export class TextIOService {
  /** @type Postit[] */
  postits;
  links;
  constructor(postits, links) {
    this.postits = postits;
    this.links = links;
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

    const links = this.links.map(v => ({startId: v.startPostit.id, endId: v.endPostit.id}))
    const output = {postits, links};
    return JSON.stringify(output, null, '  ');
  }

  inputText(text) {
    const rawData = JSON.parse(text);
    const data = TextIOService.createInstance(rawData);

    data.postits.forEach(v => this.postits.push(v))
    data.links.forEach(v => this.links.push(v))
  }

  
  static createInstance(rawData) {
    const postits = rawData.postits.map(v => new Postit(v.id, v.text, v.pos));
    const postitMap = toMap(postits, v => v.id);
    const links = rawData.links.map(v => ({
      startPostit: postitMap[v.startId], 
      endPostit: postitMap[v.endId]
    }));
  
    return {postits, links};
  }
}

function toMap(list, idFunc) {
  return list.reduce((memo, v) => {
    memo[idFunc(v)] = v;
    return memo;
  }, {})
}