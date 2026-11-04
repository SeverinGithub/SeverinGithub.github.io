class_name DungeonGen
extends RefCounted
## A tower floor, translated line by line from tryDungeon (080-maps.js) and decorate (230-environment.js):
## large halls, caves and pillared crypts joined by wide, wandering passages, then dressed by room theme.
## Tiles: 0 void, 1 floor, 2 wall, 6 floor under a blocking prop.
## The same seed and floor roll the same numbers as the browser (see Rng); later layers of the browser
## (floor themes, curses, special rooms from 982/984) are not in yet.

const THEMES := ["crypt", "moss", "ossuary", "ritual", "flooded", "mold", "collapsed", "storage"]
const TINT := [null, Color8(30, 64, 12), Color8(96, 84, 62), Color8(90, 0, 0), Color8(4, 14, 30), Color8(58, 66, 14), Color8(70, 60, 46), null]

var R: Rng
var w := 96
var h := 96
var t := PackedByteArray()

static func generate(seed_value: int, f: int) -> Dictionary:
	for tr in 16:
		var m := DungeonGen.new()._try(seed_value, f, tr, false)
		if not m.is_empty():
			return m
	return DungeonGen.new()._try(seed_value, f, 99, true)

func T(i: int, j: int) -> int:
	return 0 if i < 0 or j < 0 or i >= w or j >= h else t[j * w + i]

func n8(i: int, j: int) -> int:
	var n := 0
	for dj in range(-1, 2):
		for di in range(-1, 2):
			if (di or dj) and T(i + di, j + dj) == 1:
				n += 1
	return n

static func hyp(x: float, y: float) -> float:
	return sqrt(x * x + y * y)

