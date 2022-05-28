// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class DPostit {
    constructor(id, text, pos){
        this.id = id;
        this.text = text;
        this.pos = pos;
    }
    move(pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y;
    }
    moveWithDiff(diff) {
        this.pos.x += diff.diffX;
        this.pos.y += diff.diffY;
    }
    updateText(text) {
        this.text = text;
    }
    id;
    text;
    pos;
}
class PostitView extends DPostit {
    center = {
        x: 0,
        y: 0
    };
    size = {
        width: 0,
        height: 0
    };
    isDiv = false;
    updateSize(div) {
        if (!div) {
            this.size.width = 0;
            this.size.height = 0;
        }
        this.size.width = div.clientWidth;
        this.size.height = div.clientHeight;
        this.updateCenter();
    }
    get rightBottom() {
        return {
            x: this.pos.x + this.size.width,
            y: this.pos.y + this.size.height
        };
    }
    setPos(x, y) {
        super.move({
            x,
            y
        });
        this.updateCenter();
    }
    updateCenter() {
        this.center.x = this.pos.x + this.size.width / 2;
        this.center.y = this.pos.y + this.size.height / 2;
    }
}
class PostitDummy extends PostitView {
    constructor(){
        super("dummy", "dummy", {
            x: 12,
            y: 12
        });
    }
    static isDummy(postit) {
        return postit.id == "dummy";
    }
    static instance() {
        return dummyPostit;
    }
}
const dummyPostit = new PostitDummy();
class DLink {
    id;
    constructor(startPostit, endPostit){
        this.startPostit = startPostit;
        this.endPostit = endPostit;
        this.id = DLink.uniqId(startPostit, endPostit);
        this.startPostit = startPostit;
        this.endPostit = endPostit;
    }
    has(postitId) {
        return this.startPostit.id == postitId || this.endPostit.id == postitId;
    }
    static uniqId(startPostit, endPostit) {
        return `${startPostit.id}|${endPostit.id}`;
    }
    startPostit;
    endPostit;
}
function calcCollisionPoint(point, rect) {
    const center = {
        x: rect.pos.x + rect.size.width / 2,
        y: rect.pos.y + rect.size.height / 2
    };
    const getY = (x)=>(center.y - point.y) / (center.x - point.x) * (x - point.x) + point.y;
    const getX = (y)=>(center.x - point.x) / (center.y - point.y) * (y - point.y) + point.x;
    const getYWithRange = (x, yRangeStart, yRangeEnd)=>{
        const y = getY(x);
        return isInRange(y, yRangeStart, yRangeEnd) ? y : undefined;
    };
    const getXWithRange = (y, xRangeStart, xRangeEnd)=>{
        const x = getX(y);
        return isInRange(x, xRangeStart, xRangeEnd) ? x : undefined;
    };
    const candidatePoints = [
        {
            x: getXWithRange(rect.pos.y, rect.pos.x, rect.pos.x + rect.size.width),
            y: rect.pos.y
        },
        {
            x: getXWithRange(rect.pos.y + rect.size.height, rect.pos.x, rect.pos.x + rect.size.width),
            y: rect.pos.y + rect.size.height
        },
        {
            x: rect.pos.x + rect.size.width,
            y: getYWithRange(rect.pos.x + rect.size.width, rect.pos.y, rect.pos.y + rect.size.height)
        },
        {
            x: rect.pos.x,
            y: getYWithRange(rect.pos.x, rect.pos.y, rect.pos.y + rect.size.height)
        }
    ].filter((v)=>v.x !== undefined && v.y !== undefined);
    if (candidatePoints.length == 1) {
        return candidatePoints[0];
    }
    if (candidatePoints.length >= 3) {
        throw new Error("想定外");
    }
    const lengthes = candidatePoints.map((v)=>length(v, point));
    return lengthes[0] < lengthes[1] ? candidatePoints[0] : candidatePoints[1];
}
function isInRange(v, start, end) {
    return start <= v && v < end;
}
function length(pos1, pos2) {
    return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2);
}
class LinkView extends DLink {
    constructor(startPostitView, endPostitView){
        super(startPostitView, endPostitView);
        this.startPostitView = startPostitView;
        this.endPostitView = endPostitView;
    }
    getEndPoint() {
        if (this.startPostitView.size.width == 0 || this.endPostitView.size.height == 0) {
            return this.endPostitView.center;
        }
        return calcCollisionPoint(this.startPostitView.center, this.endPostitView);
    }
    getStartPoint() {
        if (this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
            return this.startPostitView.center;
        }
        return calcCollisionPoint(this.endPostitView.center, this.startPostitView);
    }
    startPostitView;
    endPostitView;
}
class PostitService {
    constructor(postits, links){
        this.postits = postits;
        this.links = links;
    }
    createNewPostit(pos) {
        const newPostit = new PostitView(`${Date.now()}`, "", pos);
        this.postits.add(newPostit);
        return newPostit;
    }
    createNoLinkPostit(currentPostit) {
        const pos = {
            x: currentPostit.pos.x,
            y: currentPostit.pos.y + currentPostit.size.height + 16
        };
        const postit = this.createNewPostit(pos);
        return postit;
    }
    createSidePostit(currentPostit) {
        const pos = {
            x: currentPostit.pos.x,
            y: currentPostit.pos.y + currentPostit.size.height + 16
        };
        const parentPostit = this.links.getOneEndPostit(currentPostit.id);
        const postit = this.createNewPostit(pos);
        if (parentPostit) {
            this.links.add(new LinkView(postit, parentPostit));
        }
        return postit;
    }
    createSubPostit(parentPostit) {
        const pos = {
            x: parentPostit.pos.x + parentPostit.size.width + 16,
            y: parentPostit.pos.y + 16
        };
        const endPostit = parentPostit;
        const startPostit = this.createNewPostit(pos);
        this.links.add(new LinkView(startPostit, endPostit));
        return startPostit;
    }
    deletePostit(targetPostit) {
        this.postits.delete(targetPostit.id);
    }
    move(postit, x, y) {
        this.postits.move(postit.id, {
            x,
            y
        });
    }
    clearAll() {
        this.postits.clearAll();
    }
    addLink(startPostit, endPostit) {
        this.links.add(new LinkView(startPostit, endPostit));
    }
    postits;
    links;
}
class CollisionChecker {
    postits;
    constructor(postits){
        this.postits = postits;
    }
    findCollidedPostit(pos) {
        return this.postits.filter((v)=>{
            const rightBottom = v.rightBottom;
            if (rightBottom.x < pos.x || rightBottom.y < pos.y) {
                return false;
            }
            if (v.pos.x > pos.x || v.pos.y > pos.y) {
                return false;
            }
            return true;
        });
    }
}
class DLinks {
    #uniqMap;
    constructor(values){
        this.values = values;
        this.#uniqMap = {};
        this.updateMap();
    }
    updateMap() {
        this.#uniqMap = this.values.map((v)=>v.id).reduce((memo, v)=>{
            memo[v] = true;
            return memo;
        }, {});
    }
    findByStartPostit(startPostitId) {}
    add(link) {
        this.values.push(link);
        this.updateMap();
    }
    exclude(postitId) {
        const indexies = this.values.map((v, i)=>v.has(postitId) ? i : -1).filter((v)=>v >= 0).reverse();
        indexies.forEach((v)=>this.values.splice(v, 1));
        this.updateMap();
    }
    delete(linkId) {
        var index = -1;
        for(let i = 0; i < this.values.length; i++){
            if (this.values[i].id == linkId) {
                index = i;
                break;
            }
        }
        this.values.splice(index, 1);
        this.updateMap();
    }
    getOneEndPostit(startPostitId) {
        const list = this.values.filter((v)=>v.startPostit.id == startPostitId);
        return list.length == 1 ? list[0].endPostit : undefined;
    }
    values;
}
class DPostits {
    #map;
    constructor(values, links){
        this.values = values;
        this.links = links;
        this.#map = values.reduce((memo, v)=>{
            memo[v.id] = v;
            return memo;
        }, {});
    }
    add(postit) {
        this.values.push(postit);
        this.#map[postit.id] = postit;
    }
    delete(postitId) {
        this.values.map((v, i)=>v.id == postitId ? i : -1).filter((v)=>v >= 0).reverse().forEach((v)=>this.values.splice(v, 1));
        this.links.exclude(postitId);
    }
    clearAll() {
        this.values.map((v, i)=>({
                v: v,
                i: i
            })).reverse().forEach((p, i)=>{
            this.values.splice(p.i, 1);
            this.links.exclude(p.v.id);
        });
    }
    move(postitId, pos) {
        this.#map[postitId].move(pos);
    }
    moveWithDiff(postitId, diff) {
        this.#map[postitId].moveWithDiff(diff);
    }
    updateText(postitId, text) {
        this.#map[postitId].updateText(text);
    }
    values;
    links;
}
class TextIOService {
    constructor(postits, links){
        this.postits = postits;
        this.links = links;
    }
    outputText() {
        const postitDatas = this.postits.values.map((v)=>({
                id: v.id,
                text: v.text,
                pos: {
                    x: v.pos.x,
                    y: v.pos.y
                }
            }));
        const linkDatas = this.links.values.map((v)=>({
                startId: v.startPostit.id,
                endId: v.endPostit.id
            }));
        const output = {
            postits: postitDatas,
            links: linkDatas
        };
        return JSON.stringify(output, null, '  ');
    }
    static createInstance(rawData1) {
        const postitViews = rawData1.postits.map((v)=>new PostitView(v.id, v.text, v.pos));
        const postitMap = toMap(postitViews, (v)=>v.id);
        const links = new DLinks(rawData1.links.map((v)=>new LinkView(postitMap[v.startId], postitMap[v.endId])));
        const postits = new DPostits(postitViews, links);
        return {
            postits,
            links
        };
    }
    postits;
    links;
}
function toMap(list, idFunc) {
    return list.reduce((memo, v)=>{
        memo[idFunc(v)] = v;
        return memo;
    }, {});
}
class DragPostitService {
    data;
    mouseMovement;
    selectedPostits;
    constructor(data1){
        this.data = data1;
        this.mouseMovement = data1.mouseMovement;
        this.selectedPostits = data1.selectedPostits;
    }
    onStartDrag(clientX, clientY, postit, event) {
        if (event.shiftKey) {
            this.selectedPostits.select(postit);
        } else {
            this.selectedPostits.selectOne(postit);
        }
        if (this.data.editingPostit.id != postit.id) {
            this.data.editingPostit.updateCenter();
        }
        this.data.editingLink.isEditing = false;
        this.data.editingPostit = postit;
        this.mouseMovement.updateClientPos(clientX, clientY);
        this.data.editingLink.pos.updateWithPostit(postit);
    }
    onDragging(clientX, clientY, postit) {
        const movement = this.mouseMovement.updateClientPos(clientX, clientY);
        this.selectedPostits.move(movement.x, movement.y);
        this.data.editingLink.pos.updateWithPostit(postit);
    }
}
class SelectedPostits {
    values;
    #map;
    constructor(dummyPostit2){
        this.values = [
            dummyPostit2
        ];
        this.#map = {};
    }
    select(postit) {
        if (this.#map[postit.id]) {
            return;
        }
        this.values.push(postit);
        this.#map[postit.id] = postit;
        console.log(this.values.length);
    }
    clear() {
        console.log("clear select");
        while(this.values.pop()){}
        this.#map = {};
    }
    selectOne(postit) {
        this.clear();
        this.select(postit);
    }
    isSelected(postit) {
        return !!this.#map[postit.id];
    }
    isNoSelected() {
        return this.values.length == 0;
    }
    isMultiple() {
        return this.values.length >= 2;
    }
    move(diffX, diffY) {
        this.values.forEach((v)=>v.setPos(v.pos.x + diffX, v.pos.y + diffY));
    }
    moveSelectedPostitIfKeyPressed(event) {
        const selectedPostits = this;
        if (event.code == "ArrowUp" && selectedPostits.isMultiple()) {
            selectedPostits.move(0, -16);
        } else if (event.code == "ArrowDown" && selectedPostits.isMultiple()) {
            selectedPostits.move(0, 16);
        } else if (event.code == "ArrowLeft" && selectedPostits.isMultiple()) {
            selectedPostits.move(-16, 0);
        } else if (event.code == "ArrowRight" && selectedPostits.isMultiple()) {
            selectedPostits.move(16, 0);
        } else if (event.key == "Shift" || event.key == "Meta" || event.key == "Alt" || event.key == "Control" || event.key == "CapsLock") {} else {
            selectedPostits.clear();
        }
    }
}
class MouseMovement {
    #x = 0;
    #y = 0;
    updateClientPos(clientX, clientY) {
        const result = {
            x: clientX - this.#x,
            y: clientY - this.#y
        };
        this.#x = clientX;
        this.#y = clientY;
        return result;
    }
}
class EditingLinkPos {
    x = -10;
    y = -10;
    updateWithPostit(postit) {
        this.x = postit.pos.x - 12;
        this.y = postit.pos.y + 14;
    }
}
class Selected {
    values;
    #map;
    constructor(entity){
        this.values = [
            entity
        ];
        this.#map = {};
    }
    select(entity) {
        if (this.#map[entity.id]) {
            return;
        }
        this.values.push(entity);
        this.#map[entity.id] = entity;
        console.log("selected", this.values.length);
    }
    clear() {
        console.log("clear");
        while(this.values.pop()){}
        this.#map = {};
    }
    selectOne(entity) {
        this.clear();
        this.select(entity);
    }
    isSelected(entity) {
        return !!this.#map[entity.id];
    }
    isNoSelected() {
        return this.values.length == 0;
    }
    isMultiple() {
        return this.values.length >= 2;
    }
    forEach(cb) {
        this.values.forEach(cb);
    }
}
const dummyPostit1 = PostitDummy.instance();
const rawData = {
    postits: [
        {
            id: "001",
            text: "hoge",
            pos: {
                x: 0,
                y: 100
            }
        },
        {
            id: "002",
            text: "foo",
            pos: {
                x: 100,
                y: 0
            }
        },
        {
            id: "003",
            text: "bar",
            pos: {
                x: 100,
                y: 100
            }
        }
    ],
    links: [
        {
            startId: "001",
            endId: "002"
        }
    ]
};
const data = {
    message: 'Hello Vue!',
    mouseMovement: new MouseMovement(),
    ...TextIOService.createInstance(rawData),
    selectedPostits: new SelectedPostits(dummyPostit1),
    editingLink: {
        startPostit: dummyPostit1,
        endPostit: dummyPostit1,
        pos: new EditingLinkPos(),
        isEditing: false
    },
    editingPostit: dummyPostit1,
    isFocusForText: false,
    textHeight: 20,
    refreshCount: 1,
    selectedLinks: new Selected(new LinkView(dummyPostit1, dummyPostit1))
};
var collisionChecker = new CollisionChecker([]);
var app = new Vue({
    el: '#app',
    data: data,
    methods: {
        clickLine: function(event, link) {
            console.log("click");
            if (event.shiftKey) {
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
            return `M${s.x},${s.y} L${e.x},${e.y}`;
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
        dragMouseDownForLink: function(event1) {
            this.editingLink.startPostit = this.editingPostit;
            this.editingLink.endPostit = dummyPostit1;
            this.editingLink.isEditing = true;
            this.$data.selectedLinks.clear();
            this.mouseMovement.updateClientPos(event1.clientX, event1.clientY);
            const postits = this.$data.postits.values;
            postits.forEach((v)=>v.updateCenter());
            collisionChecker = new CollisionChecker(postits);
            event1.preventDefault();
            document.onmousemove = (event)=>this.linkDrag(event);
            document.onmouseup = (event)=>this.closeLinkDrag(event);
        },
        linkDrag: function(event) {
            event.preventDefault();
            const postits = collisionChecker.findCollidedPostit(this.editingLink.pos).filter((v)=>v.id != this.editingLink.startPostit.id);
            if (postits.length == 1) {
                this.editingLink.endPostit = postits[0];
            } else {
                this.editingLink.endPostit = dummyPostit1;
            }
            this.editingLink.pos.x = event.clientX;
            this.editingLink.pos.y = event.clientY;
            console.log(postits.length);
        },
        closeLinkDrag () {
            if (!PostitDummy.isDummy(this.editingLink.startPostit) && !PostitDummy.isDummy(this.editingLink.endPostit)) {
                this.links.add(new LinkView(this.editingLink.startPostit, this.editingLink.endPostit));
                this.$data.editingLink.pos.updateWithPostit(this.editingLink.startPostit);
            }
            document.onmouseup = null;
            document.onmousemove = null;
        },
        dragMouseDown: function(event2, postit) {
            this.getDragPostitService().onStartDrag(event2.clientX, event2.clientY, postit, event2);
            this.$data.selectedLinks.clear();
            document.querySelector("textarea").focus();
            event2.preventDefault();
            document.onmousemove = (event)=>this.elementDrag(event, postit);
            document.onmouseup = (event)=>this.closeDragElement(event);
        },
        elementDrag: function(event, postit) {
            this.getDragPostitService().onDragging(event.clientX, event.clientY, postit);
            event.preventDefault();
        },
        closeDragElement: function() {
            document.onmouseup = null;
            document.onmousemove = null;
        },
        toEditMode: function(postit) {
            this.$data.editingPostit = postit;
            this.$data.isFocusForText = true;
            this.$data.editingLink.pos.updateWithPostit(postit);
            this.updateEditingPostitSize();
        },
        createNewPostit: function(pos) {
            const newPostit = this.getPostitService().createNewPostit(pos);
            this.toEditMode(newPostit);
            return newPostit;
        },
        createNoLinkPostit: function() {
            const newPostit = this.getPostitService().createNoLinkPostit(this.$data.editingPostit);
            this.toEditMode(newPostit);
        },
        createNewSheet: function() {
            this.clear();
            this.createNewPostit({
                x: 100,
                y: 100
            });
        },
        calcSize: function() {
            setTimeout(()=>{
                this.$data.postits.values.forEach((v, i)=>v.updateSize(this.$refs.postit[i]));
            }, 1);
        },
        deletePostit: function() {
            console.log("delete");
            if (PostitDummy.isDummy(this.$data.editingPostit)) {
                return;
            }
            this.$data.selectedPostits.values.forEach((v)=>this.getPostitService().deletePostit(v));
            this.$data.editingPostit = dummyPostit1;
            this.calcSize();
        },
        clear: function() {
            this.getPostitService().clearAll();
            this.$data.editingPostit = dummyPostit1;
            this.$data.editingLink.startPostit = dummyPostit1;
            this.$data.editingLink.endPostit = dummyPostit1;
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
            console.log(document.querySelector("#mainSvg").outerHTML);
        },
        inputText: function(text) {
            this.clear();
            this.getTextIOService().inputText(text);
            this.calcSize();
        },
        updateEditingPostitSize () {
            if (PostitDummy.isDummy(this.$data.editingPostit)) {
                return;
            }
            setTimeout((v)=>{
                const div = document.getElementById(this.$data.editingPostit.id);
                this.$data.editingPostit.updateSize(div);
            }, 1);
        },
        toDisplayText (text) {
            if (text.length == 0) {
                return 'new';
            }
            if (text[text.length - 1] == '\n') {
                return text + ' ';
            }
            return text;
        }
    },
    mounted: function() {
        this.$refs;
        this.$data.postits.values.forEach((v, i)=>v.updateSize(this.$refs.postit[i]));
        setInterval(()=>{
            if (!this.$data.isFocusForText) {
                return;
            }
            this.updateEditingPostitSize();
        }, 1000);
        console.log("mounted");
        document.addEventListener('keydown', (event)=>{
            console.log(event);
            this.$data.selectedPostits.moveSelectedPostitIfKeyPressed(event);
            if (event.code == "Enter") {
                this.$data.refreshCount++;
            }
            if (event.code == "Backspace" && !this.$data.selectedLinks.isNoSelected() && !PostitDummy.isDummy(this.$data.selectedLinks.values[0].startPostit)) {
                if (!this.$data.isFocusForText && this.$data.selectedPostits.isNoSelected()) {
                    console.log("delete link");
                    console.log(confirm("矢印を削除します。よろしいですか？"));
                    this.$data.selectedLinks.forEach((v)=>this.$data.links.delete(v.id));
                    this.$data.selectedLinks.clear();
                }
            }
            if (event.code == "Esc") {
                this.$data.editingPostit = dummyPostit1;
                this.$data.editingLink.isEditing = false;
            }
            if (event.code == "Enter" && event.shiftKey) {
                if (PostitDummy.isDummy(data.editingPostit)) {
                    return;
                }
                const newPostit = this.getPostitService().createSidePostit(data.editingPostit);
                this.toEditMode(newPostit);
                event.preventDefault();
            }
            if (event.code == "Tab") {
                if (PostitDummy.isDummy(data.editingPostit)) {
                    return;
                }
                const newPostit = this.getPostitService().createSubPostit(data.editingPostit);
                this.toEditMode(newPostit);
                event.preventDefault();
            }
        });
    },
    computed: {
        lineEndPos: function() {
            if (PostitDummy.isDummy(this.$data.editingLink.endPostit)) {
                return this.editingLink.pos;
            }
            return this.$data.editingLink.endPostit.center;
        }
    }
});
window.app = app;
