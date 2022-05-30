import { DLinks } from "../domain/link/DLinks.ts";
import { DLink } from "../domain/link/DLink.ts";
import { DPostit } from "../domain/postit/DPostit.ts";
import { DPostits } from "../domain/postit/DPostits.ts";

// 操作

enum CommandType {
  deleteLinkCommand = "deleteLinkCommand",
  addLinkCommand = "addLinkCommand",

  deletePostitCommand = "deletePostitCommand",
  addPostitCommand = "addPostitCommand",

  addPostitsAndLinks = "addPostitsAndLinks",
  deletePostitsAndLinks = "deletePostitsAndLinks"
}
type Command = {type: CommandType, timestamp: number}

type DeleteLinkArgs = {startPostitId: string, endPostitId: string};
type AddLinkArgs = {startPostitId: string, endPostitId: string};
type DeletePostitArgs = {postitId: string};
type AddPostitArgs = {id: string, text: string, pos: {x:number, y:number}};

type DeletePostitsAndLinksArgs = {postitIds: string[], links:{startPostitId: string, endPostitId: string}[]};
type AddPostitsAndLinksArgs = {postits:{id: string, text: string, pos: {x:number, y:number}}[], links:{startPostitId: string, endPostitId: string}[]};

type DeleteLinkCommand = Command & {type:CommandType.deleteLinkCommand} & DeleteLinkArgs;
type AddLinkCommand = Command & {type:CommandType.addLinkCommand} & AddLinkArgs;
type DeletePostitCommand = Command & {type:CommandType.deletePostitCommand} & DeletePostitArgs;
type AddPostitCommand = Command & {type:CommandType.addPostitCommand} & AddPostitArgs;
type DeletePostitsAndLinksCommand = Command & {type:CommandType.deletePostitsAndLinks} & DeletePostitsAndLinksArgs;
type AddPostitsAndLinksCommand = Command & {type:CommandType.addPostitsAndLinks} & AddPostitsAndLinksArgs;

export class CommandCenter {
  undoCommands: Command[] = [];
  constructor(public postits: DPostits, public links: DLinks) {}

  invokeAndSaveUndoCommand(command: Command) {
    const undoCommand = this.invoke(command);
    this.undoCommands.push(undoCommand);
  }

  /**
   * 
   * @param command 
   * @returns undo用のコマンドを返す
   */
  invoke(command: Command): Command {
    console.log("command", JSON.parse(JSON.stringify(command)));
    if(command.type == CommandType.deleteLinkCommand) {
      const c = command as AddLinkCommand;
      this.links.delete(DLink.uniqIdFromId(c.startPostitId, c.endPostitId));

      const undo: AddLinkCommand = {type: CommandType.addLinkCommand, timestamp: c.timestamp, startPostitId: c.startPostitId, endPostitId: c.endPostitId};
      return undo;
    }
    if(command.type == CommandType.addLinkCommand) {
      const c = command as AddLinkCommand;
      this.links.add(new DLink(this.postits.find(c.startPostitId), this.postits.find(c.endPostitId)))

      const undo: DeleteLinkCommand = {type: CommandType.deleteLinkCommand, timestamp: c.timestamp, startPostitId: c.startPostitId, endPostitId: c.endPostitId};
      return undo;
    }
    if(command.type == CommandType.deletePostitCommand) {
      const c = command as DeletePostitCommand;
      const postitAndLinks = this.postits.delete(c.postitId);
      const undo: AddPostitsAndLinksCommand = {
        type: CommandType.addPostitsAndLinks, 
        timestamp: c.timestamp, 
        postits: [postitAndLinks.postit], 
        links: postitAndLinks.links.map(v => ({startPostitId: v.startPostit.id, endPostitId: v.endPostit.id}))
      };
      return undo;
    }
    if(command.type == CommandType.addPostitCommand) {
      const c = command as AddPostitCommand;
      this.postits.add(new DPostit(c.id, c.text, c.pos));
      const undo: DeletePostitCommand = {type: CommandType.deletePostitCommand, timestamp: c.timestamp, postitId: c.id};
      return undo;
    }

    if(command.type == CommandType.deletePostitsAndLinks) {
      const c = command as DeletePostitsAndLinksCommand;
      // this.links.delete(DLink.uniqIdFromId(c.startPostitId, c.endPostitId));
      c.links
        .map(v => DLink.uniqIdFromId(v.startPostitId, v.endPostitId))
        .forEach(v => this.links.delete(v));
      const result = c.postitIds.reduce(
        (memo, v) => {
          const r = this.postits.delete(v);
          memo.postits = [...memo.postits, r.postit];
          memo.links = [...memo.links, ...r.links];
          return memo;
        }, 
        {postits: [], links: []} as {postits: DPostit[], links: DLink[]}
      );
      
      const undo: AddPostitsAndLinksCommand = {
        type: CommandType.addPostitsAndLinks, 
        timestamp: c.timestamp, 
        postits: result.postits,
        links: [...c.links, ...result.links.map(v => ({startPostitId: v.startPostit.id, endPostitId: v.endPostit.id}))]
      };
      return undo;
    }

    if(command.type == CommandType.addPostitsAndLinks) {
      const c = command as AddPostitsAndLinksCommand;
      c.postits
        .map(v => new DPostit(v.id, v.text, v.pos))
        .forEach(v => this.postits.add(v));
      c.links
        .map(v => new DLink(this.postits.find(v.startPostitId), this.postits.find(v.endPostitId)))
        .forEach(v => this.links.add(v));

        const undo: DeletePostitsAndLinksCommand = {
          type: CommandType.deletePostitsAndLinks, 
          timestamp: c.timestamp, 
          postitIds: c.postits.map(v => v.id),
          links: c.links
        };
        return undo;
    }
    throw new Error("command not found: " + command.type);
  }

  deleteLink(args :DeleteLinkArgs) {
    const c: DeleteLinkCommand = {type: CommandType.deleteLinkCommand, timestamp: Date.now(), ...args};
    this.invokeAndSaveUndoCommand(c);
  }
  addLink(args :AddLinkArgs) {
    const c: AddLinkCommand = {type: CommandType.addLinkCommand, timestamp: Date.now(), ...args};
    this.invokeAndSaveUndoCommand(c);
  }
  deletePostit(args: DeletePostitArgs) {
    const c: DeletePostitCommand = {type: CommandType.deletePostitCommand, timestamp: Date.now(), ...args};
    this.invokeAndSaveUndoCommand(c);
  }
  addPostit(args: AddPostitArgs) {
    const c: AddPostitCommand = {type: CommandType.addPostitCommand, timestamp: Date.now(), ...args};
    this.invokeAndSaveUndoCommand(c);
  }

  addPostitsAndLinks(args: AddPostitsAndLinksArgs) {
    const c: AddPostitsAndLinksCommand = {
      type: CommandType.addPostitsAndLinks, 
      timestamp: Date.now(), 
      ...args
    };
    this.invokeAndSaveUndoCommand(c);
  }
}