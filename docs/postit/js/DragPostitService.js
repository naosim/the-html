export class DragPostitService {
  data;
  constructor(data) {
    this.data = data;
  }
  onStartDrag(clientX, clientY, postit) {
    if(this.data.editingPostit.id != postit.id) {
      this.data.editingPostit.isEditing = false;// 前回の選択を外す
      this.data.editingPostit.updateCenter();
    }
    postit.isEditing = true;
    this.data.editingLink.isEditing = false;

    this.data.editingPostit = postit;
    // get the mouse cursor position at startup:
    this.data.dragPositions.clientX = clientX
    this.data.dragPositions.clientY = clientY

    // link
    this.data.editingLink.pos.x = postit.pos.x - 16;
    this.data.editingLink.pos.y = postit.pos.y + 8;
  }

  onDragging(clientX, clientY, postit) {
    this.data.dragPositions.movementX = this.data.dragPositions.clientX - clientX
    this.data.dragPositions.movementY = this.data.dragPositions.clientY - clientY
    this.data.dragPositions.clientX = clientX
    this.data.dragPositions.clientY = clientY
    // set the element's new position:
    postit.setPos(
      postit.pos.x - this.data.dragPositions.movementX,
      postit.pos.y - this.data.dragPositions.movementY
    )
    
    // link
    this.data.editingLink.pos.x = postit.pos.x - 16;
    this.data.editingLink.pos.y = postit.pos.y + 8;

  }
}