func _try(seed_value: int, f: int, tr: int, force: bool) -> Dictionary:
	R = Rng.new(seed_value * 7919 + f * 104729 + tr * 31337)
	t.resize(w * h)
	t.fill(0)
	var boss := f % 3 == 0
	var rooms: Array = []
	var place := func(rw: int, rh: int, shape: String):
		for k in 140:
			var x := R.rint(4, w - rw - 5)
			var y := R.rint(4, h - rh - 5)
			var ok := true
			for r in rooms:
				if not (x > r.x + r.w + 6 or x + rw + 6 < r.x or y > r.y + r.h + 6 or y + rh + 6 < r.y):
					ok = false
					break
			if ok:
				var r := {"x": x, "y": y, "w": rw, "h": rh, "cx": x + (rw >> 1), "cy": y + (rh >> 1), "shape": shape}
				rooms.append(r)
				return r
		return null
	if boss:
		place.call(24, 24, "round")
	var k := 0
	while k < 90 and rooms.size() < (9 if boss else 11):
		var rw := R.rint(12, 20)
		var rh := R.rint(12, 20)
		place.call(rw, rh, R.pick(["hall", "hall", "round", "cave", "cave", "crypt"]))
		k += 1
	for r in rooms:
		var ph := R.rnd(0, 6)
		var ph2 := R.rnd(0, 6)
		for j in range(r.y, r.y + r.h):
			for i in range(r.x, r.x + r.w):
				var u: float = (i - r.x + .5) / r.w * 2 - 1
				var v: float = (j - r.y + .5) / r.h * 2 - 1
				var d := hyp(u, v)
				var a := atan2(v, u)
				var ok: bool
				if r.shape == "round":
					ok = d <= 1
				elif r.shape == "cave":
					ok = d < .82 + sin(a * 3 + ph) * .14 + sin(a * 5 + ph2) * .08
				else:
					ok = absf(u) + absf(v) < 1.7
				if ok:
					_carve(i, j)
	var link := {}
	for i in range(1, rooms.size()):
		var best := 0
		var bd := 1e9
		for j in i:
			var d := hyp(rooms[i].cx - rooms[j].cx, rooms[i].cy - rooms[j].cy)
			if d < bd:
				bd = d
				best = j
		_corr(rooms[i], rooms[best])
		link["%d-%d" % [i, best]] = true
	for kk in 3:
		var a := R.rint(0, rooms.size() - 1)
		var b := R.rint(0, rooms.size() - 1)
		if a != b and not link.has("%d-%d" % [a, b]):
			_corr(rooms[a], rooms[b])
	# ragged edges, then one smoothing pass so nothing reads as a grid
	for j in range(3, h - 3):
		for i in range(3, w - 3):
			if not t[j * w + i] and (T(i + 1, j) or T(i - 1, j) or T(i, j + 1) or T(i, j - 1)):
				var cave := false
				for r in rooms:
					if r.shape == "cave" and i >= r.x - 2 and i <= r.x + r.w + 2 and j >= r.y - 2 and j <= r.y + r.h + 2:
						cave = true
						break
				if R.next() < (.3 if cave else .03):
					t[j * w + i] = 9
	for q in t.size():
		if t[q] == 9:
			t[q] = 1
	var sm := t.duplicate()
	for j in range(3, h - 3):
		for i in range(3, w - 3):
			var n := n8(i, j)
			sm[j * w + i] = 1 if n >= 5 else (0 if n <= 2 else t[j * w + i])
	t = sm
	# pillars in crypts and the larger halls
	for r in rooms:
		if not (r.shape == "crypt" or r.shape == "hall" and r.w >= 16 and r.h >= 16):
			continue
		var py: int = r.y + 3
		while py <= r.y + r.h - 5:
			for px in [r.x + 3, r.x + r.w - 5]:
				if T(px, py) and T(px + 1, py) and T(px, py + 1) and T(px + 1, py + 1) and n8(px - 1, py - 1) >= 5 and n8(px + 2, py + 2) >= 5:
					for o in [[0, 0], [1, 0], [0, 1], [1, 1]]:
						t[(py + o[1]) * w + px + o[0]] = 0
			py += 5
	var start: Dictionary
	var end: Dictionary
	if boss:
		end = rooms[0]
		start = _far(rooms, end)
	else:
		start = rooms[0]
		end = _far(rooms, start)
	var s0 := _near(start.cx + .5, start.cy + .5)
	var e0 := _near(end.cx + .5, end.cy + .5)
	# keep only what is reachable from the start
	var seen := PackedByteArray()
	seen.resize(w * h)
	var q: Array[int] = [int(s0.y) * w + int(s0.x)]
	seen[q[0]] = 1
	while q.size():
		var c: int = q.pop_back()
		var ci := c % w
		var cj := c / w
		for dd in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
			var ni: int = (cj + dd[1]) * w + ci + dd[0]
			if not seen[ni] and t[ni] == 1:
				seen[ni] = 1
				q.append(ni)
	if not seen[int(e0.y) * w + int(e0.x)] and not force:
		return {}
	var fl := 0
	for c in t.size():
		if t[c] == 1 and not seen[c]:
			t[c] = 0
		if t[c] == 1:
			fl += 1
	for j in h:
		for i in w:
			if t[j * w + i] == 0:
				for dj in range(-1, 2):
					for di in range(-1, 2):
						if T(i + di, j + dj) == 1:
							t[j * w + i] = 2
	var objs: Array = [{"type": "shrine", "x": s0.x, "y": s0.y}]
	if not boss:
		objs.append({"type": "stairs", "x": e0.x, "y": e0.y})
	var others := rooms.filter(func(r): return r != start and r != end)
	var n := R.rint(2, 4)
	k = 0
	while k < n and others.size():
		var p := _rspot(R.pick(others), 2)
		objs.append({"type": "chest", "x": p.x, "y": p.y, "open": false})
		k += 1
	# dressing: floor decals, wall torches, braziers
	var deco: Array = []
	var props: Array = []
	k = 0
	while k < fl / 22.0:
		var i := R.rint(3, w - 4)
		var j := R.rint(3, h - 4)
		if T(i, j) == 1:
			var kind: String = R.pick(["bones", "bones", "rubble", "rubble", "blood", "skull"])
			var x := i + R.rnd(.1, .9)
			var y := j + R.rnd(.1, .9)
			deco.append({"k": kind, "x": x, "y": y, "v": R.rint(0, 3)})
		k += 1
	for j in range(3, h - 3):
		for i in range(3, w - 3):
			if T(i, j) != 2 or R.next() > .07:
				continue
			var fy := T(i, j + 1) == 1
			var fx := T(i + 1, j) == 1
			if not fy and not fx:
				continue
			var x: float = i + .5 if fy else i + 1.0
			var y: float = j + 1.0 if fy else j + .5
			if props.any(func(p): return hyp(p.x - x, p.y - y) < 7):
				continue
			props.append({"k": "torch", "x": x, "y": y, "face": "y" if fy else "x", "ph": R.rnd(0, 6)})
	for r in rooms:
		if r == start or r.shape == "cave":
			continue
		for kk in 2:
			var p := _rspot(r, 3)
			props.append({"k": "brazier", "x": p.x, "y": p.y, "ph": R.rnd(0, 6)})
	var m := {"kind": "dungeon", "floor": f, "w": w, "h": h, "t": t, "rooms": rooms, "startRoom": start, "endRoom": end, "boss": boss,
		"objs": objs, "deco": deco, "props": props, "start": _near(s0.x + 1.5, s0.y + 1.5)}
	_decorate(m, start, end, objs)
	return m

