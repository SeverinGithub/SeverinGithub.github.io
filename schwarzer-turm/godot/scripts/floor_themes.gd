class_name FloorThemes
## The tower's third and fourth pass, as they are built (genDungeon wrappers of 982-floor-themes.js and 984-tower-rooms.js):
## every three floors the tower changes its face (dungeon, library, foundry, cistern, clockwork, cathedral), some floors are
## cursed, windows look out at the sky, a light well opens through a great hall; from the second floor a special room
## (lever vault, trial, blood altar, prisoner), powder kegs and chandeliers, pressure plates, cracked floors and a lift.
## Each pass rolls with its own seeded random, so a floor is the same as in the browser. ThemeRun plays them.

const FTH := [
	{"id": "kerker", "n": "Der Kerker", "d": "Zellen, Ketten und feuchtes Stroh", "tint": null, "dark": Color8(4, 3, 2), "amb": "drip"},
	{"id": "biblio", "n": "Die Bibliothek", "d": "Regale bis unter die Gewölbe", "tint": Color8(150, 96, 40), "dark": Color8(7, 4, 2), "amb": "dust"},
	{"id": "giess", "n": "Die Gießerei", "d": "Glut steht in offenen Becken", "tint": Color8(230, 80, 20), "dark": Color8(12, 3, 0), "amb": "ember"},
	{"id": "zist", "n": "Die Zisterne", "d": "Schwarzes Wasser unter tropfenden Bögen", "tint": Color8(40, 110, 170), "dark": Color8(0, 4, 10), "amb": "drip"},
	{"id": "uhr", "n": "Das Uhrwerk", "d": "Zahnräder mahlen in den Wänden", "tint": Color8(200, 150, 60), "dark": Color8(7, 5, 1), "amb": "dust"},
	{"id": "kath", "n": "Die Kathedrale", "d": "Bunte Fenster über kalten Bänken", "tint": Color8(140, 90, 210), "dark": Color8(5, 2, 9), "amb": "mote"},
]
## a cursed floor is harder and pays better: more experience, more loot (the key order is the browser's)
const CURSE_KEYS := ["blut", "nebel", "frost", "finster", "raserei"]
const CURSE := {
	"blut": {"n": "Blutmond", "d": "Gegner schlagen härter und laufen schneller", "col": Color("#ff5a4a"), "dark": Color8(22, 2, 2), "tint": Color8(200, 20, 10)},
	"nebel": {"n": "Nebel", "d": "Dichter Nebel schluckt dein Licht", "col": Color("#c8d0d8"), "dark": Color8(30, 32, 36), "light": .62},
	"frost": {"n": "Frost", "d": "Die Kälte bremst deine Schritte", "col": Color("#9ad8ff"), "dark": Color8(2, 6, 14), "tint": Color8(120, 190, 255), "spd": .85},
	"finster": {"n": "Finsternis", "d": "Entzünde die Feuerbecken, um wieder zu sehen", "col": Color("#b8a8d8"), "light": .5, "a": .985},
	"raserei": {"n": "Raserei", "d": "Gegner greifen schneller an", "col": Color("#ffa040")},
}
const GLASS := [Color8(230, 60, 60), Color8(80, 130, 255), Color8(250, 200, 60), Color8(170, 90, 230)]
const GEMS := [
	{"n": "das Blut", "c": Color("#e0302a"), "l": Color8(255, 60, 40)},
	{"n": "der Himmel", "c": Color("#3a8aff"), "l": Color8(80, 140, 255)},
	{"n": "das Gift", "c": Color("#5ae040"), "l": Color8(110, 230, 80)},
	{"n": "das Gold", "c": Color("#ffc830"), "l": Color8(255, 200, 60)},
]
const TWK := ["schatz", "pruefung", "altar", "gefangener"]
const PRISONERS := ["Alrik", "Wendela", "Hagen", "Ysra", "Tankred", "Mirla", "Odo", "Brunhild"]

static func theme_of(f: int):
	return FTH[int((f - 1) / 3) % FTH.size()] if f > 0 else null

