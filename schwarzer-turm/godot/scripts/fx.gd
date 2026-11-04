class_name Fx
extends Node2D
## Painted effects. Two of these live in a level: one on the ground under everything (telegraphs, the click ring),
## one above the figures (sparks, blood, slashes, projectiles) and one for the floating numbers, outside the darkness and the palette. The level owns the lists, this only paints them,
## as render() and drawFxWorld do in the browser.

@export var mode := "world"   # ground: under the figures · world: over them · text: floating numbers, outside the palette
var level: Level

func _process(_dt: float) -> void:
	queue_redraw()

func _draw() -> void:
	if level == null:
		return
	if mode == "text":
		_draw_texts()
		return
	if mode == "ground":
		for t in level.tele:
			if t.t >= 0:
				_tele(t)
		if level.click_fx:
			var c: Dictionary = level.click_fx
			var s := Iso.to_screen(Vector2(c.x, c.y))
			var k: float = 1.4 - c.t
			_ellipse_line(s, 14 * k, 7 * k, Color(236 / 255.0, 228 / 255.0, 207 / 255.0, c.t * 2), 1.5)
		return
	for r in level.rings:
		_ellipse_line(Iso.to_screen(Vector2(r.x, r.y)), r.r * 45.25, r.r * 22.6, Color(r.col, maxf(0, 1 - r.r / r.max)), 3)
	for s in level.slashes:
		_slash(s)
	for p in level.parts:
		var sp := Iso.to_screen(Vector2(p.x, p.y)) - Vector2(0, p.z * 30)
		var a: float = clampf(1 - p.t / p.life, 0, 1)
		var col: Color = p.col
		col.a *= a
		var sz: float = p.s
		if p.k == "smoke":
			draw_circle(sp, sz * (1 + p.t / p.life), Color(col, col.a * .5))
		else:
			draw_rect(Rect2(sp - Vector2(sz, sz) * .5, Vector2(sz, sz)), col)
	for p in level.proj:
		_proj(p)
	if level.glutmal:
		Prop.glow(self, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)) - Vector2(0, 6), 10, Color(1, .55, .2, .8))
		Prop.flame(self, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)).x, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)).y - 2, 4, 0, Game.t)

func _draw_texts() -> void:
	var font := ThemeDB.fallback_font
	for t in level.texts:
		var sp := Iso.to_screen(Vector2(t.x, t.y)) - Vector2(0, t.z * 34)
		var pop: float = 1 + (1 - t.t / .12) * .8 if t.t < .12 else 1.0
		var size := int(round((15 if t.big else 11) * pop))
		var w := font.get_string_size(t.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
		var col: Color = t.col
		col.a = 1 - t.t * t.t
		draw_string_outline(font, sp - Vector2(w / 2, 0), t.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size, 3, Color(0, 0, 0, .85 * col.a))
		draw_string(font, sp - Vector2(w / 2, 0), t.txt, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

func _ellipse_line(c: Vector2, rx: float, ry: float, col: Color, wdt: float) -> void:
	var pts := PackedVector2Array()
	for k in 33:
		var a := k / 32.0 * TAU
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	draw_polyline(pts, col, wdt)

## the outline of a telegraph in world space (shapePts in 210-render.js)
static func shape_pts(t: Dictionary, sc := 1.0) -> PackedVector2Array:
	var pts := PackedVector2Array()
	if t.shape == "circle":
		for k in 36:
			var a := k / 36.0 * TAU
			pts.append(Vector2(t.x + cos(a) * t.r * sc, t.y + sin(a) * t.r * sc))
	elif t.shape == "cone":
		pts.append(Vector2(t.x, t.y))
		for k in 17:
			var a: float = t.ang - t.arc / 2 + t.arc * k / 16.0
			pts.append(Vector2(t.x + cos(a) * t.r * sc, t.y + sin(a) * t.r * sc))
	else:
		var c := cos(t.ang)
		var s := sin(t.ang)
		var w: float = t.w / 2
		var L: float = t.len * sc
		pts.append_array([Vector2(t.x - s * w, t.y + c * w), Vector2(t.x + c * L - s * w, t.y + s * L + c * w), Vector2(t.x + c * L + s * w, t.y + s * L - c * w), Vector2(t.x + s * w, t.y - c * w)])
	var out := PackedVector2Array()
	for p in pts:
		out.append(Iso.to_screen(p))
	return out

func _tele(t: Dictionary) -> void:
	var p := clampf(t.t / t.dur, 0, 1)
	var col := Color8(220, 30, 20)
	if t.get("elem") == "fire":
		col = Color8(255, 110, 30)
	elif t.get("elem") == "frost":
		col = Color8(140, 200, 255)
	var outer := shape_pts(t)
	draw_colored_polygon(outer, Color(col, .13))
	var ring := outer.duplicate()
	ring.append(outer[0])
	draw_polyline(ring, Color(col, .6), 1.5)
	draw_colored_polygon(shape_pts(t, p if t.shape == "line" else maxf(.05, p)), Color(col, .18 + p * .25))

func _slash(s: Dictionary) -> void:
	# a sweeping arc in front of the striker (slashFx): bright at the blade's edge, fading behind
	var q: float = s.t / s.life
	var pts := PackedVector2Array()
	var n := 14
	var a0: float = s.ang - s.arc / 2
	var sweep: float = s.arc * minf(1, q * 2.2)
	for k in n + 1:
		var a := a0 + sweep * k / n
		pts.append(Iso.to_screen(Vector2(s.x + cos(a) * s.r, s.y + sin(a) * s.r)) - Vector2(0, s.z * 30))
	if pts.size() > 1:
		draw_polyline(pts, Color(s.col, (1 - q) * .8), s.wdt * (1 - q * .6))

func _proj(p: Dictionary) -> void:
	var sp := Iso.to_screen(Vector2(p.x, p.y)) - Vector2(0, 16)
	var dir := Iso.to_screen(Vector2(p.vx, p.vy)).normalized()
	match p.kind:
		"arrow":
			draw_line(sp - dir * 9, sp + dir * 3, Color("#d8d0bc"), 1.5)
			draw_line(sp - dir * 9, sp - dir * 6, Color("#ffffff"), 2)
		"fire", "glut":
			draw_circle(sp, 7, Color(1, .45, .12, .35))
			draw_circle(sp, 4, Color("#ff9a30"))
			draw_circle(sp, 2, Color("#ffe2a0"))
		"frost":
			draw_circle(sp, 6, Color(.6, .8, 1, .35))
			draw_circle(sp, 3, Color("#c8e4ff"))
		"poison":
			draw_circle(sp, 6, Color(.6, .9, .3, .35))
			draw_circle(sp, 3, Color("#9ae050"))
		_:
			draw_circle(sp, 4, Color("#e8e0c8"))
