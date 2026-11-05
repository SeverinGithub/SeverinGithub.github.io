class_name DeadLands
## The dead lands (510-dead-lands.js, 520-dead-lands-plan.js, 530-art-dead-lands.js, the world half of 550): a whole kingdom
## at the western rim, far beyond the last island lord. One long floating plateau in a local frame – p runs from the city
## gate (0) up to the castle (476), q runs across (0 = the main road) – laid into the world along x or y (WorldGen._rg_w).
## The plan is built once per world from the seed (rgPlan): the still city with its cathedral, market and a thousand houses,
## the pilgrims' road, the giant cloister with the church and its boss hall, the dark red forest with witch huts and towers,
## and the castle behind a chasm with one bridge. Chunks copy their part of it as they wake (rgFill, the owIsland and
## owContent wrappers). The buildings are pictures exported from the browser (tools/godot-export-rg.js); lamps, cauldrons,
## floating rocks and the portcullis are painted here as drawProp paints them.

const P0 := -8
const P1 := 480
const Q0 := -92
const Q1 := 92
const PW := P1 - P0
const PH := Q1 - Q0
const CH := 32
const ZN := {"gate": "Das Totentor", "city": "Die stille Stadt", "road": "Der Pilgerweg", "clo": "Vorhof des Riesenklosters", "church": "Das Riesenkloster",
	"wood": "Der dunkelrote Wald", "castle": "Vor der Riesenburg"}
const SUB := {"city": "Alles steht noch. Niemand lebt.", "clo": "Wo die Riesen beteten", "church": "Das Kirchenschiff des Riesenklosters",
	"wood": "Selbst am Mittag ist es hier Nacht", "castle": "Das Ende der Welt. Und der Anfang von etwas anderem.", "gate": "Hier beginnt Eldriks Karte"}
const ZLVL := {"gate": 0, "city": 0, "road": 1, "clo": 2, "church": 3, "wood": 6, "castle": 9}
const LIGHT := {"rglamp": {"r": 150, "a": .8, "col": Color8(255, 170, 80), "f": 6, "h": 46}, "rgcaul": {"r": 150, "a": .75, "col": Color8(90, 255, 90), "f": 8, "h": 16},
	"rghut": {"r": 120, "a": .55, "col": Color8(90, 220, 80), "f": 4, "h": 40}}
const WH := 56.0

static var zone = null           # the part of the dead lands the hero stands in (G.rgZ)
static var ck := 0.0             # near the castle the camera is drawn towards it (G.rgCk)
static var dark := 0.0           # how dark it is there now (rgDark, eased)
static var _zt := 0.0

## the hero's record (P.rgMap, rgSeen, rgHut, … in 550): older heroes lack it
static func S() -> Dictionary:
	for k in ["seen", "hut"]:
		if not Game.rg.has(k):
			Game.rg[k] = {}
	return Game.rg

static func lvl(wg: WorldGen) -> int:
	var b := wg.wb_pos(7)
	return WorldGen.lvl_at(b.x, b.y) + 4

## which part of the dead lands a world point lies in (rgZone)
static func zone_at(wg: WorldGen, x: float, y: float):
	var l := wg._rg_l(int(floor(x)), int(floor(y)))
	var p := l.x
	var q := l.y
	if absi(q) > 95 or p > 480:
		return null
	if p < -4:
		return "gate" if p > -80 and absi(q) < 30 else null
	if p < 136:
		return "city"
	if p < 150:
		return "road"
	if p < 243:
		return "church" if p >= 184 and absi(q) <= 22 else "clo"
	if p < 436:
		return "wood"
	return "castle"

# ---------- the plan (rgPlan) ----------

## the land's half width at p: city, road, cloister, forest, chasm, castle
static func hw(p: int) -> float:
	if p < 136:
		return 68.0
	if p < 150:
		return 28 + _wob(p, 1, 2, 1)
	if p < 243:
		return 50.0
	if p < 436:
		return 78 + _wob(p, 2.2, 6, 3)
	if p < 442:
		return 0.0
	return 64 + _wob(p, 4, 4, 2)

static func _wob(p: int, ph: float, a1: float, a2: float) -> float:
	return sin(p * .083 + ph) * a1 + sin(p * .217 + ph * 2.3) * a2

## the forest path's offset across the land
static func path(p: int) -> int:
	const F0 := 243
	const F1 := 430
	return WorldGen.jround(sin((p - F0) * .034) * 26 * minf(1, (p - F0) / 24.0) * minf(1, (F1 - p) / 30.0))

