class_name HillVillage
## The hill as a village (988-hill-village.js): a planned place round the tower instead of stations dropped on the grass.
## A paved ring runs round the tower; roads lead from it to every bridge, to the square before the gate and into each quarter.
## Square: bonfire in a ring of stones, well, chest, benches, banners. Market, workshop under one lean-to, Eldrik's corner,
## a walled graveyard, a wooden deck over the edge, signposts, lanterns, hedges, gate walls at the bridge heads, villagers
## on their rounds; with every fallen guardian of the deep the hill grows (hvGrow). build() is hvBuild line for line,
## so the same seed gives the same village as in the browser (check: --hillhash and tools/godot-hillhash.js).

const HVC := 22.5
const HVD := PI / 180
const HVGROW := ["", "Am Markt steht ein Händlerzelt.", "Ein neues Haus steht am Dorfplatz.", "Mehr Laternen säumen die Wege, und eine Wache zieht auf.", "Noch ein Haus, hinter dem Turm.",
	"Am Brückentor zur Arena steht jetzt ein Wachturm.", "Eine Gärtnerin pflegt die Beete, und ein drittes Haus steht.", "Wimpel flattern über dem Dorfplatz.", "Der Hügel ist ein Dorf geworden: Banner an jedem Brückentor."]
const HVRIP := ["Aldric · der erste Wächter des Turms", "Mira · kam bis Ebene 9", "Bertold · Schmied vor Brannoc", "Isolde · sie ging hinab und kam nicht wieder", "Ein Namenloser · der Turm nahm ihn"]
# flower palettes of the yard (YDLAY.pals in 620-training-yard.js)
const PALS := [["#e8483a", "#f0a030", "#f4e060"], ["#a868e0", "#e070c0", "#f0f0f0"], ["#4a8ae8", "#80d0f0", "#f4e060"], ["#f070a0", "#ffffff", "#e8483a"], ["#f4e060", "#f0a030", "#ffffff"]]
const SAY := {"lehrling": ["Das Erz ist schwer heute.", "Brannoc will es heiß.", "Noch drei Säcke."], "magd": ["Das Wasser ist kalt wie die Tiefe.", "Odalinde will frisches Wasser.", "Ein schöner Abend."],
	"kind": ["Fang mich doch!", "Ich werd auch mal Held!", "Hast du einen Drachen gesehen?"], "kind2": ["Wart auf mich!", "Hihi!"], "wache": ["Die Arena ist ruhig.", "Halt die Augen offen, Held."],
	"gaertnerin": ["Der Salbei wächst gut.", "Eldrik mag Kamille."]}
const NAMES := {"lehrling": "Lehrling Tam", "magd": "Magd Wilma", "kind": "Pim", "kind2": "Lotte", "wache": "Wache Gernot", "gaertnerin": "Gärtnerin Hedda"}

## hvGrow: one step per fallen guardian of the deep, at most eight
static func grow() -> int:
	return mini(8, Game.boss_dead.values().filter(func(v): return v).size())

static func _ad(x: float) -> float:
	return fmod(x + 540.0, 360.0) - 180.0

static func _hyp(a: float, b: float) -> float:
	return sqrt(a * a + b * b)

## hvEdge: how far the hill reaches from the tower in direction a (degrees)
static func edge(wg: WorldGen, a: float) -> float:
	var c := cos(a * HVD)
	var s := sin(a * HVD)
	var r := 3.0
	while r < 24:
		var tt: int = wg.t[int(floor(WorldGen.HOY + HVC + s * r)) * wg.w + int(floor(WorldGen.HOX + HVC + c * r))]
		if not tt or tt == 8:
			break
		r += .2
	return r

## hvUndo: take the last village away again (before it is laid anew, a step bigger)
static func undo(wg: WorldGen) -> void:
	var H := wg.home
	if H.get("hvU"):
		for k in range(H.hvU.size() - 1, -1, -1):
			var u: Array = H.hvU[k]
			wg.t[u[0]] = u[1]
			wg.under[u[0]] = u[2]
	H.hvU = null
	H.blocks = H.blocks.filter(func(b): return not b.get("hv"))
	H.props = H.props.filter(func(p): return not p.get("hv"))
	H.objs = H.objs.filter(func(o): return not o.get("hv"))
	for k in H.get("hvDeck", []):
		wg.bw.erase(k)

## hvHeads: bridges that land on the hill, one head each: the middle of their last tiles
static func heads(wg: WorldGen) -> Array:
	var HOX := WorldGen.HOX
	var HOY := WorldGen.HOY
	var out := []
	for j in range(HOY - 4, HOY + 50):
		for i in range(HOX - 4, HOX + 50):
			if wg.t[j * wg.w + i] != 8 or _hyp(i + .5 - HOX - HVC, j + .5 - HOY - HVC) > 20:
				continue
			var near4 := false
			for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
				if wg.t[(j + d[1]) * wg.w + i + d[0]] == 4:
					near4 = true
					break
			if not near4:
				continue
			var x := i + .5 - HOX
			var y := j + .5 - HOY
			var c = null
			for h in out:
				if _hyp(h.x - x, h.y - y) < 3.5:
					c = h
					break
			if c:
				c.n += 1
				c.sx += x
				c.sy += y
				c.x = c.sx / c.n
				c.y = c.sy / c.n
			else:
				out.append({"x": x, "y": y, "sx": x, "sy": y, "n": 1})
	for h in out:
		var d := _hyp(h.x - HVC, h.y - HVC)
		h.x -= (h.x - HVC) / d * .6
		h.y -= (h.y - HVC) / d * .6
		h.a = atan2(h.y - HVC, h.x - HVC) / HVD
	return out

static func _pol(c: Array, a: float, r: float) -> Array:
	return [c[0] + cos(a * HVD) * r, c[1] + sin(a * HVD) * r]

static func _add(a: Array, b: Array) -> Array:
	return [a[0] + b[0], a[1] + b[1]]

static func _ang(a: Array, b: Array) -> float:
	return atan2(b[1] - a[1], b[0] - a[0]) / HVD

static func _bez(a: Array, c: Array, b: Array, n := 12) -> Array:
	var out := []
	for k in n + 1:
		var t := k / float(n)
		var u := 1 - t
		out.append([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]])
	return out

