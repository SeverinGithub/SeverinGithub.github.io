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
		pass  # the name plates and the numbers are drawn sharp by the HUD (Hud._world_texts)
		return
	if mode == "ground":
		for gi in level.items:
			_ground_item(gi)
		if level.sk:
			_skill_ground(level.sk)
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
	if level.sk:
		_skill_world(level.sk)
	if level.glutmal:
		Prop.glow(self, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)) - Vector2(0, 6), 10, Color(1, .55, .2, .8))
		Prop.flame(self, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)).x, Iso.to_screen(Vector2(level.glutmal.x, level.glutmal.y)).y - 2, 4, 0, Game.t)

## an item on the floor: a soft glow of its rarity under it, its picture hopping once as it lands (drawGroundItem)
func _ground_item(gi: Dictionary) -> void:
	var s := Iso.to_screen(Vector2(gi.x, gi.y))
	var it: Dictionary = gi.it
	if it.rar != "normal" and it.rar != "junk":
		Prop.ellipse(self, s.x, s.y, 16, 8, Color(Items.RCOL[it.rar], .25 + sin(gi.t * 4) * .1))
	var tex := Items.ground_pic(it)
	if tex:
		var hop: float = sin(gi.t / .4 * PI) * 14 if gi.t < .4 else 0.0
		draw_texture(tex, s + Vector2(-17, -28 - hop))

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
	if t.shape == "line" and p < .02:
		return                   # a line of no length yet has no area to fill
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
		"flask":
			# thrown in an arc: high in the middle of its flight, a small shadow below
			var q: float = clampf(1 - p.life / p.life0, 0, 1) if p.get("life0") else .5
			var z := sin(q * PI) * 26 + 12
			var g := Iso.to_screen(Vector2(p.x, p.y))
			Prop.ellipse(self, g.x, g.y, 3.2, 1.5, Color(0, 0, 0, .3))
			var c := g - Vector2(0, z)
			draw_circle(c, 8, Color(p.col, .3))
			draw_circle(c + Vector2(0, 1), 3.2, Color("#bcd8d0"))
			draw_circle(c + Vector2(0, 1.8), 2.4, p.col)
			draw_rect(Rect2(c.x - 1, c.y - 4.6, 2, 3), Color("#bcd8d0"))
		"arrow":
			if p.get("oil"):
				draw_line(sp - dir * 8, sp + dir * 6, Color(p.col, .55), 4)
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

# ---------- what skills leave (drawExtGround, the zones of 470 and the flasks of 900) ----------

func _ring_w(c: Vector2, r: float) -> Vector2:
	return Vector2(r * 45.25, r * 22.6)

func _fill_ellipse(c: Vector2, rr: Vector2, col: Color) -> void:
	Prop.ellipse(self, c.x, c.y, rr.x, rr.y, col)

func _skill_ground(S: Skills) -> void:
	for z in S.zones:
		var c := Iso.to_screen(Vector2(z.x, z.y))
		var rr := _ring_w(c, z.r)
		match z.k:
			"meteor":
				if not z.get("hit"):
					var p: float = z.t / z.dur
					_fill_ellipse(c, rr, Color(1, 110 / 255.0, 30 / 255.0, .08 + p * .12))
					_ellipse_line(c, rr.x, rr.y, Color(1, 140 / 255.0, 60 / 255.0, .7), 1.5)
					_ellipse_line(c, rr.x * p, rr.y * p, Color(1, 200 / 255.0, 120 / 255.0, .6), 1.5)
			"rain":
				_ellipse_line(c, rr.x, rr.y, Color(232 / 255.0, 226 / 255.0, 208 / 255.0, .35), 1)
			"burn":
				_fill_ellipse(c, rr, Color(1, 90 / 255.0, 20 / 255.0, .12))
			"hail":
				_fill_ellipse(c, rr, Color(.6, .8, 1, .1))
				_ellipse_line(c, rr.x, rr.y, Color(.7, .85, 1, .35), 1)
			"thunder":
				_ellipse_line(c, rr.x, rr.y, Color(.7, .78, 1, .3), 1)
			"mcloud":
				_fill_ellipse(c, rr, Color(.55, .85, .3, .14))
	_draw_map_traps()
	for t in S.traps:
		var c := Iso.to_screen(Vector2(t.x, t.y))
		var a := .5 if t.arm > 0 else 1.0
		_fill_ellipse(c, Vector2(9, 4.5), Color(Color("#2a2414"), a))
		for k in 6:
			var q := k / 6.0 * TAU
			draw_line(c + Vector2(cos(q) * 3, sin(q) * 1.5), c + Vector2(cos(q) * 8, sin(q) * 4 - 3), Color(Color("#c8b890"), a), 1)
	for h in S.heals:
		var c := Iso.to_screen(Vector2(h.x, h.y))
		var f: float = clampf(minf(h.t / .3, (h.dur - h.t) / .5), 0, 1)
		_fill_ellipse(c, _ring_w(c, 2.6), Color(1, .9, .5, .12 * f))