class Plan extends RefCounted:
	var wg: WorldGen
	var T := PackedByteArray()
	var U := PackedByteArray()
	var Rn: Rng
	var bk := {}                 # chunk key → {objs, props, deco, blocks, spawn, rgBoss}
	var gate := []
	var huts := []

	func _init(w: WorldGen) -> void:
		wg = w
		T.resize(PW * PH)
		U.resize(PW * PH)
		Rn = Rng.new(w.seed * 13 + 4711)

	func rr(a: float, b: float) -> float: return a + Rn.next() * (b - a)
	func ri(a: int, b: int) -> int: return int(floor(rr(a, b + 1)))
	func pk(a: Array): return a[int(floor(Rn.next() * a.size()))]
	func ix(p: int, q: int) -> int: return -1 if p < P0 or p >= P1 or q < Q0 or q >= Q1 else (q - Q0) * PW + (p - P0)
	func gt(p: int, q: int) -> int:
		var k := ix(p, q)
		return 0 if k < 0 else T[k]
	func st(p: int, q: int, t: int, u := 0) -> void:
		var k := ix(p, q)
		if k >= 0:
			T[k] = t
			U[k] = u

	func B(x: float, y: float) -> Dictionary:
		var key := "%d,%d" % [int(floor(x / CH)), int(floor(y / CH))]
		if not bk.has(key):
			bk[key] = {"objs": [], "props": [], "deco": [], "blocks": [], "spawn": []}
		return bk[key]

	func wc(p: int, q: int) -> Array:
		var v := wg._rg_w(p, q)
		return [v.x + .5, v.y + .5]

	## a rectangle of local cells as a world footprint
	func foot(p: int, q: int, w: int, h: int) -> Dictionary:
		var a := wg._rg_w(p, q)
		var c := wg._rg_w(p + w - 1, q + h - 1)
		return {"i": mini(a.x, c.x), "j": mini(a.y, c.y), "w": absi(c.x - a.x) + 1, "h": absi(c.y - a.y) + 1}

	func solid(p: int, q: int, w: int, h: int, u = null) -> void:
		for a in range(p, p + w):
			for b in range(q, q + h):
				var k := ix(a, b)
				if k >= 0:
					U[k] = u if u != null else (U[k] if T[k] == 9 else (T[k] if T[k] else 4))
					T[k] = 9

	func fits(p: int, q: int, w := 1, h := 1, ok := [4, 7, 1]) -> bool:
		for a in range(p, p + w):
			for b in range(q, q + h):
				if not gt(a, b) in ok:
					return false
		return true

	## a building drawn as one big picture over its footprint
	func bld(k: String, p: int, q: int, w: int, h: int, v := 0, o := {}) -> Dictionary:
		solid(p, q, w, h, o.get("u"))
		var f := foot(p, q, w, h)
		var pr := {"k": k, "v": v, "fw": f.w, "fh": f.h, "x": f.i + f.w / 2.0, "y": f.j + f.h / 2.0, "ph": rr(0, 6)}
		pr.merge(o, true)
		B(pr.x, pr.y).props.append(pr)
		return pr

	func blk(k: String, p: int, q: int, v = null):
		if not fits(p, q):
			return null
		solid(p, q, 1, 1)
		var at := wg._rg_w(p, q)
		var b := {"i": at.x, "j": at.y, "k": k, "v": v if v != null else ri(0, maxi(1, Data.variants_of("prop/" + k)) - 1)}
		B(at.x, at.y).blocks.append(b)
		return b

	func prop(k: String, p: int, q: int, o := {}) -> Dictionary:
		var c := wc(p, q)
		var pr := {"k": k, "x": c[0], "y": c[1], "ph": rr(0, 6), "v": 0}
		pr.merge(o, true)
		B(c[0], c[1]).props.append(pr)
		return pr

	func deco(k: String, p: int, q: int) -> void:
		var c := wc(p, q)
		var n := Data.variants_of("deco/" + k)
		if n == 0:
			return
		var d := {"k": k}
		d.x = c[0] + rr(-.4, .4)
		d.y = c[1] + rr(-.4, .4)
		d.v = ri(0, n - 1)
		B(c[0], c[1]).deco.append(d)

	func obj(o: Dictionary, p: int, q: int) -> Dictionary:
		var c := wc(p, q)
		o.x = c[0]
		o.y = c[1]
		B(c[0], c[1]).objs.append(o)
		return o

	func spawn(pool: Array, p: int, q: int, n: int, z: String, champ := .08) -> void:
		var cr := Rn.next() < champ
		for k in n:
			var a := p + rr(-1.6, 1.6)
			var b := q + rr(-1.6, 1.6)
			if not fits(int(floor(a)), int(floor(b))):
				continue
			var c := wc(int(floor(a)), int(floor(b)))
			var s := {"vid": Rn.wpick(pool)}
			s.x = c[0] + rr(-.3, .3)
			s.y = c[1] + rr(-.3, .3)
			s.rank = "champ" if cr and k < 2 else ("unique" if k == 0 and Rn.next() < champ * .35 else "normal")
			s.rgz = z
			B(c[0], c[1]).spawn.append(s)

	func street(p0: int, q0: int, p1: int, q1: int) -> void:
		for p in range(p0, p1 + 1):
			for q in range(q0, q1 + 1):
				var t := gt(p, q)
				if t and t != 2 and t != 9:
					st(p, q, 7)

	func build() -> void:
		# the land itself: one long floating plateau
		for p in range(-4, P1):
			var h := int(floor(DeadLands.hw(p)))
			for q in range(-h, h + 1):
				st(p, q, 4)
		_city()
		_cloister()
		_forest()
		_castle()

	# ----- the city -----
	func _city() -> void:
		const CW := 130
		const CQ := 62
		for p in range(0, CW + 1):
			st(p, -CQ, 2)
			st(p, CQ, 2)
		for q in range(-CQ, CQ + 1):
			st(0, q, 2)
			st(CW, q, 2)
		for q in range(-2, 3):
			st(0, q, 7)
			st(CW, q, 7)
		street(-3, -2, CW + 3, 2); street(1, -CQ + 1, 2, CQ - 1); street(CW - 2, -CQ + 1, CW - 1, CQ - 1); street(1, -CQ + 1, CW - 1, -CQ + 2); street(1, CQ - 2, CW - 1, CQ - 1)
		var VS := [22, 44, 88, 110]
		var HS := [-42, -21, 21, 42]
		for p in VS:
			street(p - 1, -CQ + 1, p + 1, CQ - 1)
		for q in HS:
			street(1, q - 1, CW - 1, q + 1)
		street(54, -13, 78, 13)
		# the cathedral north of the square, a fountain in its middle, stalls around it
		bld("rgchurch", 56, -38, 20, 16, 0)
		for p in range(56, 76):
			st(p, -21, 7)
		bld("rgfount", 64, -2, 4, 4, 0, {"u": 7})
		for pq in [[57, 6], [61, 8], [70, 8], [74, 6], [57, -10], [74, -10]]:
			var v := ri(0, 2)
			bld("rgstall", pq[0], pq[1], 2, 2, v, {"u": 7})
		for pq in [[55, -12], [77, -12], [55, 12], [77, 12]]:
			prop("brazier", pq[0], pq[1])
		# wall towers and gatehouses
		for p in [0, 26, 52, 78, 104, CW]:
			for q in [-CQ, CQ]:
				bld("rgwt", p - 1, q - 1, 3, 3, 0)
		for q in [-21, 21, -42, 42]:
			for p in [0, CW]:
				bld("rgwt", p - 1, q - 1, 3, 3, 0)
		for p in [0, CW]:
			bld("rgwt", p - 1, -6, 3, 3, 1)
			bld("rgwt", p - 1, 4, 3, 3, 1)
		# city blocks packed with houses, every one still standing
		var cuts := [1] + VS + [CW - 1]
		var rows := [-CQ + 1] + HS + [CQ - 1]
		for a in cuts.size() - 1:
			for b in rows.size() - 1:
				var p0: int = cuts[a] + 2
				var p1: int = cuts[a + 1] - 2
				var q0: int = rows[b] + 2
				var q1: int = rows[b + 1] - 2
				var p := p0
				while p <= p1:
					var w := ri(3, 5)
					if p + w - 1 > p1:
						break
					var q := q0
					while q <= q1:
						var h := ri(3, 4)
						if q + h - 1 > q1:
							break
						if fits(p, q, w, h):
							var r := Rn.next()
							if r < .86:
								var v := ri(0, 5)
								bld("rghouse", p, q, w, h, v)
							elif r < .93:
								blk(pk(["barrel", "crate"]), p + 1, q + 1)
								deco("straw", p, q + 1)
							else:
								deco("flowers", p + 1, q + 1)
								deco("tuft", p, q)
						q += h + (1 if Rn.next() < .7 else 2)
					p += w + (1 if Rn.next() < .6 else 2)
		for k in 180:
			var p := ri(2, CW - 2)
			var q := ri(-CQ + 2, CQ - 2)
			if gt(p, q) == 7:
				deco(pk(["pebbles", "rubble", "straw", "bones", "leaves"]), p, q)
			elif gt(p, q) == 4:
				deco(pk(["tuft", "flowers", "moss"]), p, q)
		for k in 70:
			var p := ri(3, CW - 3)
			var q := ri(-CQ + 3, CQ - 3)
			if gt(p, q) == 7 and absi(q) > 3 and Rn.next() < .6:
				blk(pk(["barrel", "crate", "barrel"]), p, q)
		for k in 34:
			var p := ri(4, CW - 4)
			var q: int = pk([-1, 1]) * pk([3, 20, 23, 40, 43])
			if gt(p, q) == 7:
				prop("rglamp", p, q)
		# the burghers of bone: guards at the gates, crowds in the streets, knights here and there
		var CITIZ := [["rg_bauer", 4], ["rg_sense", 2.4], ["rg_dresch", 2], ["rg_metzger", 2], ["rg_buerger", 3], ["rg_bleich", 2.4], ["rg_wache", 2.2], ["rg_armbrust", 1.6], ["rg_jaeger", 1.4], ["rg_ritter", .9]]
		for k in 52:
			var p := ri(6, CW - 6)
			var q := ri(-CQ + 4, CQ - 4)
			if gt(p, q) != 7:
				continue
			spawn(CITIZ, p, q, ri(2, 4), "city")
		spawn([["rg_wache", 3], ["rg_armbrust", 2], ["rg_ritter", 1]], 6, 0, 4, "city", .4)
		spawn([["rg_ritter", 2], ["rg_wache", 2]], CW - 6, 0, 4, "city", .4)
		spawn([["rg_buerger", 2], ["rg_bleich", 2], ["rg_ritter", 1]], 66, 6, 5, "city", .5)
		# ----- the pilgrims' road -----
		street(CW + 1, -2, 150, 2)
		var p := CW + 4
		while p < 150:
			if Rn.next() < .5:
				blk("tree", p, pk([-6, -5, 5, 6]), 2)
			if Rn.next() < .4:
				blk("grave", p, pk([-9, -10, 9, 10]))
			p += 3

	# ----- the cloister: a walled yard of graves, then the giant church -----
	func _cloister() -> void:
		const C0 := 150
		const C1 := 242
		const CQ2 := 46
		const K0 := 184
		const KQ := 22
		for p in range(C0, C1 + 1):
			st(p, -CQ2, 2)
			st(p, CQ2, 2)
		for q in range(-CQ2, CQ2 + 1):
			st(C0, q, 2)
			st(C1, q, 2)
		for q in range(-2, 3):
			st(C0, q, 7)
		bld("rgbell", K0 - 6, -KQ - 6, 5, 5, 0)
		bld("rgbell", K0 - 6, KQ + 2, 4, 4, 1)
		street(C0, -2, K0, 2)
		for p in range(C0 + 3, K0 - 2, 5):
			for q in [-4, 4]:
				prop("brazier", p, q)
		for p in range(C0 + 4, K0 - 4, 3):
			for s in [-1, 1]:
				for q in range(8, CQ2 - 3, 3):
					if Rn.next() < .7:
						blk("grave", p, s * q)
		for pq in [[C0 + 8, -20], [C0 + 8, 20], [C0 + 22, -30], [C0 + 22, 30]]:
			blk("statue", pq[0], pq[1])
		for k in 40:
			var p := ri(C0 + 2, K0 - 2)
			var q := ri(-CQ2 + 2, CQ2 - 2)
			if gt(p, q) == 4:
				deco(pk(["bones", "skull", "moss", "tuft", "blood"]), p, q)
		for p in range(K0, C1 + 1):
			for q in range(-KQ, KQ + 1):
				st(p, q, 2 if p == K0 or p == C1 or absi(q) == KQ else 1)
		for q in range(-2, 3):
			st(K0, q, 1)
		# nave, aisles, chapels, the crossing wall and the boss hall
		for p in range(K0 + 1, 215):
			for s in [-1, 1]:
				if not (p >= 193 and p <= 195) and not (p >= 205 and p <= 207):
					st(p, s * 10, 2)
		for s in [-1, 1]:
			for q in range(11, KQ):
				if not (q >= 15 and q <= 17):
					st(199, s * q, 2)
		for q in range(-KQ, KQ + 1):
			if absi(q) > 3:
				st(215, q, 2)
		for p in range(K0 + 4, 213, 4):
			for s in [-1, 1]:
				bld("rgpillar", p, s * 6, 1, 1, 0, {"u": 1})
		for p in range(K0 + 3, 213, 6):
			for s in [-1, 1]:
				prop("brazier", p, s * 8)
		for p in range(K0 + 2, 215):
			deco("rgcarpet", p, 0)
		for s in [-1, 1]:
			for pq in [[188, 16], [203, 16], [210, 13]]:
				blk(pk(["sarcophagus", "coffin"]), pq[0], s * pq[1])
			for pq in [[192, 19], [208, 19]]:
				var v := ri(0, 2)
				prop("candles", pq[0], s * pq[1], {"v": v})
			blk("altar", 190, s * 20)
			blk("bonepile", 197, s * 13)
			blk("skullpile", 211, s * 20)
			prop("shaft", 196, s * 15)
		const HB := 216
		const HE := C1 - 1
		for p in range(HB + 2, HE - 1, 5):
			for s in [-1, 1]:
				bld("rgpillar", p, s * 15, 1, 1, 1, {"u": 1})
				prop("brazier", p, s * 10)
		for p in range(HB, HE - 2):
			for q in [-1, 0, 1]:
				deco("rgcarpet", p, q)
		for s in [-1, 1]:
			blk("sarcophagus", HB + 4, s * 19)
			blk("sarcophagus", HB + 14, s * 19)
			blk("skullpile", HE - 1, s * 19)
			prop("shaft", HB + 8, s * 7)
			prop("shaft", HB + 18, s * 6)
			bld("rgbanner", HE, s * 8, 1, 1, 0, {"u": 1})
		bld("rgthrone", HE - 2, -2, 2, 5, 0, {"u": 1})
		prop("candles", HE - 3, -4, {"v": 2})
		prop("candles", HE - 3, 4, {"v": 2})
		for q in range(-2, 3):
			st(C1, q, 9, 1)
			gate.append(ix(C1, q))
		bld("rgportc", C1, -2, 1, 5, 0, {"u": 1})
		for p in range(K0 + 1, C1, 2):
			for q in range(-KQ + 1, KQ, 2):
				if gt(p, q) == 1 and Rn.next() < .08:
					deco(pk(["bones", "rubble", "blood", "cobweb", "skull"]), p, q)
		var CLO := [["rg_ross", 3], ["rg_reiter", 2.4], ["rg_riese", 1.4], ["rg_koenig", 1.6], ["rg_armritter", 1.6], ["rg_templer", 1.2], ["rg_hellebard", 1.6]]
		for k in 12:
			var p := ri(C0 + 4, K0 - 4)
			var q := ri(-CQ2 + 4, CQ2 - 4)
			if gt(p, q) == 4 or gt(p, q) == 7:
				spawn([["rg_ross", 4], ["rg_reiter", 3], ["rg_koenig", 1], ["rg_armritter", 1]], p, q, ri(2, 3), "clo", .15)
		for pqn in [[190, 0, 3], [200, 0, 3], [210, 0, 3], [191, -16, 3], [191, 16, 3], [207, -16, 3], [207, 16, 3]]:
			spawn(CLO, pqn[0], pqn[1], pqn[2], "church", .2)
		for pq in [[HB + 4, -8], [HB + 4, 8]]:
			spawn([["rg_koenig", 2], ["rg_riese", 1]], pq[0], pq[1], 2, "church", .5)
		var c := wc(HB + 14, 0)
		B(c[0], c[1]).rgBoss = {"x": c[0], "y": c[1]}

	# ----- the dark red forest -----
	func _forest() -> void:
		const F0 := 243
		const F1 := 430
		const C1 := 242
		for q in range(-2, 3):
			st(C1 + 1, q, 7)
		var clear := []
		var towers := []
		for k in 7:
			var p := F0 + 16 + k * 25 + ri(-3, 3)
			var s := 1 if k % 2 else -1
			var q := DeadLands.path(p) + s * ri(14, 22)
			if absi(q) > DeadLands.hw(p) - 10:
				continue
			huts.append([p, q])
			clear.append([p + 2, q + 2, 7.0])
		for k in 9:
			var p := F0 + 10 + k * 20 + ri(-4, 4)
			var s := 1 if Rn.next() < .5 else -1
			var q := DeadLands.path(p) + s * ri(30, 52)
			if absi(q) > DeadLands.hw(p) - 8:
				continue
			towers.append([p, q])
			clear.append([p + 2, q + 2, 4.5])
		var near_clear := func(p: int, q: int) -> bool:
			for c in clear:
				if Vector2(p - c[0], q - c[1]).length() < c[2]:
					return true
			return false
		for p in range(F0, F1):
			var c := DeadLands.path(p)
			for q in range(c - 2, c + 3):
				if gt(p, q):
					st(p, q, 7 if Rn.next() < .72 else 4)
		for p in range(F0 + 1, F1):
			var h := int(floor(DeadLands.hw(p))) - 1
			var c := DeadLands.path(p)
			for q in range(-h, h + 1):
				if absi(q - c) < 4 or near_clear.call(p, q) or gt(p, q) != 4:
					continue
				var r := Rn.next()
				if r < .15:
					blk("rgtree" if Rn.next() < .8 else "rgdead", p, q)
				elif r < .21:
					deco(pk(["leaves", "leaves", "roots", "moss", "shrooms", "bones"]), p, q)
		for p in range(F0, F1, 2):
			var c := DeadLands.path(p)
			if Rn.next() < .5:
				var k: String = pk(["leaves", "pebbles", "roots"])
				deco(k, p, c + ri(-2, 2))
		for i in huts.size():
			var p: int = huts[i][0]
			var q: int = huts[i][1]
			bld("rghut", p, q, 4, 4, i % 3)
			var cp := p + 2
			var cq := q + (-2 if q > DeadLands.path(p) else 6)
			prop("rgcaul", cp, cq)
			blk("cage", p - 2, q + 1)
			deco("skull", p + 5, q + 2)
			deco("bones", p - 1, q + 4)
			obj({"type": "rghut", "idx": i, "name": "Hexenhaus"}, p + 2, q + 2)
			spawn([["rg_hexe", 3], ["rg_knecht", 2]], cp + 1, cq + 1, 3, "wood", .4)
		for i in towers.size():
			bld("rgtower", towers[i][0], towers[i][1], 4, 4, i % 3)
		var WOOD := [["rg_hexe", 2], ["rg_knecht", 2.4], ["rg_waldjaeger", 2], ["blutspinne", 2], ["riesenspinne", .8], ["schattenspinne", 1.6], ["moorghul", 1.4], ["glutgeist", 1]]
		for k in 46:
			var p := ri(F0 + 6, F1 - 6)
			var c := DeadLands.path(p)
			var q := c + ri(-3, 3) if Rn.next() < .6 else ri(-60, 60)
			if gt(p, q) != 4 and gt(p, q) != 7:
				continue
			spawn(WOOD, p, q, ri(2, 4), "wood", .14)

	# ----- the castle: a statue-lined plaza, a chasm, one bridge, and the gate -----
	func _castle() -> void:
		const F1 := 430
		street(F1 - 6, -8, 435, 8)
		for p in range(F1 - 4, 434, 4):
			for s in [-1, 1]:
				blk("statue", p, s * 10)
				prop("brazier", p + 2, s * 7)
		for p in range(436, 442):
			var h := DeadLands.hw(p)
			for q in range(-int(h) - 2, int(h) + 3):
				st(p, q, 0)
		for p in range(436, 442):
			for q in range(-2, 3):
				st(p, q, 8)
			for q in [-3, 3]:
				st(p, q, 9, 8)
				var at := wg._rg_w(p, q)
				B(at.x, at.y).blocks.append({"i": at.x, "j": at.y, "k": "parapet", "v": 0 if absi(p) % 3 else 1})
		street(442, -14, 451, 14)
		bld("rgcastle", 452, -16, 16, 16, 0, {"u": 7})
		# the browser walks q from -hw(p), a fraction, so it never meets a whole tile: the ground behind the castle stays open
		for p in range(452, P1):
			var h := DeadLands.hw(p)
			if h != floor(h):
				continue
			for q in range(-int(h), int(h) + 1):
				if gt(p, q) == 4:
					st(p, q, 9, 4)
		# the painted walls reach past the footprint: tiles that sit visually behind them are closed
		var cc := wg._rg_w(452, -1)
		for p in range(438, 452):
			for q in range(-36, 37):
				var t := gt(p, q)
				if t != 7 and t != 4:
					continue
				var at := wg._rg_w(p, q)
				var dx := at.x - cc.x
				var dy := at.y - cc.y
				var sx := absi(dx - dy) * 32.0
				var sy := (dx + dy) * 16.0
				var bot := 20 - sx * .5 if sx <= 120 else (-16.0 if sx <= 190 else (-70.0 if sx <= 440 else -sx * .5))
				if sy + 12 < bot:
					st(p, q, 9, t)
		obj({"type": "rgcgate", "name": "Tor der Riesenburg"}, 451, -1)
		for s in [-1, 1]:
			prop("brazier", 449, s * 5)
			blk("statue", 446, s * 12)
		for k in 18:
			var p := ri(436, 476)
			var sg: int = pk([-1, 1])
			var c := wc(p, sg * ri(34, 86))
			var r := {"k": "rgrock", "x": c[0], "y": c[1]}
			r.v = ri(0, 3)
			r.ph = rr(0, 6)
			B(c[0], c[1]).props.append(r)
		spawn([["rg_koenig", 2], ["rg_riese", 1], ["rg_hellebard", 2]], 420, 0, 4, "castle", .5)
		spawn([["rg_koenig", 2], ["rg_armritter", 2]], 446, 0, 3, "castle", .6)

