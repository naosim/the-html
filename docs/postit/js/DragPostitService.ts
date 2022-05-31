import { DPostit } from "./domain/postit/DPostit.ts";
import { PostitView, PostitViewRepository } from "./PostitView.ts";
import { EditingLinkPos } from "./EditingLinkPos.ts";
import { CommandCenter } from "./command/Command.ts";

export class DragPostitService {
  data: {
    editingPostit: DPostit,
    editingLink: {
      startPostit: DPostit,
      endPostit: DPostit,
      pos: EditingLinkPos,
      isEditing: boolean
    }
  };
  startPos = {x: 0, y: 0};
  /** @type MouseMovement */
  mouseMovement;

  /** @type SelectedPostits */
  selectedPostits;
  constructor(data: any, private postitViewRepository: PostitViewRepository, private commandCenter: CommandCenter) {
    this.data = data;
    this.mouseMovement = data.mouseMovement;
    this.selectedPostits = data.selectedPostits;
  }

  onStartDrag(clientX: number, clientY: number, postit: DPostit, event: any) {
    if(event.shiftKey) {
      this.selectedPostits.select(postit);  
    } else {
      this.selectedPostits.selectOne(postit);
    }

    if(this.data.editingPostit.id != postit.id) {
      // this.postitViewRepository.find(this.data.editingPostit.id).updateCenter(this.data.editingPostit);
    }
    this.data.editingLink.isEditing = false;

    this.data.editingPostit = postit;
    // get the mouse cursor position at startup:
    this.mouseMovement.updateClientPos(clientX, clientY);

    // link
    this.data.editingLink.pos.updateWithPostit(postit);

    this.startPos.x = postit.pos.x;
    this.startPos.y = postit.pos.y;
    console.log("start", postit.pos.x);
    console.log("start", this.startPos.x);
  }

  onDragging(clientX: number, clientY: number, postit: DPostit) {
    const movement = this.mouseMovement.updateClientPos(clientX, clientY);
    this.selectedPostits.move(movement.x, movement.y)
    
    // link
    this.data.editingLink.pos.updateWithPostit(postit);
  }
  onEndDrag(clientX: number, clientY: number, postit: DPostit) {
    console.log("end", this.startPos.x);
    if(postit.pos.x == this.startPos.x && postit.pos.y == this.startPos.y) {
      return;
    }
    console.log(this.selectedPostits.getSelectedIds());
    this.commandCenter.movePostitsForUndo({
      ids: this.selectedPostits.getSelectedIds(), 
      diff: {
        diffX: postit.pos.x - this.startPos.x,
        diffY: postit.pos.y - this.startPos.y,
      }})
    console.log("onEndDrag", postit.pos.x, postit.pos.y, this.startPos.x, this.startPos.y);
  }
}