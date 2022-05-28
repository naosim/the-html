import { DLink } from "./domain/link/DLink.ts";
import {PostitView, PostitPrime} from "./PostitView.ts"
import {calcCollisionPoint} from "./utils/calcCollisionPoint.js"

export class LinkView extends DLink {
  
  constructor(public startPostitView: PostitView, public endPostitView: PostitView) {
    super(startPostitView, endPostitView)
  }

  getEndPoint() {
    if(this.startPostitView.size.width == 0 || this.endPostitView.size.height == 0) {
      return this.endPostitView.center
    }
    return calcCollisionPoint(this.startPostitView.center, this.endPostitView);
  }

  getStartPoint() {
    if(this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
      return this.startPostitView.center
    }
    return calcCollisionPoint(this.endPostitView.center, this.startPostitView);
  }

}