static func plan(wg: WorldGen) -> Plan:
	if not wg._rg.has("plan"):
		var pl := Plan.new(wg)
		pl.build()
		wg._rg.plan = pl
		wg._rg.huts = pl.huts.map(func(h): return pl.wc(h[0] + 2, h[1] + 2))
	return wg._rg.plan

# ---------- into the world (rgFill, rgCause, the owContent and owSpawn wrappers) ----------

## copy the plan into the world as chunks come into view
static func fill(wg: WorldGen, cx: int, cy: int) -> void:
	var key := "rg%d,%d" % [cx, cy]
	if wg.gen.has(key):
		return
	wg.gen[key] = true
	var on := wg._rg_chunk(cx, cy)
	if (cx == wg._rg.gcx and cy == wg._rg.gcy) or on:
		_cause(wg)
	if not on:
		return
	var pl := plan(wg)
	var open := Game.ow_boss.has("rgk")
	for j in range(cy * CH, cy * CH + CH):
		for i in range(cx * CH, cx * CH + CH):
			var l := wg._rg_l(i, j)
			var k := pl.ix(l.x, l.y)
			if k < 0 or not pl.T[k]:
				continue
			var w := j * wg.w + i
			var t := pl.T[k]
			if open and k in pl.gate:
				t = 1
			wg.t[w] = t
			wg.under[w] = pl.U[k]

