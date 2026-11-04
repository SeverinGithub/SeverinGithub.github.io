class_name TowerTwo
## The tower, second pass (760-tower-2.js): a cracked wall with a hidden chamber behind, rolling boulders in long rooms and
## bones, urns, candles, cages and banners lying about; with them the traps of 390-combat-roles.js (spike plates and fire
## spouts), because what lies about keeps clear of them. Here is where everything goes and how a chamber opens; the level
## runs the wall, the boulders and the traps (level.gd) and Prop paints them.

## what lies about in the tower, with weights
const DCK := [["dcbones", 5], ["dcskulls", 3], ["dcurn", 4], ["dccand", 3], ["dcrubble", 5], ["dcsword", 2], ["dcbook", 2], ["dccage", 1], ["dcbanner", 2]]

## Array.prototype.sort as V8 runs it, with a comparator that only rolls dice: the browser shuffles rooms with
## sort(()=>R()-.5), so the same rolls must fall in the same order. Up to 15 elements V8 sorts by plain binary insertion
## from the second element; from 16 to 63 TimSort first counts a run (ascending or strictly descending), then inserts the
## rest. Measured against the browser for 2–63 elements, 20 seeds each (2026-11-04).
static func v8_shuffle(a: Array, R: Rng) -> Array:
	var n := a.size()
	if n < 2:
		return a
	var cmp := func() -> float: return R.next() - .5
	if n <= 15:
		_insert_from(a, 1, cmp)
		return a
	# the first run: ascending or strictly descending
	var run := 2
	var desc: bool = cmp.call() < 0
	for idx in range(2, n):
		var o: float = cmp.call()
		if (desc and o >= 0) or (not desc and o < 0):
			break
		run += 1
	if desc:
		var head := a.slice(0, run)
		head.reverse()
		for k in run:
			a[k] = head[k]
	# then binary insertion of the rest (minrun is the whole array below 64)
	_insert_from(a, run, cmp)
	return a

static func _insert_from(a: Array, run: int, cmp: Callable) -> void:
	for start in range(run, a.size()):
		var left := 0
		var right := start
		var pivot = a[start]
		while left < right:
			var mid := left + ((right - left) >> 1)
			if cmp.call() < 0:
				right = mid
			else:
				left = mid + 1
		for p in range(start, left, -1):
			a[p] = a[p - 1]
		a[left] = pivot

# ---------- the cracked wall and its chamber ----------

## a room wall of one tile masonry with only the dark behind it, room for a chamber 4×5 and its own walls (secretSpot)
static func secret_spot(m: Dictionary, R: Rng) -> Variant:
	var w: int = m.w
	var t: PackedByteArray = m.t
	var T := func(i: int, j: int) -> int: return -1 if i < 3 or j < 3 or i >= w - 3 or j >= m.h - 3 else t[j * w + i]
	var rooms := v8_shuffle(m.rooms.filter(func(r): return r != m.startRoom and not (m.boss and r == m.endRoom)), R)
	for r in rooms:
		for dir in [[-1, 0], [0, -1]]:
			var pr := [0, 1] if dir[0] else [1, 0]
			for off in range(-3, 4):
				var fi: int = r.cx + pr[0] * off
				var fj: int = r.cy + pr[1] * off
				if T.call(fi, fj) != 1:
					continue
				var k := 0
				while k < 20 and T.call(fi + dir[0], fj + dir[1]) == 1:
					fi += dir[0]
					fj += dir[1]
					k += 1
				if T.call(fi + pr[0], fj + pr[1]) != 1:
					continue
				var A := func(d: int, q: int) -> int: return T.call(fi + dir[0] * d + pr[0] * q, fj + dir[1] * d + pr[1] * q)
				var ok := true
				for q in range(-1, 3):
					if A.call(1, q) != 2:
						ok = false
						break
				if ok:
					for d in range(2, 7):
						for q in range(-2, 4):
							if A.call(d, q) != 0:
								ok = false
								break
						if not ok:
							break
				if not ok:
					continue
				var at := func(d: int, q: int) -> Vector2i: return Vector2i(fi + dir[0] * d + pr[0] * q, fj + dir[1] * d + pr[1] * q)
				var box: Array = []
				var ring: Array = []
				for q in range(0, 2):
					box.append(at.call(1, q))
				for d in range(2, 7):
					for q in range(-2, 4):
						(box if d <= 5 and q >= -1 and q <= 2 else ring).append(at.call(d, q))
				for q in [-2, 3]:
					ring.append(at.call(1, q))
				return {"fi": fi, "fj": fj, "dir": Vector2i(dir[0], dir[1]), "pr": Vector2i(pr[0], pr[1]), "box": box, "ring": ring, "open": false}
	return null

