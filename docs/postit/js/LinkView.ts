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
      return this.endPostit.pos;
    }
    return calcCollisionPoint(
      this.startPostitView.getCenter(this.startPostit), 
      {
        pos: this.endPostit.pos, size: this.endPostitView.size
      });
  }

  getStartPoint() {
    if(this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
      return this.startPostit.pos
    }
    return calcCollisionPoint(
      this.endPostitView.getCenter(this.endPostit),
      {
        pos: this.startPostit.pos, 
        size: this.startPostitView.size
      }
    );
  }

}