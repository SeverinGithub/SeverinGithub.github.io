class_name IslandSights
## The sights of the sky islands (986-island-sights.js): old lighthouses, fallen giants and waterfalls into the void,
## crypts with a treasure at the end, bridge stones that raise a bridge where two islands have none, small islets drifting
## far behind, and a pale light in the tower for every beaten guardian of the deep.
## Not yet: the climate of regions (rain moors, snowfields, ash plains) and the snow, which wait for the weather.

const ISN := {"islight": "Der alte Leuchtturm", "isstatue": "Der gestürzte Riese", "isfall": "Der Fall ins Nichts"}
const CRYPTN := ["der Vergessenen", "der Stillen", "der Ahnen", "der Krähen", "der Namenlosen", "unter der Asche"]
const TWLIGHTS := [[-12, 470], [16, 420], [-30, 372], [28, 300], [-16, 236], [10, 182], [-6, 150], [6, 124]]
const GREEN := Color("#9affc0")
const BLUE := Color("#a8d0ff")

static var grow := {}            # a bridge growing tile by tile (ISB): {L, i, acc}

## the hero's record of crypts, bridges and sights (twS in 984): older heroes lack the newer keys
static func S() -> Dictionary:
	for k in ["crypt", "seen", "br"]:
		if not Game.tw.has(k):
			Game.tw[k] = {}
	return Game.tw

static func hyp(x: float, y: float) -> float:
	return sqrt(x * x + y * y)

# ---------- what stands on an island (the owContent wrapper) ----------

static func content(wg: WorldGen, c: Dictionary, cx: int, cy: int) -> void:
	var I = wg.island_of(cx, cy)
	if I == null or I.kind == "home" or I.kind == "boss" or (I.has("big") and not (cx == I.cx and cy == I.cy)):
		return
	var Rg := Rng.new(int(floor(wg.hsh(cx, cy, 131) * 1e9)))
	var W0: int = wg.w
	# the tiles are read and written through wg: a lambda would capture a packed array as a copy
	var land := func(i: int, j: int) -> bool:
		if i < 0 or j < 0 or i >= W0 or j >= wg.h:
			return false
		var v: int = wg.t[j * W0 + i]
		return v == 4 or v == 7
	var key := "%d,%d" % [cx, cy]
	var taken: Array = []
	for o in c.objs + c.props:
		taken.append(Vector2(o.x, o.y))
	for b in c.blocks:
		taken.append(Vector2(b.i + .5, b.j + .5))
	var solid := func(i: int, j: int, n: int, k: int) -> void:
		for a in n:
			for b in k:
				var q := (j + b) * W0 + i + a
				wg.under[q] = wg.t[q]
				wg.t[q] = 9
	var ok_at := func(i: int, j: int, n: int, k: int, pad: int) -> bool:
		for a in range(-pad, n + pad):
			for b in range(-pad, k + pad):
				if not land.call(i + a, j + b):
					return false
		return pad == 0 or not taken.any(func(o): return o.x > i - 2 and o.x < i + n + 2 and o.y > j - 2 and o.y < j + k + 2)
	# a landmark on about every fifth island, set on a diagonal so no road is blocked
	var lk := ""
	if Rg.next() < .22:
		match I.kind:
			"rock": lk = "islight"
			"ruins": lk = "isstatue"
			"forest": lk = "isfall"
			_: lk = ["islight", "isstatue", "isfall"][int(floor(Rg.next() * 3))]
	if lk == "isfall":
		var ex = null
		var s := 0.0
		while s < I.r * 2:
			var i := int(floor(I.x + s * .707))
			var j := int(floor(I.y + s * .707))
			if land.call(i, j):
				ex = Vector2i(i, j)
			else:
				break
			s += .5
		if ex != null and not land.call(ex.x + 1, ex.y + 1) and hyp(ex.x - I.x, ex.y - I.y) > 3.5:
			solid.call(ex.x, ex.y, 1, 1)
			c.props.append({"k": "isfall", "x": ex.x + .5, "y": ex.y + .5, "ph": Rg.next() * 6, "v": 0, "key": key})
	elif lk != "":
		var n := 2 if lk == "islight" else 3
		var k := 2
		for tr in 20:
			var a := Rg.next() * 6.283
			var r: float = I.r * (.35 + Rg.next() * .4)
			var i := int(floor(I.x + cos(a) * r - n / 2.0))
			var j := int(floor(I.y + sin(a) * r - k / 2.0))
			if absf(i + n / 2.0 - I.x) < n / 2.0 + 2.8 or absf(j + k / 2.0 - I.y) < k / 2.0 + 2.8 or not ok_at.call(i, j, n, k, 0) \
					or c.objs.any(func(o): return hyp(o.x - i - n / 2.0, o.y - j - k / 2.0) < 3.5):
				continue
			# whatever lies about on the spot makes way
			var x0 := i + n / 2.0
			var y0 := j + k / 2.0
			var cl := func(o): return absf(o.x - x0) > n / 2.0 + 1 or absf(o.y - y0) > k / 2.0 + 1
			c.props = c.props.filter(cl)
			c.deco = c.deco.filter(cl)
			solid.call(i, j, n, k)
			c.props.append({"k": lk, "x": x0, "y": y0, "ph": Rg.next() * 6, "v": int(floor(Rg.next() * 2)), "key": key})
			taken.append(Vector2(x0, y0))
			break
	# crypts: stairs into the rock, three rooms below and a treasure at the end
	var crypt: bool = Rg.next() < .45 if I.kind == "grave" or I.kind == "ruins" else (I.kind == "wild" and Rg.next() < .12)
	if crypt:
		for tr in 8:
			var a := PI * 1.25 + (Rg.next() - .5) * .6
			var r: float = I.r * (.45 + Rg.next() * .2)
			var i := int(floor(I.x + cos(a) * r))
			var j := int(floor(I.y + sin(a) * r))
			if not ok_at.call(i, j, 1, 1, 1) or absf(i + .5 - I.x) < 2.8 or absf(j + .5 - I.y) < 2.8:
				continue
			c.objs.append({"type": "iscrypt", "x": i + .5, "y": j + .5, "key": key, "lvl": c.lvl + 1, "name": "Gruft " + CRYPTN[int(floor(Rg.next() * 6))]})
			taken.append(Vector2(i + .5, j + .5))
			break
	# bridge stones: where two islands have no bridge, a rune stone raises one
	if I.has("big"):
		return
	for d in [[1, 0], [0, 1]]:
		var dx: int = d[0]
		var dy: int = d[1]
		var N = wg.island_of(cx + dx, cy + dy)
		if N == null or N.kind == "home" or N.has("big") or wg.link_on(cx, cy, cx + dx, cy + dy) or wg.hsh(cx, cy, 150 + dx) > .4:
			continue
		var bk := "%d,%d>%d,%d" % [cx, cy, cx + dx, cy + dy]
		var x: float = floor(I.x + dx * (I.r - 3.2) + dy * 2.6) + .5
		var y: float = floor(I.y + dy * (I.r - 3.2) + dx * 2.6) + .5
		if not land.call(int(floor(x)), int(floor(y))) or taken.any(func(o): return hyp(o.x - x, o.y - y) < 1.6):
			continue
		var on: bool = S().br.has(bk)
		c.objs.append({"type": "isbstone", "x": x, "y": y, "bk": bk, "ax": cx, "ay": cy, "bx": cx + dx, "by": cy + dy, "on": on})
		taken.append(Vector2(x, y))
		if on:
			build(wg, cx, cy, cx + dx, cy + dy, false)

