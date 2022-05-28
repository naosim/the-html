import {PostitView, PostitDummy, PostitPrime} from "./PostitView.ts"
import {LinkView} from "./LinkView.ts"
import { DLinks } from "./domain/link/DLinks.ts";
import { DLink } from "./domain/link/DLink.ts";
import { DPostit } from "./domain/postit/DPostit.ts";
import { DPostits } from "./domain/postit/DPostits.ts";

export class PostitService {
  constructor(public postits: DPostits, public links: DLinks) {
  }

  createNewPostit(pos: {x: number, y: number}) {
    const newPostit = new PostitView(`${Date.now()}`, "", pos);
    this.postits.add(newPostit);
    return newPostit;
  }

  createNoLinkPostit(currentPostit: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostit.size.height + 16,
    }
    const postit = this.createNewPostit(pos);
    return postit;
  }

  createSidePostit(currentPostit: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostit.size.height + 16,
    }
    const parentPostit = this.links.getOneEndPostit(currentPostit.id);// nullable
    const postit = this.createNewPostit(pos);
    if(parentPostit) {
      this.links.add(new LinkView(postit, parentPostit as PostitView)) // キャスト
    }
    return postit;
  }

  createSubPostit(parentPostit: PostitView) {
    const pos = {
      x: parentPostit.pos.x + parentPostit.size.width + 16,
      y: parentPostit.pos.y + 16,
    }
    const endPostit = parentPostit;
    const startPostit = this.createNewPostit(pos);
    // this.addLink(startPostit, endPostit);
    this.links.add(new LinkView(startPostit, endPostit));
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

  addLink(startPostit: PostitView, endPostit: PostitView) {
    this.links.add(new LinkView(startPostit, endPostit));
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