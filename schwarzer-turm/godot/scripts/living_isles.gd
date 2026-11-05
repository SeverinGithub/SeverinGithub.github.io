class_name LivingIsles
extends Node2D
## The living isles (989-living-isles.js): grass tufts that sway in the wind and give way underfoot, trodden paths to every
## bridge, patches of moss, clover, leaves, gravel and mud, wind that carries leaves and seeds, flocks of birds, crows on the
## graves, gnats and bees, stones crumbling off the edges into the deep, standing stones whose runes wake when you come near.
## This node lives in the sky level above everything standing (drawFxWorld); the ground is painted by the Overworld
## (drawDecals), the waking runes by a node in the glow layer (drawFxGlow).
## After dark fireflies drift over the grass (most in the forests) and moths circle every warm light.
## The wind follows the weather, ash rides it in an ash rain, and the muddy patches fill to puddles in the rain.
## Not yet: the sounds.

const DIRS4 := [[1, 0], [-1, 0], [0, 1], [0, -1]]
const NV := {"path": 6, "moss": 3, "clover": 3, "leaves": 3, "gravel": 3, "mud": 2}
const RCOL := {"c": Color("#a0e8ff"), "g": Color("#b0ffc8"), "v": Color("#d0b0ff")}
const RGLOW := {"c": Color("#7ae0ff"), "g": Color("#8affb0"), "v": Color("#b08aff")}

static var wet := 0.0            # how full the puddles are (LV.wet): fills in twenty seconds of rain, dries in two minutes
static var ffly: Array = []        # fireflies after dark, around the hero (LV.ffly), glowing in the glow layer
static var lv := {"tuft": [], "path": [], "patch": [], "rune": [], "crow": [], "gnat": [], "bee": []}

# ---------- what each island gets, from the seed (the owContent wrapper) ----------

