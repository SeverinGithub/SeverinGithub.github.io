class_name ThemeDraw
## The pictures of the theme floors and the tower rooms, painted from shapes as the browser does every frame
## (ftProp in 982-floor-themes.js, twDraw and drawTwObj in 984-tower-rooms.js): windows to the sky, stained glass, cell bars,
## bookshelves, gears, posts around the light well, pews, candles, crucibles, cold braziers; the vault, levers, plaque,
## trial stone, blood altar, prisoner's cage, lift; powder kegs and chandeliers.

const WH := 56.0

static func _poly(ci: CanvasItem, pts: Array, col: Color) -> void:
	ci.draw_colored_polygon(PackedVector2Array(pts), col)

## an ellipse, turned by rot
static func ell(ci: CanvasItem, c: Vector2, rx: float, ry: float, col: Color, rot := 0.0, n := 24) -> void:
	var pts := PackedVector2Array()
	for k in n:
		var a := k / float(n) * TAU
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry).rotated(rot))
	ci.draw_colored_polygon(pts, col)

static func ell_line(ci: CanvasItem, c: Vector2, rx: float, ry: float, col: Color, wd := 1.0, n := 32) -> void:
	var pts := PackedVector2Array()
	for k in n + 1:
		var a := k / float(n) * TAU
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	ci.draw_polyline(pts, col, wd)

## a soft round glow, for 'lighter' gradients (fades from col at the middle to nothing at r)
static func glow(ci: CanvasItem, c: Vector2, rx: float, ry: float, col: Color, steps := 6) -> void:
	for k in steps:
		var f := 1 - k / float(steps)
		ell(ci, c, rx * f, ry * f, Color(col, col.a / steps * 1.6), 0, 20)

## an arch: a round top on two straight sides (archP)
static func arch(x: float, y: float, w: float, h: float) -> PackedVector2Array:
	var pts := PackedVector2Array([Vector2(x, y + h), Vector2(x, y + w / 2)])
	for k in range(1, 12):
		var a := PI + k / 12.0 * PI
		pts.append(Vector2(x + w / 2 + cos(a) * w / 2, y + w / 2 + sin(a) * w / 2))
	pts.append(Vector2(x + w, y + w / 2))
	pts.append(Vector2(x + w, y + h))
	return pts