## hvBuild: lays the whole village on the home island of wg; g is the growth step
static func build(wg: WorldGen, g: int, graves: Array = []) -> void:
	var H := wg.home
	var HOX := WorldGen.HOX
	var HOY := WorldGen.HOY
	undo(wg)
	# every home bridge is laid before the roads look for them, wherever the hero stands
	for cy in range(37, 43):
		for cx in range(37, 44):
			wg.ow_bridge(cx, cy, cx + 1, cy)
			wg.ow_bridge(cx, cy, cx, cy + 1)
	H.hvG = g
	var U := []
	H.hvU = U
	var W0 := wg.w
	var R0 := Rng.new(wg.seed * 17 + 3)
	var C := [HVC, HVC]
	var st := {"occ": [], "roads": [], "lamps": []}
	var T := func(x: float, y: float) -> int:
		return wg.t[(HOY + int(floor(y))) * W0 + HOX + int(floor(x))]
	var setT := func(x: float, y: float, tt: int, u) -> void:
		var k := (HOY + int(floor(y))) * W0 + HOX + int(floor(x))
		U.append([k, wg.t[k], wg.under[k]])
		wg.t[k] = tt
		if u != null:
			wg.under[k] = u
	var rr := func(a: float, b: float) -> float:
		return a + R0.next() * (b - a)
	var pl := func(a: float, r: float, mg: float) -> Array:
		r = minf(r, edge(wg, a) - mg)
		return [HVC + cos(a * HVD) * r, HVC + sin(a * HVD) * r]
	var is_free := func(x: float, y: float, r: float) -> bool:
		for o in st.occ:
			if _hyp(o[0] - x, o[1] - y) <= r + o[2]:
				return false
		return true
	var take := func(x: float, y: float, r: float) -> void:
		st.occ.append([x, y, r])
	var road := func(pts: Array, w: float) -> void:
		st.roads.append({"pts": pts, "w": w})
		for k in pts.size() - 1:
			var a: Array = pts[k]
			var b: Array = pts[k + 1]
			var n := ceili(_hyp(b[0] - a[0], b[1] - a[1]) / .2)
			if n == 0:
				continue
			for q in n + 1:
				var x: float = a[0] + (b[0] - a[0]) * q / n
				var y: float = a[1] + (b[1] - a[1]) * q / n
				var j := floorf(y - w)
				while j <= y + w:
					var i := floorf(x - w)
					while i <= x + w:
						if _hyp(i + .5 - x, j + .5 - y) <= w / 2 and _hyp(i + .5 - HVC, j + .5 - HVC) <= 19:
							var tt: int = T.call(i, j)
							if tt == 4 or tt == 3:
								setT.call(i, j, 7, null)
						i += 1
					j += 1
	var blk := func(x: float, y: float, k: String, v: int, ok: Array) -> Dictionary:
		var i := floorf(x)
		var j := floorf(y)
		var t0: int = T.call(i, j)
		if not ok.has(t0):
			return {}
		setT.call(i, j, 9, t0)
		var B := {"i": HOX + int(i), "j": HOY + int(j), "k": k, "v": v, "hv": 1, "big": false}
		H.blocks.append(B)
		take.call(i + .5, j + .5, .5)
		return B
	var big := func(x: float, y: float, k: String, v: int) -> bool:
		var i := floorf(x)
		var j := floorf(y)
		for d in [[0, 0], [1, 0], [0, 1], [1, 1]]:
			if T.call(i + d[0], j + d[1]) != 4:
				return false
		for d in [[0, 0], [1, 0], [0, 1], [1, 1]]:
			setT.call(i + d[0], j + d[1], 9, 4)
		H.blocks.append({"i": HOX + int(i), "j": HOY + int(j), "k": k, "v": v, "big": true, "hv": 1})
		take.call(i + 1, j + 1, 1.4)
		return true
	var prop := func(k: String, x: float, y: float, o: Dictionary) -> Dictionary:
		var p := {"k": k, "x": HOX + x, "y": HOY + y, "ph": rr.call(0, 6), "hv": 1}
		p.merge(o, true)
		H.props.append(p)
		return p
	var solid := func(x: float, y: float) -> void:
		var tt: int = T.call(x, y)
		if tt == 4 or tt == 7:
			setT.call(x, y, 9, tt)
	var W := func(p: Array) -> Array:
		return [HOX + p[0], HOY + p[1]]
	# stray rocks on the hill go; the hill is tended
	for j in 44:
		for i in 44:
			if T.call(i, j) == 3 and _hyp(i + .5 - HVC, j + .5 - HVC) < 15:
				setT.call(i, j, 4, null)
	var hs := heads(wg)
	var arena = null
	for h in hs:
		if h.x > 33 and absf(h.y - 22.5) < 4:
			arena = h
			break
	# the square before the gate and the stations in their quarters
	var Q: Array = pl.call(45, 8, 4.6)
	var door := [24.3, 24.3]
	var S := {}
	S.shrine = Q
	S.stash = _pol(Q, 8, 2.3)
	S.merchant = pl.call(-16.5, 8.8, 2.4)
	S.smith = pl.call(27, 11.8, 2.2)
	S.riftstone = pl.call(-14, 11, 1.8)
	var WC: Array = pl.call(102, 9.6, 3)
	var WT := [-sin(102 * HVD), cos(102 * HVD)]
	var WR := [cos(102 * HVD), sin(102 * HVD)]
	var wv := func(t: float, r: float) -> Array:
		return [WC[0] + WT[0] * t + WR[0] * r, WC[1] + WT[1] * t + WR[1] * r]
	S.anvil = wv.call(1.7, 0)
	S.enchant = wv.call(0, .1)
	S.grind = wv.call(-1.7, 0)
	S.chronist = pl.call(165, 8.2, 3)
	var GY: Array = pl.call(135, 10.6, 2.6)
	var deckA := 45.0
	for a in [38, 45, 52, 30, 60]:
		if not hs.any(func(h): return absf(_ad(h.a - a)) < 22):
			deckA = a
			break
	var deckE := edge(wg, deckA)
	H.hvS = {}
	for k in S:
		H.hvS[k] = W.call(S[k])
	for k in S:
		take.call(S[k][0], S[k][1], 1.2 if k == "shrine" else 1.0)
	take.call(door[0], door[1], 1)
	# the stations stand where the plan puts them (hvTick: o.hvp)
	for o in H.objs:
		if H.hvS.has(o.type):
			o.x = H.hvS[o.type][0]
			o.y = H.hvS[o.type][1]
	wg.start = {"x": HOX + Q[0] + 1.6, "y": HOY + Q[1] + 2.1}
	# roads: the ring, the gate road, a spoke to every bridge, the lanes into the quarters
	var ring := []
	for k in 49:
		ring.append(_pol(C, k / 48.0 * 360, 4.7))
	road.call(ring, 1.3)
	road.call([door, Q], 1.8)
	var sq := []
	for k in 17:
		sq.append(_pol(Q, k / 16.0 * 360, 2.9))
	sq.append(Q)
	road.call(sq, 1.6)
	var r0 := 0.0
	while r0 < 2.9:
		var cr := []
		for k in 17:
			cr.append(_pol(Q, k / 16.0 * 360, r0))
		road.call(cr, 1.2)
		r0 += .5
	for h in hs:
		var a0 := _pol(C, h.a, 4.7)
		var mid := _pol(C, h.a, (4.7 + _hyp(h.x - HVC, h.y - HVC)) / 2)
		road.call(_bez(a0, _add(mid, [sin(h.a * 3) * .6, cos(h.a * 2) * .6]), [h.x, h.y]), 2.0)
	var mk := [_pol(C, 0, 8)[0], HVC + .2]
	road.call(_bez(mk, [30.2, 25.4], _add(Q, [.9, -1.6])), 1.4)
	var wl := [_add(Q, [-1.7, 1.9]), wv.call(-2.2, 1.5), wv.call(2.8, 1.6)]
	road.call(_bez(wl[0], _add(wv.call(-3.2, 1.6), [.4, .5]), wl[1], 8) + [wl[2]], 1.4)
	var GG := _pol(GY, _ang(GY, wl[2]), 2.1)
	road.call([wl[2], GG], 1.2)
	var west = null
	for h in hs:
		if absf(_ad(h.a - 190)) < 35:
			west = h
			break
	var ef := _add(S.chronist, [1.3, 1.1])
	if west:
		road.call(_bez(_pol(C, west.a, 7), _add(_pol(C, west.a, 7.2), [.8, 1.6]), ef, 6), 1.3)
	else:
		road.call([_pol(C, 165, 4.7), ef], 1.3)
	r0 = 0.0
	while r0 < 1.3:
		var cr := []
		for k in 13:
			cr.append(_pol(ef, k / 12.0 * 360, r0))
		road.call(cr, 1.1)
		r0 += .5
	var deckIn := _pol(C, deckA, deckE - .6)
	road.call([_add(Q, _pol([0, 0], deckA, 2)), deckIn], 1.5)
	road.call([_pol(C, -62, 4.7), [25.6, 16.9]], 1.2)
	# the deck over the edge: wooden planks on the void, a bench and a spyglass
	var ei := int(floor(deckIn[0] + cos(deckA * HVD)))
	var ej := int(floor(deckIn[1] + sin(deckA * HVD)))
	H.hvDeck = []
	for j in range(ej - 1, ej + 3):
		for i in range(ei - 1, ei + 3):
			if not T.call(i, j):
				var k := (HOY + j) * W0 + HOX + i
				setT.call(i, j, 8, 8)
				wg.bw[k] = 1
				H.hvDeck.append(k)
	var dc := _pol(C, deckA, deckE + 1.1)
	var p1 := _pol(dc, deckA, .9)
	prop.call("hvtele", p1[0], p1[1], {})
	p1 = _pol(dc, deckA + 90, .9)
	prop.call("hvbench", p1[0], p1[1], {"a": deckA + 90})
	p1 = _pol(dc, deckA - 90, 1.1)
	prop.call("hvlamp", p1[0], p1[1], {})
	# the square: stones round the fire, the well, benches, banners framing the gate road, a signpost
	prop.call("hvring", Q[0] - .01, Q[1] - .01, {"half": 0})
	prop.call("hvring", Q[0] + .01, Q[1] + .01, {"half": 1})
	var WL := _pol(Q, 135, 2.4)
	blk.call(WL[0], WL[1], "hvwell", 0, [4, 7])
	for a in [95, -35]:
		var b := _pol(Q, a, 2.75)
		prop.call("hvbench", b[0], b[1], {"a": a + 90})
		take.call(b[0], b[1], .6)
	for a in [187, 263]:
		var b := _pol(Q, a, 3.15)
		prop.call("hvbanner", b[0], b[1], {"v": 0})
		take.call(b[0], b[1], .4)
	var to_w := func(to: Array) -> Array:
		return to.map(func(e): return [e[0], HOX + e[1][0], HOY + e[1][1]])
	var sg := _pol(Q, 70, 3.3)
	H.objs.append({"type": "hvsign", "k": "hvsign", "hv": 1, "name": "Wegweiser", "x": HOX + sg[0], "y": HOY + sg[1], "to": to_w.call([["Turm", door], ["Markt", S.merchant], ["Werkstatt", S.anvil], ["Aussicht", dc]])})
	take.call(sg[0], sg[1], .5)
	# signposts at the ring where the roads part
	var sign := func(a: float, r: float, to: Array) -> void:
		var p := _pol(C, a, r)
		if T.call(p[0], p[1]) != 4:
			return
		H.objs.append({"type": "hvsign", "k": "hvsign", "hv": 1, "name": "Wegweiser", "x": HOX + p[0], "y": HOY + p[1], "to": to_w.call(to)})
		take.call(p[0], p[1], .5)
	for h in hs:
		var to: Array = [["Arena", [h.x, h.y]], ["Markt", S.merchant]] if is_same(h, arena) else [["Zu den Inseln", [h.x, h.y]]]
		if west and is_same(h, west):
			to.append_array([["Eldrik", S.chronist], ["Friedhof", GY]])
		if absf(_ad(h.a + 90)) < 40:
			to.append(["Übungsplatz", [26.5, 14.5]])
		sign.call(h.a + 16, 6.6, to)
		# a bridge gate: a short wall to each side and a lamp
		var hd := _hyp(h.x - HVC, h.y - HVC)
		for s in [-1, 1]:
			var p := _pol(_pol(C, h.a, hd - .5), h.a + 90, s * 1.75)
			blk.call(p[0], p[1], "hvwall", 1 if s > 0 else 0, [4])
		var lp := _pol(_pol(C, h.a, hd - 1.6), h.a - 90, 1.9)
		if T.call(lp[0], lp[1]) == 4:
			prop.call("hvlamp", lp[0], lp[1], {})
		if g >= 8:
			var bp := _pol(_pol(C, h.a, hd - 1.4), h.a + 90, 1.9)
			if T.call(bp[0], bp[1]) == 4:
				prop.call("hvbanner", bp[0], bp[1], {"v": 1})
	# the workshop: one lean-to over all three, tools on the back wall, wood and coal behind
	var q: Array = wv.call(0, -1.05)
	prop.call("hvroof", q[0], q[1], {"t": WT, "r": WR})
	for s in [-1, 1]:
		q = wv.call(s * 3, -1.3)
		solid.call(q[0], q[1])
	q = wv.call(1.4, -2.4)
	prop.call("hvwood", q[0], q[1], {})
	q = wv.call(-1.4, -2.4)
	prop.call("hvcoal", q[0], q[1], {})
	q = wv.call(0, -1.5)
	take.call(q[0], q[1], 2.2)
	# the market: herb beds by Odalinde, barrels and crates, a quench barrel by the smith
	var M: Array = S.merchant
	for p in [[-1.9, -.4], [-1.2, -2.0]]:
		if T.call(M[0] + p[0], M[1] + p[1]) == 4:
			prop.call("ydflower", M[0] + p[0], M[1] + p[1], {"seed": int(311 + p[1] * 7), "pal": PALS[int(p[0] * 3) & 3]})
			take.call(M[0] + p[0], M[1] + p[1], .6)
	blk.call(M[0] - .6, M[1] - 1.6, "barrel", 0, [4])
	blk.call(M[0] + .6, M[1] - 1.7, "crate", 1, [4])
	blk.call(S.smith[0] + 1.3, S.smith[1] - 1.1, "barrel", 1, [4])
	prop.call("hvcoal", S.smith[0] + 1.4, S.smith[1] + .9, {})
	# Eldrik's corner: book crates, a hedge behind him, a little herb garden
	var E: Array = S.chronist
	prop.call("hvbooks", E[0] + 1.6, E[1] - .6, {})
	prop.call("hvbooks", E[0] - .4, E[1] + 1.9, {"v": 1})
	for k in range(-2, 2):
		blk.call(E[0] - 2.2, E[1] + k, "hvhedge", k & 1, [4])
	for k in range(-1, 2):
		blk.call(E[0] + k, E[1] - 2.3, "hvhedge", k & 1, [4])
	var hb := 0
	for ab in [[2.8, -1.6], [-1.3, 3], [.2, 3.4], [-3.4, -.8], [2.6, 2.8], [-3.2, 1.4]]:
		var x: float = E[0] + ab[0]
		var y: float = E[1] + ab[1]
		if hb > 1 or T.call(x, y) != 4 or _hyp(x - GY[0], y - GY[1]) < 3.4 or not is_free.call(x, y, .6):
			continue
		prop.call("ydflower", x, y, {"seed": 521 + hb * 37, "pal": PALS[2]})
		take.call(x, y, .6)
		hb += 1
	# the graveyard: a low wall with a gate towards the lane, graves inside, one old tree
	var ga := _ang(GY, wl[2])
	for a in range(0, 360, 30):
		if absf(_ad(a + 15 - ga)) < 20:
			continue
		var q0 := _pol(GY, a, 2.15)
		var q1 := _pol(GY, a + 30, 2.15)
		prop.call("hvfence", (q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, {"x0": HOX + q0[0], "y0": HOY + q0[1], "x1": HOX + q1[0], "y1": HOY + q1[1]})
	q = _pol(GY, ga, 2.05)
	prop.call("hvgate", q[0], q[1], {"a": ga + 90})
	var rip := []
	for k in range(graves.size() - 1, maxi(-1, graves.size() - 6), -1):
		var gv: Dictionary = graves[k]
		rip.append("%s · %s, Stufe %d" % [gv.n, gv.c, gv.l])
	var gi := 0
	var j0 := floorf(GY[1] - 1.5)
	while j0 <= GY[1] + 1.5:
		var i0 := floorf(GY[0] - 1.5)
		while i0 <= GY[0] + 1.5:
			if _hyp(i0 + .5 - GY[0], j0 + .5 - GY[1]) <= 1.45 and _hyp(i0 + .5 - GG[0], j0 + .5 - GG[1]) >= 1.1:
				if gi == 4:
					blk.call(i0 + .5, j0 + .5, "tree", 2, [4])
					gi += 1
				elif not blk.call(i0 + .5, j0 + .5, "grave", gi % 3, [4]).is_empty():
					prop.call("hvrip", i0 + .5, j0 + .5, {"txt": rip[gi] if gi < rip.size() else HVRIP[gi % HVRIP.size()]})
					gi += 1
			i0 += 1
		j0 += 1
	# growth: what the hill gains with every fallen guardian
	if g >= 1:
		prop.call("hvbanner", M[0] - 1.6, M[1] + .9, {"v": 2})
		for ab in [[-.4, -2.7], [-2.8, -1.6], [1.2, -2.9]]:
			if is_free.call(M[0] + ab[0], M[1] + ab[1], .8) and not blk.call(M[0] + ab[0], M[1] + ab[1], "tent", 0, [4]).is_empty():
				blk.call(M[0] + ab[0] - .9, M[1] + ab[1] - .9, "crate", 0, [4])
				break
	var hn := 3 if g >= 6 else 2 if g >= 4 else 1 if g >= 2 else 0
	for ar in [[62, 11.4], [-120, 10.4], [215, 10.6], [80, 12], [-32, 11.6], [-150, 10.5], [185, 11.5], [240, 11], [-58, 12], [120, 12]]:
		if not hn:
			break
		var p: Array = pl.call(ar[0], ar[1], 2.6)
		if is_free.call(p[0] + .5, p[1] + .5, 1.6) and big.call(p[0], p[1], "house", hn & 1):
			hn -= 1
	# hedges and a fence that make the lanes
	for k in 4:
		q = wv.call(-3.4 - k * .9, 2.7)
		blk.call(q[0], q[1], "hvhedge", k & 1, [4])
	# trees on the quiet side of the hill, away from the square so they hide nothing
	for p in [pl.call(-150, 10.5, 2.5), pl.call(-118, 11, 2.5)]:
		if is_free.call(p[0], p[1], 1):
			blk.call(p[0], p[1], "tree", int(p[0]) % 2, [4])
	if g >= 5 and arena:
		var p := _pol(_pol(C, arena.a, _hyp(arena.x - HVC, arena.y - HVC) - 1.8), arena.a + 90, 2.4)
		if T.call(p[0], p[1]) == 4:
			prop.call("hvwatch", p[0], p[1], {})
			solid.call(p[0], p[1])
	if g >= 7:
		for a in [20, 110, 200, 290]:
			var q0 := _pol(Q, a, 2.9)
			var q1 := _pol(Q, a + 90, 2.9)
			prop.call("hvgarl", (q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, {"x0": HOX + q0[0], "y0": HOY + q0[1], "x1": HOX + q1[0], "y1": HOY + q1[1]})
	# lanterns along every road
	var step := 3.4 if g >= 3 else 4.6
	var lamps: Array = st.lamps
	var lamp_ok := func(x: float, y: float) -> bool:
		return lamps.all(func(l): return _hyp(l[0] - x, l[1] - y) > 2.4)
	for Rd in st.roads:
		if Rd.w < 1.3 or is_same(Rd.pts, ring):
			continue
		var acc := step * .5
		var side := 1
		for k in Rd.pts.size() - 1:
			var a: Array = Rd.pts[k]
			var b: Array = Rd.pts[k + 1]
			var Ln := _hyp(b[0] - a[0], b[1] - a[1])
			if not Ln:
				continue
			var n := [-(b[1] - a[1]) / Ln, (b[0] - a[0]) / Ln]
			var s := 0.0
			while s < Ln:
				acc += .25
				if acc >= step:
					var x: float = a[0] + (b[0] - a[0]) * s / Ln + n[0] * side * (Rd.w / 2 + .45)
					var y: float = a[1] + (b[1] - a[1]) * s / Ln + n[1] * side * (Rd.w / 2 + .45)
					if T.call(x, y) == 4 and is_free.call(x, y, .9) and lamp_ok.call(x, y) and _hyp(x - HVC, y - HVC) > 5.6:
						prop.call("hvlamp", x, y, {})
						take.call(x, y, .6)
						lamps.append([x, y])
						acc = 0
						side = -side
				s += .25
	for k in 8:
		var p := _pol(C, k * 45 + 22, 6.2)
		if T.call(p[0], p[1]) == 4 and is_free.call(p[0], p[1], 1) and lamp_ok.call(p[0], p[1]):
			prop.call("hvlamp", p[0], p[1], {})
			lamps.append(p)
	# a washing line behind the well, strung across the view so the cloths hang side by side
	for a in [128, 150, 105]:
		var c := _pol(Q, a, 4.7)
		var w0 := [c[0] - .85, c[1] + .85]
		var w1 := [c[0] + .85, c[1] - .85]
		if T.call(w0[0], w0[1]) != 4 or T.call(w1[0], w1[1]) != 4 or not is_free.call(c[0], c[1], 1.1):
			continue
		take.call(c[0], c[1], 1)
		prop.call("hvline", (w0[0] + w1[0]) / 2, (w0[1] + w1[1]) / 2, {"x0": HOX + w0[0], "y0": HOY + w0[1], "x1": HOX + w1[0], "y1": HOY + w1[1]})
		break
	# the villagers and their rounds
	var fk := func(id: String, route: Array, o: Dictionary) -> void:
		var d := {"id": id, "route": route.map(func(p): return [HOX + p[0], HOY + p[1]]), "to": 1, "dir": 1, "wait": rr.call(0, 3), "sp": 1.25, "pause": 4.0, "seed": rr.call(0, 9)}
		d.merge(o, true)
		prop.call("hvfolk", route[0][0], route[0][1], d)
	var circ := func(c: Array, a0: float, da: float, r: float) -> Array:
		var out := []
		for k in 12:
			out.append(_pol(c, a0 + k * da, r))
		return out
	fk.call("lehrling", [_add(S.smith, [-1.1, .4]), _add(Q, [1.1, 1.6]), _add(wl[0], [.2, .3]), wv.call(-1.6, 1.3), wv.call(1.7, 1)], {"loadA": "ore", "loadB": null})
	fk.call("magd", [_add(WL, [.9, -.4]), _add(Q, [-.4, -1.3]), [30.1, 24.2], _add(M, [-1.4, .4])], {"loadA": "bucket", "loadB": "bucket", "pause": 5.0})
	fk.call("kind", circ.call(Q, 0, 30, 2.15), {"loop": 1, "sp": 2.2, "pause": 2.5, "run": 1})
	if g >= 3 and arena:
		fk.call("wache", [_pol(C, arena.a, 7), [arena.x - 1.2, arena.y]], {"sp": .8, "pause": 6.0, "loadA": "spear", "loadB": "spear"})
	if g >= 6:
		fk.call("gaertnerin", [_add(WL, [-.6, .7]), _add(Q, [-3.4, 1.4]), [19.6, 27.4], _add(E, [1.6, 2.4])], {"loadA": "basket", "loadB": "basket", "pause": 6.0})
	if g >= 8:
		fk.call("kind2", circ.call(Q, 15, -30, 2.4), {"loop": 1, "sp": 2.0, "pause": 3.0, "run": 1})
	# the grass stays where nothing stands: no tufts on the stones, no wild flowers among the houses
	var hvp: Array = H.props.filter(func(p): return p.get("hv"))
	H.deco = H.deco.filter(func(d):
		var lx: float = d.x - HOX
		var ly: float = d.y - HOY
		if d.k == "arena" or lx > 44:
			return true
		if T.call(lx, ly) != 4:
			return false
		if d.k == "flowers" and _hyp(lx - HVC, ly - HVC) < 14:
			return false
		return not hvp.any(func(p): return _hyp(p.x - d.x, p.y - d.y) < .7))
	# where the signposts lead: every place of the village, by the spot one walks up to
	var D := func(n: String, p: Array, t) -> Array:
		return [n, HOX + p[0], HOY + p[1], t]
	H.hvDest = [D.call("Turm", [25.4, 25.4], null), D.call("Dorfplatz", Q, null), D.call("Odalinde", S.merchant, "merchant"), D.call("Brannoc, der Schmied", S.smith, "smith"),
		D.call("Bodenlose Truhe", S.stash, "stash"), D.call("Werkstatt", S.anvil, "anvil"), D.call("Eldrik, der Chronist", S.chronist, "chronist"), D.call("Übungsplatz", [26.5, 15.6], null),
		D.call("Friedhof", GG, null), D.call("Aussichtssteg", deckIn, null), D.call("Riss-Stein", S.riftstone, "riftstone")]
	if arena:
		H.hvDest.append(D.call("Arena", [arena.x, arena.y], null))

## test: one line of numbers per part of the village, the same as tools/godot-hillhash.js prints in the browser
static func hash_lines(wg: WorldGen) -> Array:
	var H := wg.home
	var sh := func(s: String) -> int:
		var h := 0
		for c in s.to_utf8_buffer():
			h = (h * 31 + c) % 1000000007
		return h
	var out := []
	var u := []
	for e in H.hvU:
		u.append("%d:%d/%d" % [e[0], wg.t[e[0]], wg.under[e[0]]])
	out.append("Kacheln %d %d" % [H.hvU.size(), sh.call(" ".join(u))])
	var b := []
	for e in H.blocks:
		if e.get("hv"):
			b.append("%s%d@%d,%d%s" % [e.k, e.v, e.i, e.j, "B" if e.get("big") else ""])
	out.append("Blöcke %d %d %s" % [b.size(), sh.call(" ".join(b)), " ".join(b.slice(0, 4))])
	var p := []
	for e in H.props:
		if e.get("hv"):
			p.append("%s@%.2f,%.2f" % [e.k, e.x, e.y])
	out.append("Requisiten %d %d %s" % [p.size(), sh.call(" ".join(p)), " ".join(p.slice(0, 4))])
	var o := []
	for e in H.objs:
		if e.get("hv"):
			o.append("%s@%.2f,%.2f>%s" % [e.type, e.x, e.y, ",".join(e.to.map(func(x): return x[0]))])
	out.append("Wegweiser %d %d" % [o.size(), sh.call(" ".join(o))])
	out.append("Ziele %s" % " ".join(H.hvDest.map(func(d): return "%s@%.2f,%.2f" % [d[0], d[1], d[2]])))
	out.append("Start %.2f,%.2f Deko %d" % [wg.start.x, wg.start.y, H.deco.size()])
	return out

# ---------- every frame: the villagers walk their rounds (hvWalk) ----------

## hvWalk: walk the route, wait at its ends, chat when the hero is near; true while walking
static func walk(p: Dictionary, dt: float, hero: Vector2, L) -> void:
	if p.wait > 0:
		p.wait -= dt
		p.mv = false
		if _hyp(p.x - hero.x, p.y - hero.y) < 4.5 and randf() < dt * .12:
			L.ftext(Vector2(p.x, p.y), SAY[p.id].pick_random(), Color("#d8ccb0"))
		return
	var tg: Array = p.route[p.to]
	var dx: float = tg[0] - p.x
	var dy: float = tg[1] - p.y
	var d := _hyp(dx, dy)
	var s: float = p.sp * dt
	p.mv = true
	if d <= s:
		p.x = tg[0]
		p.y = tg[1]
		var n: int = p.route.size()
		if p.get("loop"):
			p.to = (p.to + 1) % n
			if p.to == 1 and randf() < .5:
				p.wait = p.pause
		else:
			if p.to == n - 1 or p.to == 0:
				p.dir = 1 if p.to == 0 else -1
				p.wait = p.pause * (.7 + randf() * .6)
				p.load = p.get("loadA") if p.to == 0 else p.get("loadB")
			p.to += p.dir
		return
	p.x += dx / d * s
	p.y += dy / d * s
	p.face = atan2(dy, dx)
	p.ph = p.get("ph", 0.0) + s * 2.3

# ---------- drawing the open pieces (hvDraw) ----------

static func shade(c: Color, f: float) -> Color:
	return Color(clampf(roundf(c.r8 * f) / 255.0, 0, 1), clampf(roundf(c.g8 * f) / 255.0, 0, 1), clampf(roundf(c.b8 * f) / 255.0, 0, 1), c.a)

static func _q(ci: CanvasItem, sx: float, sy: float, pts: Array, c: Color) -> void:
	var out := PackedVector2Array()
	for q in pts:
		out.append(Vector2(sx + (q[0] - q[1]) * 32, sy + (q[0] + q[1]) * 16 - q[2]))
	ci.draw_colored_polygon(out, c)

static func _box(ci: CanvasItem, sx: float, sy: float, x: float, y: float, hw: float, hd: float, z0: float, h: float, c: Color, top = null) -> void:
	var x0 := x - hw
	var x1 := x + hw
	var y0 := y - hd
	var y1 := y + hd
	var z1 := z0 + h
	_q(ci, sx, sy, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(c, .8))
	_q(ci, sx, sy, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(c, .6))
	_q(ci, sx, sy, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], top if top != null else shade(c, 1.12))

static func _rect(ci: CanvasItem, x: float, y: float, w: float, h: float, c: Color) -> void:
	ci.draw_rect(Rect2(x, y, w, h), c)

## the screen point of a world point, seen from the prop at (sx, sy)
static func _iso(p: Dictionary, sx: float, sy: float, x: float, y: float) -> Vector2:
	return Vector2(sx + ((x - p.x) - (y - p.y)) * 32, sy + ((x - p.x) + (y - p.y)) * 16)

static var _folk_tex := {}
static var _folk_meta := {}

static func draw(ci: CanvasItem, p: Dictionary, sx: float, sy: float, t: float, hero: Vector2, night := false) -> void:
	var near := _hyp(p.x - hero.x, p.y - hero.y)
	match p.k:
		"hvfolk":
			if _folk_meta.is_empty():
				var f := FileAccess.open("res://data/village_figures.json", FileAccess.READ)
				_folk_meta = JSON.parse_string(f.get_as_text()) if f else {"-": 0}
			var key: String = "folk_" + p.id + ("_" + p.load if p.get("load") else "")
			if not _folk_meta.has(key):
				key = "folk_" + p.id
			var m: Dictionary = _folk_meta.get(key, {})
			if m.is_empty():
				return
			if not _folk_tex.has(key):
				_folk_tex[key] = load("res://assets/figures/%s.png" % key)
			var s: float = {"kind": .68, "kind2": .66}.get(p.id, 1.0)
			Prop.shadow(ci, sx, sy, .34 * s)
			var cell := int(m.cell)
			var col: int = (int(p.get("ph", 0.0) / TAU * 8) % 8) if p.get("mv") else 8
			var row := Iso.dir_row(p.get("face", .8))
			ci.draw_texture_rect_region(_folk_tex[key], Rect2(sx - m.anchor[0], sy - m.anchor[1], cell, cell), Rect2(col * cell, row * cell, cell, cell))
			if near < 1.5:
				Prop.label(ci, Vector2(sx, sy - 56 * s), NAMES[p.id], Color("#d8ccb0"))
		"hvlamp":
			Prop.shadow(ci, sx, sy, .18)
			_rect(ci, sx - 1.5, sy - 46, 3, 46, Color("#1a1612"))
			_rect(ci, sx - 4, sy - 3, 8, 3, Color("#1a1612"))
			_rect(ci, sx - 1, sy - 46, 9, 2, Color("#1a1612"))
			var lx := sx + 7
			var ly := sy - 43
			var fl: float = .8 + sin(t * 7 + p.ph) * .12
			_rect(ci, lx - 3.5, ly, 7, 9, Color("#2a2018"))
			_rect(ci, lx - 4.5, ly - 1, 9, 2, Color("#2a2018"))
			_rect(ci, lx - 2.2, ly + 1.8, 4.4, 5.6, Color(1, 200 / 255.0, 110 / 255.0, fl))
			ThemeDraw.glow(ci, Vector2(lx, ly + 4), 30 if night else 16, 30 if night else 16, Color(1, 180 / 255.0, 90 / 255.0, .4 if night else .18))
		"hvsign":
			Prop.shadow(ci, sx, sy, .16)
			_rect(ci, sx - 1.5, sy - 44, 3, 44, Color("#4a3018"))
			_rect(ci, sx - 2, sy - 46, 4, 3, Color("#2a1a0c"))
			for k in p.to.size():
				var e: Array = p.to[k]
				var d := 1.0 if (e[1] - p.x) - (e[2] - p.y) >= 0 else -1.0
				var y: float = sy - 40 + k * 7
				ThemeDraw._poly(ci, [Vector2(sx - d * 3, y), Vector2(sx + d * 15, y), Vector2(sx + d * 19, y + 2.5), Vector2(sx + d * 15, y + 5), Vector2(sx - d * 3, y + 5)], Color("#7a5430") if k & 1 else Color("#8a6038"))
				_rect(ci, minf(sx + d * 2 - 1, sx + d * 2 - 1 + d * 10), y + 2, 10, 1, Color("#3a2410"))
		"hvbench":
			var a: float = p.a * HVD
			var u := [cos(a) * .48, sin(a) * .48]
			var n := [-sin(a) * .16, cos(a) * .16]
			Prop.shadow(ci, sx, sy, .3)
			for s in [-.8, .8]:
				_box(ci, sx, sy, u[0] * s, u[1] * s, .04, .04, 0, 8, Color("#3a2614"))
			_q(ci, sx, sy, [[-u[0] - n[0], -u[1] - n[1], 8], [u[0] - n[0], u[1] - n[1], 8], [u[0] + n[0], u[1] + n[1], 8], [-u[0] + n[0], -u[1] + n[1], 8]], Color("#9a6e3a"))
			_q(ci, sx, sy, [[-u[0] - n[0], -u[1] - n[1], 8], [u[0] - n[0], u[1] - n[1], 8], [u[0] - n[0], u[1] - n[1], 6], [-u[0] - n[0], -u[1] - n[1], 6]], Color("#6a4622"))
			_q(ci, sx, sy, [[-u[0] - n[0] * 1.1, -u[1] - n[1] * 1.1, 9], [u[0] - n[0] * 1.1, u[1] - n[1] * 1.1, 9], [u[0] - n[0] * 1.3, u[1] - n[1] * 1.3, 19], [-u[0] - n[0] * 1.3, -u[1] - n[1] * 1.3, 19]], Color("#7a5430"))
		"hvbanner":
			var C: Array = [["#5a0e0a", "#8a1c14"], ["#0e1a3a", "#24407a"], ["#3a2a08", "#7a5a18"]][p.get("v", 0)]
			var sw := sin(t * 1.6 + p.ph) * 2
			Prop.shadow(ci, sx, sy, .14)
			_rect(ci, sx - 1.5, sy - 64, 3, 64, Color("#2a2018"))
			_rect(ci, sx - 10, sy - 62, 20, 2.5, Color("#2a2018"))
			ci.draw_circle(Vector2(sx, sy - 66), 2.4, Color("#c8a040"))
			ThemeDraw._poly(ci, [Vector2(sx - 9, sy - 60), Vector2(sx + 9, sy - 60), Vector2(sx + 9 + sw, sy - 34), Vector2(sx + sw * .6, sy - 29), Vector2(sx - 9 + sw, sy - 34)], Color(C[0]))
			_rect(ci, sx - 7, sy - 58, 14, 2, Color(C[1]))
			_rect(ci, sx - 1.5 + sw * .4, sy - 54, 3, 14, Color("#c8a040"))
			_rect(ci, sx - 3 + sw * .4, sy - 55, 6, 2, Color("#c8a040"))
			_rect(ci, sx - 2.5 + sw * .45, sy - 42, 5, 2, Color("#c8a040"))
		"hvring":
			for k in 12:
				var a := k / 12.0 * 6.283
				var front := sin(a) + cos(a) > 0
				if front != bool(p.half):
					continue
				var X := sx + (cos(a) - sin(a)) * .95 * 32
				var Y := sy + (cos(a) + sin(a)) * .95 * 16
				Prop.ellipse(ci, X, Y - 2, 5, 3.2, Color("#5a5650") if k % 3 else Color("#6e6a62"))
				Prop.ellipse(ci, X - 1, Y - 3.4, 3, 1.6, Color("#8a8478"))
		"hvroof":
			_roof(ci, p, sx, sy, hero)
		"hvwood":
			Prop.shadow(ci, sx, sy, .42)
			_box(ci, sx, sy, 0, 0, .42, .28, 0, 14, Color("#6a4622"), Color("#7a5430"))
			for r in 3:
				for k in 5 - r:
					var v := -.28 + .12 + k * .11 + r * .05
					var X := sx + (.42 - v) * 32
					var Y := sy + (.42 + v) * 16 - 3 - r * 4.5
					Prop.ellipse(ci, X, Y, 2.4, 2.2, Color("#8a6a3a"))
					_rect(ci, X - .5, Y - .5, 1, 1, Color("#5a3a1e"))
		"hvcoal":
			Prop.shadow(ci, sx, sy, .3)
			var CC := [Color("#141418"), Color("#22222a"), Color("#30303a"), Color("#3e3e4a")]
			for k in 26:
				var q := k / 26.0
				var r := (1 - q) * 12
				var a := k * 2.4
				ThemeDraw.ell(ci, Vector2(sx + cos(a) * r, sy - 1 - absf(sin(a)) * r * .45 - q * 13), 3.2 - q, 2.4 - q * .8, CC[(k * 7) % 4], a)
			_rect(ci, sx - 4, sy - 9, 1.5, 1.5, Color("#5a5a66"))
			_rect(ci, sx + 3, sy - 6, 1.5, 1.5, Color("#5a5a66"))
			ci.draw_line(Vector2(sx + 6, sy - 6), Vector2(sx + 13, sy - 22), Color("#5a3a1e"), 1.5)
			ThemeDraw._poly(ci, [Vector2(sx + 3, sy - 3), Vector2(sx + 8, sy - 2), Vector2(sx + 7, sy - 8), Vector2(sx + 4, sy - 8)], Color("#6a6c74"))
		"hvbooks":
			Prop.shadow(ci, sx, sy, .28)
			_box(ci, sx, sy, 0, 0, .3, .24, 0, 12, Color("#6a4622"), Color("#7a5430"))
			var BC := ["#5a1a14", "#1a3a5a", "#2a4a1a", "#5a4a1a", "#3a1a4a"]
			var v: int = p.get("v", 0)
			for k in 5:
				_box(ci, sx, sy, -.22 + k * .11, -.04, .04, .15, 12, 5 + ((k + v * 2) % 3) * 1.5, Color(BC[(k + v) % 5]))
		"hvgate":
			var a: float = p.a * HVD
			var u := [cos(a) * .65, sin(a) * .65]
			for s in [-1, 1]:
				_box(ci, sx, sy, u[0] * s, u[1] * s, .15, .15, 0, 26, Color("#6a665c"), Color("#8a8478"))
			var A0 := Vector2(sx - (u[0] - u[1]) * 32, sy - (u[0] + u[1]) * 16 - 26)
			var A1 := Vector2(sx + (u[0] - u[1]) * 32, sy + (u[0] + u[1]) * 16 - 26)
			var arc := PackedVector2Array([A0])
			arc.append_array(Prop.quad(A0, Vector2(sx, sy - 48), A1))
			ci.draw_polyline(arc, Color("#2a2a30"), 2)
			_rect(ci, sx - 1, sy - 46, 2, 9, Color("#2a2a30"))
			_rect(ci, sx - 4, sy - 43, 8, 2, Color("#2a2a30"))
		"hvfence":
			var A0 := _iso(p, sx, sy, p.x0, p.y0)
			var A1 := _iso(p, sx, sy, p.x1, p.y1)
			var n := maxi(2, roundi(A0.distance_to(A1) / 6))
			for k in n + 1:
				var X := A0.lerp(A1, k / float(n))
				var post := k == 0 or k == n
				_rect(ci, X.x - (1.5 if post else .6), X.y - (20 if post else 16), 3 if post else 1.2, 20 if post else 16, Color("#24242a"))
				if not post:
					_rect(ci, X.x - 1, X.y - 18, 2, 2, Color("#24242a"))
			for h in [13, 4]:
				ci.draw_line(A0 - Vector2(0, h), A1 - Vector2(0, h), Color("#2e2e36"), 1.2)
		"hvrip":
			if near < 2.4:
				Prop.label(ci, Vector2(sx, sy - 34), p.txt, Color("#c8c0b0"))
		"hvtele":
			var a: float = t * .15 + p.ph
			var dx := cos(a) * 9
			var dy := sin(a) * 3
			Prop.shadow(ci, sx, sy, .16)
			for q in [-5, 0, 5]:
				ci.draw_line(Vector2(sx, sy - 20), Vector2(sx + q, sy + (0 if q else 2)), Color("#3a2614"), 1.4)
			ci.draw_line(Vector2(sx - dx * .6, sy - 19 - dy * .6 + 2), Vector2(sx + dx, sy - 23 + dy), Color("#8a6a2a"), 3.5)
			ci.draw_line(Vector2(sx + dx * .8, sy - 22.6 + dy * .8), Vector2(sx + dx, sy - 23 + dy), Color("#c8a040"), 4.5)
		"hvline", "hvgarl":
			var A0 := _iso(p, sx, sy, p.x0, p.y0)
			var A1 := _iso(p, sx, sy, p.x1, p.y1)
			var line: bool = p.k == "hvline"
			var h := 32.0 if line else 44.0
			var sag := 7.0 if line else 10.0
			if line:
				for X in [A0, A1]:
					_rect(ci, X.x - 1.5, X.y - h - 2, 3, h + 2, Color("#4a3018"))
			var pt := func(q: float) -> Vector2:
				return Vector2(A0.x + (A1.x - A0.x) * q, A0.y + (A1.y - A0.y) * q - h + sin(q * PI) * sag)
			var pl := PackedVector2Array()
			for k in 11:
				pl.append(pt.call(k / 10.0))
			ci.draw_polyline(pl, Color("#c8b890") if line else Color("#3a2a1a"), 1)
			if line:
				var cl := [[.2, "#e8dcc0", 8], [.38, "#8a3a2a", 7], [.58, "#4a6a8a", 9], [.78, "#e8dcc0", 6]]
				for k in cl.size():
					var X: Vector2 = pt.call(cl[k][0])
					var sw: float = sin(t * 2 + k + p.ph) * 1.5
					var hh: float = cl[k][2]
					ThemeDraw._poly(ci, [Vector2(X.x - 4, X.y), Vector2(X.x + 4, X.y), Vector2(X.x + 4 + sw, X.y + hh), Vector2(X.x - 4 + sw, X.y + hh)], Color(cl[k][1]))
			else:
				var GC := ["#8a1c14", "#c8a040", "#24407a", "#e8dcc0"]
				for k in range(1, 12):
					var X: Vector2 = pt.call(k / 12.0)
					var sw := sin(t * 3 + k) * 1.2
					ThemeDraw._poly(ci, [Vector2(X.x - 3, X.y), Vector2(X.x + 3, X.y), Vector2(X.x + sw, X.y + 7)], Color(GC[k % 4]))
		"hvwatch":
			Prop.shadow(ci, sx, sy, .5)
			for ab in [[-.38, -.38], [.38, -.38], [-.38, .38], [.38, .38]]:
				_box(ci, sx, sy, ab[0], ab[1], .05, .05, 0, 64, Color("#4a3018"))
			for z in [18, 40]:
				_q(ci, sx, sy, [[-.38, .38, z], [.38, .38, z], [.38, .38, z + 2], [-.38, .38, z + 2]], Color("#5a3a1e"))
				_q(ci, sx, sy, [[.38, -.38, z], [.38, .38, z], [.38, .38, z + 2], [.38, -.38, z + 2]], Color("#4a2e16"))
			_box(ci, sx, sy, 0, 0, .5, .5, 62, 4, Color("#6a4622"), Color("#7a5430"))
			_box(ci, sx, sy, 0, .48, .5, .02, 66, 9, Color("#5a3a1e"))
			_box(ci, sx, sy, .48, 0, .02, .5, 66, 9, Color("#4a2e16"))
			for ab in [[-.45, -.45], [.45, -.45], [-.45, .45], [.45, .45]]:
				_box(ci, sx, sy, ab[0], ab[1], .03, .03, 66, 22, Color("#3a2614"))
			var pk := Vector2(sx, sy - 104)
			var c4 := [[-.6, -.6], [.6, -.6], [.6, .6], [-.6, .6]].map(func(ab): return Vector2(sx + (ab[0] - ab[1]) * 32, sy + (ab[0] + ab[1]) * 16 - 88))
			ThemeDraw._poly(ci, [c4[3], pk, c4[1], c4[2]], Color("#5a2a18"))
			ThemeDraw._poly(ci, [c4[3], pk, c4[2]], Color("#7a3a20"))
			Prop.flame(ci, sx + 18, sy - 80, 5, p.ph, t)
		"ydflower":
			# a flower bed of the yard (620-training-yard.js): 22 stalks, the same for the same seed
			if not p.has("f"):
				var sd := [int(p.seed)]
				var R := func() -> float:
					sd[0] = (sd[0] * 16807) % 2147483647
					return sd[0] / 2147483647.0
				var f := []
				for k in 22:
					var a: float = R.call() * 6.283
					var q := sqrt(R.call())
					f.append([cos(a) * q * 26, sin(a) * q * 11, 6 + R.call() * 7, p.pal[int(R.call() * p.pal.size())], R.call() * 6])
				f.sort_custom(func(x, y): return x[1] < y[1])
				p.f = f
			Prop.ellipse(ci, sx, sy, 30, 13, Color(58 / 255.0, 38 / 255.0, 20 / 255.0, .85))
			Prop.ellipse(ci, sx, sy - 1, 26, 10, Color(90 / 255.0, 62 / 255.0, 34 / 255.0, .6))
			for e in p.f:
				var b: float = sin(t * 1.6 + e[4]) * 1.2
				var X := roundf(sx + e[0])
				var Y := roundf(sy + e[1])
				var h: float = e[2]
				_rect(ci, X, Y - h, 1, h, Color("#3a7a2a"))
				_rect(ci, X - 2, int(Y - h * .5), 2, 1, Color("#5aa83a"))
				_rect(ci, roundf(X + b) - 1, Y - h - 1, 3, 3, Color(e[3]))
				_rect(ci, roundf(X + b), Y - h, 1, 1, Color("#fff4b0"))

## the workshop's lean-to: back wall with tools, posts, a sloping roof; the hero under it or just behind sees through
static func _roof(ci: CanvasItem, p: Dictionary, sx: float, sy: float, hero: Vector2) -> void:
	var tx: float = p.t[0]
	var ty: float = p.t[1]
	var rx: float = p.r[0]
	var ry: float = p.r[1]
	var P2 := func(a: float, b: float) -> Array:
		return [tx * a + rx * b, ty * a + ry * b]
	var w := 3.2
	var zb := 78.0
	var zf := 58.0
	var du: float = (hero.x - p.x) * tx + (hero.y - p.y) * ty
	var dv: float = (hero.x - p.x) * rx + (hero.y - p.y) * ry
	ci.modulate.a = .4 if absf(du) < w + .8 and dv > -3.6 and dv < 1.6 else 1.0
	var Q := func(pts: Array, c: Color) -> void:
		_q(ci, sx, sy, pts, c)
	var a: Array = P2.call(-w, -.3)
	var b: Array = P2.call(w, -.3)
	Q.call([[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], zb], [a[0], a[1], zb]], Color("#5a3a1e"))
	for k in range(-3, 4):
		var c: Array = P2.call(k * .95, -.29)
		Q.call([[c[0] - tx * .03, c[1] - ty * .03, 0], [c[0] + tx * .03, c[1] + ty * .03, 0], [c[0] + tx * .03, c[1] + ty * .03, zb], [c[0] - tx * .03, c[1] - ty * .03, zb]], Color("#3a2614"))
	# tools on the back wall
	var at := func(u: float, z: float) -> Vector2:
		var c: Array = P2.call(u, -.26)
		return Vector2(sx + (c[0] - c[1]) * 32, sy + (c[0] + c[1]) * 16 - z)
	var X: Vector2 = at.call(-2.2, 44)
	_rect(ci, X.x - 1, X.y, 2, 12, Color("#8a8c94"))
	_rect(ci, X.x - 4, X.y - 2, 8, 4, Color("#8a8c94"))
	X = at.call(-1.2, 46)
	_rect(ci, X.x - 3, X.y, 1.5, 13, Color("#6a6c74"))
	_rect(ci, X.x + 1.5, X.y, 1.5, 13, Color("#6a6c74"))
	_rect(ci, X.x - 3, X.y, 6, 2, Color("#6a6c74"))
	X = at.call(.9, 40)
	_rect(ci, X.x - 8, X.y, 16, 4, Color("#9a9ca4"))
	_rect(ci, X.x + 8, X.y, 5, 4, Color("#5a3a1e"))
	X = at.call(2.2, 44)
	_rect(ci, X.x - 1, X.y, 2, 16, Color("#5a3a1e"))
	_rect(ci, X.x - 4, X.y - 3, 8, 4, Color("#8a8c94"))
	X = at.call(-.2, 52)
	ci.draw_arc(X, 5, 0, TAU, 20, Color("#3a2a1a"), 1.5)
	for s in [-w, w]:
		for bb in [-.3, .8]:
			var c: Array = P2.call(s, bb)
			_box(ci, sx, sy, c[0], c[1], .06, .06, 0, zb if bb < 0 else zf, Color("#3a2614"))
	var r0: Array = P2.call(-w - .25, -.55)
	var r1: Array = P2.call(w + .25, -.55)
	var r2: Array = P2.call(w + .25, .95)
	var r3: Array = P2.call(-w - .25, .95)
	Q.call([[r0[0], r0[1], zb + 4], [r1[0], r1[1], zb + 4], [r2[0], r2[1], zf - 2], [r3[0], r3[1], zf - 2]], Color("#6a3a22"))
	for k in 7:
		var q := k / 7.0
		var bb := -.55 + q * 1.5
		var z := zb + 4 - q * (zb - zf + 6)
		var e0: Array = P2.call(-w - .25, bb)
		var e1: Array = P2.call(w + .25, bb)
		var e2: Array = P2.call(w + .25, bb + .04)
		var e3: Array = P2.call(-w - .25, bb + .04)
		Q.call([[e0[0], e0[1], z], [e1[0], e1[1], z], [e2[0], e2[1], z - .8], [e3[0], e3[1], z - .8]], Color("#4a2614"))
	Q.call([[r3[0], r3[1], zf - 2], [r2[0], r2[1], zf - 2], [r2[0], r2[1], zf - 5], [r3[0], r3[1], zf - 5]], Color("#3a1c10"))

