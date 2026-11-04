class_name WorldGen
extends RefCounted
## The endless sky (300-endless-sky.js): a world of 2560×2560 tiles, islands in chunks of 32, joined by bridges,
## built around the hero as he walks (owTick). With the great islands (820-meadow.js), the eight island lords' places
## (310-overworld-bosses.js) and the dead gate with the three islands before it (510-dead-lands.js; the dead lands
## themselves are not filled yet). Every roll hangs on hsh(cx, cy, n) and the seed, so a chunk comes out the same as in
## the browser. The home island is genTown (080-maps.js) with decorateTown (230-environment.js), set in at HOX, HOY.

const WS := 2560
const CH := 32
const HOX := 1248
const HOY := 1248
const M32 := 0xFFFFFFFF
const DIRS := [[1, 0], [-1, 0], [0, 1], [0, -1]]
const OW_KIND := [["wild", 24], ["forest", 15], ["village", 22], ["ruins", 12], ["grave", 10], ["camp", 12], ["rock", 5]]
const BIGK := [["wild", 26], ["forest", 20], ["village", 18], ["ruins", 14], ["grave", 10], ["camp", 12]]
const KINDN := {"wild": "Wilde Insel", "forest": "Waldinsel", "village": "Brennendes Dorf", "ruins": "Ruinen", "grave": "Gräberinsel", "camp": "Lager", "rock": "Felsinsel", "rgate": "Totentor"}
const FIRE_A := ["Krähen", "Asche", "Nebel", "Wolfs", "Toten", "Stern", "Wind", "Grau", "Dorn", "Raben", "Glut", "Stein", "Mond", "Eisen", "Kalt", "Dunkel"]
const FIRE_B := ["fels", "hain", "rast", "feld", "kamm", "horst", "furt", "wacht", "grat", "senke"]
const TRADERS := [["Bertrun", "„Was du nicht tragen kannst, kauf ich dir ab.“"], ["Halmar", "„Die Brücken halten. Meistens.“"], ["Ysolde", "„Klingen aus den Ruinen, kaum benutzt.“"], ["Gerwin", "„Glut gegen Ware, so war es immer.“"],
	["Mira", "„Hier oben kommt selten jemand lebend an.“"], ["Oswin", "„Ich hab gesehen, was in den Dörfern haust.“"], ["Tilda", "„Feuer brennt, Gold glänzt, ich handle.“"], ["Brannoc", "„Kauf, bevor die Krähen es holen.“"]]
# trader names (490-npc-talk.js)
const TN1 := ["Bertrun", "Halmar", "Ysolde", "Gerwin", "Mira", "Oswin", "Tilda", "Ansgar", "Hedda", "Kunrat", "Liutgard", "Volkmar", "Rike", "Edelbert", "Swanhild", "Godeke", "Imma", "Ortwin", "Berthe", "Reinold", "Adelheid", "Lambert", "Gisla", "Wido", "Hiltrud", "Jorek", "Mechthild", "Ruprecht", "Fenna", "Dietlind", "Amalric", "Odo", "Wendel", "Ragna", "Notker", "Gunda"]
const TN2 := ["aus Dornfurt", "vom Grauen Steg", "aus der Nebelsenke", "vom Rabenfels", "aus Kesselbrunn", "Krummfinger", "Silberzahn", "vom Aschepass", "Halbmond", "aus Wolfsgrund", "Lederhand", "vom Kalten Moor", "Rußbart", "aus Brückwacht", "Eisenzunge", "vom Hohen Riff"]
# the island lords (WB in 310-overworld-bosses.js, the fire dragon from 660-fire-dragons.js); their colours wait for the boss sheets
const WB := [
	{"id": "wb0", "n": "Rußklaue, Plünderer der Dörfer", "short": "Rußklaue", "look": "knight", "moves": ["slam", "sweep", "charge"], "dist": 4.5, "scale": 2.1, "min": ["skel", "ghoul"]},
	{"id": "wb1", "n": "Die Nebelweberin", "short": "der Nebelweberin", "look": "weaver", "moves": ["nova", "summon", "sweep"], "dist": 6.5, "scale": 2.1, "min": ["wraith", "spider"]},
	{"id": "wb2", "n": "Moosfaust, der Grabwächter", "short": "Moosfaust", "look": "warden", "moves": ["slam", "charge", "nova"], "dist": 8.5, "scale": 2.3, "min": ["ghoul", "golem"]},
	{"id": "wb3", "n": "Kaltherz von der Frostfurt", "short": "Kaltherz", "look": "knight", "moves": ["slam", "sweep", "charge", "nova"], "dist": 11.0, "scale": 2.3, "min": ["wraith", "archer"]},
	{"id": "wb4", "n": "Die Brutkönigin", "short": "der Brutkönigin", "look": "weaver", "moves": ["summon", "nova", "meteor"], "dist": 14.0, "scale": 2.4, "min": ["spider", "scorp"]},
	{"id": "wb5", "n": "Glutkoloss Vharn", "short": "Vharn", "look": "warden", "moves": ["slam", "meteor", "charge", "nova", "sweep"], "dist": 17.0, "scale": 2.6, "min": ["golem", "cult"]},
	{"id": "wb6", "n": "Der Schattenkönig", "short": "dem Schattenkönig", "look": "knight", "moves": ["slam", "sweep", "charge", "meteor", "nova"], "dist": 21.0, "scale": 2.5, "min": ["wraith", "cult"]},
	{"id": "wb7", "n": "Aschemutter, die Letzte", "short": "der Aschemutter", "look": "weaver", "moves": ["nova", "summon", "meteor", "sweep"], "dist": 26.0, "scale": 2.7, "min": ["cult", "skel", "golem"]},
	{"id": "wb8", "n": "Vyrthrax, der Feuerdrache", "short": "Vyrthrax", "look": "dragon", "moves": ["meteor", "sweep", "charge", "nova"], "dist": 29.0, "scale": 3.1, "min": ["feuerdrache", "glutdrache"]}]