static func gear(c: Vector2, r: float, n: int, a: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for k in n * 2:
		var q := a + k / float(n * 2) * TAU
		var q2 := a + (k + 1) / float(n * 2) * TAU
		var rr := r if k % 2 else r * .78
		pts.append(c + Vector2(cos(q), sin(q)) * rr)
		pts.append(c + Vector2(cos(q2), sin(q2)) * rr)
	return pts

static func _shadow(ci: CanvasItem, sx: float, sy: float, r: float) -> void:
	Prop.shadow(ci, sx, sy, r)

# ---------- the theme's props (on the wall the node is already sheared) ----------

static func prop(ci: CanvasItem, p: Dictionary, sx: float, sy: float, t: float) -> void:
	var ph: float = p.get("ph", 0.0)
	var v: int = p.get("v", 0)
	match p.k:
		"ftwin":
			ci.draw_colored_polygon(arch(-11, -47, 22, 32), Color("#3a3630"))
			var inner := arch(-9, -45, 18, 30)
			# the sky through the window: night above, a warm band at the bottom
			var cols := PackedColorArray()
			for q in inner:
				var f := clampf((q.y + 45) / 30.0, 0, 1)
				cols.append(Color("#0b1430").lerp(Color("#2a4a86"), f / .7) if f < .7 else Color("#2a4a86").lerp(Color("#b07a5a"), (f - .7) / .3))
			ci.draw_polygon(inner, cols)
			for k in 6:
				ci.draw_rect(Rect2(-8 + ((k * 7 + v * 5) % 16), -43 + ((k * 5) % 12), 1, 1), Color(1, 1, 1, .4 + sin(t * 2 + k + ph) * .3))
			var cx := fposmod(t * 1.5 + ph * 9, 34) - 17
			if cx > -12 and cx < 12:
				ci.draw_rect(Rect2(clampf(cx - 5, -9, 9), -26, minf(10, 9 - (cx - 5)), 2), Color(200 / 255.0, 210 / 255.0, 240 / 255.0, .35))
			# an island drifting past, sometimes with a tree, a moon or a second islet
			var ix := -3.0 + (v % 3) * 3
			var iy := -22 + sin(t * .8 + ph) * .8
			var ic := Color("#141a2e")
			ell(ci, Vector2(ix, iy), 5, 1.6, ic)
			_poly(ci, [Vector2(ix - 4, iy), Vector2(ix, iy + 4), Vector2(ix + 4, iy)], ic)
			if v == 1:
				ci.draw_rect(Rect2(ix - 1, iy - 6, 2, 5), ic)
			elif v == 2:
				ci.draw_circle(Vector2(5, -38), 2.4, Color("#e8e4d0"))
			elif v == 3:
				ell(ci, Vector2(-5, -19), 3, 1, ic)
			ci.draw_rect(Rect2(-.7, -45, 1.4, 30), Color("#2a2620"))
			ci.draw_rect(Rect2(-9, -31, 18, 1.2), Color("#2a2620"))
			ci.draw_rect(Rect2(-12, -15, 24, 3), Color("#4a453c"))
		"ftglass":
			ci.draw_colored_polygon(arch(-12, -50, 24, 36), Color("#2a2430"))
			for y in 6:
				for x in 4:
					var q := (x + y + v) % 4
					var b := .55 + sin(t * 1.3 + x + y * 2 + ph) * .12
					var r := Rect2(-10 + x * 5, -48 + y * 6, 5, 6)
					if y == 0:
						# the panes follow the round top
						var top := -38.0 - sqrt(maxf(0, 100 - pow(-10 + x * 5 + 2.5, 2)))
						r = Rect2(r.position.x, top, 5, -42 - top)
					ci.draw_rect(r, Color(FloorThemes.GLASS[q], b))
			var lead := Color("#14101a")
			for x in [-5, 0, 5]:
				ci.draw_line(Vector2(x, -46), Vector2(x, -14), lead, 1)
			for y in range(-42, -14, 6):
				ci.draw_line(Vector2(-10, y), Vector2(10, y), lead, 1)
			ci.draw_arc(Vector2(0, -38), 4, 0, TAU, 16, lead, 1)
			ci.draw_rect(Rect2(-13, -14, 26, 3), Color("#4a4048"))
		"ftbars":
			ci.draw_colored_polygon(arch(-11, -40, 22, 40), Color("#050404"))
			ci.draw_rect(Rect2(-12, -42, 24, 3), Color("#2a2620"))
			if v == 2:
				var b := 0.0 if sin(t * .7 + ph) > .85 else 1.0
				ci.draw_rect(Rect2(-4, -26, 2, 1), Color(1, 60 / 255.0, 30 / 255.0, .8 * b))
				ci.draw_rect(Rect2(2, -26, 2, 1), Color(1, 60 / 255.0, 30 / 255.0, .8 * b))
			if v == 1:
				ci.draw_rect(Rect2(-6, -22, 2, 6), Color("#d8d0bc"))
				ci.draw_rect(Rect2(-7, -17, 4, 2), Color("#d8d0bc"))
			for k in 5:
				var x := -9 + k * 4.5
				ci.draw_rect(Rect2(x - 1, -38, 2.2, 38), Color("#34343a"))
				ci.draw_rect(Rect2(x - 1, -38, .8, 38), Color("#6a6a74"))
			ci.draw_rect(Rect2(-11, -26, 22, 2), Color("#34343a"))
			ci.draw_rect(Rect2(-11, -9, 22, 2), Color("#34343a"))
		"ftshelf":
			_shelf(ci, v)
		"ftgear":
			var a := t * .5 + ph
			ci.draw_rect(Rect2(-14, -46, 28, 36), Color("#0c0a06"))
			for g in [[-4.0, -32.0, 11.0, 12, 1.0], [8.0, -20.0, 6.5, 8, -12 / 8.0]]:
				var c := Vector2(g[0], g[1])
				var r: float = g[2]
				var s: float = g[4]
				var pts := gear(c, r, g[3], a * s)
				ci.draw_colored_polygon(pts, Color("#8a6a2a"))
				pts.append(pts[0])
				ci.draw_polyline(pts, Color("#c8a050"), .8)
				ci.draw_circle(c, r * .5, Color("#4a3814"))
				ci.draw_circle(c, r * .18, Color("#2a1a08"))
				for k in 4:
					var q := a * s + k * 1.571
					ci.draw_line(c + Vector2(cos(q), sin(q)) * r * .18, c + Vector2(cos(q), sin(q)) * r * .5, Color("#6a5020"), 1.4)
			if v == 1:
				var sw := sin(t * 1.8 + ph) * .5
				var e := Vector2(-8 + sin(sw) * 16, -44 + cos(sw) * 16)
				ci.draw_line(Vector2(-8, -44), e, Color("#8a6a2a"), 1.2)
				ci.draw_circle(e, 2.5, Color("#c8a050"))
		"ftpost":
			ell(ci, Vector2(sx, sy), 6, 3, Color(0, 0, 0, .35))
			ci.draw_rect(Rect2(sx - 3, sy - 13, 6, 13), Color("#3e3a34"))
			ci.draw_rect(Rect2(sx - 3, sy - 13, 2, 13), Color("#6a6458"))
			ci.draw_rect(Rect2(sx - 4, sy - 16, 8, 3), Color("#5a544a"))
		"ftpew":
			var C := [[-.85, -.22], [.85, -.22], [.85, .22], [-.85, .22]].map(func(q): return Iso.to_screen(Vector2(p.x + q[0], p.y + q[1])) - ci.position)
			var up := func(q: Array, hh: float) -> Array: return q.map(func(v2): return v2 - Vector2(0, hh))
			_shadow(ci, sx, sy, .6)
			var S: Array = up.call(C, 9)
			_poly(ci, [C[3], C[2], S[2], S[3]], Color("#2a1a0e"))
			_poly(ci, [C[1], C[2], S[2], S[1]], Color("#1e1208"))
			_poly(ci, S, Color("#5a3a1c"))
			var B: Array = up.call([C[0], C[1]], 9)
			var Bt: Array = up.call([C[0], C[1]], 22)
			_poly(ci, [B[0], B[1], Bt[1], Bt[0]], Color("#4a2e16"))
			ci.draw_rect(Rect2(minf(Bt[0].x, Bt[1].x), minf(Bt[0].y, Bt[1].y) - 1, absf(Bt[1].x - Bt[0].x), 2), Color("#7a5228"))
		"ftcandle":
			for k in 3:
				var ox: float = [-9, 3, 10][k]
				var oy: float = [-2, 4, -5][k]
				var z := 38 + sin(t * 1.3 + ph + k * 2) * 4 + k * 5
				var x := sx + ox
				var y := sy + oy - z
				ci.draw_rect(Rect2(x - 1.5, y, 3, 7), Color("#e8e0c8"))
				ci.draw_rect(Rect2(x + .5, y, 1, 7), Color("#c8b898"))
				Prop.flame(ci, x, y, 2.2, ph + k, t)
				ell(ci, Vector2(sx + ox, sy + oy), 3, 1.5, Color(0, 0, 0, .25))
		"ftcruc":
			_shadow(ci, sx, sy, .4)
			for x in [-9, 7]:
				ci.draw_rect(Rect2(sx + x, sy - 10, 2, 10), Color("#14110c"))
			_poly(ci, [Vector2(sx - 12, sy - 22), Vector2(sx + 12, sy - 22), Vector2(sx + 9, sy - 8), Vector2(sx - 9, sy - 8)], Color("#2a2620"))
			ci.draw_rect(Rect2(sx - 12, sy - 23, 24, 2), Color("#4a4236"))
			ell(ci, Vector2(sx, sy - 23), 10, 3.2, Color("#ff6a10"))
			ell(ci, Vector2(sx, sy - 23), 6, 2, Color("#fff0a0"))
		"ftcold":
			_shadow(ci, sx, sy, .32)
			_poly(ci, [Vector2(sx - 9, sy), Vector2(sx - 4, sy - 16), Vector2(sx + 4, sy - 16), Vector2(sx + 9, sy)], Color("#0d0d10"))
			ell(ci, Vector2(sx, sy - 18), 12, 5, Color("#2a2a30"))
			ell(ci, Vector2(sx, sy - 19), 9, 3.4, Color("#4a4644"))
			for k in 3:
				ci.draw_rect(Rect2(sx - 4 + k * 3, sy - 20 + (k % 2), 1.5, 1), Color(1, (80 + k * 30) / 255.0, 30 / 255.0, .3 + sin(t * 3 + k + ph) * .2))

## a bookshelf of thirty by fifty-two pixels, the books rolled once from its variant (ftShelf)
static func _shelf(ci: CanvasItem, v: int) -> void:
	var R := Rng.new(v * 131 + 7)
	var pal := ["#6a1a14", "#1a3a6a", "#2a5a24", "#6a5a1a", "#4a2a5a", "#8a6a3a", "#3a2a1a", "#7a3a1a"]
	var o := Vector2(-15, -WH + 3)
	ci.draw_rect(Rect2(o, Vector2(30, 52)), Color("#2a1a0e"))
	ci.draw_rect(Rect2(o + Vector2(2, 2), Vector2(26, 48)), Color("#120a04"))
	for s in 4:
		var y0 := 2 + s * 12
		var x := 3
		while x < 27:
			var w := 2 + int(R.next() * 3)
			var h := 7 + int(R.next() * 4)
			if R.next() < .12:
				x += w + 1
				continue
			if x + w > 27:
				break
			ci.draw_rect(Rect2(o + Vector2(x, y0 + 10 - h), Vector2(w, h)), Color(pal[int(R.next() * pal.size())]))
			ci.draw_rect(Rect2(o + Vector2(x, y0 + 12 - h), Vector2(w, 1)), Color(1, 220 / 255.0, 140 / 255.0, .35))
			x += w
		ci.draw_rect(Rect2(o + Vector2(1, y0 + 10), Vector2(28, 2)), Color("#4a2e18"))
	ci.draw_rect(Rect2(o, Vector2(30, 2)), Color("#4a2e18"))
	ci.draw_rect(Rect2(o, Vector2(2, 52)), Color("#4a2e18"))
	ci.draw_rect(Rect2(o + Vector2(28, 0), Vector2(2, 52)), Color("#4a2e18"))

# ---------- the objects of the tower rooms ----------

static func obj(ci: CanvasItem, o: Dictionary, sx: float, sy: float, t: float, S, lift_on: bool) -> void:
	var c := Vector2(roundf(sx), roundf(sy))
	match o.type:
		"twvault":
			_shadow(ci, c.x, c.y, .5)
			ci.draw_rect(Rect2(c + Vector2(-16, -18), Vector2(32, 18)), Color("#4a2a10"))
			ci.draw_rect(Rect2(c + Vector2(-16, -18), Vector2(32, 3)), Color("#6a3e18"))
			for x in [-16, -2, 13]:
				ci.draw_rect(Rect2(c + Vector2(x, -18), Vector2(3, 18)), Color("#c8a040"))
			ci.draw_rect(Rect2(c + Vector2(-16, -10), Vector2(32, 2)), Color("#c8a040"))
			if o.open:
				ci.draw_rect(Rect2(c + Vector2(-14, -22), Vector2(28, 5)), Color("#1a0e06"))
				ci.draw_rect(Rect2(c + Vector2(-10, -21), Vector2(20, 2)), Color("#ffd870"))
			else:
				var lid := PackedVector2Array([c + Vector2(-16, -18)])
				for k in range(1, 10):
					var q := k / 10.0
					lid.append(c + Vector2(-16 + 32 * q, -18 - 12 * 4 * q * (1 - q) * .5))
				lid.append(c + Vector2(16, -18))
				ci.draw_colored_polygon(lid, Color("#5a3214"))
				ci.draw_rect(Rect2(c + Vector2(-2, -27), Vector2(4, 9)), Color("#c8a040"))
				ci.draw_rect(Rect2(c + Vector2(-3, -15), Vector2(6, 6)), Color("#2a2622") if o.locked else Color("#ffe080"))
				if not o.locked:
					glow(ci, c + Vector2(0, -14), 30, 30, Color(1, 210 / 255.0, 100 / 255.0, .35 + sin(t * 3) * .12))
		"twlever":
			var G0: Dictionary = FloorThemes.GEMS[o.gem]
			ci.draw_rect(Rect2(c + Vector2(-7, -6), Vector2(14, 6)), Color("#2a2620"))
			ci.draw_rect(Rect2(c + Vector2(-7, -7), Vector2(14, 2)), Color("#4a453c"))
			var a := .8 if o.on else -.8
			var e := c + Vector2(sin(a) * 14, -6 - cos(a) * 14)
			ci.draw_line(c + Vector2(0, -6), e, Color("#5a544a"), 2.4)
			ci.draw_circle(e, 3.6, G0.c)
			ci.draw_circle(e, 8, Color(G0.l, .25 + sin(t * 2 + o.gem) * .1))
		"twplaque":
			_shadow(ci, c.x, c.y, .3)
			ci.draw_rect(Rect2(c + Vector2(-9, -22), Vector2(18, 22)), Color("#3e3a34"))
			ci.draw_rect(Rect2(c + Vector2(-9, -22), Vector2(18, 2)), Color("#5a544a"))
			for k in 4:
				ci.draw_rect(Rect2(c + Vector2(-6, -17 + k * 4), Vector2(12 - (k % 2) * 3, 1.2)), Color("#1a1610"))
			if S and S.has("order"):
				for k in S.order.size():
					ci.draw_rect(Rect2(c + Vector2(-6 + k * 5, -4), Vector2(3, 2)), FloorThemes.GEMS[S.order[k]].c)
		"twtrial":
			var on: bool = S != null and S.get("on", false)
			var dn: bool = S != null and S.get("done", false)
			_shadow(ci, c.x, c.y, .45)
			_poly(ci, [c + Vector2(-10, 0), c + Vector2(-7, -34), c + Vector2(0, -42), c + Vector2(7, -34), c + Vector2(10, 0)], Color("#1a1418"))
			var col := Color(1, 220 / 255.0, 140 / 255.0, .6) if dn else Color(1, (60 if on else 90) / 255.0, 40 / 255.0, .5 + sin(t * (8 if on else 2)) * .3)
			ci.draw_arc(c + Vector2(0, -22), 5, 0, TAU, 16, col, 1.6)
			ci.draw_line(c + Vector2(0, -32), c + Vector2(0, -12), col, 1.6)
			ci.draw_line(c + Vector2(-5, -22), c + Vector2(5, -22), col, 1.6)
		"twaltar":
			_shadow(ci, c.x, c.y, .55)
			ci.draw_rect(Rect2(c + Vector2(-18, -14), Vector2(36, 14)), Color("#2a1a1a"))
			ci.draw_rect(Rect2(c + Vector2(-20, -17), Vector2(40, 4)), Color("#4a2a28"))
			ci.draw_rect(Rect2(c + Vector2(-12, -17), Vector2(24, 2)), Color("#6a1a14"))
			if not o.used:
				ell(ci, c + Vector2(0, -17), 7, 2, Color("#8a0a08"))
				glow(ci, c + Vector2(0, -20), 26, 26, Color(1, 30 / 255.0, 20 / 255.0, .3 + sin(t * 2.5) * .1))
			ci.draw_rect(Rect2(c + Vector2(-16, -22), Vector2(6, 5)), Color("#d8d0bc"))
			ci.draw_rect(Rect2(c + Vector2(-15, -21), Vector2(1.5, 1.5)), Color("#1a140c"))
			ci.draw_rect(Rect2(c + Vector2(-12.5, -21), Vector2(1.5, 1.5)), Color("#1a140c"))
		"twcage":
			_shadow(ci, c.x, c.y, .45)
			var op: bool = o.open
			var ft := minf(1, (t - o.get("ft", 0.0)) / 2.0) if op else 0.0
			if not op or ft < 1:
				var a := 1 - ft
				var y := -ft * 4 if op else 0.0
				ci.draw_rect(Rect2(c + Vector2(-4, -14 + y), Vector2(8, 10)), Color("#6a5a48", a))
				ci.draw_rect(Rect2(c + Vector2(-3, -20 + y), Vector2(6, 6)), Color("#d8b898", a))
				ci.draw_rect(Rect2(c + Vector2(-3, -21 + y), Vector2(6, 2)), Color("#3a2a1a", a))
				ci.draw_rect(Rect2(c + Vector2(-2, -18 + y), Vector2(1, 1)), Color("#1a140c", a))
				ci.draw_rect(Rect2(c + Vector2(1, -18 + y), Vector2(1, 1)), Color("#1a140c", a))
				ci.draw_rect(Rect2(c + Vector2(-6, -5 + y), Vector2(12, 4)), Color("#5a4a38", a))
				if not op:
					var b := sin(t * 1.5) > .6
					ci.draw_rect(Rect2(c + Vector2(3 if b else 4, -12 - (6 if b else 0)), Vector2(2, 6 if b else 2)), Color("#d8b898"))
			ci.draw_rect(Rect2(c + Vector2(-13, -2), Vector2(26, 3)), Color("#1e1c1a"))
			ci.draw_rect(Rect2(c + Vector2(-13, -32), Vector2(26, 3)), Color("#1e1c1a"))
			var x := -12.0
			while x <= 12:
				if not (op and x > 4):
					ci.draw_rect(Rect2(c + Vector2(x - 1, -30), Vector2(2, 28)), Color("#34343a"))
					ci.draw_rect(Rect2(c + Vector2(x - 1, -30), Vector2(.8, 28)), Color("#5a5a64"))
				x += 4.8
			if op:
				# the door swings open
				var tr := Transform2D(.9, c + Vector2(13, -2))
				for xx in [0.0, 4.8]:
					_poly(ci, [tr * Vector2(xx, -28), tr * Vector2(xx + 2, -28), tr * Vector2(xx + 2, 0), tr * Vector2(xx, 0)], Color("#34343a"))
			ci.draw_line(c + Vector2(0, -32), c + Vector2(0, -60), Color("#2a2622"), 1.2)
		"twlift":
			var q := [Vector2(0, -16), Vector2(30, -1), Vector2(0, 14), Vector2(-30, -1)]
			_poly(ci, q.map(func(v2): return c + v2 + Vector2(0, 2)), Color.BLACK)
			_poly(ci, q.map(func(v2): return c + v2 * .82), Color("#4a3420"))
			for k in range(-2, 3):
				ci.draw_line(c + Vector2(-20 + k * 2, -8 + k * 5), c + Vector2(20 + k * 2, -2 + k * 5), Color("#2a1a0c"), 1)
			for v2 in q:
				ci.draw_line(c + v2 * .8, c + v2 * .8 - Vector2(0, 62), Color("#2a2826"), 2.4)
			var top: Array = q.map(func(v2): return c + v2 * .8 - Vector2(0, 62))
			top.append(top[0])
			ci.draw_polyline(PackedVector2Array(top), Color("#2a2826"), 2.4)
			# the rope runs while the lift is unlocked
			var ph := fmod(t * 20, 6) if lift_on else 0.0
			var y := -62.0 - ph
			while y > -180:
				ci.draw_line(c + Vector2(0, maxf(y - 3, -180)), c + Vector2(0, minf(y, -62)), Color("#5a544a"), 1)
				y -= 6
			if not lift_on:
				var col := Color("#c8a040") if o.low else Color("#8a2a1a")
				ci.draw_rect(Rect2(c + Vector2(-4, -32), Vector2(8, 7)), col)
				ci.draw_arc(c + Vector2(0, -32), 3, PI, TAU, 8, col, 1.5)

## a powder keg or a chandelier (drawTwObj): the keg's fuse burns, the chandelier sways high above and drops when struck
static func hazard(e: Enemy, t: float, near: bool) -> void:
	var fl := e.flash > 0
	if e.obj == "barrel":
		Prop.shadow(e, 0, 0, .3)
		var x := randf_range(-1, 1) if e.fuse >= 0 else 0.0
		e.draw_rect(Rect2(x - 8, -20, 16, 19), Color("#fff0d0") if fl else Color("#5a3a1c"))
		e.draw_rect(Rect2(x - 6, -20, 4, 19), Color("#7a5228"))
		for yy in [-18, -11, -4]:
			e.draw_rect(Rect2(x - 8, yy, 16, 2), Color("#2a2622"))
		ell(e, Vector2(x, -20), 8, 3, Color("#3a2410"))
		e.draw_rect(Rect2(x - 2, -15, 4, 7), Color("#b02a1a"))
		e.draw_rect(Rect2(x - 1, -14, 2, 2), Color("#e8d8b0"))
		e.draw_polyline(Prop.quad(Vector2(x + 2, -21), Vector2(x + 6, -27), Vector2(x + 4, -30)), Color("#8a7a5a"), 1)
		if e.fuse >= 0:
			Prop.flame(e, x + 4, -30, 3, t * 5, t)
		if near:
			Prop.label(e, Vector2(0, -36), "Pulverfass", Color("#ff9a5a"))
		return
	var z := pow(maxf(0, e.fuse / .45), 2) * 86 if e.fuse >= 0 else 86 + sin(t * .9 + e.world.x) * 1.5
	var cy := -z
	var sw := sin(t * .7 + e.world.y) * 1.5
	ell(e, Vector2.ZERO, 22, 10, Color(0, 0, 0, .2 + .3 * (1 - z / 90)))
	if e.fuse >= 0:
		ell_line(e, Vector2.ZERO, 1.8 * 45, 1.8 * 22.6, Color(1, 80 / 255.0, 50 / 255.0, .4 + sin(t * 30) * .3), 2)
	else:
		e.draw_line(Vector2(0, cy - 190), Vector2(sw, cy - 14), Color("#2a2620"), 1.4)
	var o := Vector2(sw, cy)
	ell_line(e, o, 27, 9, Color.WHITE if fl else Color("#5a4a2a"), 2.6)
	ell_line(e, o + Vector2(0, 4), 13, 4.5, Color.WHITE if fl else Color("#5a4a2a"), 1.6)
	e.draw_rect(Rect2(o + Vector2(-2, -16), Vector2(4, 22)), Color("#5a4a2a"))
	for k in 4:
		var a := k / 4.0 * TAU + .4
		e.draw_line(o + Vector2(0, -16), o + Vector2(cos(a) * 27, sin(a) * 9), Color("#3a3020"), 1)
	for k in 8:
		var a := k / 8.0 * TAU + .3
		var p := o + Vector2(cos(a) * 27, sin(a) * 9)
		e.draw_rect(Rect2(p + Vector2(-1.4, -8), Vector2(2.8, 8)), Color("#e8e0c8"))
		if not (e.fuse >= 0 and k % 2):
			Prop.flame(e, p.x, p.y - 6, 2.2, k + e.world.x, t)
	if near and e.fuse < 0:
		Prop.label(e, Vector2(0, cy - 24), "Kronleuchter · schieß ihn herunter", Color("#e8c878"))