## the causeway: a stone bridge from the dead-gate island to the city gate
static func _cause(wg: WorldGen) -> void:
	if wg.gen.has("rgc"):
		return
	wg.gen["rgc"] = true
	wg.ow_island_base(wg._rg.gcx, wg._rg.gcy)
	var I = wg.island_of(wg._rg.gcx, wg._rg.gcy)
	var g := wg._rg_l(int(floor(I.x)), int(floor(I.y)))
	var cells := []
	for q in range(mini(g.y, 0) - 1, maxi(g.y, 0) + 2):
		for p in range(g.x - 1, g.x + 2):
			cells.append(Vector2i(p, q))
	for p in range(g.x - 1, -4):
		for q in range(-1, 2):
			cells.append(Vector2i(p, q))
	for c in cells:
		var at := wg._rg_w(c.x, c.y)
		var k := at.y * wg.w + at.x
		if not wg.t[k]:
			wg.t[k] = 8
			wg.under[k] = 0
	for c in cells:
		for d in WorldGen.DIRS:
			if c.x + d[0] > -5:
				continue
			var at := wg._rg_w(c.x + d[0], c.y + d[1])
			var k := at.y * wg.w + at.x
			if wg.t[k]:
				continue
			wg.t[k] = 9
			wg.under[k] = 8
			var ck := "%d,%d" % [int(floor(at.x / float(CH))), int(floor(at.y / float(CH)))]
			if not wg.bblocks.has(ck):
				wg.bblocks[ck] = []
			wg.bblocks[ck].append({"i": at.x, "j": at.y, "k": "parapet", "v": 2 if wg.hsh(at.x, at.y, 11) < .2 else (0 if wg.hsh(at.x, at.y, 12) < .5 else 1)})