const ALL := ["skel", "archer", "ghoul", "spider", "cult", "wraith", "golem", "scorp", "dragon"]

var seed := 0
var w := WS
var h := WS
var t := PackedByteArray()
var under := PackedByteArray()
var gen := {}                    # what is built already: chunk keys, bridge keys, great islands
var cdata := {}                  # chunk key → its content (owContent)
var bblocks := {}                # chunk key → railing posts of the bridges in it
var bw := {}                     # tile → 1 or 2: a plank bridge running along x or y
var active := {}                 # the chunks awake around the hero
var ac := ""                     # the chunk the hero stood in at the last tick
var home := {}                   # objs, props, deco, blocks of the home island
var tower := {}
var arena := {}
var start := {}
var wb_at: Array = []            # chunk of each island lord
var _isl := {}                   # islandOf, remembered
var _wbc := {}
var _rg := {}
var R := Rng.unseeded()          # the browser's global R: rolls that are Math.random there

func _init(s: int) -> void:
	seed = s
	t.resize(w * h)
	under.resize(w * h)
	_wb_chunks()
	_rg_init()
	var town := gen_town()
	for j in town.h:
		for i in town.w:
			var k: int = (HOY + j) * w + HOX + i
			t[k] = town.t[j * town.w + i]
			under[k] = town.under[j * town.w + i]
	var sh := func(o: Dictionary) -> Dictionary:
		o.x += HOX
		o.y += HOY
		return o
	home = {"objs": town.objs.map(sh), "props": town.props.map(sh), "deco": town.deco.map(sh), "blocks": town.blocks.map(_shift_block)}
	tower = {"x": town.tower.x + HOX, "y": town.tower.y + HOY}
	arena = {"x": town.arena.x + HOX, "y": town.arena.y + HOY, "r": town.arena.r}
	start = {"x": town.start.x + HOX, "y": town.start.y + HOY}
	for cy in range(39, 41):
		for cx in range(39, 42):
			gen[_key(cx, cy)] = true

static func _shift_block(b: Dictionary) -> Dictionary:
	b.i += HOX
	b.j += HOY
	return b

static func _key(cx: int, cy: int) -> String:
	return "%d,%d" % [cx, cy]

static func _imul(a: int, b: int) -> int:
	return ((a & M32) * (b & M32)) & M32

## JS Math.round: halves go up
static func jround(v: float) -> int:
	return int(floor(v + .5))

## the world's hash: one number in [0, 1) for a chunk (or tile) and a purpose
func hsh(a: int, b: int, c := 0) -> float:
	var x := _imul(a, 374761393) ^ _imul(b, 668265263) ^ _imul(c + 1, 2246822519) ^ _imul(seed, 3266489917)
	x = _imul(x ^ (x >> 13), 1274126177)
	return float((x ^ (x >> 16)) & M32) / 4294967296.0

static func is_home_c(cx: int, cy: int) -> bool:
	return cx >= 39 and cx <= 41 and cy >= 39 and cy <= 40

static func lvl_at(x: float, y: float) -> int:
	return 1 + int(floor(Vector2(x / CH - 40, y / CH - 39.5).length() * 1.7))

# ---------- the island lords (wbChunks) ----------

func _wb_chunks() -> void:
	for i in WB.size():
		var b: Dictionary = WB[i]
		var a := hsh(i, 77, 3) * 6.283 + i * 2.4
		var cx := clampi(jround(40 + cos(a) * b.dist), 4, WS / CH - 5)
		var cy := clampi(jround(39.5 + sin(a) * b.dist), 4, WS / CH - 5)
		while _wbc.has(_key(cx, cy)) or is_home_c(cx, cy):
			cx += 1
		_wbc[_key(cx, cy)] = i
		wb_at.append(Vector2i(cx, cy))

func wb_pos(i: int) -> Vector2:
	return Vector2(wb_at[i].x * CH + 16.5, wb_at[i].y * CH + 16.5)

# ---------- the dead gate (rgInit, rgChunk in 510-dead-lands.js) ----------

func _rg_init() -> void:
	var a := hsh(91, 17, 5) < .5
	var side := -1 if hsh(92, 18, 6) < .5 else 1
	_rg = {"ax": "x" if a else "y", "c": 1280 + side * 1000}
	var g := _rg_w(-60, 0)
	_rg.gcx = int(floor(g.x / CH))
	_rg.gcy = int(floor(g.y / CH))
	var d := Vector2i(1, 0) if _rg.ax == "x" else Vector2i(0, 1)
	_rg.chain = [1, 2, 3].map(func(k): return _key(_rg.gcx + d.x * k, _rg.gcy + d.y * k))
	_rg.all = [_key(_rg.gcx, _rg.gcy)] + _rg.chain

func _rg_w(p: int, q: int) -> Vector2i:
	var a := 550 - p
	return Vector2i(a, _rg.c + q) if _rg.ax == "x" else Vector2i(_rg.c + q, a)

func _rg_l(x: int, y: int) -> Vector2i:
	var a := x if _rg.ax == "x" else y
	var b := y if _rg.ax == "x" else x
	return Vector2i(550 - a, b - _rg.c)

func _rg_chunk(cx: int, cy: int) -> bool:
	if cx == _rg.gcx and cy == _rg.gcy:
		return false
	var p := _rg_l(cx * CH, cy * CH)
	var q := _rg_l(cx * CH + CH - 1, cy * CH + CH - 1)
	return maxi(p.x, q.x) >= -8 and mini(p.x, q.x) < 480 and maxi(p.y, q.y) >= -92 and mini(p.y, q.y) < 92

# ---------- which island stands in a chunk ----------

func island_of(cx: int, cy: int):
	var k := _key(cx, cy)
	if not _isl.has(k):
		_isl[k] = _island_rg(cx, cy)
	return _isl[k]