static func content(wg: WorldGen, c: Dictionary, cx: int, cy: int) -> void:
	var Q := {"tuft": [], "path": [], "patch": [], "rune": [], "crow": [], "gnat": [], "bee": []}
	c.lv = Q
	# tufts leave the flat ground and sway on their own
	var keep := []
	for d in c.deco:
		if d.k == "tuft":
			Q.tuft.append({"x": d.x, "y": d.y, "v": d.v, "ph": wg.hsh(int(floor(d.x * 7)), int(floor(d.y * 7)), 173) * 6.28})
		else:
			keep.append(d)
	c.deco = keep
	for d in c.deco:
		if d.k == "flowers" and Q.bee.size() < 3 and wg.hsh(int(floor(d.x * 5)), int(floor(d.y * 5)), 174) < .5:
			Q.bee.append({"x": d.x, "y": d.y, "ph": wg.hsh(cx, cy, 175 + Q.bee.size()) * 6.28})
	var I = wg.island_of(cx, cy)
	if I == null or I.kind == "home" or I.kind == "boss" or (I.has("big") and not (cx == I.cx and cy == I.cy)):
		return
	var Rg := Rng.new(int(floor(wg.hsh(cx, cy, 171) * 1e9)))
	var rr := func(a: float, b: float) -> float: return a + Rg.next() * (b - a)
	var W0: int = wg.w
	var T := func(i: int, j: int) -> int:
		if i < 0 or j < 0 or i >= W0 or j >= wg.h:
			return 0
		return wg.t[j * W0 + i]
	var SX: float = I.get("sx", 1.0)
	var SY: float = I.get("sy", 1.0)
	# trodden paths from the middle to every bridge, a little crooked
	var path := {}
	if not I.has("big"):
		var ph: float = rr.call(0, 6.28)
		for d in DIRS4:
			var dx: int = d[0]
			var dy: int = d[1]
			var on: bool = wg.link_on(cx, cy, cx + dx, cy + dy) if dx > 0 or dy > 0 else wg.link_on(cx + dx, cy + dy, cx, cy)
			if not on:
				continue
			var pi = null
			var pj = null
			var s := 1.5
			while s < I.r + 3:
				var o := sin(s * .45 + ph + dx * 2 + dy) * .6
				var i := int(floor(I.x + dx * s - dy * o))
				var j := int(floor(I.y + dy * s + dx * o))
				s += .5
				if T.call(i, j) != 4:
					pi = null
					continue
				# a step to the side keeps the tiles joined edge to edge, never only at a corner
				if pi != null and pi != i and pj != j and T.call(pi, j) == 4:
					path[j * W0 + pi] = true
				path[j * W0 + i] = true
				pi = i
				pj = j
	for k in path:
		var i: int = k % W0
		var j: int = k / W0
		if T.call(i, j + 1) and T.call(i + 1, j):
			Q.path.append({"i": i, "j": j, "v": (i * 7 + j * 13) % NV.path})
	if path.size():
		var off := func(d): return not path.has(int(floor(d.y)) * W0 + int(floor(d.x)))
		Q.tuft = Q.tuft.filter(off)
		c.deco = c.deco.filter(off)
	# patches: what lies about depends on the island
	var spot := func(ok: Callable):
		for k in 20:
			var a: float = rr.call(0, 6.28)
			var r: float = rr.call(1, I.r - 1.2)
			var i := int(floor(I.x + cos(a) * r * SX))
			var j := int(floor(I.y + sin(a) * r * SY))
			if ok.call(T.call(i, j)) and not path.has(j * W0 + i):
				var x: float = i + rr.call(.2, .8)
				var y: float = j + rr.call(.2, .8)
				return [x, y]          # not a Vector2: that holds only 32 bits, the browser 64
		return null
	var grass := func(v: int) -> bool: return v == 4
	var ground := func(v: int) -> bool: return v == 4 or v == 7
	var put := func(k: String, n: int, ok: Callable) -> void:
		for q in n:
			var p = spot.call(ok)
			if p != null:
				var v := int(floor(rr.call(0, NV[k] - .01)))
				Q.patch.append({"k": k, "x": p[0], "y": p[1], "v": v, "f": Rg.next() < .5})
	var A: float = I.r * I.r * SX * SY / 100
	var N := func(n: float) -> int: return WorldGen.jround(n * A * rr.call(.7, 1.3))
	var K: String = I.kind
	put.call("moss", N.call(6 if K == "forest" else (5 if K == "ruins" else (4 if K == "grave" else 2))), grass)
	put.call("clover", N.call(5 if K == "wild" else (2 if K == "village" or K == "camp" else (2 if K == "forest" else 1))), grass)
	put.call("gravel", N.call(6 if K == "rock" else (4 if K == "ruins" else (3 if K == "village" or K == "camp" else 1))), ground)
	put.call("leaves", N.call(3.0 if K == "forest" else (2.0 if K == "grave" else .5)), grass)
	put.call("mud", N.call(2.5), ground)
	var ngrave := Data.variants_of("prop/grave")
	for b in c.blocks:
		if b.k == "tree" and Rg.next() < .6:
			var x: float = b.i + .5 + rr.call(-.6, .6)
			var y: float = b.j + 1.2 + rr.call(-.3, .3)
			var v := int(floor(rr.call(0, 2.99)))
			Q.patch.append({"k": "leaves", "x": x, "y": y, "v": v, "f": Rg.next() < .5})
		if b.k == "tree" and (K == "forest" or K == "wild" or K == "grave") and Q.gnat.size() < 3 and Rg.next() < .35:
			Q.gnat.append({"x": b.i + 1.4, "y": b.j + 1.4, "ph": rr.call(0, 6)})
		if b.k == "grave" and Q.crow.size() < 3 and Rg.next() < .5:
			var hz := 22.0
			if ngrave:
				hz = maxf(14, float(Data.sprites["prop/grave/%d" % (b.v % ngrave)].ay) - 8)
			Q.crow.append({"hx": b.i + .5, "hy": b.j + .5, "hz": hz, "x": b.i + .5, "y": b.j + .5, "z": 0.0, "st": 0, "a": 0.0, "t": rr.call(0, 6), "rt": 0.0})
	for p in Q.patch:
		if p.k == "mud" and Rg.next() < .4:
			Q.gnat.append({"x": p.x, "y": p.y, "ph": rr.call(0, 6)})
	# standing stones with runes: often on ruins and grave islands, now and then out in the wild
	var nr := 0
	if K == "ruins":
		nr = (2 + (1 if Rg.next() < .4 else 0)) if Rg.next() < .85 else 0
	elif K == "grave":
		nr = (1 + (1 if Rg.next() < .3 else 0)) if Rg.next() < .7 else 0
	elif K == "wild" or K == "forest":
		nr = 1 if Rg.next() < .25 else 0
	var col := "c" if K == "ruins" else ("g" if K == "grave" else "v")
	var taken: Array = c.objs + c.props
	var heads := []
	var RR := int(ceil(I.r * maxf(SX, SY))) + 4
	var j0 := int(floor(I.y)) - RR
	var i0 := int(floor(I.x)) - RR
	for j in range(j0, int(floor(I.y + RR)) + 1):
		for i in range(i0, int(floor(I.x + RR)) + 1):
			if T.call(i, j) != 8:
				continue
			for d in DIRS4:
				var v: int = T.call(i + d[0], j + d[1])
				if v == 4 or v == 7:
					heads.append([i + .5, j + .5])
					break
	var seg_d := func(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
		var dx := bx - ax
		var dy := by - ay
		var Ls := dx * dx + dy * dy
		if Ls == 0:
			Ls = 1
		var q := clampf(((px - ax) * dx + (py - ay) * dy) / Ls, 0, 1)
		var ex := px - ax - dx * q
		var ey := py - ay - dy * q
		return sqrt(ex * ex + ey * ey)
	var on_way := func(x: float, y: float) -> bool:
		for h in heads:
			var hx: float = h[0]
			var hy: float = h[1]
			if seg_d.call(x, y, hx, hy, I.x, I.y) < 2.8 or seg_d.call(x, y, hx, hy, I.x, hy) < 2.8 or seg_d.call(x, y, I.x, hy, I.x, I.y) < 2.8 \
					or seg_d.call(x, y, hx, hy, hx, I.y) < 2.8 or seg_d.call(x, y, hx, I.y, I.x, I.y) < 2.8:
				return true
		return false
	var q := 0
	var tr := 0
	while q < nr and tr < 80:
		tr += 1
		var a: float = rr.call(0, 6.28)
		var r: float = rr.call(3.5, I.r - 2)
		var i := int(floor(I.x + cos(a) * r * SX))
		var j := int(floor(I.y + sin(a) * r * SY))
		if absf(i + .5 - I.x) < 3 or absf(j + .5 - I.y) < 3:
			continue
		var v0: int = T.call(i, j)
		var ok := v0 == 4 or v0 == 7
		for d in [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1]]:
			var v: int = T.call(i + d[0], j + d[1])
			if not v or v == 8:
				ok = false
		if not ok or on_way.call(i + .5, j + .5) or path.has(j * W0 + i) or taken.any(func(o): return absf(o.x - i - .5) < 1.4 and absf(o.y - j - .5) < 1.4) \
				or Q.rune.any(func(o): return absf(o.x - i - .5) < 4 and absf(o.y - j - .5) < 4):
			continue
		var k := j * W0 + i
		var v := int(floor(rr.call(0, 3.99)))
		wg.under[k] = wg.t[k]
		wg.t[k] = 9
		c.blocks.append({"i": i, "j": j, "k": "lvrune", "v": v})
		Q.rune.append({"x": i + .5, "y": j + .5, "v": v, "col": col, "w": 0.0, "on": false})
		q += 1
	Q.tuft = Q.tuft.filter(func(d): return T.call(int(floor(d.x)), int(floor(d.y))) != 9)

