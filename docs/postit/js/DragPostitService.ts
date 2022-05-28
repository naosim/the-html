import {SelectedPostits} from "./SelectedPostits.ts"
import {MouseMovement} from "./MouseMovement.ts"
import { Postit } from "./Postit.ts";

export class DragPostitService {
  data;
  /** @type MouseMovement */
  mouseMovement;

  /** @type SelectedPostits */
  selectedPostits;
  constructor(data: any) {
    this.data = data;
    this.mouseMovement = data.mouseMovement;
    this.selectedPostits = data.selectedPostits;
  }

  onStartDrag(clientX: number, clientY: number, postit: Postit, event: any) {
    if(event.shiftKey) {
      this.selectedPostits.select(postit);  
    } else {
      this.selectedPostits.selectOne(postit);
    }

    if(this.data.editingPostit.id != postit.id) {
      this.data.editingPostit.updateCenter();
    }
    this.data.editingLink.isEditing = false;

    this.data.editingPostit = postit;
    // get the mouse cursor position at startup:
    this.mouseMovement.updateClientPos(clientX, clientY);

    // link
    this.data.editingLink.pos.updateWithPostit(postit);
  }

  onDragging(clientX: number, clientY: number, postit: Postit) {
    const movement = this.mouseMovement.updateClientPos(clientX, clientY);
    this.selectedPostits.move(movement.x, movement.y)
    
    // link
    this.data.editingLink.pos.updateWithPostit(postit);
  }
}