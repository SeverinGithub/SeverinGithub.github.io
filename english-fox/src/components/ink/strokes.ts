import { getStroke } from 'perfect-freehand'
import type { Stroke } from '../../../shared/types'

export const strokeOptions = { size: 3.2, thinning: 0.55, smoothing: 0.5, streamline: 0.45, simulatePressure: false }

export function strokePath(stroke: Stroke, scale = 1): Path2D {
  const outline = getStroke(stroke.points.map(([x, y, p]) => [x * scale, y * scale, p]), { ...strokeOptions, size: strokeOptions.size * scale, simulatePressure: stroke.points.every((p) => p[2] === 0.5) })
  const path = new Path2D()
  if (!outline.length) return path
  path.moveTo(outline[0][0], outline[0][1])
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i - 1], [x1, y1] = outline[i]
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
  }
  path.closePath()
  return path
}

export function bounds(strokes: Stroke[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const s of strokes) for (const [x, y] of s.points) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y)
  }
  return { minX, minY, maxX, maxY }
}
