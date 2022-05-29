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

declare var document: any;
declare var window: any;
declare var Vue: any;

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
postitsAndLinks.postits.values.map(v => new PostitView(v.id)).forEach(v => postitViewRepository.add(v));

const data = {
  message: 'Hello Vue!',
  mouseMovement: new MouseMovement(),
  ...postitsAndLinks,
  selectedPostits: new SelectedPostits(dummyPostit),
  editingLink: {
    startPostit: dummyPostit,
    endPostit: dummyPostit,
    pos: new EditingLinkPos(),
    isEditing: false
  },
  editingPostit: dummyPostit,
  isFocusForText: false,
  textHeight: 20, // 定数
  refreshCount: 1,
  selectedLinks: new Selected(new DLink(dummyPostit, dummyPostit)),
  shock: Date.now()
};

var app = new Vue({
  el: '#app',
  data: data,
  methods: {
    getPostitAndViews: function() {
      const result = data.postits.values.map(v => ({postit: v, postitView: postitViewRepository.find(v.id)}));
      
      console.log("getPostitAndViews", result.length);
      // result.forEach(v => console.log(v.postitView.size.width))
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
      console.log(data.selectedLinks.values.length);
      data.isFocusForText = false;
      data.selectedPostits.clear();
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
      console.log("getLinePath", linkView.startPostitView.isDiv);
      return `M${s.x},${s.y} L${e.x},${e.y}`
    },
    getPostitService: function(): PostitService {
      return new PostitService(data.postits, data.links);
    },
    getTextIOService: function(): TextIOService {
      return new TextIOService(data.postits, data.links);
    },
    getDragPostitService: function() {
      return new DragPostitService(data, postitViewRepository);
    },
    dragMouseDownForLink: function(event: any) {
      data.editingLink.startPostit = data.editingPostit;
      data.editingLink.endPostit = dummyPostit;// ダミーをセットする
      data.editingLink.isEditing = true;

      data.selectedLinks.clear();

      // get the mouse cursor position at startup:
      data.mouseMovement.updateClientPos(event.clientX, event.clientY);

      /** @type Postit[] */
      const postits = data.postits.values;
      postits.forEach(v => postitViewRepository.find(v.id).updateCenter(v))
      collisionChecker = new CollisionChecker(postits, postitViewRepository);

      event.preventDefault()
      document.onmousemove = (event: any) => this.linkDrag(event);
      document.onmouseup = (event: any) => this.closeLinkDrag(event);
    },
    linkDrag: function (event: any) {
      event.preventDefault()
      const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter(v => v.id != data.editingLink.startPostit.id)
      if(postits.length == 1) {
        data.editingLink.endPostit = postits[0]
      } else {
        data.editingLink.endPostit = dummyPostit;
      }
      data.editingLink.pos.x = event.clientX;
      data.editingLink.pos.y = event.clientY;
      console.log(postits.length);

    },
    closeLinkDrag: function(event: any) {
      if(!PostitDummy.isDummy(data.editingLink.startPostit) && !PostitDummy.isDummy(data.editingLink.endPostit)) {
        data.links.add(new DLink(
          data.editingLink.startPostit,
          data.editingLink.endPostit
        ))
        data.editingLink.pos.updateWithPostit(data.editingLink.startPostit);
      }
      document.onmouseup = null
      document.onmousemove = null
    },
    dragMouseDown: function (event: any, postit: DPostit) {
      this.getDragPostitService().onStartDrag(event.clientX, event.clientY, postit, event);
      data.selectedLinks.clear();

      document.querySelector("textarea").focus();

      event.preventDefault()
      document.onmousemove = (event: any) => this.elementDrag(event, postit);
      document.onmouseup = (event: any) => this.closeDragElement(event);
    },
    elementDrag: function (event: any, postit: DPostit) {
      this.getDragPostitService().onDragging(event.clientX, event.clientY, postit);
      event.preventDefault()
    },
    closeDragElement: function(event: any) {
      document.onmouseup = null
      document.onmousemove = null
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
      data.selectedPostits.clear();// vueに刺激を与える
      setTimeout(() => {
        data.postits.values.forEach((v, i) => {
          const postitView = postitViewRepository.find(v.id);
          const div: any = (this as any).$refs.postit[i];
          postitView.updateSize(div, v);
        })
        console.log("updateSize");
        data.shock = Date.now();
      }, 1); // ちょっと待てばdivが作られるだろうって発想
    },
    deletePostit: function() {
      console.log("delete");
      if(PostitDummy.isDummy(data.editingPostit)) {
        return;
      }
      data.selectedPostits.values.forEach(v => this.getPostitService().deletePostit(v));
      // this.getPostitService().deletePostit(this.$data.editingPostit)

      data.editingPostit = dummyPostit;
      this.calcSize();
    },
    
    clear: function() {
      this.getPostitService().clearAll();
      
      data.editingPostit = dummyPostit;
      data.editingLink.startPostit = dummyPostit;
      data.editingLink.endPostit = dummyPostit;
      data.editingLink.pos.x = 0;
      data.editingLink.pos.y = 0;
      data.editingLink.isEditing = false;
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
    // inputText: function(text: string) {
    //   this.clear();
    //   this.getTextIOService().inputText(text);
    //   this.calcSize();
    // },
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
  },
  mounted: function() {
    data.postits.values.forEach((v, i) => {
      const postitView = postitViewRepository.find(v.id);
      // var b = this.$refs;
      // var c = this.$refs.postit;
      // var a = this.$refs.postit[i];
      // console.log(b, c, a);
      postitView.updateSize(this.$refs.postit[i], v)
    })
    setInterval(()=> {
      if(!this.$data.isFocusForText) {
        return;
      }
      this.updateEditingPostitSize();
    }, 1000)
    // this.$refs.textarea.addEventListener('compositionend', () => this.$data.postits.forEach((v, i) => v.setDiv(this.$refs.postit[i])));
    // this.$refs.textarea.addEventListener('compositionend', () => this.$data.postits.forEach((v, i) => v.setDiv(this.$refs.postit[i])));

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
          data.selectedLinks.forEach(v => this.$data.links.delete(v.id))
          data.selectedLinks.clear();
        }
      }

      if(event.code == "Esc") {
        this.$data.editingPostit = dummyPostit;
        this.$data.editingLink.isEditing = false;
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
    lineEndPos: function(): {x: number, y: number} {
      // return {x: 0, y: 0};
      if(PostitDummy.isDummy(data.editingLink.endPostit)) {
        return data.editingLink.pos;
      }
      return postitViewRepository.find(data.editingLink.endPostit.id).center;
    },
    postitAndViews: function() {
      data.shock;// 更新を監視している
      const result = data.postits.values.map(v => ({postit: v, postitView: postitViewRepository.find(v.id)}));
      
      // console.log("getPostitAndViews", result.length);
      // result.forEach(v => console.log(v.postitView.size.width))
      return result;
    }
  }
})

window.app = app;