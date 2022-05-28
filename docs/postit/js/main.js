import {Postit, PostitDummy} from "./Postit.ts"
import {PostitService} from "./PostitService.ts"
import {CollisionChecker} from "./CollisionChecker.ts"
import {TextIOService} from "./TextIOService.ts"
import {DragPostitService} from "./DragPostitService.ts"
import {SelectedPostits} from "./SelectedPostits.ts"
import {MouseMovement} from "./MouseMovement.ts"
import {Link} from "./Link.ts"
import {EditingLinkPos} from "./EditingLinkPos.ts"
import {Selected} from "./Selected.ts"

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

const data = {
  message: 'Hello Vue!',
  mouseMovement: new MouseMovement(),
  ...TextIOService.createInstance(rawData),
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
  selectedLinks: new Selected(new Link(dummyPostit, dummyPostit))
};

var collisionChecker = new CollisionChecker([]);

var app = new Vue({
  el: '#app',
  data: data,
  methods: {
    clickLine: function(event, link) {
      console.log("click");
      if(event.shiftKey) {
        this.$data.selectedLinks.select(link);
      } else {
        this.$data.selectedLinks.selectOne(link);
      }
      console.log(this.$data.selectedLinks.values.length);
      this.$data.isFocusForText = false;
      this.$data.selectedPostits.clear();
    },
    getLinePath: function(link) {
      const s = link.getStartPoint();
      const e = link.getEndPoint();
      return `M${s.x},${s.y} L${e.x},${e.y}`
    },
    getPostitService: function() {
      return new PostitService(this.$data.postits, this.$data.links);
    },
    getTextIOService: function() {
      return new TextIOService(this.$data.postits, this.$data.links);
    },
    getDragPostitService: function() {
      return new DragPostitService(this.$data);
    },
    dragMouseDownForLink: function(event) {
      this.editingLink.startPostit = this.editingPostit;
      this.editingLink.endPostit = dummyPostit;// ダミーをセットする
      this.editingLink.isEditing = true;

      this.$data.selectedLinks.clear();

      // get the mouse cursor position at startup:
      this.mouseMovement.updateClientPos(event.clientX, event.clientY);

      /** @type Postit[] */
      const postits = this.$data.postits;
      postits.forEach(v => v.updateCenter())
      collisionChecker = new CollisionChecker(postits);

      event.preventDefault()
      document.onmousemove = (event) => this.linkDrag(event);
      document.onmouseup = (event) => this.closeLinkDrag(event);
    },
    linkDrag: function (event) {
      event.preventDefault()
      const postits = collisionChecker.findCollidedPostit(this.editingLink.pos).filter(v => v.id != this.editingLink.startPostit.id)
      if(postits.length == 1) {
        this.editingLink.endPostit = postits[0]
      } else {
        this.editingLink.endPostit = dummyPostit;
      }
      this.editingLink.pos.x = event.clientX;
      this.editingLink.pos.y = event.clientY;
      console.log(postits.length);

    },
    closeLinkDrag () {
      if(!PostitDummy.isDummy(this.editingLink.startPostit) && !PostitDummy.isDummy(this.editingLink.endPostit)) {
        this.links.push(new Link(
          this.editingLink.startPostit,
          this.editingLink.endPostit
        ))
        this.$data.editingLink.pos.updateWithPostit(this.editingLink.startPostit);
      }
      document.onmouseup = null
      document.onmousemove = null
    },
    dragMouseDown: function (event, postit) {
      this.getDragPostitService().onStartDrag(event.clientX, event.clientY, postit, event);
      this.$data.selectedLinks.clear();

      document.querySelector("textarea").focus();

      event.preventDefault()
      document.onmousemove = (event) => this.elementDrag(event, postit);
      document.onmouseup = (event) => this.closeDragElement(event);
    },
    elementDrag: function (event, postit) {
      this.getDragPostitService().onDragging(event.clientX, event.clientY, postit);
      event.preventDefault()
    },
    closeDragElement: function() {
      document.onmouseup = null
      document.onmousemove = null
    },
    toEditMode: function(postit) {
      this.$data.editingPostit = postit;
      this.$data.isFocusForText = true;


      // link
      this.$data.editingLink.pos.updateWithPostit(postit);
      this.updateEditingPostitSize();
    },
    createNewPostit: function(pos) {
      const newPostit = this.getPostitService().createNewPostit(pos);
      this.toEditMode(newPostit);  
      return newPostit;// ほんとはasyncが正しいかもしれない
    },
    createNoLinkPostit: function() {// 編集中の付箋の近くに
      const newPostit = this.getPostitService().createNoLinkPostit(this.$data.editingPostit);
      this.toEditMode(newPostit);
    },
    createNewSheet: function() {
      this.clear();
      this.createNewPostit({x: 100, y: 100});
    },
    calcSize: function() {
      setTimeout(() => {
        this.$data.postits.forEach((v, i) => v.updateSize(this.$refs.postit[i]))
      }, 1); // ちょっと待てばdivが作られるだろうって発想
    },
    deletePostit: function() {
      console.log("delete");
      if(PostitDummy.isDummy(this.$data.editingPostit)) {
        return;
      }
      this.$data.selectedPostits.values.forEach(v => this.getPostitService().deletePostit(v));
      // this.getPostitService().deletePostit(this.$data.editingPostit)

      this.$data.editingPostit = dummyPostit;
      this.calcSize();
    },
    
    clear: function() {
      this.getPostitService().clearAll();
      
      this.$data.editingPostit = dummyPostit;
      this.$data.editingLink.startPostit = dummyPostit;
      this.$data.editingLink.endPostit = dummyPostit;
      this.$data.editingLink.pos.x = 0;
      this.$data.editingLink.pos.y = 0;
      this.$data.editingLink.isEditing = false;
      this.$data.isFocusForText = false;
      this.$data.selectedPostits.clear();
    },
    outputText: function() {
      const text = this.getTextIOService().outputText();
      console.log(text);
    },
    outputSvg: function() {
      console.log(document.querySelector("#mainSvg").outerHTML)
    },
    inputText: function(text) {
      this.clear();
      this.getTextIOService().inputText(text);
      this.calcSize();
    },
    updateEditingPostitSize() {
      if(PostitDummy.isDummy(this.$data.editingPostit)) {
        return;
      }
      setTimeout(v => {
        const div = document.getElementById(this.$data.editingPostit.id);
        this.$data.editingPostit.updateSize(div);
      }, 1)
      
    },
    toDisplayText(text) {
      if(text.length == 0) {
        return 'new'
      }
      if(text[text.length - 1] == '\n') {
        return text + ' '
      }
      return text;
    }
  },
  mounted: function() {
    const ref = this.$refs;
    this.$data.postits.forEach((v, i) => v.updateSize(this.$refs.postit[i]))
    setInterval(()=> {
      if(!this.$data.isFocusForText) {
        return;
      }
      this.updateEditingPostitSize();
    }, 1000)
    // this.$refs.textarea.addEventListener('compositionend', () => this.$data.postits.forEach((v, i) => v.setDiv(this.$refs.postit[i])));
    // this.$refs.textarea.addEventListener('compositionend', () => this.$data.postits.forEach((v, i) => v.setDiv(this.$refs.postit[i])));

    console.log("mounted");
    document.addEventListener('keydown', (event) => {
      console.log(event);

      // 選択中のふせんをキー操作で動かす
      this.$data.selectedPostits.moveSelectedPostitIfKeyPressed(event);

      if(event.code == "Enter") {
        this.$data.refreshCount++;
      }

      if(event.code == "Backspace" && !this.$data.selectedLinks.isNoSelected() && !PostitDummy.isDummy(this.$data.selectedLinks.values[0].startPostit)) {
        if(!this.$data.isFocusForText && this.$data.selectedPostits.isNoSelected()) {
          console.log("delete link");
          console.log(confirm("矢印を削除します。よろしいですか？"));
          this.$data.selectedLinks.forEach(v => this.$data.links.deleteLink(v))
          this.$data.selectedLinks.clear();
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
        const newPostit = this.getPostitService().createSidePostit(data.editingPostit);
        this.toEditMode(newPostit);
        event.preventDefault()
      }
      if(event.code == "Tab") {// タブが押されたら、サブ付箋を作る
        if(PostitDummy.isDummy(data.editingPostit)) {
          return;
        }
        const newPostit = this.getPostitService().createSubPostit(data.editingPostit);
        this.toEditMode(newPostit);
        event.preventDefault()
      }
    })

  },
  computed: {
    lineEndPos: function() {
      if(PostitDummy.isDummy(this.$data.editingLink.endPostit)) {
        return this.editingLink.pos
      }
      return this.$data.editingLink.endPostit.center
    }
  }
})
window.app = app;