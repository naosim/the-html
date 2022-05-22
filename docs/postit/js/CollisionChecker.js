export class CollisionChecker {
  /** @type Postit[] */
  postits;
  
  constructor(postits) {
    this.postits = postits;
  }

  findCollidedPostit(pos) {
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