## the lists of the chunks around the hero, gathered whenever that set changes (the owTick wrapper)
static func gather(wg: WorldGen) -> void:
	var out := {"tuft": [], "path": [], "patch": [], "rune": [], "crow": [], "gnat": [], "bee": []}
	for key in wg.active:
		var c: Dictionary = wg.cdata[key]
		if c.has("lv"):
			for k in out:
				out[k].append_array(c.lv[k])
	lv = out

## one line of check numbers for a chunk's lists (--worldhash, tools/godot-worldhash.js)
static func hash_line(c: Dictionary) -> String:
	var Q: Dictionary = c.get("lv", {"tuft": [], "path": [], "patch": [], "rune": [], "crow": [], "gnat": [], "bee": []})
	var f2 := func(x: float) -> String: return str(int(round(x * 100)))   # whole hundredths: %.2f and toFixed round edge cases apart
	var parts := [
		" ".join(Q.tuft.map(func(d): return "%s,%s:%d:%s" % [f2.call(d.x), f2.call(d.y), d.v, f2.call(d.ph)])),
		" ".join(Q.path.map(func(p): return "%d,%d:%d" % [p.i, p.j, p.v])),
		" ".join(Q.patch.map(func(p): return "%s@%s,%s:%d%s" % [p.k, f2.call(p.x), f2.call(p.y), p.v, "f" if p.f else ""])),
		" ".join(Q.rune.map(func(r): return "%s,%s:%d%s" % [f2.call(r.x), f2.call(r.y), r.v, r.col])),
		" ".join(Q.crow.map(func(r): return "%s,%s:%d:%s" % [f2.call(r.hx), f2.call(r.hy), int(r.hz), f2.call(r.t)])),
		" ".join(Q.gnat.map(func(r): return "%s,%s:%s" % [f2.call(r.x), f2.call(r.y), f2.call(r.ph)])),
		" ".join(Q.bee.map(func(r): return "%s,%s:%s" % [f2.call(r.x), f2.call(r.y), f2.call(r.ph)]))]
	return parts.map(func(s): return str(_sh(s))).reduce(func(a, b): return a + "/" + b)

static func _sh(s: String) -> int:
	var h := 0
	for ch in s.to_utf8_buffer():
		h = (h * 31 + ch) % 1000000007
	return h

