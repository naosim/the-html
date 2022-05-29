import { DPostit } from "./domain/postit/DPostit.ts";
import {PostitView} from "./PostitView.ts"
import {calcCollisionPoint} from "./utils/calcCollisionPoint.js"

export class LinkView {
  
  constructor(
    public readonly startPostit: DPostit, 
    public readonly endPostit: DPostit,
    public readonly startPostitView: PostitView, 
    public readonly endPostitView: PostitView
  ) {
  }

  getEndPoint() {
    if(this.startPostitView.size.width == 0 || this.endPostitView.size.height == 0) {
      return this.endPostitView.center
    }
    return calcCollisionPoint(
      this.startPostitView.center, {pos: this.endPostit.pos, size: this.endPostitView.size});
  }

  getStartPoint() {
    if(this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
      return this.startPostitView.center
    }
    return calcCollisionPoint(this.endPostitView.center, {pos: this.startPostit.pos, size: this.startPostitView.size});
  }

}

// class LinkViews {
//   find(linkId: string) {}
// }