## the dead gate's island and the chunks of the dead lands get their part (the owContent wrapper of 520)
static func content(wg: WorldGen, c: Dictionary, cx: int, cy: int) -> void:
	var R := wg.R
	if cx == wg._rg.gcx and cy == wg._rg.gcy:
		var I = wg.island_of(cx, cy)
		c.lvl = lvl(wg)
		var at := func(dx: int, dy: int) -> Array: return [floor(I.x) + dx + .5, floor(I.y) + dy + .5]
		var a: Array = at.call(-3, -3)
		c.objs.append({"type": "shrine", "ow": true, "key": "%d,%d" % [cx, cy], "name": "Leuchtfeuer am Totentor", "x": a[0], "y": a[1]})
		a = at.call(3, -3)
		c.objs.append({"type": "rgsign", "name": "Ein verwitterter Wegstein", "x": a[0], "y": a[1]})
		for k in 10:
			var an := k / 10.0 * 6.283
			var x := int(floor(I.x + cos(an) * 7))
			var y := int(floor(I.y + sin(an) * 7))
			if wg.t[y * wg.w + x] == 4 and k % 3:
				wg.under[y * wg.w + x] = 4
				wg.t[y * wg.w + x] = 9
				c.blocks.append({"i": x, "j": y, "k": "grave", "v": k % 3})
		for k in 14:
			var d := {"k": R.pick(["bones", "skull", "tuft", "moss"])}
			d.x = I.x + R.rnd(-8, 8)
			d.y = I.y + R.rnd(-8, 8)
			d.v = R.rint(0, 3)
			c.deco.append(d)
		for k in 4:
			var dx := R.rint(-5, 5)
			a = at.call(dx, R.rint(2, 6))
			c.spawn.append({"vid": R.pick(["rg_bauer", "rg_buerger", "rg_bleich"]), "x": a[0], "y": a[1], "rank": "normal", "rgz": "gate"})
	if not wg._rg_chunk(cx, cy):
		return
	var pl := plan(wg)
	var b = pl.bk.get("%d,%d" % [cx, cy])
	var p := wg._rg_l(cx * CH + 16, cy * CH + 16).x
	c.lvl = lvl(wg) + (0 if p < 136 else (2 if p < 184 else (3 if p < 243 else (6 if p < 436 else 9))))
	if b == null:
		return
	c.objs.append_array(b.objs)
	c.props.append_array(b.props)
	c.deco.append_array(b.deco)
	c.blocks.append_array(b.blocks)
	c.spawn.append_array(b.spawn.map(func(s): return s.duplicate()))
	if b.has("rgBoss"):
		c.rgBoss = b.rgBoss

