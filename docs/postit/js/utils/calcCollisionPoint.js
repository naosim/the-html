export function calcCollisionPoint(point, rect) {
  // 四角形の中心
  const center = {
    x: rect.pos.x + rect.size.width / 2,
    y: rect.pos.y + rect.size.height / 2
  }
  // 範囲内かどうか？ startは境界値含む、endは境界値含まず
  const isInRange = (v, start, end) => start <= v && v < end;

  // 点と四角形の中心を結ぶ直線
  const getY = (x) => (center.y - point.y) / (center.x - point.x) * (x - point.x) + point.y;
  const getX = (y) => (center.x - point.x) / (center.y - point.y) * (y - point.y) + point.x;

  const getYWithRange = (x, yRangeStart, yRangeEnd) => {
    const y = getY(x);
    return isInRange(y, yRangeStart, yRangeEnd) ? y : undefined;
  };
  const getXWithRange = (y, xRangeStart, xRangeEnd) => {
    const x = getX(y);
    return isInRange(x, xRangeStart, xRangeEnd) ? x : undefined;
  }

  // 各辺(直線)と線の交点 
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
  ].filter(v => v.x !== undefined && v.y !== undefined);

  if(candidatePoints.length == 1) {
    return candidatePoints[0];
  }

  const lengthes = candidatePoints.map(v => Math.pow(v.x - point.x, 2) + Math.pow(v.y - point.y, 2));
  
  return lengthes[0] < lengthes[1] ? candidatePoints[0] : candidatePoints[1];
}