static func title(f: int) -> String:
	if f < 0:
		return Game.crypt_name if Game.crypt_name != "" else "Gruft"
	var th = theme_of(f)
	if th == null:
		return "Ebene %d" % f
	return "Ebene %d · %s" % [f, String(th.n).trim_prefix("Der ").trim_prefix("Die ").trim_prefix("Das ")]

static func hyp(x: float, y: float) -> float:
	return sqrt(x * x + y * y)

## both passes, in the browser's order: themes and curse (seed·5153 + f·7907), then the rooms (seed·3301 + f·6007)
static func dress(m: Dictionary, seed_value: int, f: int, done: Dictionary) -> void:
	var R := Rng.new(seed_value * 5153 + f * 7907)
	m.fth = theme_of(f)
	if f >= 3 and R.next() < .3:
		m.curse = R.pick(CURSE_KEYS)
	_ft_dress(m, R)
	_tw_dress(m, f, Rng.new(seed_value * 3301 + f * 6007), done)

# ---------- placing things on a fresh map ----------

static func _tile(m: Dictionary, i: int, j: int) -> int:
	if i < 0 or j < 0 or i >= m.w or j >= m.h:
		return -1
	return m.t[j * m.w + i]

static func clear(m: Dictionary, x: float, y: float, rad: float) -> bool:
	for j in range(floori(y - rad), floori(y + rad) + 1):
		for i in range(floori(x - rad), floori(x + rad) + 1):
			if hyp(i + .5 - x, j + .5 - y) <= rad + .5 and _tile(m, i, j) != 1:
				return false
	return true

static func far(m: Dictionary, x: float, y: float, d: float) -> bool:
	for o in m.objs:
		if hyp(o.x - x, o.y - y) < d:
			return false
	return hyp(m.start.x - x, m.start.y - y) > d + 1

static func spot(m: Dictionary, r: Dictionary, R: Rng, rad := 1.0, away := 2.0):
	for k in 40:
		var x := floorf(R.rnd(r.x + 1, r.x + r.w - 1)) + .5
		var y := floorf(R.rnd(r.y + 1, r.y + r.h - 1)) + .5
		if clear(m, x, y, rad) and far(m, x, y, away):
			return Vector2(x, y)
	return null

static func _wall_spots(m: Dictionary, n: int, gap: float, R: Rng) -> Array:
	var out := []
	var g := 0
	while g < n * 80 and out.size() < n:
		g += 1
		var i := R.rint(3, m.w - 4)
		var j := R.rint(3, m.h - 4)
		if _tile(m, i, j) != 2:
			continue
		var fy := _tile(m, i, j + 1) == 1 and _tile(m, i - 1, j) == 2 and _tile(m, i + 1, j) == 2 and _tile(m, i - 1, j + 1) == 1 and _tile(m, i + 1, j + 1) == 1
		var fx := not fy and _tile(m, i + 1, j) == 1 and _tile(m, i, j - 1) == 2 and _tile(m, i, j + 1) == 2 and _tile(m, i + 1, j - 1) == 1 and _tile(m, i + 1, j + 1) == 1
		if not fy and not fx:
			continue
		var x: float = i + .5 if fy else i + 1.0
		var y: float = j + 1.0 if fy else j + .5
		var bad := false
		for p in m.props:
			if p.has("face") and hyp(p.x - x, p.y - y) < minf(gap, 2.2):
				bad = true
				break
		if not bad:
			for p in out:
				if hyp(p.x - x, p.y - y) < gap:
					bad = true
					break
		if not bad:
			for o in m.objs:
				if hyp(o.x - x, o.y - y) < 1.5:
					bad = true
					break
		if bad:
			continue
		out.append({"x": x, "y": y, "face": "y" if fy else "x"})
	return out

static func _pool(m: Dictionary, r: Dictionary, arr: Array, rad: float, R: Rng) -> void:
	for k in 24:
		var x := R.rnd(r.x + rad + 1, r.x + r.w - rad - 1)
		var y := R.rnd(r.y + rad + 1, r.y + r.h - rad - 1)
		if hyp(x - r.cx - .5, y - r.cy - .5) < 2.6 or not clear(m, x, y, rad + .6) or not far(m, x, y, rad + 2):
			continue
		var near := false
		for p in m.lava + m.water:
			if hyp(p.x - x, p.y - y) < p.r + rad + 1.2:
				near = true
				break
		if near:
			continue
		arr.append({"x": x, "y": y, "r": rad, "ph": R.rnd(0, 6)})
		return

