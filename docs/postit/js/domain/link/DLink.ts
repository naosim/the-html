import { DPostit } from "../postit/DPostit.ts";

export class DLink {
  id;
  
  constructor(public startPostit: DPostit, public endPostit: DPostit) {
    this.id = DLink.uniqId(startPostit, endPostit);
    this.startPostit = startPostit;
    this.endPostit = endPostit;
  }

  has(postitId: string) {
    return this.startPostit.id == postitId || this.endPostit.id == postitId;
  }

  static uniqId(startPostit: DPostit, endPostit: DPostit) {
    return `${startPostit.id}|${endPostit.id}`
  }
}