class_name Chests
## Chests (770-chests.js): barrels and crates for the small stuff, and real chests that grow rarer, finer and richer.
## Where they stand in the tower (dungeonChests) and on the islands (the owContent wrapper), what each one holds
## (chestLoot), and the small things lying about on islands (the owContent wrapper of 760-tower-2.js), because the
## island chests keep clear of them. Pictures: chest/<kind>/0 closed, /1 open, dc/<kind> (tools/godot-export-sky.js).

## name, label colour, glow (rgb) and marks of each kind (CHT)
const CHT := {
	"barrel": {"n": "Fass", "junk": true}, "crate": {"n": "Holzkiste", "junk": true},
	"wood": {"n": "Truhe"},
	"iron": {"n": "Eisenbeschlagene Truhe", "col": "#c8ccd4"},
	"royal": {"n": "Königsblaue Truhe", "col": "#8ab0ff"},
	"moss": {"n": "Überwucherte Truhe", "col": "#8ad06a"},
	"crystal": {"n": "Kristalltruhe", "col": "#d8c8ff", "glow": Color8(200, 180, 255)},
	"gold": {"n": "Goldene Truhe", "col": "#ffd040", "glow": Color8(255, 200, 80), "shine": true},
	"emerald": {"n": "Smaragdtruhe", "col": "#50f0a0", "glow": Color8(80, 255, 170), "shine": true},
	"vault": {"n": "Verschlossene Truhe", "col": "#e8b060"},
	"trial": {"n": "Prüfungstruhe", "col": "#f0e0b0", "glow": Color8(255, 230, 160)}}
## barrels and crates on an island of each kind: from, to (CHOW)
const CHOW := {"village": [4, 8], "camp": [3, 6], "ruins": [2, 4], "wild": [1, 3], "forest": [1, 3], "grave": [1, 2], "rock": [0, 2], "boss": [1, 3]}
## what lies about on an island of each kind, with weights (DCOW)
const DCOW := {
	"wild": [["dclog", 2], ["dcstump", 2], ["dcbush", 3], ["dcmush", 2], ["dcstones", 2], ["dcsign", .5]],
	"forest": [["dclog", 3], ["dcstump", 3], ["dcmush", 3], ["dcbush", 2]],
	"village": [["dccart", 2], ["dcwell", 1], ["dcurn", 2], ["dcbones", 2], ["dcbanner", 1], ["dcsign", 1]],
	"ruins": [["dcstones", 3], ["dcrubble", 3], ["dcskulls", 1], ["dcbanner", 1], ["dcsword", 1]],
	"grave": [["dcskulls", 2], ["dcbones", 3], ["dccand", 2], ["dcstump", 1]],
	"camp": [["dcwell", 1], ["dcscare", 1], ["dcsign", 1], ["dccart", 1], ["dcbanner", 2], ["dcbush", 2]],
	"rock": [["dcstones", 3], ["dcbush", 1]],
	"boss": [["dcbones", 3], ["dcskulls", 2], ["dcsword", 2], ["dcbanner", 2]]}

static func look(o: Dictionary) -> String:
	return o.get("ct", "royal" if o.get("star") or o.get("secret") else "wood")

static func info(o: Dictionary) -> Dictionary:
	return CHT.get(look(o), CHT.wood)

static func tier(R: Rng, deep: bool) -> String:
	var x := R.next()
	return "gold" if x < .005 else ("emerald" if x < .01 else ("crystal" if x < .035 else ("royal" if x < .09 else ("iron" if x < (.27 if deep else .24) else "wood"))))

static func _hyp(x: float, y: float) -> float:
	return sqrt(x * x + y * y)

# ---------- in the tower (dungeonChests) ----------