## the tiles a bridge stone's bridge covers: a lane three wide from one island's middle to the other's
static func bridge_tiles(wg: WorldGen, ax: int, ay: int, bx: int, by: int) -> Array:
	var A = wg.island_of(ax, ay)
	var B = wg.island_of(bx, by)
	var L := []
	if A == null or B == null:
		return L
	var W0: int = wg.w
	var open := func(k: int) -> bool: return wg.t[k] == 0 or (wg.t[k] == 9 and wg.under[k] == 8)
	if by == ay:
		var row := WorldGen.jround((A.y + B.y) / 2) - 1
		for i in range(int(floor(A.x)), int(ceil(B.x)) + 1):
			for j in range(row, row + 3):
				if open.call(j * W0 + i):
					L.append(j * W0 + i)
	else:
		var col := WorldGen.jround((A.x + B.x) / 2) - 1
		for j in range(int(floor(A.y)), int(ceil(B.y)) + 1):
			for i in range(col, col + 3):
				if open.call(j * W0 + i):
					L.append(j * W0 + i)
	return L

## raise the bridge: at once, or tile by tile when the stone was just touched (isBuild)
static func build(wg: WorldGen, ax: int, ay: int, bx: int, by: int, anim: bool) -> void:
	wg.ow_island(bx, by)
	var L := bridge_tiles(wg, ax, ay, bx, by)
	for k in L:
		if wg.t[k] == 9:
			wg.unpost(k % wg.w, k / wg.w)
			wg.t[k] = 8
			wg.under[k] = 0
	if not anim:
		for k in L:
			wg.t[k] = 8
			wg.under[k] = 0
		return
	grow = {"wg": wg, "L": L, "i": 0, "acc": 0.0}

# ---------- names over things (ISO) ----------