## the hind gate of the cloister rises once Ser Haldor has fallen (rgOpenGate)
static func open_gate(wg: WorldGen) -> void:
	for q in range(-2, 3):
		var at := wg._rg_w(242, q)
		wg.t[at.y * wg.w + at.x] = 1

# ---------- in play (rgTick, rgDark, the interact and drawObj wrappers of 550) ----------

static func tick(L: Level, dt: float) -> void:
	var wg: WorldGen = L.ow.wg
	var want := 0.0
	if zone == "church":
		want = .9
	elif zone == "wood":
		want = .62
	dark += (want - dark) * minf(1, dt * 2.5)
	var l := wg._rg_l(int(floor(L.P.x)), int(floor(L.P.y)))
	var kc := clampf((l.x - 414) / 26.0, 0, 1) if absi(l.y) < 92 else 0.0
	ck += (kc - ck) * minf(1, dt * 1.5)
	if absf(dark - want) < .005:
		dark = want
	_zt -= dt
	if _zt > 0:
		return
	_zt = .25
	var z = zone_at(wg, L.P.x, L.P.y)
	if z != null:
		var nm := "%s · Stufe %d" % [ZN[z], lvl(wg) + ZLVL[z]]
		if Game.place != nm:
			Game.place = nm
		Game.mlvl = lvl(wg) + ZLVL[z]
	if z != zone:
		zone = z
		if z != null:
			if not S().seen.has(z):
				S().seen[z] = 1
				Game.banner.emit(ZN[z].to_upper(), SUB.get(z, ""), "boss")
				L.get_tree().current_scene.save_game()
		else:
			Game.place = wg.place_name(L.P.x, L.P.y)
	if z == "wood":
		var H: Array = wg._rg.get("huts", [])
		for i in H.size():
			if not S().hut.has(str(i)) and Vector2(H[i][0] - L.P.x, H[i][1] - L.P.y).length() < 6:
				S().hut[str(i)] = 1
				Game.log_msg("Ein Hexenhaus. Grünes Licht hinter den Fenstern.", Color("#9ae050"))
	if Game.ow_boss.has("rgk"):
		var at := wg._rg_w(242, 0)
		if wg.t[at.y * wg.w + at.x] == 9:
			open_gate(wg)

## where the camera looks: near the castle halfway towards its towers, so the walls can loom over the hero (the camera
## drift of rgTick; the browser also pulls back to fit the whole burg, which would break the whole pixels here)
static func cam_pull(L: Level) -> Vector2:
	if ck < .005 or L.ow == null:
		return Vector2.ZERO
	var v := L.ow.wg._rg_w(466, -8)
	return (Vector2(v.x, v.y) - Vector2(L.P.x, L.P.y)) * ck * .5

## the darkness of the church and the forest: blood red under the trees, near black in the church (darkFill)
static func dark_color() -> Color:
	return Color8(22, 2, 6) if zone == "wood" else Color8(4, 3, 2)

static func prop_light(p: Dictionary):
	return LIGHT.get(p.k)

static func obj_name(o: Dictionary) -> String:
	return o.get("name", "")

static func interact(L: Level, o: Prop) -> void:
	var host = L.get_tree().current_scene
	match o.p.type:
		"rgcgate":
			_say(host, "Tor der Riesenburg", "Das Tor ist höher als der Schwarze Turm. Kein Riegel, kein Schloss, kein Griff. Nur ein Wappen aus Gold, und dahinter ein Herzschlag aus Stein.",
				"Es ist verschlossen. Noch.", "Zurücktreten")
		"rgsign":
			_say(host, "Ein verwitterter Wegstein", "„Hinter dieser Brücke liegt die stille Stadt. Wer weitergeht, kehrt nicht als derselbe zurück. Wer gar nicht zurückkehrt, bleibt. Für immer.“",
				"Darunter, frisch gekratzt: ein Pfeil nach Westen.", "Weitergehen")
		"rghut":
			Game.log_msg("Die Tür ist mit Knochen vernagelt.", Color("#a39b88"))

static func _say(host, title: String, text: String, hint: String, btn: String) -> void:
	var pv := Ui.plate(12, Vector4(22, 14, 22, 20))
	var p: PanelContainer = pv[0]
	p.custom_minimum_size = Vector2(minf(440, host.ui.area().x - 32), 0)
	var v: VBoxContainer = pv[1]
	v.add_child(Ui.heading(title, 30))
	var l := Ui.label(text, 15)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(l)
	var h := Ui.hint(hint, 13)
	h.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	v.add_child(h)
	v.add_child(Ui.button(btn, func(): host.close_menu()))
	host._menu = "rg"
	host.ui.open_modal(p, host.close_menu)

# ---------- drawing (the drawProp and drawObj wrappers of 530 and 550) ----------

static func is_rg(k) -> bool:
	return String(k).begins_with("rg")

