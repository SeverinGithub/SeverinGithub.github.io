import type { Stroke } from '../../../shared/types'
import { bounds, strokePath } from './strokes'

// Strokes -> JPEG for the AI: white background, black ink, cropped to the writing + 16px, max 1000px wide.
export async function exportInk(strokes: Stroke[]): Promise<string> {
  if (!strokes.length) return ''
  const pad = 16
  const b = bounds(strokes)
  const w = b.maxX - b.minX + pad * 2, h = b.maxY - b.minY + pad * 2
  const scale = Math.min(2, 1000 / w)
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(w * scale)
  canvas.height = Math.ceil(h * scale)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.translate((pad - b.minX) * scale, (pad - b.minY) * scale)
  ctx.fillStyle = '#000'
  for (const s of strokes) ctx.fill(strokePath(s, scale))
  return canvas.toDataURL('image/jpeg', 0.85)
}
