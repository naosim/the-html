import { PostitView } from "./PostitView.ts";

export class CollisionChecker {
  /** @type Postit[] */
  postits;
  
  constructor(postits: PostitView[]) {
    this.postits = postits;
  }

  findCollidedPostit(pos: {x: number, y: number}) {
    return this.postits.filter(v => {
      const rightBottom = v.rightBottom;
      if(rightBottom.x < pos.x || rightBottom.y < pos.y) {
        return false;
      }
      if(v.pos.x > pos.x || v.pos.y > pos.y) {
        return false;
      }
      return true;

    })
  }

}