## the dead gate's island and the three islands leading to it always exist; the dead lands hold none of their own
func _island_rg(cx: int, cy: int):
	if cx == _rg.gcx and cy == _rg.gcy:
		return {"x": cx * CH + 16.5, "y": cy * CH + 16.5, "r": 11.0, "kind": "rgate", "cx": cx, "cy": cy, "dist": Vector2(cx - 40, cy - 39.5).length()}
	if _rg_chunk(cx, cy):
		return null
	var I = _island_base(cx, cy)
	if I or not _key(cx, cy) in _rg.chain:
		return I
	return {"x": cx * CH + 16.5, "y": cy * CH + 16.5, "r": 9.0, "kind": "wild", "cx": cx, "cy": cy, "dist": Vector2(cx - 40, cy - 39.5).length()}

func _island_base(cx: int, cy: int):
	if cx < 2 or cy < 2 or cx >= WS / CH - 2 or cy >= WS / CH - 2:
		return null
	if cx == 39 and cy == 39:
		return {"x": HOX + 22.5, "y": HOY + 22.5, "r": 13.0, "kind": "home", "cx": cx, "cy": cy, "dist": 0.0}
	if cx == 41 and cy == 39:
		return {"x": HOX + 61.5, "y": HOY + 22.5, "r": 12.0, "kind": "home", "cx": cx, "cy": cy, "dist": 1.0}
	if is_home_c(cx, cy):
		return null
	var wi = _wbc.get(_key(cx, cy))
	if wi != null:
		return {"x": cx * CH + 16.5, "y": cy * CH + 16.5, "r": 12.0, "kind": "boss", "wb": wi, "cx": cx, "cy": cy, "dist": Vector2(cx - 40, cy - 39.5).length()}
	var B = _big_island(cx, cy)
	if B:
		return B
	if hsh(cx, cy, 1) > .84:
		return null
	var x := cx * CH + 16 + jround((hsh(cx, cy, 2) - .5) * 8) + .5
	var y := cy * CH + 16 + jround((hsh(cx, cy, 3) - .5) * 8) + .5
	var r: float = 8 + floor(hsh(cx, cy, 4) * 3.99)
	var dist := Vector2(cx - 40, cy - 39.5).length()
	var k := hsh(cx, cy, 5) * 100
	var kind := "wild"
	for nw in OW_KIND:
		if k < nw[1]:
			kind = nw[0]
			break
		k -= nw[1]
	if dist < 2.6 and kind != "camp" and kind != "rock":
		kind = "wild" if hsh(cx, cy, 6) < .6 else "camp"
	return {"x": x, "y": y, "r": r, "kind": kind, "cx": cx, "cy": cy, "dist": dist}

## some 2×2 blocks of chunks carry one great island, some pairs a long one; every chunk of it answers with the same island
func _big_island(cx: int, cy: int):
	var bx := cx >> 1
	var by := cy >> 1
	var x0 := bx * 2
	var y0 := by * 2
	for a in 2:
		for b in 2:
			var X := x0 + a
			var Y := y0 + b
			if X < 2 or Y < 2 or X >= WS / CH - 2 or Y >= WS / CH - 2 or is_home_c(X, Y) or _wbc.has(_key(X, Y)) or Vector2(X - 40, Y - 39.5).length() < 3.4:
				return null
	var hh := hsh(bx, by, 31)
	var kind_of := func(s: int) -> String:
		var k := hsh(bx, by, s) * 100
		for nw in BIGK:
			if k < nw[1]:
				return nw[0]
			k -= nw[1]
		return "wild"
	if hh < .13:
		var x := (x0 + 1) * CH + jround((hsh(bx, by, 33) - .5) * 6)
		var y := (y0 + 1) * CH + jround((hsh(bx, by, 34) - .5) * 6)
		var r := 15 + hsh(bx, by, 35) * 4.6
		return {"x": x + .5, "y": y + .5, "r": r, "kind": kind_of.call(36), "cx": x0, "cy": y0, "dist": Vector2(x0 + .5 - 40, y0 + .5 - 39.5).length(),
			"big": "mega", "sx": 1.0, "sy": 1.0, "chunks": [[x0, y0], [x0 + 1, y0], [x0, y0 + 1], [x0 + 1, y0 + 1]]}
	if hh < .36:
		var p := int(floor(hsh(bx, by, 37) * 4))
		var hor := p < 2
		var ch: Array = [[x0, y0 + p], [x0 + 1, y0 + p]] if hor else [[x0 + p - 2, y0], [x0 + p - 2, y0 + 1]]
		if not ch.any(func(c): return c[0] == cx and c[1] == cy):
			return null
		var r := 8 + hsh(bx, by, 38) * 2
		var x: int = (x0 + 1) * CH + jround((hsh(bx, by, 39) - .5) * 4) if hor else ch[0][0] * CH + 16 + jround((hsh(bx, by, 39) - .5) * 4)
		var y: int = ch[0][1] * CH + 16 + jround((hsh(bx, by, 40) - .5) * 4) if hor else (y0 + 1) * CH + jround((hsh(bx, by, 40) - .5) * 4)
		return {"x": x + .5, "y": y + .5, "r": r, "kind": kind_of.call(41), "cx": ch[0][0], "cy": ch[0][1], "dist": Vector2(ch[0][0] - 40, ch[0][1] - 39.5).length(),
			"big": "long", "sx": 1.75 if hor else 1.0, "sy": 1.0 if hor else 1.75, "chunks": ch}
	return null

static func same_isl(A, B) -> bool:
	return A != null and B != null and A.has("big") and B.has("big") and A.cx == B.cx and A.cy == B.cy

func _prim_link(cx: int, cy: int):
	var o := DIRS.filter(func(d): return island_of(cx + d[0], cy + d[1]) != null)
	return o[int(floor(hsh(cx, cy, 9) * o.size()))] if o.size() else null