static func obj_name(o: Dictionary) -> String:
	match o.type:
		"iscrypt": return o.name + " (leer)" if S().crypt.has(o.key) else "%s · Stufe %d" % [o.name, o.lvl]
		"iscryptexit": return "Hinauf ans Licht"
		"iscryptchest": return "Truhe (leer)" if o.open else "Schatz der Gruft"
		"isbstone": return "Brückenstein (erwacht)" if o.on else "Brückenstein · berühren"
	return ""

static func prop_light(p: Dictionary):
	match p.k:
		"islight": return {"r": 240, "a": .9, "col": Color8(255, 220, 150), "f": 3, "h": 128}
		"isfall": return {"r": 110, "a": .4, "col": Color8(150, 200, 255), "f": 2, "h": 10}
	return null

# ---------- using them ----------

static func interact(L: Level, o: Prop) -> void:
	var p := o.p
	var host = L.get_tree().current_scene
	match p.type:
		"iscrypt":
			enter_crypt(L, p)
		"iscryptexit":
			host.call_deferred("enter_floor", 0)
		"iscryptchest":
			if p.open:
				return
			p.open = true
			if L.theme:
				L.theme._loot(p, 3, Game.mlvl + 2)
			S().crypt[p.key] = 1
			Game.banner.emit("DER SCHATZ DER GRUFT", "Die Gruft ist geplündert", "")
			host.save_game()
		"isbstone":
			if p.on:
				return
			p.on = true
			S().br[p.bk] = 1
			build(L.ow.wg, p.ax, p.ay, p.bx, p.by, true)
			Game.banner.emit("DER BRÜCKENSTEIN ERWACHT", "Eine Brücke wächst über die Leere", "")
			L.shake = maxf(L.shake, 5)
			L.flashes.append({"x": p.x, "y": p.y, "r": 84.0, "a": .5, "t": 0.0, "life": .2})
			host.save_game()

static func enter_crypt(L: Level, o: Dictionary) -> void:
	if S().crypt.has(o.key):
		Game.log_msg("Die Gruft ist leer. Nur Staub und Knochen.", Color("#c8b898"))
		return
	var host = L.get_tree().current_scene
	Game.ow_at = Vector2(L.P.x, L.P.y)
	Game.crypt = gen_crypt(L.ow.wg, o.key, o.lvl)
	Game.crypt_name = o.name
	Game.crypt_lvl = o.lvl
	host.call_deferred("enter_floor", -1)

## the crypt below an island: three rooms in a row, bones, torches, and the treasure in a green light (genCrypt)
static func gen_crypt(wg: WorldGen, key: String, lvl: int) -> Dictionary:
	var ab := key.split(",")
	var R := Rng.new(int(floor(wg.hsh(int(ab[0]), int(ab[1]), 160) * 1e9)))
	var w := 62
	var h := 40
	var t := []                   # an Array while carving (lambdas share it), packed at the end
	t.resize(w * h)
	t.fill(0)
	var rooms := []
	var carve := func(i: int, j: int) -> void:
		if i > 1 and j > 1 and i < w - 2 and j < h - 2:
			t[j * w + i] = 1
	for k in 3:
		var rw := R.rint(9, 12)
		var rh := R.rint(9, 12)
		var x := 4 + k * 18 + R.rint(0, 3)
		var y := R.rint(4, h - rh - 4)
		var shape: String = R.pick(["hall", "cave", "crypt"])
		var r := {"x": x, "y": y, "w": rw, "h": rh, "cx": x + (rw >> 1), "cy": y + (rh >> 1), "shape": shape}
		rooms.append(r)
		var ph := R.rnd(0, 6)
		for j in range(y, y + rh):
			for i in range(x, x + rw):
				var u := (i - x + .5) / rw * 2 - 1
				var v := (j - y + .5) / rh * 2 - 1
				var d := hyp(u, v)
				var q := atan2(v, u)
				if (d < .86 + sin(q * 3 + ph) * .1) if shape == "cave" else (absf(u) + absf(v) < 1.6):
					carve.call(i, j)
	for k in range(1, 3):
		var A: Dictionary = rooms[k - 1]
		var B: Dictionary = rooms[k]
		var x: int = A.cx
		var y: int = A.cy
		var br := func(cx: int, cy: int) -> void:
			for j in range(cy - 1, cy + 2):
				for i in range(cx - 1, cx + 2):
					carve.call(i, j)
		while x != B.cx:
			br.call(x, y)
			x += signi(B.cx - x)
		while y != B.cy:
			br.call(x, y)
			y += signi(B.cy - y)
		br.call(x, y)
	for j in h:
		for i in w:
			if t[j * w + i]:
				continue
			for dj in range(-1, 2):
				for di in range(-1, 2):
					if i + di >= 0 and j + dj >= 0 and i + di < w and j + dj < h and t[(j + dj) * w + i + di] == 1:
						t[j * w + i] = 2
	var s: Dictionary = rooms[0]
	var e: Dictionary = rooms[2]
	var m := {"kind": "dungeon", "crypt": key, "floor": maxi(2, WorldGen.jround((lvl + 1) / 2.0)), "w": w, "h": h, "t": PackedByteArray(t), "rooms": rooms,
		"startRoom": s, "endRoom": e, "boss": false, "objs": [], "deco": [], "props": [], "start": {"x": s.cx + .5, "y": s.cy + 1.5},
		"secret": null, "boulders": [], "dc": 1, "lava": [], "water": [], "vents": [], "plates": [], "cracks": [],
		"fth": {"id": "gruft", "n": "Gruft", "d": "Am Ende wartet ein Schatz", "tint": Color8(70, 140, 100), "dark": Color8(2, 6, 4), "amb": "drip"}}
	m.objs.append({"type": "iscryptexit", "x": s.cx - .5, "y": s.cy - .5})
	m.objs.append({"type": "iscryptchest", "x": e.cx + .5, "y": e.cy + .5, "open": false, "key": key})
	for q in FloorThemes._wall_spots(m, 9, 4.5, R):
		q.k = "torch"
		q.ph = R.rnd(0, 6)
		m.props.append(q)
	m.props.append({"k": "twL", "x": e.cx + .5, "y": e.cy + .5, "col": Color8(120, 255, 170), "r": 150, "ph": 0.0})
	for dx in [-1.3, 1.3]:
		m.props.append({"k": "dccand", "x": e.cx + .5 + dx, "y": e.cy + .5 + .8, "v": 0, "ph": R.rnd(0, 6)})
	for k in 30:
		var i := R.rint(3, w - 4)
		var j := R.rint(3, h - 4)
		if t[j * w + i] == 1:
			var dk: String = R.pick(["bones", "bones", "skull", "rubble"])
			var x := i + R.rnd(.1, .9)
			var y := j + R.rnd(.1, .9)
			m.deco.append({"k": dk, "x": x, "y": y, "v": R.rint(0, 3)})
	TowerTwo.decor(m, [], R)
	return m

