export class History {

}

class MovePostitEvent {
  constructor(postitId, beforePos, afterPos) {
    this.postitId = postitId;
    this.beforePos = beforePos;
    this.afterPos = afterPos;
  }

  execute() {}
  undo() {

  }

}

/*
## 操作
- 付箋
  - 追加
  - 削除
  - 文章更新
  - 位置更新
- リンク
  - 追加
  - 削除
*/