## whether a bridge joins two neighbouring chunks
func link_on(ax: int, ay: int, bx: int, by: int) -> bool:
	if _key(ax, ay) in _rg.all and _key(bx, by) in _rg.all:
		return island_of(ax, ay) != null and island_of(bx, by) != null
	var A = island_of(ax, ay)
	var B = island_of(bx, by)
	if A == null or B == null or same_isl(A, B):
		return false
	if A.kind == "home" or B.kind == "home":
		return true
	if hsh(ax, ay, 8 if bx == ax else 7) < .6:
		return true
	var pa = _prim_link(ax, ay)
	var pb = _prim_link(bx, by)
	return (pa != null and pa[0] == bx - ax and pa[1] == by - ay) or (pb != null and pb[0] == ax - bx and pb[1] == ay - by)

## the old stone bridge, a plank bridge on rope posts, or a land bridge of earth and grass
func bridge_kind(ax: int, ay: int, bx: int, by: int) -> String:
	var A = island_of(ax, ay)
	var B = island_of(bx, by)
	if (A and A.kind == "home") or (B and B.kind == "home"):
		return "stone"
	var hh := hsh(ax * 3 + bx, ay * 3 + by, 43)
	return "stone" if hh < .4 else ("wood" if hh < .72 else "land")

# ---------- building the ground (owIsland, owBridge) ----------

func ow_island(cx: int, cy: int) -> void:
	var key := _key(cx, cy)
	if gen.has(key):
		return
	gen[key] = true
	var I = island_of(cx, cy)
	if I == null or I.kind == "home":
		return
	if I.has("big"):
		var k0 := _key(I.cx, I.cy) + "#big"
		if gen.has(k0):
			return
		gen[k0] = true
	var ph := hsh(I.cx, I.cy, 10) * 6.28
	var x: float = I.x
	var y: float = I.y
	var r: float = I.r
	var sx: float = I.get("sx", 1.0)
	var sy: float = I.get("sy", 1.0)
	var stone_r: float = r * .72 if I.kind == "boss" else (r * .62 if I.kind == "village" or I.kind == "ruins" else (r * .4 if I.kind == "camp" else 0.0))
	var mega: bool = I.get("big", "") == "mega"
	for j in range(int(floor(y - r * sy - 3)), int(floor(y + r * sy + 3)) + 1):
		for i in range(int(floor(x - r * sx - 3)), int(floor(x + r * sx + 3)) + 1):
			var dx := (i + .5 - x) / sx
			var dy := (j + .5 - y) / sy
			var d := sqrt(dx * dx + dy * dy)
			var a := atan2(dy, dx)
			var rr := r + sin(a * 3 + ph) * 1.2 + sin(a * 7 + ph * 2) * .5 + (sin(a * 2 + ph * 3) * 1.6 if mega else 0.0)
			if d < rr:
				var k := j * w + i
				if I.has("big") and t[k]:
					continue
				t[k] = 7 if d < stone_r + sin(a * 5 + ph) * 1.2 else 4
				under[k] = 0

func ow_bridge(ax: int, ay: int, bx: int, by: int) -> void:
	var key := "b%d,%d>%d,%d" % [ax, ay, bx, by]
	if gen.has(key):
		return
	gen[key] = true
	if not link_on(ax, ay, bx, by):
		return
	ow_island(ax, ay)
	ow_island(bx, by)
	var A: Dictionary = island_of(ax, ay)
	var B: Dictionary = island_of(bx, by)
	var bk := bridge_kind(ax, ay, bx, by)
	var hor := by == ay
	var wd := 2 if bk == "wood" else 3
	var put := func(i: int, j: int, par: bool, q: int) -> void:
		var k := j * w + i
		if t[k]:
			if not par and t[k] == 9 and under[k] == 8:
				t[k] = 8
				under[k] = 0
				unpost(i, j)
			return
		if bk == "land":
			t[k] = 4
			under[k] = 0
			return
		if bk == "wood":
			bw[k] = 1 if hor else 2
		if par:
			t[k] = 9
			under[k] = 8
			if bk == "wood" and q % 2:
				return
			var ck := _key(int(floor(i / float(CH))), int(floor(j / float(CH))))
			if not bblocks.has(ck):
				bblocks[ck] = []
			if bk == "wood":
				bblocks[ck].append({"i": i, "j": j, "k": "ropepost", "v": 0 if hor else 1})
			else:
				bblocks[ck].append({"i": i, "j": j, "k": "parapet", "v": 2 if hsh(i, j, 11) < .2 else (0 if hsh(i, j, 12) < .5 else 1)})
		else:
			t[k] = 8
			under[k] = 0
	# a land bridge wanders and swells a little; it has no railing
	var h44 := hsh(ax, ay, 44)
	var h45 := hsh(bx, by, 45)
	var wob := func(q: int) -> int: return jround(sin(q * .35 + h44 * 6) * 1.4) if bk == "land" else 0
	var ext := func(q: int) -> int: return 1 if bk == "land" and sin(q * .6 + h45 * 6) > .55 else 0
	if hor:
		var row := jround((A.y + B.y) / 2) - 1
		for i in range(int(floor(A.x)), int(ceil(B.x)) + 1):
			var o: int = wob.call(i)
			for j in range(row + o - ext.call(i), row + o + wd + ext.call(i + 3)):
				put.call(i, j, false, 0)
			if bk != "land":
				put.call(i, row - 1, true, i)
				put.call(i, row + wd, true, i)
		open_rails(int(floor(A.x)) - 1, int(ceil(B.x)) + 1, row - 4, row + wd + 4)
	else:
		var col := jround((A.x + B.x) / 2) - 1
		for j in range(int(floor(A.y)), int(ceil(B.y)) + 1):
			var o: int = wob.call(j)
			for i in range(col + o - ext.call(j), col + o + wd + ext.call(j + 3)):
				put.call(i, j, false, 0)
			if bk != "land":
				put.call(col - 1, j, true, j)
				put.call(col + wd, j, true, j)
		open_rails(col - 4, col + wd + 4, int(floor(A.y)) - 1, int(ceil(B.y)) + 1)

