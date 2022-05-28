export class DPostit {
  constructor(
    public id: string,
    public text: string,
    public pos: {x:number, y:number}
  ) {}
  move(pos: {x: number, y: number}) {
    this.pos.x = pos.x;
    this.pos.y = pos.y;
  }
  moveWithDiff(diff: {diffX: number, diffY: number}) {
    this.pos.x += diff.diffX;
    this.pos.y += diff.diffY;
  }
  updateText(text: string) {
    this.text = text;
  }
}