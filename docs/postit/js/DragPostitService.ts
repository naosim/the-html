import { DPostit } from "./domain/postit/DPostit.ts";
import { PostitView, PostitViewRepository } from "./PostitView.ts";
import { EditingLinkPos } from "./EditingLinkPos.ts";

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
  /** @type MouseMovement */
  mouseMovement;

  /** @type SelectedPostits */
  selectedPostits;
  constructor(data: any, private postitViewRepository: PostitViewRepository) {
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
      this.postitViewRepository.find(this.data.editingPostit.id).updateCenter(this.data.editingPostit);
    }
    this.data.editingLink.isEditing = false;

    this.data.editingPostit = postit;
    // get the mouse cursor position at startup:
    this.mouseMovement.updateClientPos(clientX, clientY);

    // link
    this.data.editingLink.pos.updateWithPostit(postit);
  }

  onDragging(clientX: number, clientY: number, postit: DPostit) {
    const movement = this.mouseMovement.updateClientPos(clientX, clientY);
    this.selectedPostits.move(movement.x, movement.y)
    
    // link
    this.data.editingLink.pos.updateWithPostit(postit);
  }
}