## where one bridge meets another from the side, a railing post between two walkways would bar the way: open it
func open_rails(i0: int, i1: int, j0: int, j1: int) -> void:
	for _pass in 2:
		for j in range(j0, j1 + 1):
			for i in range(i0, i1 + 1):
				var k := j * w + i
				if t[k] != 9 or under[k] != 8:
					continue
				if (t[k - 1] == 8 and t[k + 1] == 8) or (t[k - w] == 8 and t[k + w] == 8):
					t[k] = 8
					under[k] = 0
					unpost(i, j)

## take the railing post off a bridge tile that has become a walkway
var posts_gone := false
func unpost(i: int, j: int) -> void:
	var ck := _key(int(floor(i / float(CH))), int(floor(j / float(CH))))
	if bblocks.has(ck):
		bblocks[ck] = bblocks[ck].filter(func(b): return not (b.i == i and b.j == j and (b.k == "parapet" or b.k == "ropepost")))
		posts_gone = true

# ---------- what stands on an island (owContent) ----------

func ow_content(cx: int, cy: int) -> Dictionary:
	var c := {"objs": [], "props": [], "deco": [], "blocks": [], "spawn": [], "lvl": 1, "boss": null}
	var I = island_of(cx, cy)
	if I == null or I.kind == "home":
		return c
	var Rg := Rng.new(int(floor(hsh(cx, cy, 20) * 1e9)))
	c.lvl = lvl_at(I.x, I.y)
	var fe := maxi(1, jround(I.dist * .9))
	var lead: bool = not I.has("big") or (cx == I.cx and cy == I.cy)
	var SX: float = I.get("sx", 1.0)
	var SY: float = I.get("sy", 1.0)
	var Ir: float = I.r
	# keep roads from every bridge to the middle clear of anything solid
	var roads := DIRS.filter(func(d): return link_on(cx, cy, cx + d[0], cy + d[1]) if d[0] > 0 or d[1] > 0 else link_on(cx + d[0], cy + d[1], cx, cy))
	# on a great island every bridge of every chunk gets a lane: along its row to the middle, then across to the centre
	var lanes := []
	if I.has("big"):
		for ab in I.chunks:
			for d in DIRS:
				var on := link_on(ab[0], ab[1], ab[0] + d[0], ab[1] + d[1]) if d[0] > 0 or d[1] > 0 else link_on(ab[0] + d[0], ab[1] + d[1], ab[0], ab[1])
				if not on:
					continue
				var N = island_of(ab[0] + d[0], ab[1] + d[1])
				if N == null:
					continue
				if d[0]:
					lanes.append([d[0], 0, jround((I.y + N.y) / 2) - 1 + 1.5])
				else:
					lanes.append([0, d[1], jround((I.x + N.x) / 2) - 1 + 1.5])
	var on_road := func(i: int, j: int) -> bool:
		var x: float = i + .5 - I.x
		var y: float = j + .5 - I.y
		if sqrt(x * x + y * y) < 3:
			return true
		if I.has("big"):
			for ln in lanes:
				var l: float = ln[2]
				if ln[0]:
					var ly: float = l - I.y
					if sign(x) == ln[0] and absf(j + .5 - l) < 2.6:
						return true
					if absf(x) < 2.6 and sign(y) == sign(ly) and absf(y) <= absf(ly) + 1:
						return true
				else:
					var lx: float = l - I.x
					if sign(y) == ln[1] and absf(i + .5 - l) < 2.6:
						return true
					if absf(y) < 2.6 and sign(x) == sign(lx) and absf(x) <= absf(lx) + 1:
						return true
			return false
		for d in roads:
			if d[0] and sign(x) == d[0] and absf(y) < 2.6:
				return true
			if d[1] and sign(y) == d[1] and absf(x) < 2.6:
				return true
		return false
	var T := func(i: int, j: int) -> int: return t[j * w + i]
	var spot := func(min_r: float, max_r: float) -> Variant:
		for k in 30:
			var a := Rg.rnd(0, 6.28)
			var r := Rg.rnd(min_r, max_r)
			var i := int(floor(I.x + cos(a) * r * SX))
			var j := int(floor(I.y + sin(a) * r * SY))
			var v: int = T.call(i, j)
			if v == 4 or v == 7:
				return Vector2i(i, j)
		return null
	var block := func(k: String, min_r: float, max_r: float, v = null, big := false) -> Variant:
		for _tr in 12:
			var p = spot.call(min_r, max_r)
			if p == null:
				return null
			var cells := [Vector2i(0, 0), Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)] if big else [Vector2i(0, 0)]
			var bad := false
			for q in cells:
				var tv: int = T.call(p.x + q.x, p.y + q.y)
				if (tv != 4 and tv != 7) or on_road.call(p.x + q.x, p.y + q.y):
					bad = true
					break
			if bad:
				continue
			for q in cells:
				var kk: int = (p.y + q.y) * w + p.x + q.x
				under[kk] = t[kk]
				t[kk] = 9
			var B := {"i": p.x, "j": p.y, "k": k, "v": v if v != null else Rg.rint(0, maxi(1, Data.variants_of("prop/" + k)) - 1), "big": big}
			c.blocks.append(B)
			return B
		return null
	var flat := func(k: String, n: int, min_r := 0.0, max_r := -1.0) -> void:
		if max_r < 0:
			max_r = Ir - 1
		for q in n:
			var p = spot.call(min_r, max_r)
			if p != null:
				var dx := Rg.rnd(.1, .9)
				var dy := Rg.rnd(.1, .9)
				c.deco.append({"k": k, "x": p.x + dx, "y": p.y + dy, "v": Rg.rint(0, Data.variants_of("deco/" + k) - 1)})
	var prop := func(k: String, x: float, y: float, o := {}) -> void:
		var p := {"k": k, "x": x, "y": y, "ph": Rg.rnd(0, 6), "v": 0}
		p.merge(o, true)
		c.props.append(p)
	var rock := func(n: int) -> void:
		for q in n:
			var p = spot.call(Ir * .5, Ir - 1.5)
			if p != null and not on_road.call(p.x, p.y) and T.call(p.x, p.y) == 4:
				t[p.y * w + p.x] = 3
	var spawn := func(bases: Array, n: int, champ := 0.0) -> void:
		var VP := var_pool(fe).filter(func(e): return Data.variants[e[0]].base in bases)
		if VP.is_empty():
			return
		var mix := [R.wpick(VP), R.wpick(VP), R.wpick(VP)]
		var cr := Rg.next() < champ
		for q in n:
			var p = spot.call(1.5, Ir - 1.5)
			if p != null:
				var vid = mix[0] if cr and q < 3 else Rg.pick(mix)
				var rank := "champ" if cr and q < 3 else ("unique" if q == 0 and Rg.next() < champ * .4 else "normal")
				c.spawn.append({"vid": vid, "x": p.x + .5, "y": p.y + .5, "rank": rank})
	var shrine := func() -> void:
		if not lead:
			c.fa = 0.0
			return
		var fb: String = Rg.pick(FIRE_B)
		var name: String = "Leuchtfeuer " + ("an der " if fb in ["rast", "furt", "wacht", "senke"] else "am ") + Rg.pick(FIRE_A) + fb
		var a := Rg.rnd(0, 6.28)
		c.fa = a
		var i := int(floor(I.x + cos(a) * 2.2))
		var j := int(floor(I.y + sin(a) * 2.2))
		c.objs.append({"type": "shrine", "ow": true, "key": _key(cx, cy), "name": name, "x": i + .5, "y": j + .5})
	var chest := func(p: Vector2i) -> void:
		c.objs.append({"type": "chest", "x": p.x + .5, "y": p.y + .5, "open": false})
	match I.kind:
		"wild":
			flat.call("tuft", 26); flat.call("flowers", 10); flat.call("pebbles", 6); flat.call("shrooms", 3)
			for q in Rg.rint(3, 7):
				block.call("tree", Ir * .55, Ir - 1, Rg.rint(0, 1))
			rock.call(Rg.rint(1, 3))
			spawn.call(ALL, Rg.rint(3, 6), .15)
		"forest":
			flat.call("tuft", 14); flat.call("leaves", 10); flat.call("moss", 6); flat.call("shrooms", 6)
			for q in Rg.rint(12, 20):
				block.call("tree", 1.5, Ir - 1, Rg.rint(0, 2))
			spawn.call(["spider", "scorp", "ghoul"], Rg.rint(4, 8), .2)
		"village":
			flat.call("rubble", 12); flat.call("blood", 6); flat.call("bones", 5); flat.call("smear", 3); flat.call("tuft", 8, Ir * .6)
			for q in Rg.rint(3, 5):
				var B = block.call("ruinhouse", 2.5, Ir * .75, Rg.rint(0, 1), true)
				if B != null and Rg.next() < .8:
					var hh := 16 + Rg.rnd(0, 10)
					var ss := Rg.rnd(1, 1.5)
					prop.call("fire", B.i + 1, B.j + 1, {"h": hh, "s": ss})
			for q in Rg.rint(3, 6):
				var p = spot.call(1, Ir - 1)
				if p != null:
					prop.call("fire", p.x + .5, p.y + .5, {"s": Rg.rnd(.6, 1.1)})
			for q in Rg.rint(2, 4):
				block.call(Rg.pick(["barrel", "crate"]), 2, Ir - 1)
			for q in Rg.rint(1, 2):
				var p = spot.call(1, Ir * .6)
				if p != null:
					chest.call(p)
			spawn.call(ALL, Rg.rint(6, 10), .35)
		"ruins":
			flat.call("moss", 8); flat.call("rubble", 10); flat.call("bones", 4); flat.call("pebbles", 6)
			for q in Rg.rint(5, 9):
				block.call(Rg.pick(["menhir", "menhir", "ringwall"]), 2.5, Ir - 1)
			if Rg.next() < .6:
				block.call("statue", 3, Ir - 2)
			if Rg.next() < .45:
				shrine.call()
			spawn.call(["skel", "archer", "wraith", "golem"], Rg.rint(4, 8), .25)
		"grave":
			flat.call("bones", 8); flat.call("skull", 4); flat.call("moss", 6); flat.call("tuft", 8)
			for q in Rg.rint(9, 15):
				block.call("grave", 2, Ir - 1)
			for q in Rg.rint(1, 3):
				block.call("tree", Ir * .5, Ir - 1, 2)
			if lead:
				prop.call("fog", I.x, I.y, {"r": Ir * maxf(SX, SY)})
			spawn.call(["skel", "archer", "ghoul", "wraith", "cult"], Rg.rint(5, 8), .25)
		"camp":
			flat.call("straw", 6); flat.call("flowers", 8); flat.call("tuft", 12)
			for q in Rg.rint(1, 3):
				block.call("house", 3, Ir - 1.5, null, true)
			for q in Rg.rint(2, 3):
				block.call("tent", 2.5, Ir - 1)
			for q in Rg.rint(1, 3):
				block.call(Rg.pick(["barrel", "crate"]), 2, Ir - 1)
			shrine.call()
			if lead and Rg.next() < .8:
				var tq: Array = Rg.pick(TRADERS)
				var a: float = c.fa + PI + Rg.rnd(-.7, .7)
				var tx: float = floor(I.x + cos(a) * 3.6) + .5
				var ty: float = floor(I.y + sin(a) * 3.6) + .5
				c.objs.append({"type": "merchant", "name": tr_name(tx, ty), "quote": tq[1], "lvl": c.lvl, "x": tx, "y": ty})
			var p = spot.call(3, 5)
			if p != null:
				prop.call("fire", p.x + .5, p.y + .5, {"s": .8})
		"boss":
			var b: Dictionary = WB[I.wb]
			flat.call("bones", 10); flat.call("skull", 5); flat.call("blood", 6); flat.call("rubble", 6)
			for q in 12:
				var a := q / 12.0 * 6.283 + .26
				var i := int(floor(I.x + cos(a) * (Ir - 2.5)))
				var j := int(floor(I.y + sin(a) * (Ir - 2.5)))
				if not on_road.call(i, j) and (T.call(i, j) == 4 or T.call(i, j) == 7):
					var kk := j * w + i
					under[kk] = t[kk]
					t[kk] = 9
					c.blocks.append({"i": i, "j": j, "k": "menhir", "v": q % 2, "big": false})
			for q in 6:
				var a := q / 6.0 * 6.283
				prop.call("fire", I.x + cos(a) * (Ir - 5), I.y + sin(a) * (Ir - 5), {"s": 1.1})
			# a bonfire at the gate, so a lost fight is never far away
			var g: Array = roads[0] if roads.size() else [1, 0]
			c.objs.append({"type": "shrine", "ow": true, "key": _key(cx, cy), "name": "Leuchtfeuer vor " + b.short, "x": floor(I.x + g[0] * (Ir - 1.5)) + .5, "y": floor(I.y + g[1] * (Ir - 1.5)) + .5})
			c.boss = I.wb
			spawn.call(b.min, Rg.rint(2, 4), .3)
		"rock":
			flat.call("pebbles", 8); flat.call("tuft", 4)
			rock.call(Rg.rint(2, 5))
			if Rg.next() < .3:
				var p = spot.call(0, 3)
				if p != null:
					chest.call(p)
	return c

