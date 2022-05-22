import {Postit, PostitDummy} from "./Postit.js"

export class PostitService {
  /** @type Postit[] */
  postits;
  links;
  constructor(postits, links) {
    this.postits = postits;
    this.links = links;
  }

  createNewPostit(pos) {
    const newPostit = new Postit(`${Date.now()}`, "", pos);
    this.postits.push(newPostit);
    return newPostit;
  }

  createSubPostit(parentPostit) {
    const pos = {
      x: parentPostit.pos.x + parentPostit.size.width + 16,
      y: parentPostit.pos.y + 16,
    }
    const endPostit = parentPostit;
    const startPostit = this.createNewPostit(pos);
    this.addLink(startPostit, endPostit);
    return startPostit;
  }

  deletePostit(targetPostit) {
    // 付箋の削除
    this.postits
        .map((v, i) => v.id == targetPostit.id ? i : -1)
        .filter(v => v >= 0)
        .reverse() // 1つしかないはずだから意味ない
        .forEach(v => this.postits.splice(v, 1))
      

      // linkの削除
      const indexies = this.links
        .map((v, i) => v.startPostit.id == targetPostit.id || v.endPostit.id == targetPostit.id ? i : -1)
        .filter(v => v >= 0)
        .reverse();
      indexies.forEach(v => this.links.splice(v, 1))
  }

  setPos(postit, x, y) {
    postit.setPos(x, y);
  }

  clearAll() {
    // 一気に消せるかも
    for(let i = this.postits.length - 1; i >= 0; i--) {
      this.postits.splice(i, 1)
    }
    for(let i = this.links.length - 1; i >= 0; i--) {
      this.links.splice(i, 1)
    }
  }

  addLink(startPostit, endPostit) {
    this.links.push({startPostit, endPostit});
  }
  
}