func _carve(i: int, j: int) -> void:
	if i > 2 and j > 2 and i < w - 3 and j < h - 3:
		t[j * w + i] = 1

func _corr(a: Dictionary, b: Dictionary) -> void:
	var hw := R.rint(4, 6) / 2.0
	var x: int = a.cx
	var y: int = a.cy
	var oy := 0
	var ox := 0
	var brush := func(cx: float, cy: float):
		for j in range(int(floor(cy - hw)), int(ceil(cy + hw))):
			if j >= cy + hw:
				break
			for i in range(int(floor(cx - hw)), int(ceil(cx + hw))):
				if i >= cx + hw:
					break
				_carve(i, j)
	var sx: int = signi(b.cx - a.cx) if b.cx != a.cx else 1
	var sy: int = signi(b.cy - a.cy) if b.cy != a.cy else 1
	while x != b.cx:
		brush.call(x, y + oy)
		x += sx
		if R.next() < .3:
			oy = clampi(oy + (-1 if R.next() < .5 else 1), -3, 3)
	while y != b.cy:
		brush.call(x + ox, y)
		y += sy
		if R.next() < .3:
			ox = clampi(ox + (-1 if R.next() < .5 else 1), -3, 3)
	brush.call(x, y)

func _near(x: float, y: float) -> Vector2:
	for rr in 8:
		for dj in range(-rr, rr + 1):
			for di in range(-rr, rr + 1):
				var i := int(floor(x)) + di
				var j := int(floor(y)) + dj
				if T(i, j) == 1 and T(i + 1, j) == 1 and T(i, j + 1) == 1 and T(i - 1, j) == 1 and T(i, j - 1) == 1:
					return Vector2(i + .5, j + .5)
	return Vector2(x, y)

func _far(rooms: Array, from: Dictionary) -> Dictionary:
	var b = null
	var bd := -1.0
	for r in rooms:
		var d := hyp(r.cx - from.cx, r.cy - from.cy)
		if d > bd:
			bd = d
			b = r
	return b

func _rspot(r: Dictionary, pad := 1) -> Vector2:
	for k in 40:
		var i := R.rint(r.x + pad, r.x + r.w - 1 - pad)
		var j := R.rint(r.y + pad, r.y + r.h - 1 - pad)
		if T(i, j) == 1 and n8(i, j) == 8:
			return Vector2(i + .5, j + .5)
	return _near(r.cx + .5, r.cy + .5)

# ---------- decorate (230-environment.js) ----------
var _m: Dictionary
var _objs: Array
var _props: Array
var _deco: Array
var _reach := 0
var _si := 0

static func variants(group: String, k: String) -> int:
	var n := 0
	while Data.sprites.has("%s/%s/%d" % [group, k, n]):
		n += 1
	return n

func _free8(i: int, j: int) -> bool:
	return T(i, j) == 1 and n8(i, j) == 8

func _farobj(x: float, y: float, d: float) -> bool:
	for o in _objs:
		if hyp(o.x - x, o.y - y) <= d:
			return false
	return hyp(_m.start.x - x, _m.start.y - y) > d

