import {DPostit} from "./domain/postit/DPostit.ts"
import {DLink} from "./domain/link/DLink.ts"

import {PostitView, PostitDummy, PostitViewRepository} from "./PostitView.ts"
import {PostitService} from "./PostitService.ts"
import {CollisionChecker} from "./CollisionChecker.ts"
import {TextIOService} from "./TextIOService.ts"
import {DragPostitService} from "./DragPostitService.ts"
import {SelectedPostits} from "./SelectedPostits.ts"
import {MouseMovement} from "./MouseMovement.ts"
import {LinkView} from "./LinkView.ts"
import {EditingLinkPos} from "./EditingLinkPos.ts"
import {Selected} from "./Selected.ts"
import { CommandCenter } from "./command/Command.ts";

declare var document: any;
declare var window: any;
declare var Vue: any;

class EditingLink {
  startPostit: DPostit = dummyPostit;
  endPostitPos = {x: 0, y: 0};
  pos = new EditingLinkPos();
  isEditing = false;

  clear() {
    this.startPostit = dummyPostit;
    this.endPostitPos = {x: 0, y: 0};
    this.pos = new EditingLinkPos();
    this.isEditing = false;
  }
}

const dummyPostit = PostitDummy.instance();

const rawData = {
  postits: [
    {id: "001", text: "hoge", pos: {x: 0, y : 100}},
    {id: "002", text: "foo", pos: {x: 100, y : 0}},
    {id: "003", text: "bar", pos: {x: 100, y : 100}}
  ],
  links: [
    {startId: "001", endId: "002"}
  ]
}
var postitViewRepository = new PostitViewRepository();
var collisionChecker = new CollisionChecker([], postitViewRepository);
const postitsAndLinks = TextIOService.createInstance(rawData);
const commandCenter = new CommandCenter(postitsAndLinks.postits, postitsAndLinks.links);
postitsAndLinks.postits.values.map(v => new PostitView(v.id)).forEach(v => postitViewRepository.add(v));

const data = {
  message: 'Hello Vue!',
  mouseMovement: new MouseMovement(),
  ...postitsAndLinks,
  selectedPostits: new SelectedPostits(dummyPostit),
  editingLink: new EditingLink(),
  editingPostit: dummyPostit,
  isFocusForText: false,
  textHeight: 20, // 定数
  refreshCount: 1,
  selectedLinks: new Selected(new DLink(dummyPostit, dummyPostit)),
  shock: Date.now(),
  linkShock: Date.now(),
  commandCenter: commandCenter
};

var dragPostitService : DragPostitService | null = null;