# ---------- signposts: a list of every place, then a trail of lights (hvSignOpen, hvGuide) ----------

## the places a signpost offers: every one more than three steps from it, stations only if they stand
static func dests(wg: WorldGen, o: Dictionary, hero: Vector2) -> Array:
	var H := wg.home
	var out := []
	for i in H.get("hvDest", []).size():
		var d: Array = H.hvDest[i]
		if d[3] != null and not H.objs.any(func(q): return q.type == d[3]):
			continue
		if _hyp(d[1] - o.x, d[2] - o.y) <= 3:
			continue
		out.append([i, "%s · %d Schritte" % [d[0], roundi(_hyp(d[1] - hero.x, d[2] - hero.y))]])
	return out

## hvGuide: even lights along the path to the place, every .85 steps
static func guide(L, d: Array) -> Dictionary:
	var tg: Vector2 = L.near_walk(d[1], d[2])
	var path: Array = L.find_path(Vector2(L.P.x, L.P.y), tg)
	if path.is_empty():
		Game.log_msg("Dorthin findet der Wegweiser keinen Weg.", Color("#a39b88"))
		return {}
	var all: Array = [Vector2(L.P.x, L.P.y)] + path
	var pts := []
	var acc := 0.0
	for k in all.size() - 1:
		var a: Vector2 = all[k]
		var b: Vector2 = all[k + 1]
		var Ln := a.distance_to(b)
		var s := 0.0
		while s < Ln:
			acc += .1
			if acc >= .85:
				acc = 0
				var q := s / Ln
				pts.append([a.x + (b.x - a.x) * q, a.y + (b.y - a.y) * q, atan2(b.y - a.y, b.x - a.x)])
			s += .1
	Game.log_msg("Folge den Lichtern: %s." % d[0], Color("#e8d8b0"))
	return {"n": d[0], "x": tg.x, "y": tg.y, "pts": pts, "t": 0.0, "at": 0}