# ---------- the ground: paths, patches, tufts (lvGround, painted by the Overworld) ----------

static func ground(ow: Node2D, top: Vector2, bot: Vector2, wind: Dictionary, walkers: Array) -> void:
	var vis := func(sp: Vector2, mx: float) -> bool: return sp.x > top.x - mx and sp.x < bot.x + mx and sp.y > top.y - mx and sp.y < bot.y + mx
	for p in lv.path:
		var sp := Iso.to_screen(Vector2(p.i, p.j))
		if vis.call(sp, 40):
			ow.draw_texture(Data.sprite("lv/path/%d" % p.v), sp - Vector2(32, 0))
	for p in lv.patch:
		var sp := Iso.to_screen(Vector2(p.x, p.y))
		if not vis.call(sp, 60):
			continue
		var tex := Data.sprite("lv/%s/%d" % [p.k, p.v])
		var sz := tex.get_size()
		if p.f and p.k != "mud":
			ow.draw_texture_rect(tex, Rect2((sp - sz / 2).round() + Vector2(sz.x, 0), Vector2(-sz.x, sz.y)), false)
		else:
			ow.draw_texture(tex, (sp - sz / 2).round())
		# in the rain the mud fills to a puddle that mirrors the sky, with rings where the drops strike
		if p.k == "mud" and wet > .02:
			_puddle(ow, sp, p)
	# tufts lean with the wind and away from whoever walks through them
	var nt := Data.variants_of("deco/tuft")
	if nt == 0:
		return
	var lean0 := (cos(wind.a) - sin(wind.a)) * .7
	var t := Game.t
	for d in lv.tuft:
		var sp := Iso.to_screen(Vector2(d.x, d.y))
		if not vis.call(sp, 30):
			continue
		var tex := Data.sprite("deco/tuft/%d" % (d.v % nt))
		var sz := tex.get_size()
		var l: float = wind.s * lean0 * (.22 + .16 * sin(t * 2.2 + d.ph))
		for e in walkers:
			var dx: float = d.x - e.x
			var dy: float = d.y - e.y
			var r := absf(dx) + absf(dy)
			if r < 1.1:
				l += (1.0 if dx - dy >= 0 else -1.0) * .75 * (1 - r / 1.1)
		l = clampf(l, -.9, .9)
		ow.draw_set_transform_matrix(Transform2D(Vector2(1, 0), Vector2(-l, 1), Vector2(sp.x, sp.y + sz.y / 2 - 3)))
		ow.draw_texture(tex, Vector2(-sz.x / 2, -(sz.y - 3)))
	ow.draw_set_transform_matrix(Transform2D.IDENTITY)

# ---------- the moving things: one world-wide state (LV) ----------

var L: Level
var wind := {"a": 0.0, "s": .35}
var leaf: Array = []
var streak: Array = []
var birds: Array = []
var peb: Array = []
var bird_t := 8.0
var cr_t := 1.0
var R := Rng.unseeded()

func _init(level: Level) -> void:
	L = level
	z_index = 1

func land(x: float, y: float) -> bool:
	var wg: WorldGen = L.ow.wg
	var v := wg.t[int(floor(y)) * wg.w + int(floor(x))]
	return v == 4 or v == 7 or v == 9