## the wall that takes blows like a foe (secretWall): no will, only cracks that widen
static func secret_wall(S: Dictionary, f: int, ml: int, R: Rng) -> Enemy:
	var x: float = S.fi + .5 + S.dir.x * .7 + S.pr.x * .5
	var y: float = S.fj + .5 + S.dir.y * .7 + S.pr.y * .5
	var e := Enemy.make("golem", Vector2(x, y), "normal", ml, R)
	R.next()                     # makeEnemy also rolls the frame of its animation
	e.wall = true
	e.e_name = "Rissige Wand"
	e.sub = "Schlag zu, um sie aufzubrechen"
	e.hp = 80 + f * 30
	e.max_hp = e.hp
	e.dmg = [0.0, 0.0]
	e.spd = 0
	e.xp = 0
	e.aff = []
	e.r = .7
	e.cd = 1e9
	e.scale_f = 1
	e.elem = null
	e.face = 0
	var R0 := Rng.new(f * 977 + S.fi * 31 + S.fj)
	for k in 7:
		var a := R0.next() * 6.28
		var l := 6 + R0.next() * 14
		e.cracks.append([R0.next() * 20 - 10, -10 - R0.next() * 44, a, l])
	return e

## the wall gives way: the chamber is floor, its edge masonry, a chest stands inside between two candles (secretOpen)
static func secret_open(m: Dictionary) -> Dictionary:
	var S: Dictionary = m.secret
	S.open = true
	var t: PackedByteArray = m.t
	for p in S.box:
		t[p.y * m.w + p.x] = 1
	for p in S.ring:
		if t[p.y * m.w + p.x] == 0:
			t[p.y * m.w + p.x] = 2
	m.t = t
	var cx: float = S.fi + .5 + S.dir.x * 3.6 + S.pr.x * .5
	var cy: float = S.fj + .5 + S.dir.y * 3.6 + S.pr.y * .5
	var ch := {"type": "chest", "x": cx, "y": cy, "open": false, "secret": true}
	m.objs.append(ch)
	var cands: Array = []
	for q in [-1.1, 1.1]:
		var c := {"k": "dccand", "x": cx + q * S.pr.x + S.dir.x * .9, "y": cy + q * S.pr.y + S.dir.y * .9, "v": 0, "ph": randf() * 6}
		m.props.append(c)
		cands.append(c)
	return {"chest": ch, "cands": cands}

# ---------- rolling boulders ----------

## a stone in a niche at one end of a long room (boulderSpot)
static func boulder_spot(m: Dictionary, r: Dictionary, R: Rng) -> Variant:
	var w: int = m.w
	var t: PackedByteArray = m.t
	var T := func(i: int, j: int) -> int: return t[j * w + i]
	for dir in R.pick([[[1, 0], [0, 1]], [[0, 1], [1, 0]]]):
		var i: int = r.cx
		var j: int = r.cy
		if T.call(i, j) != 1:
			continue
		while T.call(i - dir[0], j - dir[1]) == 1:
			i -= dir[0]
			j -= dir[1]
		var len := 0
		while T.call(i + dir[0] * (len + 1), j + dir[1] * (len + 1)) == 1 and len < 30:
			len += 1
		if len < 8:
			continue
		return {"k": "boulder", "x": i + .5, "y": j + .5, "x0": i + .5, "y0": j + .5, "ang": atan2(dir[1], dir[0]), "len": len + .2, "st": 0, "t": 0.0, "cd": R.rnd(1, 3), "p": 0.0, "rot": 0.0}
	return null

# ---------- traps (390-combat-roles.js) ----------