func _add(k: String, x: float, y: float, o := {}) -> void:
	var p := {"k": k, "x": x, "y": y, "v": R.rint(0, maxi(1, variants("prop", k)) - 1), "ph": R.rnd(0, 6)}
	p.merge(o, true)
	_props.append(p)

func _flat(k: String, x: float, y: float) -> void:
	_deco.append({"k": k, "x": x, "y": y, "v": R.rint(0, variants("deco", k) - 1)})

func _flood() -> int:
	var s2 := PackedByteArray()
	s2.resize(w * h)
	var q: Array[int] = [_si]
	s2[_si] = 1
	var n := 0
	while q.size():
		var c: int = q.pop_back()
		n += 1
		for d in [1, -1, w, -w]:
			var nn: int = c + d
			if not s2[nn] and t[nn] == 1:
				s2[nn] = 1
				q.append(nn)
	return n

## a blocker never cuts the map: if the floor behind it is no longer reachable, it is taken back
func _block(i: int, j: int, k: String, o := {}, edge := false) -> bool:
	if not (T(i, j) == 1 and n8(i, j) >= 4 if edge else _free8(i, j)) or not _farobj(i + .5, j + .5, 2.6):
		return false
	t[j * w + i] = 6
	var n := _flood()
	if n != _reach - 1:
		t[j * w + i] = 1
		return false
	_reach = n
	_add(k, i + .5, j + .5, o)
	return true

func _spot(r: Dictionary, pad := 1):
	for k in 30:
		var i := R.rint(r.x + pad, r.x + r.w - 1 - pad)
		var j := R.rint(r.y + pad, r.y + r.h - 1 - pad)
		if T(i, j) == 1:
			return Vector2i(i, j)
	return null

func _edge_spot(r: Dictionary):
	for k in 40:
		var i := R.rint(r.x, r.x + r.w - 1)
		var j := R.rint(r.y, r.y + r.h - 1)
		if T(i, j) == 1 and n8(i, j) < 8 and n8(i, j) >= 4:
			return Vector2i(i, j)
	return null

func _walls_of(r: Dictionary, pad := 1) -> Array:
	var out := []
	for j in range(r.y - pad, r.y + r.h + pad):
		for i in range(r.x - pad, r.x + r.w + pad):
			if T(i, j) != 2:
				continue
			var fy := T(i, j + 1) == 1
			var fx := T(i + 1, j) == 1
			if fy or fx:
				out.append({"face": "y" if fy else "x", "x": i + .5 if fy else i + 1.0, "y": j + 1.0 if fy else j + .5})
	return out

func _wall_prop(r: Dictionary, k: String, n: int) -> void:
	var W2 := _walls_of(r)
	var c := 0
	while c < n and W2.size():
		var s: Dictionary = W2.pop_at(R.rint(0, W2.size() - 1))
		c += 1
		if _props.any(func(p): return p.has("face") and hyp(p.x - s.x, p.y - s.y) < 1.6):
			continue
		_add(k, s.x, s.y, {"face": s.face})

func _many(r: Dictionary, k: String, n: int, pad := 1) -> void:
	for c in n:
		var p = _spot(r, pad)
		if p != null:
			var x: float = p.x + R.rnd(.1, .9)
			var y: float = p.y + R.rnd(.1, .9)
			_flat(k, x, y)

func _shaft(r: Dictionary) -> void:
	var p = _spot(r, 3)
	if p != null:
		_add("shaft", p.x + .5, p.y + .5, {"v": 0})

func _B(r: Dictionary, k: String, n: int) -> void:
	var c := 0
	var tries := 0
	while c < n and tries < n * 6:
		var p = _spot(r, 2)
		if p != null and _block(p.x, p.y, k):
			c += 1
		tries += 1

func _EB(r: Dictionary, k: String, n: int) -> void:
	var c := 0
	var tries := 0
	while c < n and tries < n * 8:
		var p = _edge_spot(r)
		if p != null and _block(p.x, p.y, k, {}, true):
			c += 1
		tries += 1

func _nearp(r: Dictionary, k: String, n: int, o := {}) -> void:
	for c in n:
		var p = _spot(r, 1)
		if p != null and _farobj(p.x + .5, p.y + .5, 1.4):
			var x: float = p.x + R.rnd(.2, .8)
			var y: float = p.y + R.rnd(.2, .8)
			_add(k, x, y, o)

