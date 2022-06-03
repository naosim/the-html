import {PostitView} from "./PostitView.ts"
import { DLinks } from "./domain/link/DLinks.ts";
import { DPostit } from "./domain/postit/DPostit.ts";
import { DPostits } from "./domain/postit/DPostits.ts";
import { CommandCenter } from "./command/Command.ts";

export class PostitService {
  constructor(public postits: DPostits, public links: DLinks, private commandCenter: CommandCenter) {
  }

  createPostitId(): string {
    return `${Date.now()}`;
  }

  createNewPostit(pos: {x: number, y: number}): DPostit {
    const id = this.createPostitId();
    this.commandCenter.addPostit({id, text: "", pos});
    // this.postits.add(newPostit);
    return this.postits.find(id);
  }

  createNoLinkPostit(currentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostitView.size.height + 16,
    }
    // const postit = this.createNewPostit(pos);
    const id = this.createPostitId();
    this.commandCenter.addPostit({id, text: "", pos});
    return this.postits.find(id);
  }

  createSidePostit(currentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: currentPostit.pos.x,
      y: currentPostit.pos.y + currentPostitView.size.height + 16,
    }
    const parentPostit = this.links.getOneEndPostit(currentPostit.id);// nullable
    // const postit = this.createNewPostit(pos);
    // const postit = new DPostit(this.createPostitId(), "", pos);
    // if(parentPostit) {
    //   this.links.add(new DLink(postit, parentPostit))
    // }
    const id = this.createPostitId();
    if(parentPostit) {
      this.commandCenter.addPostitsAndLinks({
        postits: [{id, text: "", pos}],
        links: [{startPostitId: id, endPostitId: parentPostit.id}]
      })
    } else {
      this.commandCenter.addPostit({id, text: "", pos});
    }
    return this.postits.find(id);
  }

  createSubPostit(parentPostit: DPostit, currentPostitView: PostitView) {
    const pos = {
      x: parentPostit.pos.x + currentPostitView.size.width + 16,
      y: parentPostit.pos.y + 16,
    }
    const endPostit = parentPostit;
    // const startPostit = new DPostit(this.createPostitId(), "", pos);
    const id = this.createPostitId();
    this.commandCenter.addPostitsAndLinks({
      postits: [{id, text: "", pos}],
      links: [{startPostitId: id, endPostitId: endPostit.id}]
    })
    // this.links.add(new DLink(startPostit, endPostit));
    return this.postits.find(id);
  }

  deletePostit(targetPostit: DPostit) {
    this.commandCenter.deletePostit({postitId: targetPostit.id});
  }

  deletePostits(postits: DPostit[]) {
    this.commandCenter.deletePostitsAndLinks({
      postitIds: postits.map(v => v.id),
      links: []
    })
  }

  move(postit: DPostit, x: number, y: number) {
    this.postits.move(postit.id, {x, y})
  }

  clearAll() {
    this.postits.clearAll();
  }

  addLink(startPostit: DPostit, endPostit: DPostit) {
    this.commandCenter.addLink({startPostitId: startPostit.id, endPostitId: endPostit.id})
  }
  
}