# ---------- ticking: bridges grow, sights are found ----------

static func tick(L: Level, dt: float) -> void:
	if not L.ow:
		return
	if not grow.is_empty() and grow.wg == L.ow.wg:
		var wg: WorldGen = grow.wg
		grow.acc += dt * 45
		while grow.acc >= 1 and grow.i < grow.L.size():
			grow.acc -= 1
			var k: int = grow.L[grow.i]
			grow.i += 1
			wg.t[k] = 8
			wg.under[k] = 0
			var at := Vector2(k % wg.w + .5, k / wg.w + .5)
			if grow.i % 3 == 0:
				L._smoke(at, 2)
			if grow.i % 9 == 0:
				L.sparks(at, .2, -1.57, 3, [BLUE, Color.WHITE], 3)
		L.shake = maxf(L.shake, 1.2)
		if grow.i >= grow.L.size():
			grow = {}
			L.compute_flow()
			Game.log_msg("Die Brücke steht. Ein neuer Weg über die Leere.", BLUE)
	if L.P.dead:
		return
	var seen: Dictionary = S().seen
	var pp := Vector2(L.P.x, L.P.y)
	for p in L.ow.wg.live("props"):
		if not ISN.has(p.k):
			continue
		var d := pp.distance_to(Vector2(p.x, p.y))
		# the waterfall breathes spray, close by
		if p.k == "isfall" and d < 18 and randf() < .2:
			L.parts.append({"k": "spark", "x": p.x + .3 + randf_range(-.1, .1), "y": p.y + .3 + randf_range(-.1, .1), "z": .1, "vx": randf_range(-.5, .5), "vy": randf_range(-.5, .5),
				"vz": randf_range(.8, 1.6), "t": 0.0, "life": .5, "col": Color("#c8e4ff"), "s": 1.3, "g": 7.0})
		var id := "%s@%s" % [p.k, p.key]
		if seen.has(id) or d > 5.5:
			continue
		seen[id] = 1
		Game.gain_xp(Game.lvl * 25)
		Game.banner.emit("ENTDECKT", ISN[p.k], "")
		Game.log_msg("Entdeckt: %s." % ISN[p.k], Color("#ffd88a"))
		L.get_tree().current_scene.save_game()
	# green motes over a crypt not yet plundered
	for n in L.obj_nodes:
		if n.p.type == "iscrypt" and not S().crypt.has(n.p.key) and randf() < .1 and pp.distance_to(Vector2(n.p.x, n.p.y)) < 18:
			L.parts.append({"k": "spark", "x": n.p.x + randf_range(-.3, .3), "y": n.p.y + randf_range(-.3, .3), "z": .1, "vx": 0.0, "vy": 0.0, "vz": .5,
				"t": 0.0, "life": 1.4, "col": GREEN, "s": 1.1, "g": -.2})

