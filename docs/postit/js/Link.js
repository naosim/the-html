import {Postit} from "./Postit.js"

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

  /**
   * 
   * @param {Postit} postit 
   * @returns {boolean} 含まれている場合はtrue
   */
  has(postit) {
    return this.startPostit.id == postit.id || this.endPostit.id == postit.id;
  }
}