func _process(dt: float) -> void:
	if not L.ow:
		return
	var P := L.P
	var t := Game.t
	var wg: WorldGen = L.ow.wg
	var night := DayNight.a()
	# wind follows the weather, with gusts
	var ws: float = {"clear": .35, "rain": .8, "ash": .6, "fog": .15, "snow": .75}.get(Weather.now(), .35)
	wet = clampf(wet + (dt / 20 if Weather.now() == "rain" else -dt / 120), 0, 1)
	wind.s += (ws * (1 + .35 * sin(t * .31) * sin(t * .13)) - wind.s) * minf(1, dt * .5)
	wind.a = wg.hsh(3, 7, 177) * 6.28 + sin(t * .011) * .7
	# leaves and seeds on the wind, and now and then a streak of air
	var I = wg.island_of(int(floor(P.x / WorldGen.CH)), int(floor(P.y / WorldGen.CH)))
	var kind: String = I.kind if I != null else ""
	var want := roundi(4 + wind.s * 22)
	var wx := cos(wind.a)
	var wy := sin(wind.a)
	if leaf.size() < want and R.next() < dt * 8:
		var a := R.rnd(0, 6.28)
		var r := R.rnd(2, 13)
		leaf.append({"x": P.x + cos(a) * r - wx * 4, "y": P.y + sin(a) * r - wy * 4, "z": R.rnd(.3, 2.6), "k": "ash" if Weather.now() == "ash" else ("leaf" if kind == "forest" or R.next() < .3 else "seed"),
			"c": Color(R.pick(["#c07a2a", "#d8a03a", "#8aa030", "#a0522a"])), "t": 0.0, "life": R.rnd(4, 7), "ph": R.rnd(0, 6), "r": R.rnd(0, 6)})
	for f in leaf:
		f.t += dt
		var sp: float = wind.s * (2.2 if f.k == "seed" else 3.0)
		f.x += (wx * sp + sin(t * 2 + f.ph) * .3) * dt
		f.y += (wy * sp + cos(t * 1.7 + f.ph) * .3) * dt
		f.z += sin(t * 1.3 + f.ph) * dt * .4 - (.08 if f.k == "leaf" else 0.0) * dt
		f.r += dt * (4.0 if f.k == "leaf" else 1.0)
	leaf = leaf.filter(func(f): return f.t < f.life and f.z > -.2)
	if wind.s > .4 and R.next() < dt * wind.s * .9 and streak.size() < 4:
		var a := R.rnd(0, 6.28)
		var r := R.rnd(3, 12)
		streak.append({"x": P.x + cos(a) * r, "y": P.y + sin(a) * r, "z": R.rnd(.8, 3), "t": 0.0, "life": R.rnd(1.4, 2.2), "ph": R.rnd(0, 6)})
	for s in streak:
		s.t += dt
		s.x += wx * wind.s * 4 * dt
		s.y += wy * wind.s * 4 * dt
	streak = streak.filter(func(s): return s.t < s.life)
	# a flock now and then: birds by day, bats by night
	bird_t -= dt
	if bird_t <= 0:
		bird_t = R.rnd(16, 38)
		var bat := night > .5
		var a := R.rnd(0, 6.28)
		var n := int(floor(R.rnd(4, 8) if bat else R.rnd(5, 10)))
		var ox := cos(a)
		var oy := sin(a)
		var sx0: float = P.x - ox * 22 + oy * R.rnd(-8, 8)
		var sy0: float = P.y - oy * 22 - ox * R.rnd(-8, 8)
		var z := R.rnd(2, 3.5) if bat else R.rnd(5, 8)
		for k in n:
			var row := ceili(k / 2.0)
			var side := 1 if k % 2 else -1
			birds.append({"x": sx0 - ox * row * .9 + oy * side * row * .7, "y": sy0 - oy * row * .9 - ox * side * row * .7, "z": z + R.rnd(-.3, .3),
				"vx": ox * (5.5 if bat else 4.2), "vy": oy * (5.5 if bat else 4.2), "bat": bat, "ph": R.rnd(0, 6), "t": 0.0})
	for b in birds:
		b.t += dt
		var j: float = sin(t * 9 + b.ph) * 1.5 if b.bat else 0.0
		b.x += (b.vx - b.vy * j * .3) * dt
		b.y += (b.vy + b.vx * j * .3) * dt
	birds = birds.filter(func(b): return b.t < 14)
	# stones work loose from the edges and fall into the deep
	cr_t -= dt * (4.0 if L.shake > 3 else 1.0)
	if cr_t <= 0:
		cr_t = R.rnd(.7, 2)
		for tr in 30:
			var i := int(floor(P.x + R.rnd(-13, 13)))
			var j := int(floor(P.y + R.rnd(-13, 13)))
			var v := wg.t[j * wg.w + i]
			if v != 4 and v != 7:
				continue
			var s := wg.t[(j + 1) * wg.w + i] == 0
			var e := wg.t[j * wg.w + i + 1] == 0
			if not s and not e:
				continue
			var x := i + R.rnd(.1, .9) if s else i + 1.0
			var y := j + 1.0 if s else j + R.rnd(.1, .9)
			for k in int(floor(R.rnd(1, 4))):
				peb.append({"x": x + R.rnd(-.1, .1), "y": y + R.rnd(-.1, .1), "z": -R.rnd(0, .2), "vz": R.rnd(0, 1), "vx": 0.0 if s else R.rnd(.1, .4),
					"vy": R.rnd(.1, .4) if s else 0.0, "t": 0.0, "s": R.rnd(1, 2.6), "c": Color(R.pick(["#5a4a3a", "#6a5a48", "#4a3e32", "#7a6a56"]))})
			if R.next() < .5:
				L.parts.append({"k": "smoke", "x": x, "y": y, "z": -.1, "vx": 0.0, "vy": 0.0, "vz": -.3, "t": 0.0, "life": 1.2,
					"col": Color(120 / 255.0, 104 / 255.0, 84 / 255.0, .6), "s": R.rnd(4, 7), "g": 0.0})
			break
	for p in peb:
		p.t += dt
		p.vz -= 9 * dt
		p.z += p.vz * dt
		p.x += p.vx * dt
		p.y += p.vy * dt
	peb = peb.filter(func(p): return p.t < 2.4)
	# runes wake when the hero comes near and fall asleep again slowly
	var pp := Vector2(P.x, P.y)
	for r in lv.rune:
		var d := pp.distance_to(Vector2(r.x, r.y))
		var near := d < 4.5
		r.w = clampf(r.w + (dt * 1.4 if near else -dt / 6), 0, 1)
		if near and not r.on:
			r.on = true
			for k in 8:
				L.parts.append({"k": "spark", "x": r.x + R.rnd(-.3, .3), "y": r.y + R.rnd(-.3, .3), "z": R.rnd(.3, 1.5), "vx": R.rnd(-.2, .2), "vy": R.rnd(-.2, .2),
					"vz": R.rnd(.2, .6), "t": 0.0, "life": R.rnd(1.2, 2.2), "col": RCOL[r.col], "s": R.rnd(.6, 1) * 1.6, "g": 0.0})
		if d > 7:
			r.on = false
	# crows sit on the graves, take off when you come close and come back when you have gone
	for c in lv.crow:
		c.t += dt
		var d := pp.distance_to(Vector2(c.hx, c.hy))
		if c.st == 0 and d < 3.4:
			c.st = 1
			c.a = atan2(c.hy - P.y, c.hx - P.x)
		if c.st == 1:
			c.a += dt * .9
			c.z = minf(c.z + dt * 2.4, 4)
			c.x = c.hx + cos(c.a) * minf(4, c.z)
			c.y = c.hy + sin(c.a) * minf(4, c.z)
			if d > 7.5:
				c.rt += dt
				if c.rt > 5:
					c.st = 2
					c.rt = 0.0
			else:
				c.rt = 0.0
		if c.st == 2:
			c.z = maxf(0, c.z - dt * 1.6)
			var q := minf(1, dt * 2)
			c.x += (c.hx - c.x) * q
			c.y += (c.hy - c.y) * q
			if c.z <= 0:
				c.st = 0
				c.x = c.hx
				c.y = c.hy
			if d < 3.4:
				c.st = 1
	# fireflies after dark: many in the forests, few on bare rock; they shy from the hero and fade with the morning
	var ff_w := (40 if kind == "forest" else (8 if kind == "rock" else 26)) if night > .4 else 0
	if ffly.size() < ff_w and R.next() < dt * 6:
		var a := R.rnd(0, 6.28)
		var r := R.rnd(2, 11)
		var x: float = P.x + cos(a) * r
		var y: float = P.y + sin(a) * r
		if land(x, y):
			ffly.append({"x": x, "y": y, "z": R.rnd(.3, 1.4), "vx": 0.0, "vy": 0.0, "t": 0.0, "life": R.rnd(14, 28), "ph": R.rnd(0, 6), "sp": R.rnd(.9, 1.6)})
	for f in ffly:
		f.t += dt
		var d := pp.distance_to(Vector2(f.x, f.y))
		var ax: float = sin(t * .7 * f.sp + f.ph) * .6
		var ay: float = cos(t * .53 * f.sp + f.ph * 1.3) * .6
		if d < 1.6 and d > .001:
			ax += (f.x - P.x) / d * 3
			ay += (f.y - P.y) / d * 3
		f.vx += (ax - f.vx) * dt * 2
		f.vy += (ay - f.vy) * dt * 2
		var nx: float = f.x + f.vx * dt
		var ny: float = f.y + f.vy * dt
		if land(nx, ny):
			f.x = nx
			f.y = ny
		else:
			f.vx *= -1
			f.vy *= -1
		f.z = clampf(f.z + sin(t * 1.1 + f.ph) * dt * .3, .2, 1.8)
		if not ff_w:
			f.life = minf(f.life, f.t + 1.5)
	ffly = ffly.filter(func(f): return f.t < f.life and pp.distance_to(Vector2(f.x, f.y)) < 17)
	queue_redraw()