## spike plates and fire spouts in a third of the rooms from the second floor; new on every visit (unseeded in the browser)
static func traps(m: Dictionary, free_at: Callable) -> Array:
	var out: Array = []
	if m.floor < 2:
		return out
	var R := Rng.unseeded()
	for r in m.rooms:
		if r == m.startRoom or (m.boss and r == m.endRoom) or randf() > .32:
			continue
		if randf() < .6:
			for k in R.rint(2, 4):
				var x: float = floor(r.x + R.rnd(1, r.w - 1)) + .5
				var y: float = floor(r.y + R.rnd(1, r.h - 1)) + .5
				if free_at.call(x, y, .4) and not out.any(func(q): return Vector2(q.x - x, q.y - y).length() < 1.2):
					out.append({"k": "spike", "x": x, "y": y, "t": 0.0, "st": 0})
		else:
			var dir: Array = R.pick([[1, 0], [-1, 0], [0, 1], [0, -1]])
			var cx: float = r.cx + .5
			var cy: float = r.cy + .5
			var x := cx
			var y := cy
			for k in 20:
				if not free_at.call(x - dir[0], y - dir[1], .3):
					break
				x -= dir[0]
				y -= dir[1]
			var d := Vector2(x - cx, y - cy).length()
			if d > 2:
				out.append({"k": "jet", "x": x, "y": y, "ang": atan2(dir[1], dir[0]), "len": minf(6, d * 2), "t": R.rnd(0, 3), "per": R.rnd(3.2, 4.4)})
	return out

# ---------- lying about (dungeonDecor) ----------

static func decor(m: Dictionary, used_extra: Array, R: Rng) -> void:
	var w: int = m.w
	var t: PackedByteArray = m.t
	var T := func(i: int, j: int) -> int: return t[j * w + i]
	var used: Array = []
	for o in m.objs.slice(0, m.get("objs0", m.objs.size())):
		used.append(Vector2(o.x, o.y))
	for o in used_extra:
		used.append(Vector2(o.x, o.y))
	var st := Vector2(m.start.x, m.start.y)
	var n := R.rint(26, 38)
	var q := 0
	var g := 0
	while q < n and g < 600:
		g += 1
		var i := R.rint(4, w - 5)
		var j := R.rint(4, m.h - 5)
		if T.call(i, j) != 1:
			continue
		var c := 0
		for a in range(-1, 2):
			for b in range(-1, 2):
				if (a or b) and T.call(i + a, j + b) == 1:
					c += 1
		if c < 8:
			continue
		var x := i + R.rnd(.2, .8)
		var y := j + R.rnd(.2, .8)
		if Vector2(x, y).distance_to(st) < 4 or used.any(func(o): return Vector2(o.x - x, o.y - y).length() < 1.6):
			continue
		var k: String = R.wpick(DCK)
		var ph := R.rnd(0, 6)
		m.props.append({"k": k, "x": x, "y": y, "v": 0, "ph": ph, "f": R.next() < .5})
		used.append(Vector2(x, y))
		q += 1

## everything the second pass adds when a floor is entered (the populate wrapper of 760): the secret and the boulders once,
## the wall again while the chamber is shut, what lies about once. Returns the wall, if one stands.
static func populate(m: Dictionary, seed_value: int, ml: int) -> Enemy:
	var f: int = m.floor
	var R := Rng.new(seed_value * 6151 + f * 92821)
	if not m.has("secret"):
		m.secret = null
		if f >= 2 and R.next() < .5:
			m.secret = secret_spot(m, R)
	var wall: Enemy = null
	if m.secret != null and not m.secret.open:
		wall = secret_wall(m.secret, f, ml, R)
	if not m.has("boulders"):
		m.boulders = []
		if f >= 3:
			for r in m.rooms:
				if r == m.startRoom or (m.boss and r == m.endRoom) or R.next() > .2:
					continue
				var b = boulder_spot(m, r, R)
				if b != null:
					m.boulders.append(b)
					m.props.append({"k": "dcboulder", "x": b.x, "y": b.y, "v": 0, "ph": 0, "trap": b})
	if not m.has("dc"):
		m.dc = 1
		decor(m, m.get("traps", []) + m.boulders, R)
	return wall