## many barrels and crates along the walls, now and then something finer; from the second floor a locked chest
## and a trial room whose chest stays sealed until its guards fall
static func dungeon(m: Dictionary, seed_value: int) -> void:
	var f: int = m.floor
	var R := Rng.new(seed_value * 4409 + f * 55331)
	var w: int = m.w
	var t: PackedByteArray = m.t
	var T := func(i: int, j: int) -> int: return t[j * w + i]
	var n8 := func(i: int, j: int) -> int:
		var n := 0
		for a in range(-1, 2):
			for b in range(-1, 2):
				if (a or b) and t[(j + b) * w + i + a] == 1:
					n += 1
		return n
	for o in m.objs:
		if o.type == "chest" and not o.has("ct") and not o.get("secret") and not o.get("star"):
			o.ct = tier(R, f >= 6)
	var busy: Array = m.objs.map(func(o): return Vector2(o.x, o.y))
	var st := Vector2(m.start.x, m.start.y)
	var ok := func(x: float, y: float, d := 1.4) -> bool:
		for b in busy:
			if _hyp(b.x - x, b.y - y) < d:
				return false
		return _hyp(x - st.x, y - st.y) > 3
	var q := 0
	var g := 0
	var n := R.rint(12, 18)
	while q < n and g < 800:
		g += 1
		var i := R.rint(4, w - 5)
		var j := R.rint(4, m.h - 5)
		if T.call(i, j) != 1:
			continue
		var k: int = n8.call(i, j)
		if k < 4 or k > 6:
			continue
		var x := i + .5
		var y := j + .5
		if not ok.call(x, y):
			continue
		m.objs.append({"type": "chest", "ct": "barrel" if R.next() < .55 else "crate", "x": x, "y": y, "open": false})
		busy.append(Vector2(x, y))
		q += 1
		for c in R.rint(0, 2):
			var x2 := x + R.rnd(-1, 1)
			var y2 := y + R.rnd(-1, 1)
			if T.call(floori(x2), floori(y2)) == 1 and ok.call(x2, y2, .8):
				m.objs.append({"type": "chest", "ct": "barrel" if R.next() < .5 else "crate", "x": x2, "y": y2, "open": false})
				busy.append(Vector2(x2, y2))
				q += 1
	var rooms: Array = m.rooms.filter(func(r): return r != m.startRoom and not (m.boss and r == m.endRoom))
	var spot := func(r: Dictionary) -> Variant:
		for k in 40:
			var i := R.rint(r.x + 2, r.x + r.w - 3)
			var j := R.rint(r.y + 2, r.y + r.h - 3)
			if T.call(i, j) == 1 and n8.call(i, j) == 8 and ok.call(i + .5, j + .5, 2):
				return Vector2(i + .5, j + .5)
		return null
	if f >= 2 and R.next() < .35 and rooms.size():
		var s = spot.call(R.pick(rooms))
		if s != null:
			m.objs.append({"type": "chest", "ct": "vault", "x": s.x, "y": s.y, "open": false})
			busy.append(s)
	if f >= 2 and R.next() < .5 and rooms.size() > 1:
		var r: Dictionary = R.pick(rooms.filter(func(r): return r != m.endRoom))
		var cx: float = r.cx + .5
		var cy: float = r.cy + .5
		var s = Vector2(cx, cy) if T.call(r.cx, r.cy) == 1 and ok.call(cx, cy, 2) else spot.call(r)
		if s != null:
			r.trial = 1
			m.objs.append({"type": "chest", "ct": "trial", "x": s.x, "y": s.y, "open": false, "rx": r.x, "ry": r.y, "rw": r.w, "rh": r.h})
			busy.append(s)

# ---------- on the islands (the owContent wrappers of 760 and 770) ----------

static func _taken(c: Dictionary) -> Array:
	var out: Array = []
	for o in c.objs:
		out.append(Vector2(o.x, o.y))
	for p in c.props:
		out.append(Vector2(p.x, p.y))
	for b in c.blocks:
		out.append(Vector2(b.i + .5, b.j + .5))
	return out

static func _free(taken: Array, x: float, y: float, d: float) -> bool:
	for o in taken:
		if _hyp(o.x - x, o.y - y) < d:
			return false
	return true

## logs, stumps, bushes, carts, wells, scarecrows, bones … away from the middle and the roads
static func island_decor(wg: WorldGen, c: Dictionary, I: Dictionary, cx: int, cy: int) -> void:
	if not DCOW.has(I.kind):
		return
	var Rg := Rng.new(int(floor(wg.hsh(cx, cy, 77) * 1e9)))
	var K: Array = DCOW[I.kind]
	var sum := 0.0
	for kw in K:
		sum += kw[1]
	var n: int = WorldGen.jround(I.r * .9) + (2 if I.kind == "forest" or I.kind == "wild" else 0)
	var taken := _taken(c)
	var q := 0
	var g := 0
	while q < n and g < 120:
		g += 1
		var a := Rg.next() * 6.283
		var r: float = 2.8 + Rg.next() * (I.r - 4)
		var x: float = I.x + cos(a) * r
		var y: float = I.y + sin(a) * r
		var v := wg.t[floori(y) * wg.w + floori(x)]
		if not (v == 4 or v == 7) or absf(x - I.x) < 2.8 or absf(y - I.y) < 2.8 or not _free(taken, x, y, 2):
			continue
		var s := Rg.next() * sum
		var k: String = K[0][0]
		for kw in K:
			if s < kw[1]:
				k = kw[0]
				break
			s -= kw[1]
		var ph := Rg.next() * 6
		c.props.append({"k": k, "x": x, "y": y, "v": 0, "ph": ph, "f": Rg.next() < .5})
		taken.append(Vector2(x, y))
		q += 1

