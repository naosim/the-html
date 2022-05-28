import {DPostit} from "./domain/postit/DPostit.ts"

export class EditingLinkPos {
  x = -10;
  y = -10;
  updateWithPostit(postit: DPostit) {
    this.x = postit.pos.x - 12;
    this.y = postit.pos.y + 14;
  }
}