var app = new Vue({
  el: '#app',
  data: data,
  methods: {
    getPostitAndViews: function() {
      const result = data.postits.values.map(v => ({postit: v, postitView: postitViewRepository.find(v.id)}));
      return result;
    },
    getPostitView: function(postitId: string) {
      return postitViewRepository.find(postitId);
    },
    clickLine: function(event: any, link: DLink) {
      console.log("click");
      if(event.shiftKey) {
        data.selectedLinks.select(link);
      } else {
        data.selectedLinks.selectOne(link);
      }
      data.isFocusForText = false;
      data.selectedPostits.clear();
      data.linkShock = Date.now();
    },
    getLinePath: function(link: DLink) {
      const linkView: LinkView = new LinkView(
        link.startPostit,
        link.endPostit,
        postitViewRepository.find(link.startPostit.id),
        postitViewRepository.find(link.endPostit.id)
      );
      const s = linkView.getStartPoint();
      const e = linkView.getEndPoint();
      return `M${s.x},${s.y} L${e.x},${e.y}`
    },
    getPostitService: function(): PostitService {
      return new PostitService(data.postits, data.links, commandCenter);
    },
    getTextIOService: function(): TextIOService {
      return new TextIOService(data.postits, data.links);
    },
    getDragPostitService: function() {
      return new DragPostitService(data, postitViewRepository, commandCenter);
    },
    dragMouseDownForLink: function(event: any) {
      data.editingLink.startPostit = data.editingPostit;
      data.editingLink.endPostitPos = {x: 0, y: 0};// ダミーをセットする
      data.editingLink.isEditing = true;

      data.selectedLinks.clear();

      // get the mouse cursor position at startup:
      data.mouseMovement.updateClientPos(event.clientX, event.clientY);
      collisionChecker = new CollisionChecker(data.postits.values, postitViewRepository);

      event.preventDefault()
      document.onmousemove = (event: any) => this.linkDrag(event);
      document.onmouseup = (event: any) => this.closeLinkDrag(event);
    },
    linkDrag: function (event: any) {
      event.preventDefault()
      const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter(v => v.id != data.editingLink.startPostit.id)
      if(postits.length == 1) {
        data.editingLink.endPostitPos = postits[0].pos
      } else {
        data.editingLink.endPostitPos = {x: 0, y: 0};
      }
      data.editingLink.pos.x = event.clientX;
      data.editingLink.pos.y = event.clientY;

    },
    closeLinkDrag: function(event: any) {
      // if(!PostitDummy.isDummy(data.editingLink.startPostit)) {
      const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter(v => v.id != data.editingLink.startPostit.id);
      if(postits.length == 1) {
        const startPostitId = data.editingLink.startPostit.id;
        const endPostitId = postits[0].id;
        if(!data.links.has(startPostitId, endPostitId)) {
          commandCenter.addLink({startPostitId, endPostitId});
          data.editingLink.pos.updateWithPostit(data.editingLink.startPostit);
        } else {
          console.log("linkが重複");
        }
      }
        
      // }
      document.onmouseup = null
      document.onmousemove = null
    },
    dragMouseDown: function (event: any, postit: DPostit) {
      dragPostitService = new DragPostitService(data, postitViewRepository, commandCenter);
      dragPostitService.onStartDrag(event.clientX, event.clientY, postit, event);
      data.selectedLinks.clear();

      document.querySelector("textarea").focus();

      event.preventDefault()
      document.onmousemove = (event: any) => this.elementDrag(event, postit);
      document.onmouseup = (event: any) => this.closeDragElement(event, postit);
    },
    elementDrag: function (event: any, postit: DPostit) {
      dragPostitService!.onDragging(event.clientX, event.clientY, postit);
      event.preventDefault()
    },
    closeDragElement: function(event: any, postit: DPostit) {
      dragPostitService!.onEndDrag(event.clientX, event.clientY, postit);
      document.onmouseup = null
      document.onmousemove = null
      dragPostitService = null;
    },
    toEditMode: function(postit: DPostit) {
      data.editingPostit = postit;
      data.isFocusForText = true;

      // link
      data.editingLink.pos.updateWithPostit(postit);
      this.updateEditingPostitSize();
    },
    createNewPostit: function(pos: {x: number, y: number}) {
      const newPostit = this.getPostitService().createNewPostit(pos);
      this.toEditMode(newPostit);  
      return newPostit;// ほんとはasyncが正しいかもしれない
    },
    createNoLinkPostit: function() {// 編集中の付箋の近くに
      const newPostit = this.getPostitService().createNoLinkPostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
      postitViewRepository.add(new PostitView(newPostit.id));
      this.toEditMode(newPostit);
    },
    createNewSheet: function() {
      this.clear();
      this.createNewPostit({x: 100, y: 100});
    },
    calcSize: function() {
      //data.selectedPostits.clear();// vueに刺激を与える
      setTimeout(() => {
        data.postits.values.forEach((v, i) => {
          const postitView = postitViewRepository.find(v.id);
          const div: any = (this as any).$refs.postit[i];
          postitView.updateSize(div, v);
        })
        data.shock = Date.now();
      }, 1); // ちょっと待てばdivが作られるだろうって発想
    },
    deletePostit: function() {
      if(PostitDummy.isDummy(data.editingPostit)) {
        return;
      }
      this.getPostitService().deletePostits(data.selectedPostits.values);
      data.editingPostit = dummyPostit;
      this.calcSize();
    },
    
    clear: function() {
      this.getPostitService().clearAll();
      data.editingPostit = dummyPostit;
      data.editingLink.clear();
      data.isFocusForText = false;
      data.selectedPostits.clear();
    },
    outputText: function() {
      const text = this.getTextIOService().outputText();
      console.log(text);
    },
    outputSvg: function() {
      console.log(document.querySelector("#mainSvg").outerHTML)
    },
    inputText: function(text: string) {
      this.getTextIOService().inputText(text);
      this.calcSize();
    },
    updateEditingPostitSize() {
      if(PostitDummy.isDummy(data.editingPostit)) {
        return;
      }
      setTimeout(v => {
        const postit = data.editingPostit;
        const postitView = postitViewRepository.find(postit.id);
        const isUpdated = postitView.updateSize(document.getElementById(data.editingPostit.id), postit);
        if(isUpdated) {
          data.shock = Date.now();
        }
        
      }, 1)
    },
    toDisplayText(text: string) {
      if(text.length == 0) {
        return 'new'
      }
      if(text[text.length - 1] == '\n') {
        return text + ' '
      }
      return text;
    },
    undo() {
      commandCenter.undo();
    }
  },
  mounted: function() {
    data.selectedPostits.clear();
    data.selectedLinks.clear();

    data.postits.values.forEach((v, i) => {
      const postitView = postitViewRepository.find(v.id);
      postitView.updateSize(this.$refs.postit[i], v)
    })
    setInterval(()=> {
      if(!this.$data.isFocusForText) {
        return;
      }
      this.updateEditingPostitSize();
    }, 1000)

    console.log("mounted");
    document.addEventListener('keydown', (event: any) => {
      console.log(event);

      const postitService: PostitService = this.getPostitService();

      // 選択中のふせんをキー操作で動かす
      data.selectedPostits.moveSelectedPostitIfKeyPressed(event);

      if(event.code == "Enter") {
        this.$data.refreshCount++;
      }

      if(event.code == "Backspace" && !this.$data.selectedLinks.isNoSelected() && !PostitDummy.isDummy(this.$data.selectedLinks.values[0].startPostit)) {
        if(!this.$data.isFocusForText && this.$data.selectedPostits.isNoSelected()) {
          console.log("delete link");
          console.log(confirm("矢印を削除します。よろしいですか？"));
          commandCenter.deletePostitsAndLinks({
            postitIds: [],
            links: data.selectedLinks.values.map(v => v as DLink).map(v =>({startPostitId: v.startPostit.id, endPostitId: v.endPostit.id}))
          })
          // data.selectedLinks.forEach(v => this.$data.links.delete(v.id))
          data.selectedLinks.clear();
        }
      }

      if(event.code == "Esc") {
        this.$data.editingPostit = dummyPostit;
        this.$data.editingLink.isEditing = false;
        data.selectedLinks.clear();
        data.selectedPostits.clear();
        this.data.shock = Date.now();
      }

      
      if(event.code == "Enter" && event.shiftKey) {
        if(PostitDummy.isDummy(data.editingPostit)) {
          return;
        }
        const newPostit = postitService.createSidePostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
        postitViewRepository.add(new PostitView(newPostit.id))
        this.toEditMode(newPostit);
        event.preventDefault()
      }
      if(event.code == "Tab") {// タブが押されたら、サブ付箋を作る
        if(PostitDummy.isDummy(data.editingPostit)) {
          return;
        }
        const newPostit = postitService.createSubPostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
        postitViewRepository.add(new PostitView(newPostit.id))
        this.toEditMode(newPostit);
        event.preventDefault()
      }
    })
    this.calcSize();

  },
  computed: {
    linkArrows: function() {
      data.linkShock;
      console.log("linkArrows");
      return data.links.values.map(link => {
        const linkView: LinkView = new LinkView(
          link.startPostit,
          link.endPostit,
          postitViewRepository.find(link.startPostit.id),
          postitViewRepository.find(link.endPostit.id)
        );
        const s = linkView.getStartPoint();
        const e = linkView.getEndPoint();
        return {
          link: link,
          path: `M${s.x},${s.y} L${e.x},${e.y}`,
          isSelected: (this as any).selectedLinks.isSelected(link),
          hasStartPostitDiv: postitViewRepository.find(link.startPostit.id).isDiv
        }
      })
    },
    lineEndPos: function(): {x: number, y: number} {
      const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter(v => v.id != data.editingLink.startPostit.id);
      const pos = postits.length == 1 ? postitViewRepository.find(postits[0].id).getCenter(postits[0]) : data.editingLink.pos;
      return {x: pos.x, y: pos.y} // 呼ばれるたびに新たなインスタンスを生成する。こうしないと最初の戻り値のインスタンスを永遠監視される。
    },
    postitAndViews: function() {
      data.shock;// 更新を監視している
      const result = data.postits.values.map(v => ({
        postit: v, postitView: postitViewRepository.find(v.id),
        isSelected: data.selectedPostits.isSelected(v.id)
      }));
      console.log("postitAndViews");
      return result;
    }
  }
})

window.app = app;