## the island's chests get their kind; barrels and crates join them, now and then a mossy, locked or golden chest
static func island_chests(wg: WorldGen, c: Dictionary, I: Dictionary, cx: int, cy: int) -> void:
	var Rg := Rng.new(int(floor(wg.hsh(cx, cy, 131) * 1e9)))
	var taken := _taken(c)
	for o in c.objs:
		if o.type == "chest" and not o.has("ct"):
			var x := Rg.next()
			o.ct = "gold" if x < .006 else ("emerald" if x < .012 else ("crystal" if x < .04 else ("royal" if x < .1 else ("iron" if x < .27 else "wood"))))
	var place := func(ct: String) -> bool:
		for g in 30:
			var a := Rg.next() * 6.283
			var r: float = 2.5 + Rg.next() * (I.r - 3.5)
			var x: float = I.x + cos(a) * r
			var y: float = I.y + sin(a) * r
			var v := wg.t[floori(y) * wg.w + floori(x)]
			if not (v == 4 or v == 7) or not _free(taken, x, y, 1.6):
				continue
			c.objs.append({"type": "chest", "ct": ct, "x": x, "y": y, "open": false})
			taken.append(Vector2(x, y))
			return true
		return false
	var nn: Array = CHOW.get(I.kind, [0, 1])
	for k in nn[0] + floori(Rg.next() * (nn[1] - nn[0] + 1)):
		if place.call("barrel" if Rg.next() < .5 else "crate") and Rg.next() < .4:
			place.call("barrel" if Rg.next() < .5 else "crate")
	if (I.kind == "wild" or I.kind == "forest") and Rg.next() < .12:
		place.call("moss")
	if (I.kind == "ruins" or I.kind == "grave") and Rg.next() < .25:
		place.call("vault")
	if I.kind != "boss" and Rg.next() < .025:
		place.call("gold" if Rg.next() < .5 else "emerald")

# ---------- what a chest holds (chestLoot) ----------

## the items and the glut a chest gives, at monster level cl
static func loot(o: Dictionary, cl: int, mf: float, floor_no: int) -> Dictionary:
	var lk := look(o)
	var out: Array = []
	var R := Rng.unseeded()
	var it := func(opt: Dictionary) -> void: out.append(Items.make(cl + opt.get("up", 0), opt))
	var gl := 0
	var pot := 0
	match lk:
		"barrel", "crate":
			for k in R.rint(1, 3 if lk == "crate" else 2):
				out.append(Items.junk_for(null, cl))
			if R.next() < .18:
				it.call({"mf": mf})
			pot = 1 if R.next() < .25 else 0
			gl = R.rint(3, 8) * cl
		"wood":
			for k in R.rint(1, 2):
				out.append(Items.junk_for(null, cl))
			it.call({"mf": mf + 40})
			if R.next() < .3:
				it.call({"mf": mf})
			pot = 1 if R.next() < .4 else 0
			gl = R.rint(6, 12) * cl
		"iron":
			it.call({"mf": mf + 100}); it.call({"mf": mf + 100})
			if R.next() < .25:
				it.call({"rarity": "rare"})
			pot = 1
			gl = R.rint(10, 18) * cl
		"moss":
			it.call({"mf": mf + 150}); it.call({"mf": mf + 150})
			if R.next() < .45:
				it.call({"rarity": "rare"})
			pot = 2
			gl = R.rint(10, 18) * cl
		"royal":
			it.call({"rarity": "rare", "up": 1}); it.call({"rarity": "rare" if R.next() < .5 else "magic"})
			pot = 1
			gl = R.rint(15, 25) * cl
		"crystal":
			it.call({"rarity": "rare", "up": 1}); it.call({"mf": mf + 150})
			pot = 1
			gl = R.rint(15, 25) * cl
		"gold":
			it.call({"rarity": "unique", "up": 2}); it.call({"rarity": "rare", "up": 2}); it.call({"rarity": "rare", "boost": .3})
			pot = 2
			gl = 60 * cl
		"emerald":
			it.call({"rarity": "unique", "up": 2}); it.call({"rarity": "rare", "up": 2})
			pot = 2
			gl = 45 * cl
		"vault":
			it.call({"rarity": "unique", "up": 2}); it.call({"rarity": "rare", "up": 2}); it.call({"rarity": "rare", "boost": .4})
			pot = 1
			gl = 40 * cl
		"trial":
			it.call({"rarity": "rare", "up": 2, "boost": .3})
			for k in R.rint(2, 3):
				it.call({"rarity": "rare" if R.next() < .4 else "magic", "up": 1})
			if R.next() < .2:
				it.call({"rarity": "unique", "up": 2})
			pot = 2
			gl = 30 * cl
	var rn = Runes.chest_rune(lk, cl)
	if rn:
		out.append(rn)
	for k in pot:
		out.append(Items.potion("life" if R.next() < .65 else "mana", floor_no))
	return {"out": out, "gl": gl}
