import {SelectedPostits} from "./SelectedPostits.js"
import {MouseMovement} from "./MouseMovement.js"

export class DragPostitService {
  data;
  /** @type MouseMovement */
  mouseMovement;

  /** @type SelectedPostits */
  selectedPostits;
  constructor(data) {
    this.data = data;
    this.mouseMovement = data.mouseMovement;
    this.selectedPostits = data.selectedPostits;
  }

  onStartDrag(clientX, clientY, postit, event) {
    if(event.shiftKey) {
      this.selectedPostits.select(postit);  
    } else {
      this.selectedPostits.selectOne(postit);
    }

    if(this.data.editingPostit.id != postit.id) {
      this.data.editingPostit.isEditing = false;// 前回の選択を外す
      this.data.editingPostit.updateCenter();
    }
    postit.isEditing = true;
    this.data.editingLink.isEditing = false;

    this.data.editingPostit = postit;
    // get the mouse cursor position at startup:
    this.mouseMovement.updateClientPos(clientX, clientY);

    // link
    this.data.editingLink.pos.x = postit.pos.x - 16;
    this.data.editingLink.pos.y = postit.pos.y + 8;
  }

  onDragging(clientX, clientY, postit) {
    const movement = this.mouseMovement.updateClientPos(clientX, clientY);
    this.selectedPostits.move(movement.x, movement.y)
    
    // link
    this.data.editingLink.pos.x = postit.pos.x - 16;
    this.data.editingLink.pos.y = postit.pos.y + 8;
  }
}