static func var_pool(f: int) -> Array:
	var L := []
	for v in Data.variants.values():
		if v.minF <= f:
			L.append([v.id, v.w * (1.6 if f - v.minF < 4 else 1.0)])
	return L

## a trader's name from where he stands (trName in 490-npc-talk.js)
static func tr_name(x: float, y: float) -> String:
	var s := "%d,%d" % [jround(x), jround(y)]
	var hh := 2166136261
	for ch in s.to_ascii_buffer():
		hh = _imul(hh ^ ch, 16777619)
	return TN1[hh % 997 % TN1.size()] + " " + TN2[(hh >> 5) % 997 % TN2.size()]

# ---------- streaming (owTick) ----------

## Build what lies around the chunk at (x, y): islands three chunks out, bridges and content two chunks out.
## Returns the chunks that went to sleep and the ones that woke, or null if the hero is still in the same chunk.
func tick(x: float, y: float):
	var cx := int(floor(x / CH))
	var cy := int(floor(y / CH))
	var sig := _key(cx, cy)
	if ac == sig:
		return null
	ac = sig
	for dy in range(-3, 4):
		for dx in range(-3, 4):
			ow_island(cx + dx, cy + dy)
	var want := {}
	for dy in range(-2, 3):
		for dx in range(-2, 3):
			var a := cx + dx
			var b := cy + dy
			ow_bridge(a, b, a + 1, b)
			ow_bridge(a, b, a, b + 1)
			ow_bridge(a - 1, b, a, b)
			ow_bridge(a, b - 1, a, b)
			want[_key(a, b)] = true
	for key in want:
		if not cdata.has(key):
			var ab: PackedStringArray = key.split(",")
			cdata[key] = ow_content(int(ab[0]), int(ab[1]))
	var gone := active.keys().filter(func(k): return not want.has(k))
	var woke := want.keys().filter(func(k): return not active.has(k))
	active = want
	return {"gone": gone, "woke": woke}

