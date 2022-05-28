import {Postit, PostitDummy, PostitPrime} from "./Postit.ts"
import {Link, Links} from "./Link.ts"

export class PostitService {
  constructor(public postits: Postit[], public links: Links) {
  }

  createNewPostit(pos: {x: number, y: number}) {
    const newPostit = new Postit(`${Date.now()}`, "", pos);
    this.postits.push(newPostit);
    return newPostit;
  }

  createNoLinkPostit(currentPostit: Postit) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostit.size.height + 16,
    }
    const postit = this.createNewPostit(pos);
    return postit;
  }

  createSidePostit(currentPostit: Postit) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostit.size.height + 16,
    }
    const parentPostit = this.links.getOneEndPostit(currentPostit);// nullable
    const postit = this.createNewPostit(pos);
    if(parentPostit) {
      this.links.push(new Link(postit, parentPostit))
    }
    return postit;
  }

  createSubPostit(parentPostit: Postit) {
    const pos = {
      x: parentPostit.pos.x + parentPostit.size.width + 16,
      y: parentPostit.pos.y + 16,
    }
    const endPostit = parentPostit;
    const startPostit = this.createNewPostit(pos);
    // this.addLink(startPostit, endPostit);
    this.links.push(new Link(startPostit, endPostit));
    return startPostit;
  }

  deletePostit(targetPostit: PostitPrime) {
    // 付箋の削除
    this.postits
        .map((v, i) => v.id == targetPostit.id ? i : -1)
        .filter(v => v >= 0)
        .reverse() // 1つしかないはずだから意味ない
        .forEach(v => this.postits.splice(v, 1))
      
      // linkの削除
      this.links.exclude(targetPostit);
  }

  setPos(postit: PostitPrime, x: number, y: number) {
    postit.setPos(x, y);
  }

  clearAll() {
    // 一気に消せるかも
    for(let i = this.postits.length - 1; i >= 0; i--) {
      this.postits.splice(i, 1)
    }
    this.links.clear();
  }

  addLink(startPostit: Postit, endPostit: Postit) {
    this.links.push(new Link(startPostit, endPostit));
  }
  
}

const usecaseTypes = [
  "postit.add",        // 追加
  "postit.delete",     // 削除。リンクも消える
  "postit.updateText", // テキスト更新 
  "postit.move",       // 移動

  "postits.delete", // リンクも消える
  "postits.move",

  "link.add",
  "link.delete",

  "links.delete"
]