func _skill_world(S: Skills) -> void:
	# lightning: a jagged line, seeded so it does not flicker every frame
	for b in S.bolts:
		var a := Iso.to_screen(b.a) - Vector2(0, 18)
		var e := Iso.to_screen(b.b) - Vector2(0, 18)
		var pts := PackedVector2Array([a])
		var rng := RandomNumberGenerator.new()
		rng.seed = int(b.seed * 100000) + int(Game.t * 20)
		var n := 7
		var nrm := (e - a).orthogonal().normalized()
		for k in range(1, n):
			pts.append(a.lerp(e, k / float(n)) + nrm * rng.randf_range(-7, 7))
		pts.append(e)
		var al: float = clampf(b.t / .2, 0, 1)
		draw_polyline(pts, Color(.48, .64, 1, .5 * al), 4)
		draw_polyline(pts, Color(.9, .94, 1, al), 1.6)
	# the bone ward circles the hero
	var P: Dictionary = level.P
	if P.get("ward", 0) > 0 and not P.dead:
		var h := Iso.to_screen(Vector2(P.x, P.y))
		for k in 6:
			var a := Game.t * 3 + k * 1.047
			var c := h + Vector2(cos(a) * 17, -18 + sin(a) * 8 + sin(Game.t * 4 + k) * 2)
			draw_line(c - Vector2(2.6, -.6), c + Vector2(2.6, -.6), Color("#ece4cf"), 2)

## the tower's traps (drawMapTraps in 390-combat-roles.js): spike plates and the nozzles of fire spouts
func _draw_map_traps() -> void:
	if level.ow:
		return
	for t in level.m.get("traps", []):
		var c := Iso.to_screen(Vector2(t.x, t.y))
		if t.k == "spike":
			var dia := PackedVector2Array([c + Vector2(0, -9), c + Vector2(17, 0), c + Vector2(0, 9), c + Vector2(-17, 0)])
			draw_colored_polygon(dia, Color("#1c1a18"))
			dia.append(dia[0])
			draw_polyline(dia, Color("#3e3a34"), 1)
			var up := 0.0
			if t.st == 2:
				up = minf(1, t.t / .06) * (maxf(0, 1 - (t.t - 1) / .4) if t.t > 1 else 1.0)
			elif t.st == 1:
				up = .12
			for i in range(-1, 2):
				for j in range(-1, 2):
					var q := c + Vector2((i - j) * 5, (i + j) * 2.5)
					draw_rect(Rect2(q.x - 1, q.y - .5, 2, 1.2), Color("#050403"))
					if up > .02:
						draw_colored_polygon(PackedVector2Array([q + Vector2(-1.2, 0), q + Vector2(0, -9 * up), q + Vector2(1.2, 0)]), Color("#b8b0a0"))
		else:
			var f := Enemy._scr_dir(t.ang)
			var hot: bool = t.t > t.per - .9
			draw_rect(Rect2(c.x - 5, c.y - 14, 10, 12), Color("#24201c"))
			draw_rect(Rect2(c.x - 2.5 + f.x * 3, c.y - 9 + f.y * 2, 5, 4), Color(1, (120 + sin(Game.t * 30) * 60) / 255.0, 30 / 255.0, .95) if hot else Color("#4a2410"))

