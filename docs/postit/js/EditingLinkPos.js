import {Postit, PostitDummy} from "./Postit.js"

export class EditingLinkPos {
  x = -10;
  y = -10;
  updateWithPostit(postit) {
    this.x = postit.pos.x - 12;
    this.y = postit.pos.y + 14;
  }
}