# ---------- pictures (isProp, isObj) ----------

static func _grad_quad(ci: CanvasItem, pts: Array, cols: Array) -> void:
	ci.draw_polygon(PackedVector2Array(pts), PackedColorArray(cols))

static func prop(ci: CanvasItem, p: Dictionary, sx: float, sy: float, t: float) -> void:
	match p.k:
		"islight": _lighthouse(ci, p, sx, sy, t)
		"isstatue": _statue(ci, sx, sy)
		"isfall": _fall(ci, p, sx, sy, t)

static func _lighthouse(ci: CanvasItem, p: Dictionary, sx: float, sy: float, t: float) -> void:
	Prop.shadow(ci, sx, sy, .9)
	var H0 := 128.0
	var bw := 17.0
	var tw := 10.0
	for k in 6:
		var y0 := sy - k * H0 / 6
		var y1 := sy - (k + 1) * H0 / 6
		var w0 := bw - (bw - tw) * k / 6
		var w1 := bw - (bw - tw) * (k + 1) / 6
		ThemeDraw._poly(ci, [Vector2(sx - w0, y0), Vector2(sx - w1, y1), Vector2(sx + w1, y1), Vector2(sx + w0, y0)], Color("#a82a20") if k % 2 else Color("#e8e0d0"))
		ThemeDraw._poly(ci, [Vector2(sx + w0 * .25, y0), Vector2(sx + w1 * .25, y1), Vector2(sx + w1, y1), Vector2(sx + w0, y0)], Color(0, 0, 0, .28))
	ci.draw_rect(Rect2(sx - 4, sy - 14, 8, 14), Color("#2a1a10"))
	ci.draw_rect(Rect2(sx - 2, sy - 62, 4, 7), Color("#1a1410"))
	ci.draw_rect(Rect2(sx + 3, sy - 96, 3, 6), Color("#1a1410"))
	var top := sy - H0
	ci.draw_rect(Rect2(sx - 15, top - 3, 30, 4), Color("#2a2622"))
	var x := -14
	while x <= 14:
		ci.draw_rect(Rect2(sx + x, top - 9, 1.4, 6), Color("#4a453c"))
		x += 4
	ci.draw_rect(Rect2(sx - 15, top - 10, 30, 1.4), Color("#4a453c"))
	var n := 1.0 if Game.get("night") == true else 0.0
	_grad_quad(ci, [Vector2(sx - 7, top - 24), Vector2(sx + 7, top - 24), Vector2(sx + 7, top - 7), Vector2(sx - 7, top - 7)],
		[Color("#fff4c0"), Color("#fff4c0"), Color("#ffb050"), Color("#ffb050")])
	ci.draw_rect(Rect2(sx - 1, top - 24, 2, 17), Color("#2a2622"))
	ci.draw_rect(Rect2(sx - 8, top - 25, 16, 2), Color("#2a2622"))
	ThemeDraw._poly(ci, [Vector2(sx - 10, top - 25), Vector2(sx, top - 38), Vector2(sx + 10, top - 25)], Color("#7a1a14"))
	ci.draw_rect(Rect2(sx - .7, top - 43, 1.4, 6), Color("#2a2622"))
	# two beams turning over the sky
	var a0: float = t * .7 + p.ph
	var al := .1 + n * .35
	var o := Vector2(sx, top - 16)
	for s in [0.0, PI]:
		var a: float = a0 + s
		var ca := cos(a)
		var ln := 280 * (.35 + .65 * absf(ca))
		var tip := o + Vector2(ca * ln, sin(a) * ln * .3)
		if absf(tip.x - o.x) < 1:
			continue              # the beam points at you: no triangle to draw
		_grad_quad(ci, [o, tip - Vector2(0, ln * .07), tip + Vector2(0, ln * .07)],
			[Color(1, 236 / 255.0, 170 / 255.0, al), Color(1, 220 / 255.0, 150 / 255.0, 0), Color(1, 220 / 255.0, 150 / 255.0, 0)])
	Prop.glow(ci, o, 40, Color(1, 230 / 255.0, 160 / 255.0, .3 + n * .3))

