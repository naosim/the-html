import {PostitPrime} from "./Postit.ts"

export class EditingLinkPos {
  x = -10;
  y = -10;
  updateWithPostit(postit: PostitPrime) {
    this.x = postit.pos.x - 12;
    this.y = postit.pos.y + 14;
  }
}