static func prop(ci: Prop, p: Dictionary, sx: float, sy: float, t: float) -> void:
	match p.k:
		"rglamp":
			Prop.shadow(ci, sx, sy, .2)
			ci.draw_rect(Rect2(sx - 1.5, sy - 48, 3, 48), Color("#16161a"))
			ci.draw_rect(Rect2(sx - 6, sy - 50, 12, 2), Color("#16161a"))
			ci.draw_rect(Rect2(sx + 3, sy - 50, 6, 10), Color("#2a2a30"))
			Prop.flame(ci, sx + 6, sy - 42, 4, p.ph, t)
			return
		"rgcaul":
			_cauldron(ci, p, sx, sy, t)
			return
		"rgrock":
			_rock(ci, p, sx, sy, t)
			return
		"rgportc":
			_portcullis(ci, p)
			return
	var key := "rg/%s/%d/%dx%d" % [p.k, p.v, p.get("fw", 1), p.get("fh", 1)]
	if not Data.sprites.has(key):
		return
	var m: Dictionary = Data.sprites[key]
	var col := Color.WHITE
	var L = ci.get_parent().get_parent()
	if p.k != "rgcastle" and L is Level:
		# a building between the hero and the camera turns see-through
		var ps := Iso.to_screen(Vector2(L.P.x, L.P.y)) - ci.position
		if p.x + p.y > L.P.x + L.P.y + .4 and absf(sx - ps.x) < (p.fw + p.fh) * 18 and ps.y < sy + 10 and ps.y > sy - float(m.ay) + 20:
			col.a = .42
	ci.draw_texture(Data.sprite(key), Vector2(sx - float(m.ax), sy - float(m.ay)), col)
	if p.k == "rghut":
		for k in 2:
			var ph := fmod(t * .5 + k * .5 + p.ph, 1.0)
			ci.draw_circle(Vector2(sx + (10 if p.v % 2 else -6) + ph * 8, sy - float(m.ay) + 40 - ph * 40), 4 + ph * 8, Color(90 / 255.0, 90 / 255.0, 80 / 255.0, .35 * (1 - ph)))

static func _cauldron(ci: Prop, _p: Dictionary, sx: float, sy: float, t: float) -> void:
	Prop.shadow(ci, sx, sy, .32)
	for k in 3:
		var a := k * 2.1 + t * .2
		ci.draw_rect(Rect2(sx + cos(a) * 10 - 1, sy - 4 + sin(a) * 4, 2, 6), Color("#1a1410"))
	Prop.ellipse(ci, sx, sy - 4, 10, 4, Color(120 / 255.0, 1, 110 / 255.0, .45))
	var half := PackedVector2Array()
	for k in 17:
		var a := PI * k / 16.0
		half.append(Vector2(sx + cos(a) * 13, sy - 14 + sin(a) * 10))
	ci.draw_colored_polygon(half, Color("#0c0c10"))
	Prop.ellipse(ci, sx, sy - 14, 13, 4, Color("#0c0c10"))
	Prop.ellipse(ci, sx, sy - 15, 10, 3, Color("#3ac83a"))
	for k in 3:
		var b := fmod(t * 1.4 + k * .33, 1.0)
		ci.draw_circle(Vector2(sx - 6 + k * 6, sy - 16 - b * 14), 1.5 + b * 2, Color(180 / 255.0, 1, 150 / 255.0, 1 - b))

## rocks hang in the air round the castle and bob slowly
static func _rock(ci: Prop, p: Dictionary, sx: float, sy: float, t: float) -> void:
	var z: float = 70 + (p.v * 37) % 90 + sin(t * .6 + p.ph) * 8
	var s: float = [1.0, 1.4, .8, 1.8][p.v]
	Prop.ellipse(ci, sx, sy + 30, 16 * s, 6 * s, Color(0, 0, 0, .18))
	var o := Vector2(sx, sy - z)
	var P := func(x: float, y: float) -> Vector2: return o + Vector2(x, y) * s
	ci.draw_colored_polygon(PackedVector2Array([P.call(-16, 0), P.call(-10, 14), P.call(-2, 26), P.call(6, 16), P.call(15, 2)]), Color("#2e2a26"))
	ci.draw_colored_polygon(PackedVector2Array([P.call(-16, 0), P.call(-10, 14), P.call(-2, 26), P.call(-4, 6)]), Color("#4a443c"))
	Prop.ellipse(ci, o.x, o.y, 16 * s, 6 * s, Color("#4a7a2a"))
	Prop.ellipse(ci, o.x - 3 * s, o.y - s, 10 * s, 3.5 * s, Color("#6a9a3a"))

## the cloister's hind gate: two pillars and an iron grille that rises once its lord has fallen
static func _portcullis(ci: Prop, p: Dictionary) -> void:
	var lift := minf(1, Game.rg.get("open_t", 1.0)) if Game.ow_boss.has("rgk") else 0.0
	var ax: bool = p.fw > p.fh
	var L: float = (p.fw if ax else p.fh) / 2.0
	var key := "rg/rgpillar/0/1x1"
	var m: Dictionary = Data.sprites[key]
	var tex := Data.sprite(key)
	var e0 := Vector2(p.x - (L if ax else 0.0), p.y - (0.0 if ax else L))
	var e1 := Vector2(p.x + (L if ax else 0.0), p.y + (0.0 if ax else L))
	var a := Iso.to_screen(e0) - ci.position
	var b := Iso.to_screen(e1) - ci.position
	var h := WH + 10
	var off := lift * (h - 6)
	for k in 9:
		var u := k / 8.0
		var x := lerpf(a.x, b.x, u)
		var y := lerpf(a.y, b.y, u)
		var y0 := maxf(y - off - h, y - h - 4)
		var y1 := y - off
		if y1 > y0:
			ci.draw_line(Vector2(x, y0), Vector2(x, y1), Color("#2a2c33"), 3)
			ci.draw_line(Vector2(x - 1, y0), Vector2(x - 1, y1), Color("#787d88"), 1)
	var z := 6.0
	while z < h:
		if z + off <= h + 4:
			ci.draw_line(a - Vector2(0, z + off), b - Vector2(0, z + off), Color("#2a2c33"), 3)
		z += 10
	for e in [a, b]:
		ci.draw_texture(tex, e - Vector2(float(m.ax), float(m.ay)))