static func _statue(ci: CanvasItem, sx: float, sy: float) -> void:
	Prop.shadow(ci, sx, sy + 4, 2)
	ci.draw_set_transform(Vector2(sx, sy), 0, Vector2(1.7, 1.7))
	# the broken torso, the arm reaching out, the great head on its side
	ThemeDraw._poly(ci, [Vector2(-46, -4), Vector2(-30, -26), Vector2(-6, -22), Vector2(-2, 2), Vector2(-30, 12)], Color("#4a463e"))
	ThemeDraw._poly(ci, [Vector2(-46, -4), Vector2(-30, -26), Vector2(-20, -24), Vector2(-34, -2)], Color("#6a6458"))
	ci.draw_rect(Rect2(-12, -18, 6, 4), Color("#3a362e"))
	ThemeDraw._poly(ci, [Vector2(-4, -2), Vector2(30, 10), Vector2(34, 4), Vector2(0, -10)], Color("#5a544a"))
	for k in 4:
		ci.draw_rect(Rect2(32 + k * 3, 2 + k * 2, 2.4, 8), Color("#6a6458"))
	ci.draw_rect(Rect2(30, 12, 5, 3), Color("#6a6458"))
	ThemeDraw.ell(ci, Vector2(22, -18), 20, 16, Color("#5a544a"), -.4)
	ThemeDraw.ell(ci, Vector2(18, -22), 14, 10, Color("#7a7468"), -.4)
	for r in [Rect2(16, -24, 5, 3), Rect2(26, -28, 5, 3), Rect2(22, -16, 2, 6), Rect2(18, -10, 9, 2)]:
		ci.draw_rect(r, Color("#2a2620"))
	for q in [[-38, -12, 8], [-24, -24, 6], [10, -32, 9], [30, -30, 5], [0, -6, 5]]:
		ci.draw_rect(Rect2(q[0], q[1], q[2], 2), Color("#3a6a24"))
	ci.draw_rect(Rect2(12, -33, 4, 1), Color("#4a8a2a"))
	ci.draw_polyline(PackedVector2Array([Vector2(-28, -20), Vector2(-22, -10), Vector2(-24, 0)]), Color("#2a2620"), 1)
	ci.draw_set_transform(Vector2.ZERO)

static func _fall(ci: CanvasItem, p: Dictionary, sx: float, sy: float, t: float) -> void:
	var c := Vector2(sx, sy)
	ThemeDraw.ell(ci, c, 24, 11, Color("#2a3238"))
	ThemeDraw.ell(ci, c, 21, 9.5, Color("#14304a"))
	ThemeDraw.ell(ci, c + Vector2(-3, -2), 14, 6, Color("#3a6a9a"))
	for k in 2:
		var q := fposmod(t * .4 + k * .5 + p.ph, 1.0)
		ThemeDraw.ell_line(ci, c + Vector2(-3, -1), maxf(.1, q * 16), maxf(.1, q * 7), Color(190 / 255.0, 225 / 255.0, 1, (1 - q) * .4), 1)
	for r in [[-22, -2], [18, -6], [20, 4], [-14, 8]]:
		ThemeDraw.ell(ci, c + Vector2(r[0], r[1]), 5, 3, Color("#5a544a"))
	# the stream over the edge, fading into the void
	var pts := []
	var cols := []
	var col := func(y: float) -> Color:
		var f := clampf((y - 6) / 254.0, 0, 1)
		var a := lerpf(.95, .5, f / .6) if f < .6 else lerpf(.5, 0, (f - .6) / .4)
		return Color(lerpf(190, 160, minf(1, f / .6)) / 255.0, lerpf(225, 200, minf(1, f / .6)) / 255.0, lerpf(255, 240, minf(1, f / .6)) / 255.0, a)
	var right := Prop.quad(Vector2(18, 8), Vector2(26, 120), Vector2(30, 260), 12)
	var left := Prop.quad(Vector2(6, 260), Vector2(8, 120), Vector2(6, 6), 12)
	pts.append(Vector2(6, 6))
	pts.append(Vector2(18, 8))
	pts.append_array(right)
	pts.append_array(left)
	pts.pop_back()
	for q in pts:
		cols.append(col.call(q.y))
	var sp := PackedVector2Array()
	for q in pts:
		sp.append(c + q)
	ci.draw_polygon(sp, PackedColorArray(cols))
	for k in 5:
		var o := fposmod(t * 140 + k * 53, 240.0)
		ci.draw_line(c + Vector2(9 + k * 2.4 + o * .06, 12 + o), c + Vector2(9 + k * 2.4 + o * .07, 26 + o), Color(1, 1, 1, .55), 1)
	for k in 4:
		var q := fposmod(t * .3 + k * .25, 1.0)
		ci.draw_circle(c + Vector2(18 + sin(k * 2) * 10, 220 - q * 30), 14 + q * 18, Color(220 / 255.0, 236 / 255.0, 1, (1 - q) * .12))

