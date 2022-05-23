
/**
 * 
 * @param {{x: number, y: number}} point 
 * @param {{pos: {x: number, y: number}, size: {width: number, height: number}}} rect 
 * @returns {{x: number, y: number}}
 */
export function calcCollisionPoint(point, rect) {
  // 四角形の中心
  const center = {
    x: rect.pos.x + rect.size.width / 2,
    y: rect.pos.y + rect.size.height / 2
  }

  // 点と四角形の中心を結ぶ直線
  // xからyを算出
  const getY = (x) => (center.y - point.y) / (center.x - point.x) * (x - point.x) + point.y;
  // yからxを算出
  const getX = (y) => (center.x - point.x) / (center.y - point.y) * (y - point.y) + point.x;

  // 範囲内の交点を算出。範囲外ならundefined
  const getYWithRange = (x, yRangeStart, yRangeEnd) => {
    const y = getY(x);
    return isInRange(y, yRangeStart, yRangeEnd) ? y : undefined;
  };
  const getXWithRange = (y, xRangeStart, xRangeEnd) => {
    const x = getX(y);
    return isInRange(x, xRangeStart, xRangeEnd) ? x : undefined;
  }

  // 四角形の各辺(直線)と中心に向かう線の交点 
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
  ].filter(v => v.x !== undefined && v.y !== undefined);// 範囲内の点だけにする

  if(candidatePoints.length == 1) {
    return candidatePoints[0];
  }
  if(candidatePoints.length >= 3) {
    throw new Error("想定外");
  }

  // 候補が2つある場合は点から近い方を採用する
  const lengthes = candidatePoints.map(v => length(v, point));
  return lengthes[0] < lengthes[1] ? candidatePoints[0] : candidatePoints[1];
}

/**
 * 値の範囲内かどうか？
 * @param {number} v 
 * @param {number} start 開始の値（境界値含む）
 * @param {number} end 終了の値（境界値含まず）
 * @returns {boolean} 範囲内ならばtrue
 */
function isInRange(v, start, end) {
  return start <= v && v < end;
}

/**
 * 距離（ただし比較用のためルートしない）
 * @param {{x: number, y: number}} pos1 
 * @param {{x: number, y: number}} pos2 
 * @returns {number}
 */
function length(pos1, pos2) {
  return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
}