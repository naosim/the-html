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
      {
        x: this.startPostit.pos.x + this.startPostitView.size.width / 2,
        y: this.startPostit.pos.y + this.startPostitView.size.height / 2
      }, 
      {
        pos: this.endPostit.pos, size: this.endPostitView.size
      });
  }

  getStartPoint() {
    if(this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
      return this.startPostitView.center
    }
    return calcCollisionPoint(
      {
        x: this.endPostit.pos.x + this.endPostitView.size.width / 2,
        y: this.endPostit.pos.y + this.endPostitView.size.height / 2
      },
      // this.endPostitView.center, 
      {
        pos: this.startPostit.pos, 
        size: this.startPostitView.size
      }
    );
  }

}

// class LinkViews {
//   find(linkId: string) {}
// }