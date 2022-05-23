export class MouseMovement {
  #x = undefined;
  #y = undefined;

  /**
   * 位置を更新する。差分を返す
   * @returns {{x:number, y:number}} 移動差分
   */
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