## a puddle on a muddy patch: a pale sky by day, a dark blue one at night (lvGround)
static func _puddle(ow: Node2D, sp: Vector2, p: Dictionary) -> void:
	var nt := DayNight.a() > .5
	var c0 := Color("#3a4a70") if nt else Color("#c8dcf4")
	var c1 := Color("#1a2440") if nt else Color("#7aa4d8")
	ow.draw_set_transform(sp, 0, Vector2(1, .5))
	for k in 8:
		var q := 1.0 - k / 8.0
		var col := c1.lerp(c0, 1 - q) if q > .3 else Color(60 / 255.0, 80 / 255.0, 110 / 255.0, 0).lerp(c1, q / .3)
		col.a *= wet * .85 * (.35 if k else 1.0)
		ow.draw_circle(Vector2(-4, -4) * (1 - q), 20 * q, col)
	if Weather.now() == "rain":
		var t := Game.t
		var q := fposmod(t * 1.3 + p.x, 1.0)
		var s := floorf(t * 1.3)
		ow.draw_arc(Vector2(sin(p.x * 9 + s) * 8, cos(p.y * 7 + s) * 6), q * 9 + .01, 0, TAU, 16, Color(220 / 255.0, 235 / 255.0, 1, (1 - q) * .6), 1.5)
	ow.draw_set_transform_matrix(Transform2D.IDENTITY)