## hvGuideTick: the lights behind the hero go out; at the place, or after 90 seconds, the trail is gone
static func guide_tick(g: Dictionary, dt: float, hero: Vector2) -> bool:
	g.t += dt
	if g.t > 90:
		return false
	if _hyp(g.x - hero.x, g.y - hero.y) < 1.6:
		Game.log_msg("%s. Du bist da." % g.n, Color("#e8d8b0"))
		return false
	for k in range(mini(g.pts.size() - 1, g.at + 10), g.at - 1, -1):
		if _hyp(g.pts[k][0] - hero.x, g.pts[k][1] - hero.y) < 1.2:
			g.at = k + 1
			break
	return true

static func guide_draw(ci: CanvasItem, g: Dictionary, t: float) -> void:
	for k in range(g.at, g.pts.size()):
		var e: Array = g.pts[k]
		var sp := Iso.to_screen(Vector2(e[0], e[1]))
		var w := .5 + .5 * sin(t * 5 - k * .7)
		var f := minf(1, (k - g.at + 1) / 3.0)
		var al := (.35 + .45 * w) * f
		var a: float = e[2]
		var dx := cos(a) - sin(a)
		var dy := (cos(a) + sin(a)) * .5
		var Ln := _hyp(dx, dy)
		var ux := dx / Ln
		var uy := dy / Ln
		ThemeDraw.glow(ci, sp, 16, 16, Color(1, 200 / 255.0, 90 / 255.0, al * .55))
		var pts := PackedVector2Array([sp + Vector2(ux * 10, uy * 10), sp + Vector2(-ux * 6 - uy * 9, -uy * 6 + ux * 9), sp + Vector2(-ux * 2, -uy * 2), sp + Vector2(-ux * 6 + uy * 9, -uy * 6 - ux * 9)])
		ci.draw_colored_polygon(pts, Color(1, 214 / 255.0, 120 / 255.0, minf(1, al + .25)))
		pts.append(pts[0])
		ci.draw_polyline(pts, Color(60 / 255.0, 30 / 255.0, 4 / 255.0, al * .8), 1.2)
	var r := 10 + sin(t * 4) * 3
	ThemeDraw.ell_line(ci, Iso.to_screen(Vector2(g.x, g.y)), r * 1.6, r * .8, Color(1, 210 / 255.0, 120 / 255.0, .7), 2)
