import {Postit} from "./Postit.js"
import {calcCollisionPoint} from "./utils/calcCollisionPoint.js"

export class Link {
  /** @type Postit */
  startPostit;
  /** @type Postit */
  endPostit;

  /**
   * @param {Postit} startPostit 
   * @param {Postit} endPostit 
   */
  constructor(startPostit, endPostit) {
    this.startPostit = startPostit;
    this.endPostit = endPostit;
  }

  getEndPoint() {
    if(this.endPostit.size.width == 0 || this.endPostit.size.height == 0) {
      return this.endPostit.center
    }
    return calcCollisionPoint(this.startPostit.pos, this.endPostit);
  }

  getStartPoint() {
    if(this.startPostit.size.width == 0 || this.startPostit.size.height == 0) {
      return this.startPostit.center
    }
    return calcCollisionPoint(this.endPostit.pos, this.startPostit);
  }

  /**
   * 
   * @param {Postit} postit 
   * @returns {boolean} 含まれている場合はtrue
   */
  has(postit) {
    return this.startPostit.id == postit.id || this.endPostit.id == postit.id;
  }
}