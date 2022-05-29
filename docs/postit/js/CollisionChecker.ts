import { DPostit } from "./domain/postit/DPostit.ts";
import {PostitViewRepository } from "./PostitView.ts";

export class CollisionChecker {
  
  constructor(private postits: DPostit[], private postitViewRepository: PostitViewRepository) {
  }

  findCollidedPostit(pos: {x: number, y: number}) {
    return this.postits.filter(v => {
      const postitView = this.postitViewRepository.find(v.id);
      const rightBottom = postitView.getRightBottom(v);
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