## the wind as the ground needs it
func walkers() -> Array:
	var out := [{"x": L.P.x, "y": L.P.y}]
	for e in L.enemies:
		if not e.dead and absf(e.world.x - L.P.x) < 14 and absf(e.world.y - L.P.y) < 14:
			out.append({"x": e.world.x, "y": e.world.y})
	return out

# ---------- in the air, after everything standing (lvAir) ----------

func _draw() -> void:
	if not L.ow:
		return
	var t := Game.t
	var night := DayNight.a()
	var pp := Vector2(L.P.x, L.P.y)
	var near := func(x: float, y: float, r: float) -> bool: return absf(x - pp.x) < r and absf(y - pp.y) < r
	for s in streak:
		var sp := Iso.to_screen(Vector2(s.x, s.y)) - Vector2(0, s.z * 30)
		var p: float = s.t / s.life
		var a := sin(p * PI) * .22
		var dv := Enemy._scr_dir(wind.a)
		var pts := PackedVector2Array()
		for k in 13:
			var q := k / 12.0
			var Ls := (q - .5) * 120
			pts.append(Vector2(sp.x + dv.x * Ls, sp.y + dv.y * Ls + sin(q * 6 + s.ph + t * 3) * 4))
		draw_polyline(pts, Color(240 / 255.0, 246 / 255.0, 1, a), 1.2)
	for f in leaf:
		var sp := Iso.to_screen(Vector2(f.x, f.y)) - Vector2(0, f.z * 30)
		var a := minf(1, minf(f.t, f.life - f.t))
		if f.k == "leaf":
			draw_set_transform(sp, f.r, Vector2(1, absf(sin(f.r * 1.3)) + .2))
			ThemeDraw.ell(self, Vector2.ZERO, 3, 1.5, Color(f.c, a), 0, 10)
			draw_set_transform(Vector2.ZERO)
		elif f.k == "ash":
			draw_rect(Rect2(sp.x, sp.y, 2, 2), Color("#5a5652" if f.ph > 3 else "#8a8680", a))
		else:
			draw_rect(Rect2(sp.x - 1, sp.y, 3, 1), Color(250 / 255.0, 250 / 255.0, 240 / 255.0, .85 * a))
			draw_rect(Rect2(sp.x, sp.y - 1, 1, 3), Color(250 / 255.0, 250 / 255.0, 240 / 255.0, .85 * a))
	for b in birds:
		if not near.call(b.x, b.y, 30):
			continue
		var s0 := Iso.to_screen(Vector2(b.x, b.y))
		var sp := s0 - Vector2(0, b.z * 30)
		var a := minf(1, minf(b.t, 14 - b.t))
		if land(b.x, b.y):
			ThemeDraw.ell(self, s0, 3 if b.bat else 5, 1.6, Color(0, 0, 0, .12 * a), 0, 12)
		var f := sin(t * (22 if b.bat else 9) + b.ph)
		var w := 4.0 if b.bat else 7.0
		var col := Color("#120e14") if b.bat else Color("#2a2a30")
		col.a = a
		var pts := PackedVector2Array([sp + Vector2(-w, -f * 3)])
		pts.append_array(Prop.quad(sp + Vector2(-w, -f * 3), sp + Vector2(-w * .4, -2 - f * 2), sp, 5))
		pts.append_array(Prop.quad(sp, sp + Vector2(w * .4, -2 - f * 2), sp + Vector2(w, -f * 3), 5))
		draw_polyline(pts, col, 1.4 if b.bat else 1.6)
	for c in lv.crow:
		if not near.call(c.x, c.y, 18):
			continue
		var s0 := Iso.to_screen(Vector2(c.x, c.y))
		var y: float = s0.y - c.hz - (c.z * 30 + 6 if c.st else 0.0)
		var sx := s0.x
		if c.st == 0:
			var pk := 2.0 if sin(c.t * 1.3) > .8 else 0.0
			ThemeDraw.ell(self, Vector2(sx, y - 3), 3.4, 2.4, Color("#0a0a0e"), 0, 12)
			draw_rect(Rect2(sx + 1, y - 6 + pk, 3, 3), Color("#0a0a0e"))
			draw_rect(Rect2(sx + 4, y - 5 + pk, 2, 1), Color("#3a3a30"))
			draw_rect(Rect2(sx - 5, y - 3, 3, 1), Color("#0a0a0e"))
		else:
			var f := sin(c.t * 10)
			draw_polyline(PackedVector2Array([Vector2(sx - 6, y - f * 3), Vector2(sx, y + 1), Vector2(sx + 6, y - f * 3)]), Color("#0a0a0e"), 1.6)
	if night < .6:
		for g in lv.gnat:
			if not near.call(g.x, g.y, 18):
				continue
			var s0 := Iso.to_screen(Vector2(g.x, g.y))
			for k in 11:
				var q: float = g.ph + k * 1.9
				draw_rect(Rect2(roundf(s0.x + sin(t * (3 + k * .37) + q) * 9), roundf(s0.y - 26 + cos(t * (2.3 + k * .29) + q * 1.4) * 6), 1, 1), Color(20 / 255.0, 20 / 255.0, 16 / 255.0, .75 * (1 - night)))
	if night < .4:
		for b in lv.bee:
			if not near.call(b.x, b.y, 18):
				continue
			var s0 := Iso.to_screen(Vector2(b.x, b.y))
			for k in 2:
				var q: float = t * (2.2 + k * .5) + b.ph + k * 3
				var x := roundf(s0.x + sin(q) * 8)
				var y := roundf(s0.y - 8 + sin(q * 2) * 3)
				draw_rect(Rect2(x, y, 2, 1), Color("#e8c030"))
				draw_rect(Rect2(x + 1, y, 1, 1), Color("#1a1408"))
				draw_rect(Rect2(x, y - 1 - (1 if sin(t * 60) > 0 else 0), 1, 1), Color(1, 1, 1, .6))
	# moths circle the warm lights after dark
	if night > .4:
		for p in L.ow.wg.live("props"):
			if not near.call(p.x, p.y, 12) or p.k == "shaft":
				continue
			var Lp = L.prop_light(p)
			if Lp == null or Lp.get("col") == null:
				continue
			var s0 := Iso.to_screen(Vector2(p.x, p.y))
			var cy: float = s0.y - Lp.get("h", 14) - 6
			for k in 3:
				var q: float = t * (1.6 + k * .4) + k * 2.1 + p.get("ph", 0.0)
				var x := roundf(s0.x + cos(q) * (8 + k * 3))
				var y := roundf(cy + sin(q * 1.7) * (5 + k))
				var fw := 2 if sin(t * 30 + k) > 0 else 1
				draw_rect(Rect2(x - fw, y, fw, 1), Color(232 / 255.0, 224 / 255.0, 200 / 255.0, .85))
				draw_rect(Rect2(x + 1, y, fw, 1), Color(232 / 255.0, 224 / 255.0, 200 / 255.0, .85))
	for p in peb:
		var sp := Iso.to_screen(Vector2(p.x, p.y)) - Vector2(0, p.z * 30)
		draw_rect(Rect2(roundf(sp.x), roundf(sp.y), ceilf(p.s), ceilf(p.s * .8)), Color(p.c, minf(1, (2.4 - p.t) / 1.2)))