static func _face_prop(k: String, s: Dictionary, v: int, ph: float) -> Dictionary:
	return {"k": k, "x": s.x, "y": s.y, "face": s.face, "v": v, "ph": ph}

## ftDress: windows, the theme's furniture, pools, vents, pews, the light well
static func _ft_dress(m: Dictionary, R: Rng) -> void:
	var th: Dictionary = m.fth
	var rooms: Array = m.rooms.filter(func(r): return not (r == m.startRoom) and not (m.boss and (r == m.endRoom)))
	m.lava = []
	m.water = []
	m.vents = []
	for s in _wall_spots(m, R.rint(3, 5), 9, R):
		var v := R.rint(0, 3)
		m.props.append(_face_prop("ftglass" if th.id == "kath" else "ftwin", s, v, R.rnd(0, 6)))
	match th.id:
		"kerker":
			for s in _wall_spots(m, R.rint(8, 12), 4, R):
				var v := R.rint(0, 2)
				m.props.append(_face_prop("ftbars", s, v, R.rnd(0, 6)))
		"biblio":
			for s in _wall_spots(m, R.rint(24, 32), 2.1, R):
				m.props.append(_face_prop("ftshelf", s, R.rint(0, 3), 0))
			for r in rooms:
				if R.next() < .6:
					for k in R.rint(1, 3):
						var p = spot(m, r, R, 1)
						if p != null:
							m.props.append({"k": "ftcandle", "x": p.x, "y": p.y, "ph": R.rnd(0, 6), "v": 0})
		"giess":
			for r in rooms:
				if R.next() < .75:
					for k in R.rint(1, 3):
						_pool(m, r, m.lava, R.rnd(1.1, 2.1), R)
			for L in m.lava:
				m.props.append({"k": "ftlavaL", "x": L.x, "y": L.y, "ph": L.ph, "r": L.r})
			for r in rooms:
				if R.next() < .45:
					var p = spot(m, r, R, 1, 2)
					if p != null:
						m.props.append({"k": "ftcruc", "x": p.x, "y": p.y, "ph": R.rnd(0, 6), "v": 0})
		"zist":
			for r in rooms:
				if R.next() < .8:
					for k in R.rint(1, 3):
						_pool(m, r, m.water, R.rnd(1.4, 2.7), R)
		"uhr":
			for s in _wall_spots(m, R.rint(10, 16), 5, R):
				var v := R.rint(0, 2)
				m.props.append(_face_prop("ftgear", s, v, R.rnd(0, 6)))
			for r in rooms:
				if R.next() < .65:
					for k in R.rint(1, 2):
						var p = spot(m, r, R, 1, 2.5)
						if p != null:
							var t0 := R.rnd(0, 4)
							m.vents.append({"x": p.x, "y": p.y, "t": t0, "per": R.rnd(3.6, 5.2)})
		"kath":
			for r in rooms:
				if r.w >= 14 and r.h >= 14 and R.next() < .65:
					for row in range(-2, 3):
						for s in [-1, 1]:
							var x: float = r.cx + .5 + s * 2.4
							var y: float = r.cy + .5 + row * 1.7
							if clear(m, x, y, 1) and far(m, x, y, 1.6):
								m.props.append({"k": "ftpew", "x": x, "y": y, "v": 0, "ph": 0})
	if R.next() < .45:
		var halls := rooms.filter(func(r): return (r.shape == "hall" or r.shape == "round") and r.w >= 15 and r.h >= 15)
		TowerTwo.v8_shuffle(halls, R)
		for r in halls:
			if _well(m, r, R):
				break
	if m.get("curse") == "finster":
		for p in m.props:
			if p.k == "brazier":
				p.k = "ftcold"