static func obj(ci: CanvasItem, o: Dictionary, sx: float, sy: float, t: float) -> void:
	var c := Vector2(sx, sy)
	var dia := [c + Vector2(0, -12), c + Vector2(24, 0), c + Vector2(0, 12), c + Vector2(-24, 0)]
	match o.type:
		"iscrypt":
			var done: bool = S().crypt.has(o.key)
			ThemeDraw._poly(ci, dia, Color.BLACK)
			for k in 4:
				ci.draw_line(c + Vector2(-17 + k * 5, -2 + k * 2.5), c + Vector2(7 + k * 5, -2 + k * 2.5), Color("#3a3630"), 1.4)
			for s in [-1, 1]:
				ci.draw_rect(Rect2(sx + s * 20 - 4, sy - 34, 8, 32), Color("#3e3a34"))
				ci.draw_rect(Rect2(sx + s * 20 - 4, sy - 34, 3, 32), Color("#5a544a"))
			ci.draw_rect(Rect2(sx - 26, sy - 40, 52, 7), Color("#4a453c"))
			ci.draw_rect(Rect2(sx - 26, sy - 40, 52, 2), Color("#6a6458"))
			ci.draw_rect(Rect2(sx - 6, sy - 38, 12, 3), Color("#1a1610"))
			if not done:
				Prop.glow(ci, c + Vector2(0, -4), 30, Color(120 / 255.0, 1, 170 / 255.0, .22 + sin(t * 2) * .08))
		"iscryptexit":
			ThemeDraw._poly(ci, dia, Color("#0a0806"))
			for k in 4:
				ci.draw_rect(Rect2(sx - 14 + k * 4, sy + 4 - k * 5, 26 - k * 4, 3), Color("#4a453c"))
			_grad_quad(ci, [c + Vector2(-14, -60), c + Vector2(14, -60), c + Vector2(14, 6), c + Vector2(-14, 6)],
				[Color(200 / 255.0, 220 / 255.0, 1, 0), Color(200 / 255.0, 220 / 255.0, 1, 0), Color(200 / 255.0, 220 / 255.0, 1, .25), Color(200 / 255.0, 220 / 255.0, 1, .25)])
		"iscryptchest":
			Prop.shadow(ci, sx, sy, .5)
			ci.draw_rect(Rect2(sx - 18, sy - 16, 36, 16), Color("#2a3a30"))
			ci.draw_rect(Rect2(sx - 18, sy - 16, 36, 3), Color("#3e5244"))
			for x in [-18, -2, 15]:
				ci.draw_rect(Rect2(sx + x, sy - 16, 3, 16), Color("#8a9a7a"))
			if o.open:
				ci.draw_rect(Rect2(sx - 16, sy - 20, 32, 5), Color("#0a0e0c"))
			else:
				var lid := [c + Vector2(-18, -16)]
				lid.append_array(Prop.quad(c + Vector2(-18, -16), c + Vector2(0, -28), c + Vector2(18, -16)))
				ThemeDraw._poly(ci, lid, Color("#24342a"))
				Prop.glow(ci, c + Vector2(0, -14), 32, Color(120 / 255.0, 1, 170 / 255.0, .3 + sin(t * 3) * .1))
		"isbstone":
			Prop.shadow(ci, sx, sy, .4)
			ThemeDraw._poly(ci, [c + Vector2(-9, 0), c + Vector2(-7, -36), c + Vector2(0, -44), c + Vector2(7, -34), c + Vector2(10, 0)], Color("#24222a"))
			ThemeDraw._poly(ci, [c + Vector2(-7, -36), c + Vector2(0, -44), c + Vector2(0, 0), c + Vector2(-9, 0)], Color("#3a3842"))
			var a: float = .85 if o.on else .25 + sin(t * 1.5) * .12
			var rc := Color(120 / 255.0, 200 / 255.0, 1, a)
			ci.draw_polyline(PackedVector2Array([c + Vector2(-3, -32), c + Vector2(3, -26), c + Vector2(-3, -20), c + Vector2(3, -14)]), rc, 1.6)
			ci.draw_line(c + Vector2(-4, -8), c + Vector2(4, -8), rc, 1.6)
			if o.on:
				Prop.glow(ci, c + Vector2(0, -22), 30, Color(120 / 255.0, 200 / 255.0, 1, .35))

# ---------- islets drifting far behind (drawIslets) ----------

static var _islets: Array = []

