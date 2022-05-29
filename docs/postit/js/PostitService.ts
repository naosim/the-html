import {PostitView} from "./PostitView.ts"
import {LinkView} from "./LinkView.ts"
import { DLinks } from "./domain/link/DLinks.ts";
import { DLink } from "./domain/link/DLink.ts";
import { DPostit } from "./domain/postit/DPostit.ts";
import { DPostits } from "./domain/postit/DPostits.ts";

export class PostitService {
  constructor(public postits: DPostits, public links: DLinks) {
  }

  createNewPostit(pos: {x: number, y: number}) {
    const newPostit = new DPostit(`${Date.now()}`, "", pos);
    this.postits.add(newPostit);
    return newPostit;
  }

  createNoLinkPostit(currentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostitView.size.height + 16,
    }
    const postit = this.createNewPostit(pos);
    return postit;
  }

  createSidePostit(currentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostitView.size.height + 16,
    }
    const parentPostit = this.links.getOneEndPostit(currentPostit.id);// nullable
    const postit = this.createNewPostit(pos);
    if(parentPostit) {
      this.links.add(new DLink(postit, parentPostit))
    }
    return postit;
  }

  createSubPostit(parentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: parentPostit.pos.x + currentPostitView.size.width + 16,
      y: parentPostit.pos.y + 16,
    }
    const endPostit = parentPostit;
    const startPostit = this.createNewPostit(pos);
    this.links.add(new DLink(startPostit, endPostit));
    return startPostit;
  }

  deletePostit(targetPostit: DPostit) {
    this.postits.delete(targetPostit.id);
  }

  move(postit: DPostit, x: number, y: number) {
    this.postits.move(postit.id, {x, y})
  }

  clearAll() {
    this.postits.clearAll();
  }

  addLink(startPostit: DPostit, endPostit: DPostit) {
    this.links.add(new DLink(startPostit, endPostit));
  }
  
}


const commandTypes = [
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