## the waking runes, in the glow layer over everything (lvGlow)
class Glow extends Node2D:
	func _init() -> void:
		var add := CanvasItemMaterial.new()
		add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = add

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var t := Game.t
		var na := DayNight.a()
		for f in LivingIsles.ffly:
			var sp := Iso.to_screen(Vector2(f.x, f.y)) - Vector2(0, f.z * 30)
			var b: float = pow(maxf(0, sin(t * 1.4 * f.sp + f.ph)), 2) * minf(1, minf(f.t, f.life - f.t)) * minf(1, na * 1.6)
			if b < .03:
				continue
			Prop.glow(self, sp, 9, Color(200 / 255.0, 248 / 255.0, 120 / 255.0, b * .6))
			draw_rect(Rect2(roundf(sp.x), roundf(sp.y), 1, 1), Color(244 / 255.0, 1, 208 / 255.0, b))
		for r in LivingIsles.lv.rune:
			if r.w < .02:
				continue
			var sp := Iso.to_screen(Vector2(r.x, r.y))
			var fl := .8 + .2 * sin(t * 3 + r.x)
			draw_texture(Data.sprite("lv/glow/%s/%d" % [r.col, r.v]), sp - Vector2(15, 49), Color(1, 1, 1, r.w * fl))
			# the browser's soft radial glow falls off to nothing; Prop.glow's rings sum up brighter, so a little less of it
			Prop.glow(self, sp - Vector2(0, 30), 28, Color(LivingIsles.RGLOW[r.col], r.w * .16 * fl))