## ftWell: a round shaft through the middle of a great hall, light from above and the dark of the floors below
static func _well(m: Dictionary, r: Dictionary, R: Rng) -> bool:
	var x: float = r.cx + .5
	var y: float = r.cy + .5
	var rad := 2.6
	if not clear(m, x, y, 5.4) or not far(m, x, y, 5.5):
		return false
	var t: PackedByteArray = m.t
	for j in range(floori(y - rad), floori(y + rad) + 1):
		for i in range(floori(x - rad), floori(x + rad) + 1):
			if hyp(i + .5 - x, j + .5 - y) < rad:
				t[j * m.w + i] = 0
	m.t = t
	m.props = m.props.filter(func(p): return hyp(p.x - x, p.y - y) > rad + .9)
	m.deco = m.deco.filter(func(d): return hyp(d.x - x, d.y - y) > rad + .5)
	for k in 12:
		var a := k / 12.0 * 6.283 + .26
		m.props.append({"k": "ftpost", "x": x + cos(a) * (rad + .75), "y": y + sin(a) * (rad + .75), "v": 0, "ph": 0})
	m.props.append({"k": "shaft", "x": x, "y": y, "ph": R.rnd(0, 6)})
	m.well = {"x": x, "y": y, "r": rad, "room": r}
	return true

# ---------- the rooms of 984 ----------

## twAt: the nearest free spot around a point, in rings of half a step
static func at(m: Dictionary, cx: float, cy: float, rad: float, away := 1.6):
	var r := 0.0
	while r < 6:
		var a := 0.0
		while a < 6.28:
			var x := floorf(cx + cos(a) * r) + .5
			var y := floorf(cy + sin(a) * r) + .5
			if clear(m, x, y, rad):
				var ok := true
				for o in m.objs:
					if hyp(o.x - x, o.y - y) < away:
						ok = false
						break
				if ok:
					return Vector2(x, y)
			a += .6
		r += .5
	return null