## what is awake now: the home island and every active chunk, with the bridges' railing posts
func live(what: String) -> Array:
	var out: Array = home.get(what, []).duplicate()
	for key in active:
		out.append_array(cdata[key][what])
		if what == "blocks":
			out.append_array(bblocks.get(key, []))
	return out

## the name of the place the hero stands in (floorName in owTick)
func place_name(x: float, y: float) -> String:
	var I = island_of(int(floor(x / CH)), int(floor(y / CH)))
	if I == null or I.kind == "home":
		return "Der Hügel"
	if I.kind == "boss":
		return "Revier: " + WB[I.wb].n
	return KINDN.get(I.kind, "Insel") + " · Stufe %d" % lvl_at(I.x, I.y)

# ---------- the home island (genTown in 080-maps.js, decorateTown in 230-environment.js) ----------

static func ang_diff(a: float, b: float) -> float:
	var d := a - b
	while d > PI:
		d -= TAU
	while d < -PI:
		d += TAU
	return d

func gen_town() -> Dictionary:
	var Rt := Rng.new(seed * 31 + 7)
	var tw := 80
	var th := 44
	var c := 22
	var tt := PackedByteArray()
	tt.resize(tw * th)
	var un := PackedByteArray()
	un.resize(tw * th)
	var ph := Rt.rnd(0, 6)
	var ax := 61
	var ay := 22
	var blocks := []
	for j in th:
		for i in tw:
			var dx := i + .5 - c
			var dy := j + .5 - c
			var a := atan2(dy, dx)
			if sqrt(dx * dx + dy * dy) < 15.5 + sin(a * 3 + ph) * 1.6 + sin(a * 7 + ph * 2) * .8:
				tt[j * tw + i] = 4
	for j in range(c - 1, c + 2):
		for i in range(c - 1, c + 2):
			tt[j * tw + i] = 5
	# the arena island: a stone floor inside a grassy rim
	for j in th:
		for i in tw:
			var dx := i + .5 - ax
			var dy := j + .5 - ay
			var d := sqrt(dx * dx + dy * dy)
			var a := atan2(dy, dx)
			if d < 14 + sin(a * 4 + ph) * 1.1 + sin(a * 9 + ph) * .5:
				tt[j * tw + i] = 7 if d < 12.6 else 4
	# an old stone bridge between the islands, three tiles wide with low parapets
	var by := 21
	for i in range(c + 8, ax - 8):
		for j in range(by, by + 3):
			if not tt[j * tw + i]:
				tt[j * tw + i] = 8
		for j in [by - 1, by + 3]:
			if not tt[j * tw + i]:
				tt[j * tw + i] = 9
				un[j * tw + i] = 8
				blocks.append({"i": i, "j": j, "k": "parapet", "v": 2 if Rt.next() < .2 else Rt.rint(0, 1), "big": false})
	var blk := func(i: int, j: int, k, v) -> void:
		if tt[j * tw + i] != 7 and tt[j * tw + i] != 4:
			return
		un[j * tw + i] = tt[j * tw + i]
		tt[j * tw + i] = 9
		if k:
			blocks.append({"i": i, "j": j, "k": k, "v": v, "big": false})
	# colosseum: an outer wall of stone blocks with gaps, a ring of menhirs and columns inside
	var a := 0.0
	while a < 6.283:
		var gap := absf(ang_diff(a, PI)) < .42 or [.9, 2.2, 4.1, 5.3].any(func(g): return absf(ang_diff(a, g)) < .12)
		if not gap:
			var v := 2 if Rt.next() < .25 else Rt.rint(0, 1)
			blk.call(int(floor(ax + .5 + cos(a) * 12.2)), int(floor(ay + .5 + sin(a) * 12.2)), "ringwall", v)
		a += .075
	for k in 14:
		var b := k / 14.0 * 6.283 + .22
		if absf(ang_diff(b, PI)) < .4 or absf(ang_diff(b, 0)) < .3:
			continue
		blk.call(int(floor(ax + .5 + cos(b) * 9)), int(floor(ay + .5 + sin(b) * 9)), "menhir", Rt.rint(0, 2))
	blk.call(ax + 10, ay, null, 0)
	var spots := [[c + 6.5, c + 8.5], [c + 5.5, c + 6.5], [c + 7.5, c + 2.5], [c + 2.3, c + 2.3], [c + 3.5, c + 7], [c + 15, c + .5], [c + 14, c + 1.5], [ax - 12, ay + .5], [ax - 13, ay + 1.5]]
	for k in 34:
		var i := Rt.rint(3, 40)
		var j := Rt.rint(3, th - 4)
		if tt[j * tw + i] != 4 or Vector2(i - c, j - c).length() < 4.5:
			continue
		if spots.any(func(s): return Vector2(s[0] - i - .5, s[1] - j - .5).length() < 2.6):
			continue
		# keep a path from the camp to the door clear
		if i >= c + 1 and j >= c + 1 and i <= c + 8 and j <= c + 9:
			continue
		tt[j * tw + i] = 3
	var tm := {"w": tw, "h": th, "t": tt, "under": un, "blocks": blocks, "arena": {"x": ax + .5, "y": ay + .5, "r": 8}, "tower": {"x": c + .5, "y": c + .5}, "start": {"x": c + 6.5, "y": c + 8.5},
		"objs": [{"type": "door", "x": c + 2.3, "y": c + 2.3}, {"type": "shrine", "x": c + 5.5, "y": c + 6.5}, {"type": "merchant", "x": c + 7.5, "y": c + 2.5}, {"type": "stash", "x": c + 3.5, "y": c + 7.0}, {"type": "colossus", "x": ax + 10.5, "y": ay + .5}]}
	_decorate_town(tm)
	return tm