static func islet_tex(v: int) -> ImageTexture:
	# the browser paints each on a small canvas; here a few shapes into an image, the same shapes
	var img := Image.create(96, 74, false, Image.FORMAT_RGBA8)
	var Rr := Rng.new(v * 97 + 3)
	var poly := func(pts: Array, col: Color) -> void:
		var P := PackedVector2Array(pts)
		var r := Rect2(P[0], Vector2.ZERO)
		for q in P:
			r = r.expand(q)
		for y in range(maxi(0, floori(r.position.y)), mini(74, ceili(r.end.y) + 1)):
			for x in range(maxi(0, floori(r.position.x)), mini(96, ceili(r.end.x) + 1)):
				if Geometry2D.is_point_in_polygon(Vector2(x + .5, y + .5), P):
					img.set_pixel(x, y, col)
	var ell := func(cx: float, cy: float, rx: float, ry: float, col: Color) -> void:
		for y in range(maxi(0, floori(cy - ry)), mini(74, ceili(cy + ry) + 1)):
			for x in range(maxi(0, floori(cx - rx)), mini(96, ceili(cx + rx) + 1)):
				var u := (x + .5 - cx) / rx
				var w := (y + .5 - cy) / ry
				if u * u + w * w <= 1:
					img.set_pixel(x, y, col)
	var a := [Vector2(6, 22)]
	for k in 9:
		a.append(Vector2(6 + k * 10.5, 22 + sin(k / 8.0 * PI) * (40 + Rr.next() * 12) + Rr.next() * 6))
	a.append(Vector2(90, 22))
	poly.call(a, Color("#3a2e24"))
	var b := [Vector2(10, 22)]
	for k in 7:
		b.append(Vector2(10 + k * 9, 22 + sin(k / 6.0 * PI) * 22 + Rr.next() * 4))
	b.append(Vector2(64, 22))
	poly.call(b, Color("#5a4a3a"))
	for k in 5:
		# hanging roots
		var x := 16 + Rr.next() * 64
		var e := 48 + Rr.next() * 12
		for q in Prop.quad(Vector2(x, 26), Vector2(x + 3, 40), Vector2(x - 2, e), 14):
			if q.x >= 0 and q.x < 96 and q.y >= 0 and q.y < 74:
				img.set_pixel(int(q.x), int(q.y), Color("#2a3a1a"))
	ell.call(48, 21, 43, 10, Color("#2e6a22"))
	ell.call(44, 18, 36, 6.5, Color("#4a9a34"))
	if v % 3 == 0:
		img.fill_rect(Rect2i(60, 4, 3, 14), Color("#3a2414"))
		ell.call(61, 4, 8, 8, Color("#1e5a1a"))
		ell.call(59, 2, 5, 5, Color("#2a7a24"))
	elif v % 3 == 1:
		img.fill_rect(Rect2i(30, 2, 5, 16), Color("#8a8478"))
		img.fill_rect(Rect2i(42, 6, 5, 12), Color("#8a8478"))
		img.fill_rect(Rect2i(28, 0, 21, 3), Color("#8a8478"))
	return ImageTexture.create_from_image(img)

## behind the islands, under the clouds: seven islets sail slowly past, against the camera
static func draw_islets(ci: CanvasItem, cam_px: Vector2, vs: Vector2, t: float) -> void:
	if _islets.is_empty():
		var Rr := Rng.new(Game.seed_value * 11 + 5)
		for k in 7:
			_islets.append({"x": Rr.next() * 2400, "y": Rr.next() * 1500, "s": .45 + Rr.next() * .55, "v": 6 + Rr.next() * 10, "ph": Rr.next() * 6, "tex": islet_tex(k)})
	var n := 1.0 if Game.get("night") == true else 0.0
	# CX, CY of the browser: where the world's origin lies on the screen
	var CX := vs.x / 2 - cam_px.x
	var CY := vs.y / 2 - cam_px.y - 40
	for I in _islets:
		var par: float = .12 + I.s * .25
		var x := fposmod(I.x + CX * par + t * I.v, 2400.0) - 300
		var y := fposmod(I.y + CY * par, 1500.0) - 250 + sin(t * .4 + I.ph) * 5
		if x < -120 or x > vs.x + 40 or y < -90 or y > vs.y + 20:
			continue
		ci.draw_texture_rect(I.tex, Rect2(x, y, 96 * I.s, 74 * I.s), false, Color(1, 1, 1, (.45 + I.s * .4) * (1 - n * .6)))

# ---------- the tower's lights for the beaten guardians (drawTowerFx) ----------

class TowerLights extends Node2D:
	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var n := 0
		for k in Game.boss_dead:
			if str(k).is_valid_int() and int(k) > 0 and Game.boss_dead[k]:
				n += 1
		if n == 0:
			return
		var t := Game.t
		for k in mini(n, TWLIGHTS.size()):
			var X: float = TWLIGHTS[k][0]
			var Y: float = -580 + TWLIGHTS[k][1]
			var f := .8 + sin(t * 2 + k * 1.7) * .2
			draw_rect(Rect2(X - 3, Y - 8, 6, 14), Color("#030202"))
			draw_arc(Vector2(X, Y - 8), 1.5, PI, TAU, 6, Color("#030202"), 3)
			draw_rect(Rect2(X - 1.5, Y - 6, 3, 11), Color(190 / 255.0, 225 / 255.0, 1, f))
			Prop.glow(self, Vector2(X, Y), 26, Color(150 / 255.0, 200 / 255.0, 1, .35 * f))
		if n >= TWLIGHTS.size():
			Prop.glow(self, Vector2(0, -540), 90, Color(190 / 255.0, 225 / 255.0, 1, .35 + sin(t * 1.5) * .1))