static func _tw_dress(m: Dictionary, f: int, R: Rng, done: Dictionary) -> void:
	var well = m.get("well")
	var rooms: Array = m.rooms.filter(func(r): return not (r == m.startRoom) and not (r == m.endRoom) and not (well and (well.room == r)))
	TowerTwo.v8_shuffle(rooms, R)
	var L := func(x: float, y: float, col: Color, r: float, hh: float) -> Dictionary:
		var p := {"k": "twL", "x": x, "y": y, "col": col, "r": r, "h": hh, "ph": R.rnd(0, 6)}
		m.props.append(p)
		return p
	# one special room on every floor from the second
	if f >= 2 and rooms.size():
		var r: Dictionary = rooms.pop_front()
		var k: String = TWK[(f + R.rint(0, 3)) % 4]
		var S := {"k": k, "id": "%d:%s" % [f, k], "cx": r.cx + .5, "cy": r.cy + .5, "rad": maxf(4, minf(r.w, r.h) / 2.0 - 1.2)}
		m.sroom = S
		var was: bool = done.has(S.id)
		var c = at(m, S.cx, S.cy, 1.2, 2.5)
		if c != null:
			S.cx = c.x
			S.cy = c.y
		match k:
			"schatz":
				var gs := TowerTwo.v8_shuffle([0, 1, 2, 3], R).slice(0, 3)
				S.order = TowerTwo.v8_shuffle(gs.duplicate(), R)
				S.step = 0
				S.solved = was
				m.objs.append({"type": "twvault", "x": S.cx, "y": S.cy, "open": was, "locked": not was})
				L.call(S.cx, S.cy, Color8(255, 200, 90), 130.0, 20.0)
				for n in gs.size():
					var a: float = n / 3.0 * 6.283 + R.next()
					var p = at(m, S.cx + cos(a) * 3, S.cy + sin(a) * 3, .8, 1.6)
					if p != null:
						m.objs.append({"type": "twlever", "x": p.x, "y": p.y, "gem": gs[n], "on": was})
				var q = at(m, S.cx + 2, S.cy - 1.5, .8, 1.4)
				if q != null:
					m.objs.append({"type": "twplaque", "x": q.x, "y": q.y})
			"pruefung":
				m.objs.append({"type": "twtrial", "x": S.cx, "y": S.cy})
				S.done = was
				L.call(S.cx, S.cy, Color8(255, 70, 50), 150.0, 20.0)
			"altar":
				m.objs.append({"type": "twaltar", "x": S.cx, "y": S.cy, "used": was})
				L.call(S.cx, S.cy, Color8(255, 40, 30), 150.0, 20.0)
				for n in 6:
					var a := n / 6.0 * 6.283
					m.props.append({"k": "dccand", "x": S.cx + cos(a) * 1.6, "y": S.cy + sin(a) * 1.6, "v": 0, "ph": R.rnd(0, 6)})
				for n in 5:
					var bx: float = S.cx + R.rnd(-1.4, 1.4)
					var by: float = S.cy + R.rnd(-1.4, 1.4)
					m.deco.append({"k": "blood", "x": bx, "y": by, "v": R.rint(0, 3)})
			"gefangener":
				m.objs.append({"type": "twcage", "x": S.cx, "y": S.cy, "open": was, "name": R.pick(PRISONERS)})
				L.call(S.cx, S.cy, Color8(255, 170, 80), 110.0, 20.0)
	# powder kegs and chandeliers: they hurt whoever stands near, foes too
	m.hz = []
	for r in m.rooms:
		if (r == m.startRoom) or (m.boss and (r == m.endRoom)):
			continue
		if R.next() < .4:
			for n in R.rint(1, 3):
				var p = spot(m, r, R, .6, 1.8)
				if p != null and not m.hz.any(func(z): return hyp(z.x - p.x, z.y - p.y) < 1.2):
					m.hz.append({"k": "barrel", "x": p.x, "y": p.y})
		if r.w >= 14 and r.h >= 14 and R.next() < .35:
			var ax: float = r.cx + .5 + R.rnd(-2, 2)
			var ay: float = r.cy + .5 + R.rnd(-2, 2)
			var p = at(m, ax, ay, 1, 2)
			if p != null and (well == null or hyp(p.x - well.x, p.y - well.y) > well.r + 2):
				var pr: Dictionary = L.call(p.x, p.y, Color8(255, 190, 100), 210.0, 70.0)
				m.hz.append({"k": "chand", "x": p.x, "y": p.y, "prop": pr})
	# pressure plates: a stone gives under the foot, arrows fly from the wall across the room
	m.plates = []
	if f >= 2:
		for r in m.rooms:
			if (r == m.startRoom) or R.next() > .3:
				continue
			var p = spot(m, r, R, .6, 2.5)
			if p == null:
				continue
			var d := Vector2(1, 0) if R.next() < .5 else Vector2(0, 1)
			var a := 0
			var b := 0
			while _tile(m, floori(p.x - d.x * (a + 1)), floori(p.y - d.y * (a + 1))) == 1 and a < 12:
				a += 1
			while _tile(m, floori(p.x + d.x * (b + 1)), floori(p.y + d.y * (b + 1))) == 1 and b < 12:
				b += 1
			if a + b < 5:
				continue
			m.plates.append({"x": p.x, "y": p.y, "sx": p.x - d.x * (a + .45), "sy": p.y - d.y * (a + .45), "ang": atan2(d.y, d.x), "len": a + b + .9, "cd": 0.0, "dn": 0.0})
	# cracked floors: step on one and you fall to the next floor, hurt but quicker
	m.cracks = []
	if f >= 2 and not m.boss:
		for r in rooms.slice(0, R.rint(1, 2)):
			var p = spot(m, r, R, 1, 3)
			if p != null:
				m.cracks.append({"x": p.x, "y": p.y, "st": 0, "t": 0.0, "seed": R.rint(0, 999)})
	# a lift beside the stairs: unlock it from below once, then it rides between stairs and bonfire
	if f >= 2 and not m.boss:
		var st = null
		var sh = null
		for o in m.objs:
			if o.type == "stairs" and st == null:
				st = o
			if o.type == "shrine" and sh == null:
				sh = o
		if st and sh:
			var a = at(m, st.x + 2.2, st.y - 1.2, 1, 1.8)
			var b = at(m, sh.x - 2, sh.y + 1.6, 1, 1.8)
			if a != null and b != null:
				m.objs.append({"type": "twlift", "x": a.x, "y": a.y, "low": true})
				m.objs.append({"type": "twlift", "x": b.x, "y": b.y, "low": false})
				L.call(a.x, a.y, Color8(255, 190, 110), 100.0, 20.0)
				L.call(b.x, b.y, Color8(255, 190, 110), 100.0, 20.0)
