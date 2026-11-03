class_name Iso
## The same isometric projection as the browser game (110-camera-iso.js):
## one tile is 64×32 pixels, world x runs to the lower right, world y to the lower left.

const TW := 32.0  # half a tile's width
const TH := 16.0  # half a tile's height

static func to_screen(w: Vector2) -> Vector2:
	return Vector2((w.x - w.y) * TW, (w.x + w.y) * TH)

static func to_world(s: Vector2) -> Vector2:
	var a := s.x / TW
	var b := s.y / TH
	return Vector2((a + b) / 2.0, (b - a) / 2.0)

## Sheet row for a world angle: the export bakes 8 rows, row k faces world angle k·45°.
static func dir_row(world_angle: float) -> int:
	return posmod(roundi(world_angle / (PI / 4.0)), 8)