func _decorate(m: Dictionary, start: Dictionary, end: Dictionary, objs: Array) -> void:
	_m = m
	_objs = objs
	_props = m.props
	_deco = m.deco
	var rooms: Array = m.rooms
	var theme := PackedByteArray()
	theme.resize(w * h)
	var wov := PackedByteArray()
	wov.resize(w * h)
	var drips := []
	var runes := []
	var fireflies := []
	var spores := []
	_si = int(m.start.y) * w + int(m.start.x)
	_reach = _flood()
	for r in rooms:
		var th: String
		if r == start:
			th = R.pick(["crypt", "storage"])
		elif r == end and m.boss:
			th = "ritual"
		else:
			th = R.pick(["crypt", "crypt", "moss", "moss", "ossuary", "ritual", "flooded", "mold", "collapsed", "storage"])
		r.theme = th
		var ti := THEMES.find(th) + 1
		for j in range(r.y - 1, r.y + r.h + 1):
			for i in range(r.x - 1, r.x + r.w + 1):
				if i < 0 or j < 0 or i >= w or j >= h:
					continue
				if t[j * w + i] == 1:
					theme[j * w + i] = ti
				if t[j * w + i] == 2 and (th == "moss" or th == "flooded" or th == "mold") and R.next() < .8:
					wov[j * w + i] = R.rint(1, 4)
		var area: int = r.w * r.h
		var N := func(kk: float) -> int: return int(round(kk * area / 200.0))
		match th:
			"crypt":
				_B(r, "sarcophagus", R.rint(1, 3)); _EB(r, "statue", R.rint(0, 2)); _EB(r, "coffin", R.rint(0, 2)); _nearp(r, "candles", N.call(3) + 2)
				_many(r, "bones", N.call(6)); _many(r, "skull", N.call(2)); _many(r, "wax", N.call(3)); _many(r, "cobweb", N.call(3))
				_wall_prop(r, "banner", R.rint(1, 3)); _wall_prop(r, "niche", R.rint(0, 2)); _wall_prop(r, "wallweb", 2)
			"moss":
				_many(r, "moss", N.call(26), 0); _many(r, "roots", N.call(5)); _many(r, "leaves", N.call(4))
				var nn: int = N.call(6) + 2
				_nearp(r, "mushrooms", nn, {"v": R.rint(0, 2)})
				_EB(r, "stalagmite", R.rint(2, 4)); _B(r, "stalagmite", R.rint(0, 2))
				for c in N.call(3) + 1:
					var p = _spot(r)
					if p != null:
						_flat("puddle", p.x + .5, p.y + .5)
						drips.append(Vector2(p.x + .5, p.y + .5))
				if R.next() < .7:
					_shaft(r)
				fireflies.append([r.cx + .5, r.cy + .5, r.w / 2.0])
			"ossuary":
				_nearp(r, "bonepile", N.call(6) + 2); _nearp(r, "skullpile", N.call(3) + 1); _many(r, "bones", N.call(14)); _many(r, "skull", N.call(6))
				_wall_prop(r, "niche", R.rint(4, 8)); _EB(r, "cage", R.rint(0, 1)); _nearp(r, "candles", R.rint(1, 3))
			"ritual":
				var cx: float = r.cx + .5
				var cy: float = r.cy + .5
				if T(int(cx), int(cy)) == 1:
					_deco.append({"k": "runes", "x": cx, "y": cy, "v": 0})
					runes.append(Vector2(cx, cy))
					if not m.boss:
						_block(int(cx), int(cy), "altar")
					for kk in 8:
						var a := kk / 8.0 * 6.283
						var x := cx + cos(a) * 2.4
						var y := cy + sin(a) * 2.4
						if T(int(x), int(y)) == 1:
							_add("candles", x, y)
				_many(r, "blood", N.call(6)); _many(r, "smear", N.call(4)); _many(r, "skull", N.call(2))
				_wall_prop(r, "banner", R.rint(2, 4)); _wall_prop(r, "chains", R.rint(1, 3)); _EB(r, "statue", R.rint(1, 2))
			"flooded":
				for c in N.call(12) + 3:
					var p = _spot(r, 1)
					if p != null:
						var x: float = p.x + R.rnd(.2, .8)
						var y: float = p.y + R.rnd(.2, .8)
						_flat("puddle", x, y)
						if R.next() < .35:
							drips.append(Vector2(p.x + .5, p.y + .5))
				_many(r, "moss", N.call(8)); _many(r, "roots", N.call(3)); _many(r, "pebbles", N.call(5)); _shaft(r)
				if R.next() < .5:
					_shaft(r)
				_EB(r, "stalagmite", R.rint(0, 2))
			"mold":
				_many(r, "mold", N.call(22), 0); _many(r, "cobweb", N.call(5)); _many(r, "rubble", N.call(4))
				var nn: int = N.call(3)
				_nearp(r, "mushrooms", nn, {"v": 2})
				_many(r, "bones", N.call(3)); _wall_prop(r, "wallweb", R.rint(2, 4))
				spores.append([r.cx + .5, r.cy + .5, r.w / 2.0])
			"collapsed":
				_many(r, "rubble", N.call(14)); _many(r, "pebbles", N.call(8)); _B(r, "pillar", R.rint(2, 4)); _EB(r, "stalagmite", R.rint(1, 3))
				_shaft(r); _shaft(r)
				if R.next() < .5:
					_shaft(r)
				_many(r, "bones", N.call(3)); _many(r, "leaves", N.call(3))
			"storage":
				_EB(r, "barrel", R.rint(3, 6)); _EB(r, "crate", R.rint(3, 6)); _many(r, "straw", N.call(8)); _many(r, "wax", N.call(2))
				_nearp(r, "candles", R.rint(1, 2)); _wall_prop(r, "chains", R.rint(1, 2)); _wall_prop(r, "banner", R.rint(0, 2)); _many(r, "cobweb", N.call(3))
	# passages: webs in the corners, puddles, a chain or two, moss creeping in
	for j in range(3, h - 3):
		for i in range(3, w - 3):
			if t[j * w + i] != 1 or theme[j * w + i]:
				continue
			var n := n8(i, j)
			var x := i + R.rnd(.2, .8)
			var y := j + R.rnd(.2, .8)
			if n <= 5 and R.next() < .06:
				_flat("cobweb", x, y)
			elif R.next() < .012:
				_flat("puddle", x, y)
			elif R.next() < .02:
				_flat(R.pick(["rubble", "pebbles", "bones", "moss", "leaves"]), x, y)
	for j in range(3, h - 3):
		for i in range(3, w - 3):
			if t[j * w + i] != 2 or theme[j * w + i]:
				continue
			var corridor := true
			for r in rooms:
				if i >= r.x - 1 and i <= r.x + r.w and j >= r.y - 1 and j <= r.y + r.h:
					corridor = false
					break
			if not corridor:
				continue
			if R.next() < .08:
				wov[j * w + i] = R.rint(1, 4)
			var fy := T(i, j + 1) == 1
			var fx := T(i + 1, j) == 1
			if (fy or fx) and R.next() < .03:
				var x: float = i + .5 if fy else i + 1.0
				var y: float = j + 1.0 if fy else j + .5
				if not _props.any(func(p): return p.has("face") and hyp(p.x - x, p.y - y) < 2):
					_add(R.pick(["chains", "wallweb", "wallweb", "banner"]), x, y, {"face": "y" if fy else "x"})
	# rats (the browser rolls the count anew on every pass of its loop, so do we)
	var crit := []
	var k := 0
	while k < R.rint(6, 11):
		for tr in 20:
			var i := R.rint(3, w - 4)
			var j := R.rint(3, h - 4)
			if t[j * w + i] == 1:
				crit.append({"k": "rat", "x": i + .5, "y": j + .5, "a": R.rnd(0, 6.28), "sp": 0.0, "t": R.rnd(0, 3)})
				break
		k += 1
	m.merge({"theme": theme, "wov": wov, "drips": drips, "runes": runes, "crit": crit, "fireflies": fireflies, "spores": spores, "t": t}, true)