func _decorate_town(m: Dictionary) -> void:
	var Rd := Rng.new(seed * 13 + 5)
	var tw: int = m.w
	var th: int = m.h
	var tt: PackedByteArray = m.t
	var c := 22
	var deco := []
	for k in 320:
		var i := Rd.rint(2, tw - 3)
		var j := Rd.rint(2, th - 3)
		if tt[j * tw + i] != 4 or Vector2(i - c, j - c).length() < 4:
			continue
		if i >= c + 1 and j >= c + 1 and i <= c + 8 and j <= c + 9 and Rd.next() < .7:
			continue
		var kk: String = Rd.pick(["tuft", "tuft", "tuft", "flowers", "flowers", "pebbles", "shrooms"])
		var x := i + Rd.rnd(.1, .9)
		var y := j + Rd.rnd(.1, .9)
		deco.append({"k": kk, "x": x, "y": y, "v": Rd.rint(0, 4)})
	var A: Dictionary = m.arena
	deco.append({"k": "arena", "x": A.x, "y": A.y, "v": 0})
	for k in 70:
		var a := Rd.rnd(0, 6.28)
		var r := Rd.rnd(0, 11.5)
		var x: float = A.x + cos(a) * r
		var y: float = A.y + sin(a) * r
		if tt[int(floor(y)) * tw + int(floor(x))] == 7:
			var kk: String = Rd.pick(["pebbles", "pebbles", "moss", "blood", "bones", "leaves", "rubble"])
			deco.append({"k": kk, "x": x, "y": y, "v": Rd.rint(0, 3)})
	for i in tw:
		for j in th:
			if tt[j * tw + i] == 8 and Rd.next() < .35:
				var kk: String = Rd.pick(["moss", "moss", "pebbles", "leaves"])
				var x := i + Rd.rnd(.1, .9)
				var y := j + Rd.rnd(.1, .9)
				deco.append({"k": kk, "x": x, "y": y, "v": Rd.rint(0, 3)})
	m.props = []
	for a in [.9, 2.2, 4.1, 5.3]:
		m.props.append({"k": "brazier", "x": A.x + cos(a) * 10.6, "y": A.y + sin(a) * 10.6, "ph": Rd.rnd(0, 6)})
	for d in deco:
		d.v = mini(d.v, Data.variants_of("deco/" + d.k) - 1)
	m.deco = deco
