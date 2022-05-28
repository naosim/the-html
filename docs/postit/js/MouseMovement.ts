export class MouseMovement {
  #x = 0;
  #y = 0;

  /**
   * 位置を更新する。差分を返す
   * @returns {{x:number, y:number}} 移動差分
   */
  updateClientPos(clientX: number, clientY: number) {
    const result = {
      x: clientX - this.#x,
      y: clientY - this.#y
    };
    this.#x = clientX;
    this.#y = clientY;
    return result;
  }
}