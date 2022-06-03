// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

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
        return DLink.uniqIdFromId(startPostit.id, endPostit.id);
    }
    static uniqIdFromId(startPostitId, endPostitId) {
        return `${startPostitId}|${endPostitId}`;
    }
    startPostit;
    endPostit;
}
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
class PostitView {
    isDiv;
    constructor(postitId){
        this.postitId = postitId;
        this.isDiv = false;
        this.#size = {
            width: 0,
            height: 0
        };
    }
    #size;
    get size() {
        if (!this.isDiv) {
            console.log("zero!", this.postitId);
        }
        return this.#size;
    }
    getCenter(postit) {
        return {
            x: postit.pos.x + this.size.width / 2,
            y: postit.pos.y + this.size.height / 2
        };
    }
    updateSize(div, postit) {
        const currentWidth = this.#size.width;
        const currentHeight = this.#size.height;
        if (!div) {
            this.#size.width = 0;
            this.#size.height = 0;
        } else {
            this.isDiv = true;
            this.#size.width = div.clientWidth;
            this.#size.height = div.clientHeight;
        }
        return currentWidth != this.#size.width || currentHeight != this.#size.height;
    }
    getRightBottom(postit) {
        return {
            x: postit.pos.x + this.size.width,
            y: postit.pos.y + this.size.height
        };
    }
    postitId;
}
class PostitViewRepository {
    #map = {};
    find(postitId) {
        if (PostitDummy.isDummyById(postitId)) {
            return new PostitView(postitId);
        }
        const result = this.#map[postitId];
        if (!result) {
            throw new Error(`not found: ${postitId}`);
        }
        return result;
    }
    add(postitView) {
        this.#map[postitView.postitId] = postitView;
    }
    delete(postitId) {
        delete this.#map[postitId];
    }
    optimize(postits) {
        Object.keys(this.#map).filter((id)=>!postits.isExist(id)).forEach((id)=>this.delete(id));
    }
}
class PostitDummy extends DPostit {
    constructor(){
        super("dummy", "dummy", {
            x: 12,
            y: 12
        });
    }
    static isDummy(postit) {
        return this.isDummyById(postit.id);
    }
    static isDummyById(postitId) {
        return postitId == "dummy";
    }
    static instance() {
        return dummyPostit;
    }
}
const dummyPostit = new PostitDummy();
class PostitService {
    constructor(postits, links, commandCenter1){
        this.postits = postits;
        this.links = links;
        this.commandCenter = commandCenter1;
    }
    createPostitId() {
        return `${Date.now()}`;
    }
    createNewPostit(pos) {
        const id = this.createPostitId();
        this.commandCenter.addPostit({
            id,
            text: "",
            pos
        });
        return this.postits.find(id);
    }
    createNoLinkPostit(currentPostit, currentPostitView) {
        const pos = {
            x: currentPostit.pos.x,
            y: currentPostit.pos.y + currentPostitView.size.height + 16
        };
        const id = this.createPostitId();
        this.commandCenter.addPostit({
            id,
            text: "",
            pos
        });
        return this.postits.find(id);
    }
    createSidePostit(currentPostit, currentPostitView) {
        const pos = {
            x: currentPostit.pos.x,
            y: currentPostit.pos.y + currentPostitView.size.height + 16
        };
        const parentPostit = this.links.getOneEndPostit(currentPostit.id);
        const id = this.createPostitId();
        if (parentPostit) {
            this.commandCenter.addPostitsAndLinks({
                postits: [
                    {
                        id,
                        text: "",
                        pos
                    }
                ],
                links: [
                    {
                        startPostitId: id,
                        endPostitId: parentPostit.id
                    }
                ]
            });
        } else {
            this.commandCenter.addPostit({
                id,
                text: "",
                pos
            });
        }
        return this.postits.find(id);
    }
    createSubPostit(parentPostit, currentPostitView) {
        const pos = {
            x: parentPostit.pos.x + currentPostitView.size.width + 16,
            y: parentPostit.pos.y + 16
        };
        const endPostit = parentPostit;
        const id = this.createPostitId();
        this.commandCenter.addPostitsAndLinks({
            postits: [
                {
                    id,
                    text: "",
                    pos
                }
            ],
            links: [
                {
                    startPostitId: id,
                    endPostitId: endPostit.id
                }
            ]
        });
        return this.postits.find(id);
    }
    deletePostit(targetPostit) {
        this.commandCenter.deletePostit({
            postitId: targetPostit.id
        });
    }
    deletePostits(postits) {
        this.commandCenter.deletePostitsAndLinks({
            postitIds: postits.map((v)=>v.id),
            links: []
        });
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
        this.commandCenter.addLink({
            startPostitId: startPostit.id,
            endPostitId: endPostit.id
        });
    }
    postits;
    links;
    commandCenter;
}
class CollisionChecker {
    constructor(postits, postitViewRepository1){
        this.postits = postits;
        this.postitViewRepository = postitViewRepository1;
    }
    findCollidedPostit(pos) {
        return this.postits.filter((v)=>{
            const postitView = this.postitViewRepository.find(v.id);
            const rightBottom = postitView.getRightBottom(v);
            if (rightBottom.x < pos.x || rightBottom.y < pos.y) {
                return false;
            }
            if (v.pos.x > pos.x || v.pos.y > pos.y) {
                return false;
            }
            return true;
        });
    }
    postits;
    postitViewRepository;
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
        if (this.#uniqMap[link.id]) {
            throw new Error("既に追加済みのリンク");
        }
        this.values.push(link);
        this.updateMap();
    }
    has(startPostitId, endPostitId) {
        const id = DLink.uniqIdFromId(startPostitId, endPostitId);
        return !!this.#uniqMap[id];
    }
    exclude(postitId) {
        const deletedLinks = [];
        const indexies = this.values.map((v, i)=>v.has(postitId) ? i : -1).filter((v)=>v >= 0).reverse();
        indexies.forEach((v)=>{
            deletedLinks.push(this.values[v]);
            this.values.splice(v, 1);
        });
        this.updateMap();
        return deletedLinks;
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
        const postit = this.find(postitId);
        this.values.map((v, i)=>v.id == postitId ? i : -1).filter((v)=>v >= 0).reverse().forEach((v)=>this.values.splice(v, 1));
        const links = this.links.exclude(postitId);
        return {
            postit,
            links
        };
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
    isExist(postitId) {
        return !!this.#map[postitId];
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
    find(postitId) {
        return this.#map[postitId];
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
    inputText(text) {
        const rawData1 = JSON.parse(text);
        const data1 = TextIOService.createInstance(rawData1);
        this.postits.clearAll();
        data1.postits.values.forEach((v)=>this.postits.add(v));
        data1.links.values.forEach((v)=>this.links.add(v));
    }
    static createInstance(rawData2) {
        const postitViews = rawData2.postits.map((v)=>new DPostit(v.id, v.text, v.pos));
        const postitMap = toMap(postitViews, (v)=>v.id);
        const links = new DLinks(rawData2.links.map((v)=>new DLink(postitMap[v.startId], postitMap[v.endId])));
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
    startPos;
    mouseMovement;
    selectedPostits;
    constructor(data2, postitViewRepository2, commandCenter2){
        this.postitViewRepository = postitViewRepository2;
        this.commandCenter = commandCenter2;
        this.startPos = {
            x: 0,
            y: 0
        };
        this.data = data2;
        this.mouseMovement = data2.mouseMovement;
        this.selectedPostits = data2.selectedPostits;
    }
    onStartDrag(clientX, clientY, postit, event) {
        if (event.shiftKey) {
            this.selectedPostits.select(postit);
        } else {
            this.selectedPostits.selectOne(postit);
        }
        this.data.shock = Date.now();
        if (this.data.editingPostit.id != postit.id) {}
        this.data.editingLink.isEditing = false;
        this.data.editingPostit = postit;
        this.mouseMovement.updateClientPos(clientX, clientY);
        this.data.editingLink.pos.updateWithPostit(postit);
        this.startPos.x = postit.pos.x;
        this.startPos.y = postit.pos.y;
        console.log("start", postit.pos.x);
        console.log("start", this.startPos.x);
    }
    onDragging(clientX, clientY, postit) {
        const movement = this.mouseMovement.updateClientPos(clientX, clientY);
        this.selectedPostits.move(movement.x, movement.y);
        this.data.editingLink.pos.updateWithPostit(postit);
    }
    onEndDrag(clientX, clientY, postit) {
        console.log("end", this.startPos.x);
        if (postit.pos.x == this.startPos.x && postit.pos.y == this.startPos.y) {
            return;
        }
        console.log(this.selectedPostits.getSelectedIds());
        this.commandCenter.movePostitsForUndo({
            ids: this.selectedPostits.getSelectedIds(),
            diff: {
                diffX: postit.pos.x - this.startPos.x,
                diffY: postit.pos.y - this.startPos.y
            }
        });
        console.log("onEndDrag", postit.pos.x, postit.pos.y, this.startPos.x, this.startPos.y);
    }
    postitViewRepository;
    commandCenter;
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
    getSelectedIds() {
        return this.values.map((v)=>v.id);
    }
    select(postit) {
        if (this.#map[postit.id]) {
            return;
        }
        this.values.push(postit);
        this.#map[postit.id] = postit;
    }
    clear() {
        while(this.values.pop()){}
        this.#map = {};
    }
    selectOne(postit) {
        this.clear();
        this.select(postit);
    }
    isSelected(postitId) {
        return !!this.#map[postitId];
    }
    isNoSelected() {
        return this.values.length == 0;
    }
    isMultiple() {
        return this.values.length >= 2;
    }
    move(diffX, diffY) {
        this.values.forEach((v)=>v.moveWithDiff({
                diffX,
                diffY
            }));
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
class LinkView {
    constructor(startPostit, endPostit, startPostitView, endPostitView){
        this.startPostit = startPostit;
        this.endPostit = endPostit;
        this.startPostitView = startPostitView;
        this.endPostitView = endPostitView;
    }
    getEndPoint() {
        if (this.startPostitView.size.width == 0 || this.endPostitView.size.height == 0) {
            return this.endPostit.pos;
        }
        return calcCollisionPoint(this.startPostitView.getCenter(this.startPostit), {
            pos: this.endPostit.pos,
            size: this.endPostitView.size
        });
    }
    getStartPoint() {
        if (this.startPostitView.size.width == 0 || this.startPostitView.size.height == 0) {
            return this.startPostit.pos;
        }
        return calcCollisionPoint(this.endPostitView.getCenter(this.endPostit), {
            pos: this.startPostit.pos,
            size: this.startPostitView.size
        });
    }
    startPostit;
    endPostit;
    startPostitView;
    endPostitView;
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
var CommandType;
(function(CommandType1) {
    CommandType1["deleteLinkCommand"] = "deleteLinkCommand";
    CommandType1["addLinkCommand"] = "addLinkCommand";
    CommandType1["deletePostitCommand"] = "deletePostitCommand";
    CommandType1["addPostitCommand"] = "addPostitCommand";
    CommandType1["addPostitsAndLinks"] = "addPostitsAndLinks";
    CommandType1["deletePostitsAndLinks"] = "deletePostitsAndLinks";
    CommandType1["movePostits"] = "movePostits";
})(CommandType || (CommandType = {}));
class CommandCenter {
    undoCommands;
    currentIndex;
    constructor(postits, links){
        this.postits = postits;
        this.links = links;
        this.undoCommands = [];
        this.currentIndex = -1;
    }
    invokeAndSaveUndoCommand(command) {
        const undoCommand = this.invoke(command);
        this.addUndoCommand(undoCommand);
    }
    addUndoCommand(command) {
        this.undoCommands.slice(0, this.currentIndex + 1);
        this.undoCommands.push(command);
        this.currentIndex = this.undoCommands.length - 1;
    }
    undo() {
        if (this.currentIndex < 0) {
            throw new Error("undoできない");
        }
        const command = this.undoCommands[this.currentIndex];
        this.invoke(command);
        this.currentIndex--;
    }
    redo() {
        if (this.currentIndex >= this.undoCommands.length - 1) {
            throw new Error("redoできない");
        }
        const command = this.undoCommands[this.currentIndex + 1];
        this.invoke(command);
        this.currentIndex++;
    }
    invoke(command) {
        console.log("command", JSON.parse(JSON.stringify(command)));
        if (command.type == CommandType.deleteLinkCommand) {
            const c = command;
            this.links.delete(DLink.uniqIdFromId(c.startPostitId, c.endPostitId));
            const undo = {
                type: CommandType.addLinkCommand,
                timestamp: c.timestamp,
                startPostitId: c.startPostitId,
                endPostitId: c.endPostitId
            };
            return undo;
        }
        if (command.type == CommandType.addLinkCommand) {
            const c = command;
            this.links.add(new DLink(this.postits.find(c.startPostitId), this.postits.find(c.endPostitId)));
            const undo = {
                type: CommandType.deleteLinkCommand,
                timestamp: c.timestamp,
                startPostitId: c.startPostitId,
                endPostitId: c.endPostitId
            };
            return undo;
        }
        if (command.type == CommandType.deletePostitCommand) {
            const c = command;
            const postitAndLinks = this.postits.delete(c.postitId);
            const undo = {
                type: CommandType.addPostitsAndLinks,
                timestamp: c.timestamp,
                postits: [
                    postitAndLinks.postit
                ],
                links: postitAndLinks.links.map((v)=>({
                        startPostitId: v.startPostit.id,
                        endPostitId: v.endPostit.id
                    }))
            };
            return undo;
        }
        if (command.type == CommandType.addPostitCommand) {
            const c = command;
            this.postits.add(new DPostit(c.id, c.text, c.pos));
            const undo = {
                type: CommandType.deletePostitCommand,
                timestamp: c.timestamp,
                postitId: c.id
            };
            return undo;
        }
        if (command.type == CommandType.deletePostitsAndLinks) {
            const c = command;
            c.links.map((v)=>DLink.uniqIdFromId(v.startPostitId, v.endPostitId)).forEach((v)=>this.links.delete(v));
            const result = c.postitIds.reduce((memo, v)=>{
                const r = this.postits.delete(v);
                memo.postits = [
                    ...memo.postits,
                    r.postit
                ];
                memo.links = [
                    ...memo.links,
                    ...r.links
                ];
                return memo;
            }, {
                postits: [],
                links: []
            });
            const undo = {
                type: CommandType.addPostitsAndLinks,
                timestamp: c.timestamp,
                postits: result.postits,
                links: [
                    ...c.links,
                    ...result.links.map((v)=>({
                            startPostitId: v.startPostit.id,
                            endPostitId: v.endPostit.id
                        }))
                ]
            };
            return undo;
        }
        if (command.type == CommandType.addPostitsAndLinks) {
            const c = command;
            c.postits.map((v)=>new DPostit(v.id, v.text, v.pos)).forEach((v)=>this.postits.add(v));
            c.links.map((v)=>new DLink(this.postits.find(v.startPostitId), this.postits.find(v.endPostitId))).forEach((v)=>this.links.add(v));
            const undo = {
                type: CommandType.deletePostitsAndLinks,
                timestamp: c.timestamp,
                postitIds: c.postits.map((v)=>v.id),
                links: c.links
            };
            return undo;
        }
        if (command.type == CommandType.movePostits) {
            const c = command;
            c.ids.forEach((id)=>this.postits.moveWithDiff(id, c.diff));
            const undo = {
                type: CommandType.movePostits,
                timestamp: c.timestamp,
                ids: c.ids,
                diff: {
                    diffX: -c.diff.diffX,
                    diffY: -c.diff.diffY
                }
            };
            return undo;
        }
        throw new Error("command not found: " + command.type);
    }
    deleteLink(args) {
        const c = {
            type: CommandType.deleteLinkCommand,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    addLink(args) {
        const c = {
            type: CommandType.addLinkCommand,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    deletePostit(args) {
        const c = {
            type: CommandType.deletePostitCommand,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    addPostit(args) {
        const c = {
            type: CommandType.addPostitCommand,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    addPostitsAndLinks(args) {
        const c = {
            type: CommandType.addPostitsAndLinks,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    deletePostitsAndLinks(args) {
        const c = {
            type: CommandType.deletePostitsAndLinks,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    movePostits(args) {
        const c = {
            type: CommandType.movePostits,
            timestamp: Date.now(),
            ...args
        };
        this.invokeAndSaveUndoCommand(c);
    }
    movePostitsForUndo(args) {
        const undo = {
            type: CommandType.movePostits,
            timestamp: Date.now(),
            ids: args.ids,
            diff: {
                diffX: -args.diff.diffX,
                diffY: -args.diff.diffY
            }
        };
        this.addUndoCommand(undo);
    }
    postits;
    links;
}
class EditingLink {
    startPostit = dummyPostit1;
    endPostitPos = {
        x: 0,
        y: 0
    };
    pos = new EditingLinkPos();
    isEditing = false;
    clear() {
        this.startPostit = dummyPostit1;
        this.endPostitPos = {
            x: 0,
            y: 0
        };
        this.pos = new EditingLinkPos();
        this.isEditing = false;
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
var postitViewRepository = new PostitViewRepository();
var collisionChecker = new CollisionChecker([], postitViewRepository);
const postitsAndLinks = TextIOService.createInstance(rawData);
const commandCenter = new CommandCenter(postitsAndLinks.postits, postitsAndLinks.links);
postitsAndLinks.postits.values.map((v)=>new PostitView(v.id)).forEach((v)=>postitViewRepository.add(v));
const data = {
    message: 'Hello Vue!',
    mouseMovement: new MouseMovement(),
    ...postitsAndLinks,
    selectedPostits: new SelectedPostits(dummyPostit1),
    editingLink: new EditingLink(),
    editingPostit: dummyPostit1,
    isFocusForText: false,
    textHeight: 20,
    refreshCount: 1,
    selectedLinks: new Selected(new DLink(dummyPostit1, dummyPostit1)),
    shock: Date.now(),
    commandCenter: commandCenter
};
var dragPostitService = null;
var app = new Vue({
    el: '#app',
    data: data,
    methods: {
        getPostitAndViews: function() {
            const result = data.postits.values.map((v)=>({
                    postit: v,
                    postitView: postitViewRepository.find(v.id)
                }));
            return result;
        },
        getPostitView: function(postitId) {
            return postitViewRepository.find(postitId);
        },
        clickLine: function(event, link) {
            console.log("click");
            if (event.shiftKey) {
                data.selectedLinks.select(link);
            } else {
                data.selectedLinks.selectOne(link);
            }
            data.isFocusForText = false;
            data.selectedPostits.clear();
            data.shock = Date.now();
        },
        getLinePath: function(link) {
            const linkView = new LinkView(link.startPostit, link.endPostit, postitViewRepository.find(link.startPostit.id), postitViewRepository.find(link.endPostit.id));
            const s = linkView.getStartPoint();
            const e = linkView.getEndPoint();
            return `M${s.x},${s.y} L${e.x},${e.y}`;
        },
        getPostitService: function() {
            return new PostitService(data.postits, data.links, commandCenter);
        },
        getTextIOService: function() {
            return new TextIOService(data.postits, data.links);
        },
        getDragPostitService: function() {
            return new DragPostitService(data, postitViewRepository, commandCenter);
        },
        dragMouseDownForLink: function(event1) {
            data.editingLink.startPostit = data.editingPostit;
            data.editingLink.endPostitPos = {
                x: 0,
                y: 0
            };
            data.editingLink.isEditing = true;
            data.selectedLinks.clear();
            data.mouseMovement.updateClientPos(event1.clientX, event1.clientY);
            collisionChecker = new CollisionChecker(data.postits.values, postitViewRepository);
            event1.preventDefault();
            document.onmousemove = (event)=>this.linkDrag(event);
            document.onmouseup = (event)=>this.closeLinkDrag(event);
        },
        linkDrag: function(event) {
            event.preventDefault();
            const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter((v)=>v.id != data.editingLink.startPostit.id);
            if (postits.length == 1) {
                data.editingLink.endPostitPos = postits[0].pos;
            } else {
                data.editingLink.endPostitPos = {
                    x: 0,
                    y: 0
                };
            }
            data.editingLink.pos.x = event.clientX;
            data.editingLink.pos.y = event.clientY;
        },
        closeLinkDrag: function(event) {
            const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter((v)=>v.id != data.editingLink.startPostit.id);
            if (postits.length == 1) {
                const startPostitId = data.editingLink.startPostit.id;
                const endPostitId = postits[0].id;
                if (!data.links.has(startPostitId, endPostitId)) {
                    commandCenter.addLink({
                        startPostitId,
                        endPostitId
                    });
                    data.editingLink.pos.updateWithPostit(data.editingLink.startPostit);
                } else {
                    console.log("linkが重複");
                }
            }
            document.onmouseup = null;
            document.onmousemove = null;
        },
        dragMouseDown: function(event2, postit) {
            dragPostitService = new DragPostitService(data, postitViewRepository, commandCenter);
            dragPostitService.onStartDrag(event2.clientX, event2.clientY, postit, event2);
            data.selectedLinks.clear();
            document.querySelector("textarea").focus();
            event2.preventDefault();
            document.onmousemove = (event)=>this.elementDrag(event, postit);
            document.onmouseup = (event)=>this.closeDragElement(event, postit);
        },
        elementDrag: function(event, postit) {
            dragPostitService.onDragging(event.clientX, event.clientY, postit);
            event.preventDefault();
        },
        closeDragElement: function(event, postit) {
            dragPostitService.onEndDrag(event.clientX, event.clientY, postit);
            document.onmouseup = null;
            document.onmousemove = null;
            dragPostitService = null;
        },
        toEditMode: function(postit) {
            data.editingPostit = postit;
            data.isFocusForText = true;
            data.editingLink.pos.updateWithPostit(postit);
            this.updateEditingPostitSize();
        },
        createNewPostit: function(pos) {
            const newPostit = this.getPostitService().createNewPostit(pos);
            this.toEditMode(newPostit);
            return newPostit;
        },
        createNoLinkPostit: function() {
            const newPostit = this.getPostitService().createNoLinkPostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
            postitViewRepository.add(new PostitView(newPostit.id));
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
                data.postits.values.forEach((v, i)=>{
                    const postitView = postitViewRepository.find(v.id);
                    const div = this.$refs.postit[i];
                    postitView.updateSize(div, v);
                });
                data.shock = Date.now();
            }, 1);
        },
        deletePostit: function() {
            if (PostitDummy.isDummy(data.editingPostit)) {
                return;
            }
            this.getPostitService().deletePostits(data.selectedPostits.values);
            data.editingPostit = dummyPostit1;
            this.calcSize();
        },
        clear: function() {
            this.getPostitService().clearAll();
            data.editingPostit = dummyPostit1;
            data.editingLink.clear();
            data.isFocusForText = false;
            data.selectedPostits.clear();
        },
        outputText: function() {
            const text = this.getTextIOService().outputText();
            console.log(text);
        },
        outputSvg: function() {
            console.log(document.querySelector("#mainSvg").outerHTML);
        },
        inputText: function(text) {
            this.getTextIOService().inputText(text);
            this.calcSize();
        },
        updateEditingPostitSize () {
            if (PostitDummy.isDummy(data.editingPostit)) {
                return;
            }
            setTimeout((v)=>{
                const postit = data.editingPostit;
                const postitView = postitViewRepository.find(postit.id);
                const isUpdated = postitView.updateSize(document.getElementById(data.editingPostit.id), postit);
                if (isUpdated) {
                    data.shock = Date.now();
                }
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
        },
        undo () {
            commandCenter.undo();
        }
    },
    mounted: function() {
        data.selectedPostits.clear();
        data.selectedLinks.clear();
        data.postits.values.forEach((v, i)=>{
            const postitView = postitViewRepository.find(v.id);
            postitView.updateSize(this.$refs.postit[i], v);
        });
        setInterval(()=>{
            if (!this.$data.isFocusForText) {
                return;
            }
            this.updateEditingPostitSize();
        }, 1000);
        console.log("mounted");
        document.addEventListener('keydown', (event)=>{
            console.log(event);
            const postitService = this.getPostitService();
            data.selectedPostits.moveSelectedPostitIfKeyPressed(event);
            if (event.code == "Enter") {
                this.$data.refreshCount++;
            }
            if (event.code == "Backspace" && !this.$data.selectedLinks.isNoSelected() && !PostitDummy.isDummy(this.$data.selectedLinks.values[0].startPostit)) {
                if (!this.$data.isFocusForText && this.$data.selectedPostits.isNoSelected()) {
                    console.log("delete link");
                    console.log(confirm("矢印を削除します。よろしいですか？"));
                    commandCenter.deletePostitsAndLinks({
                        postitIds: [],
                        links: data.selectedLinks.values.map((v)=>v).map((v)=>({
                                startPostitId: v.startPostit.id,
                                endPostitId: v.endPostit.id
                            }))
                    });
                    data.selectedLinks.clear();
                }
            }
            if (event.code == "Esc") {
                this.$data.editingPostit = dummyPostit1;
                this.$data.editingLink.isEditing = false;
                data.selectedLinks.clear();
                data.selectedPostits.clear();
                this.data.shock = Date.now();
            }
            if (event.code == "Enter" && event.shiftKey) {
                if (PostitDummy.isDummy(data.editingPostit)) {
                    return;
                }
                const newPostit = postitService.createSidePostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
                postitViewRepository.add(new PostitView(newPostit.id));
                this.toEditMode(newPostit);
                event.preventDefault();
            }
            if (event.code == "Tab") {
                if (PostitDummy.isDummy(data.editingPostit)) {
                    return;
                }
                const newPostit = postitService.createSubPostit(data.editingPostit, postitViewRepository.find(data.editingPostit.id));
                postitViewRepository.add(new PostitView(newPostit.id));
                this.toEditMode(newPostit);
                event.preventDefault();
            }
        });
        this.calcSize();
    },
    computed: {
        linkArrows: function() {
            data.shock;
            console.log("linkArrows");
            return data.links.values.map((link)=>{
                const linkView = new LinkView(link.startPostit, link.endPostit, postitViewRepository.find(link.startPostit.id), postitViewRepository.find(link.endPostit.id));
                const s = linkView.getStartPoint();
                const e = linkView.getEndPoint();
                return {
                    link: link,
                    path: `M${s.x},${s.y} L${e.x},${e.y}`,
                    isSelected: this.selectedLinks.isSelected(link),
                    hasStartPostitDiv: postitViewRepository.find(link.startPostit.id).isDiv
                };
            });
        },
        lineEndPos: function() {
            const postits = collisionChecker.findCollidedPostit(data.editingLink.pos).filter((v)=>v.id != data.editingLink.startPostit.id);
            const pos = postits.length == 1 ? postitViewRepository.find(postits[0].id).getCenter(postits[0]) : data.editingLink.pos;
            return {
                x: pos.x,
                y: pos.y
            };
        },
        postitAndViews: function() {
            data.shock;
            const result = data.postits.values.map((v)=>({
                    postit: v,
                    postitView: postitViewRepository.find(v.id),
                    isSelected: data.selectedPostits.isSelected(v.id)
                }));
            console.log("postitAndViews");
            return result;
        }
    }
});
window.app = app;