static func obj(ci: Prop, o: Dictionary, sx: float, sy: float, _t: float) -> void:
	if o.type != "rgsign":
		return
	# a weathered waystone with a fresh arrow scratched under the old words
	Prop.shadow(ci, sx, sy, .3)
	var top := PackedVector2Array([Vector2(sx - 9, sy), Vector2(sx - 8, sy - 30)])
	for k in range(1, 8):
		var u := k / 8.0
		top.append(Vector2(sx - 8, sy - 30).lerp(Vector2(sx, sy - 38), u).lerp(Vector2(sx, sy - 38).lerp(Vector2(sx + 8, sy - 30), u), u))
	top.append_array([Vector2(sx + 8, sy - 30), Vector2(sx + 9, sy)])
	ci.draw_colored_polygon(top, Color("#3a3632"))
	ci.draw_rect(Rect2(sx - 8, sy - 30, 4, 30), Color("#5a544c"))
	for k in 4:
		ci.draw_rect(Rect2(sx - 5, sy - 26 + k * 5, 10, 1.4), Color("#1a1614"))
	ci.draw_rect(Rect2(sx - 4, sy - 8, 8, 1.5), Color("#ff9a3a"))
	ci.draw_colored_polygon(PackedVector2Array([Vector2(sx - 6, sy - 7), Vector2(sx - 3, sy - 10), Vector2(sx - 3, sy - 4)]), Color("#ff9a3a"))

## warm and green light added over the darkness of the church and the forest, and the light shafts of the nave
class Glow extends Node2D:
	var L: Level

	func _init(level: Level) -> void:
		L = level
		var add := CanvasItemMaterial.new()
		add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = add

	func _process(_dt: float) -> void:
		if DeadLands.dark > .01 or visible:
			queue_redraw()

	func _draw() -> void:
		if DeadLands.dark < .01 or L.ow == null:
			return
		var k := clampf(DeadLands.dark / .6, 0, 1)
		var t := Game.t
		for p in L.ow.wg.live("props"):
			var Lt = L.prop_light(p)
			if Lt == null:
				continue
			var sp := Iso.to_screen(Vector2(p.x, p.y))
			if p.k == "shaft":
				var fl := .85 + sin(t * .7 + p.ph) * .15
				var tp := sp + Vector2(-70, -330)
				for wa in [[46.0, 26.0, .07], [26.0, 12.0, .1]]:
					var c0 := Color(210 / 255.0, 226 / 255.0, 1, wa[2] * 1.4 * fl * k)
					var c1 := Color(200 / 255.0, 218 / 255.0, 1, 0)
					draw_polygon(PackedVector2Array([tp - Vector2(wa[1], 0), tp + Vector2(wa[1], 0), sp + Vector2(wa[0], 0), sp - Vector2(wa[0], 0)]), PackedColorArray([c0, c0, c1, c1]))
				continue
			if Lt.col == null:
				continue
			var r: float = Lt.r * .78
			draw_texture_rect(Level._glow_tex, Rect2(sp - Vector2(r, r + Lt.get("h", 14)), Vector2(r, r) * 2), false, Color(Lt.col, .17 * k))

# ---------- checks (--rghash, tools/godot-rghash.js) ----------

static func _h(s: String) -> int:
	var hh := 0
	for c in s.to_utf8_buffer():
		hh = (hh * 31 + c) % 1000000007
	return hh

static func _c(x: float) -> String:
	return str(WorldGen.jround(x * 100))

## the same lines as tools/godot-rghash.js prints in the browser for the same seed
static func hash_text(wg: WorldGen) -> String:
	var out := []
	var pl := plan(wg)
	out.append("Lage %s %d · Tor %d,%d" % [wg._rg.ax, wg._rg.c, wg._rg.gcx, wg._rg.gcy])
	var fh := 0
	for k in pl.T.size():
		fh = (fh * 31 + pl.T[k] * 7 + pl.U[k]) % 1000000007
	out.append("Felder %d · Tor %s" % [fh, " ".join(pl.gate.map(func(k): return str(k)))])
	var L := {"props": [], "blocks": [], "deco": [], "spawn": [], "objs": []}
	for key in pl.bk:
		var b: Dictionary = pl.bk[key]
		for p in b.props:
			L.props.append("%s %s@%s,%s v%d f%dx%d p%s" % [key, p.k, _c(p.x), _c(p.y), p.v, p.get("fw", 0), p.get("fh", 0), _c(p.ph)])
		for q in b.blocks:
			L.blocks.append("%s %s@%d,%d v%d" % [key, q.k, q.i, q.j, q.v])
		for d in b.deco:
			L.deco.append("%s %s@%s,%s v%d" % [key, d.k, _c(d.x), _c(d.y), d.v])
		for s in b.spawn:
			L.spawn.append("%s %s@%s,%s %s %s" % [key, s.vid, _c(s.x), _c(s.y), s.rank, s.rgz])
		for o in b.objs:
			L.objs.append("%s %s@%s,%s" % [key, o.type, _c(o.x), _c(o.y)])
		if b.has("rgBoss"):
			L.objs.append("%s boss@%s,%s" % [key, _c(b.rgBoss.x), _c(b.rgBoss.y)])
	for k in ["props", "blocks", "deco", "spawn", "objs"]:
		out.append("%s %d %d" % [k, L[k].size(), _h(" ".join(L[k]))])
	out.append("Hütten " + " ".join(wg._rg.huts.map(func(h): return _c(h[0]) + "," + _c(h[1]))))
	out.append("Chunks %d" % pl.bk.size())
	# into the world: the gate island, the causeway and three chunks of the land
	var g := Vector2i(wg._rg.gcx, wg._rg.gcy)
	var at := [g]
	for pq in [[60, 8], [200, 0], [330, 0]]:
		var v := wg._rg_w(pq[0], pq[1])
		at.append(Vector2i(v.x / CH, v.y / CH))
	for a in at:
		wg.ow_island(a.x, a.y)
	var wh := 0
	for a in at:
		for j in range(a.y * CH - 4, a.y * CH + CH + 4):
			for i in range(a.x * CH - 4, a.x * CH + CH + 4):
				var k := j * wg.w + i
				wh = (wh * 31 + wg.t[k] * 7 + wg.under[k]) % 1000000007
	out.append("Welt %d" % wh)
	for a in at.slice(1):
		var c := wg.ow_content(a.x, a.y)
		out.append("%d,%d: lvl %d Deko %d Blöcke %d Requisiten %d Objekte %d Gegner %d Büschel %d" % [a.x, a.y, c.lvl, c.deco.size(), c.blocks.size(), c.props.size(), c.objs.size(), c.spawn.size(), c.lv.tuft.size()])
	var gc := wg.ow_content(g.x, g.y)
	out.append("Tor: lvl %d Objekte %s Blöcke %d" % [gc.lvl, " ".join(gc.objs.map(func(o): return o.type + "@" + _c(o.x) + "," + _c(o.y))), gc.blocks.size()])
	return "\n".join(out)
