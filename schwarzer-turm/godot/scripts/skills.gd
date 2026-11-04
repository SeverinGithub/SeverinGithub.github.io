class_name Skills
extends Node
## The hero's skills in a level: castSkill (170-combat.js) and what each skill does, from the warrior's (040, 470),
## the mage's spells in four elements with their resonances (470), the huntress's and the weapon sets' (640: twin blades,
## long blade, hammer, spear) and the alchemist's flasks and arrows (860, 900). Also what they leave behind: burning ground,
## storms, traps, the healing mist, buffs that run down, poison on foes. Lives as a child of the Level and works on its P and foes.
## The effects are drawn by Fx (zones and traps on the ground, lightning in the world).

var L: Level
var R := Rng.unseeded()
var cds := {}                    # skill → seconds until it can be cast again
var zones: Array = []            # {k: meteor, burn, rain, hail, thunder, mcloud, x, y, r, t, dur, tick, acc, dmg}
var traps: Array = []
var bolts: Array = []            # lightning lines {a, b, t}
var heals: Array = []            # healing mists {x, y, t, dur, rate}
var queue: Array = []            # {t, f}: what happens a moment later (setTimeout in the browser)
var m_last = null                # the mage's last spell and when, for resonances
var m_impact = null
var m_jump_from = null
var oil_i := 0

const BUFFS := [["cryT", "cry", "Wut"], ["atemT", "atem", "Zweiter Atem"], ["oathT", "schwur", "Heiliger Schwur"], ["fuseT", "m_fuse", "Verschmelzung"], ["venomT", "venom", "Giftklinge"], ["shadowT", "dash", "Schattenschritt"], ["oilT", "a_oil", "Alchemistenöl"]]

var P: Dictionary:
	get: return L.P

func _init(level: Level) -> void:
	L = level

# ---------- numbers ----------

func spell_base(id: String, l: int) -> float:
	var d := Game.d
	if id == "trap":
		return (10 + l * 7) * (1 + d.s.dex * .015)
	return {"fire": 6 + l * 5, "nova": 5 + l * 4, "chain": 5 + l * 5, "ward": 25 + l * 18, "meteor": 16 + l * 11, "blink": 5 + l * 3}[id] * d.spellMul

func w_avg() -> float:
	return (Game.d.dmin + Game.d.dmax) / 2.0

func p_dmg(m: float) -> float:
	return (w_avg() + Game.d.ele) * m

func al_d(m: float) -> float:
	return p_dmg(m) * (1 + Game.d.potPow / 200.0)

func pos() -> Vector2:
	return Vector2(P.x, P.y)

func foes() -> Array:
	return L.enemies.filter(func(e): return not e.dead)

func later(sec: float, f: Callable) -> void:
	queue.append({"t": sec, "f": f})

static func dir(a: float) -> Vector2:
	return Vector2(cos(a), sin(a))

# ---------- casting ----------

## cast the skill in slot i towards a world point (castSkill)
func cast(i: int, tx: float, ty: float) -> void:
	if P.dead or P.roll > 0 or P.get("dash") or P.get("leap") or P.get("cast", 0) > 0 or P.atkT > 0:
		return
	var id: String = Game.sk_ids()[i]
	var l := Game.sk_lvl(i)
	if l <= 0:
		Game.log_msg(Game.sk_name(id) + " ist noch nicht erlernt (K).", Color("#a39b88"))
		return
	if cds.get(id, 0) > 0:
		return
	if id.begins_with("m_") and Game.m_elem() == null:
		Game.log_msg("Ohne Zauberstab kein Zauber. Leg einen Stab an.", Color("#a39b88"))
		return
	var cost := Game.sk_mana(id, l)
	if Game.mp < cost:
		Game.log_msg("Nicht genug Mana.", Color("#7aa4ff"))
		return
	if id != "dash":
		P.veilT = 0.0
	Game.mp -= cost
	cds[id] = float(Data.skill_info.skills[id].cd) * (1 - Game.d.cdr / 100.0)
	Game.sel = i
	var ang := atan2(ty - P.y, tx - P.x)
	P.face = ang
	P.cast = .28
	P.path = []
	P.target = null
	L.hero.face = ang
	L.hero.play("attack", L.hero.attack_time() / .35)
	if has_method("_" + id):
		call("_" + id, l, ang, tx, ty)

## the six slots of the weapon set or class, ready or not, for the bar
func cd_frac(i: int) -> float:
	var id: String = Game.sk_ids()[i]
	var cd: float = float(Data.skill_info.skills[id].cd) * (1 - Game.d.cdr / 100.0)
	return clampf(cds.get(id, 0.0) / cd, 0, 1) if cd > 0 else 0.0

# ---------- hitting ----------

func w_hit(e: Enemy, mult: float, o: Dictionary, from: Vector2) -> void:
	L.weapon_hit(e, mult)
	if o.get("kb") and not e.dead:
		L.hit_enemy(e, 0, {"kb": o.kb, "from": atan2(e.world.y - from.y, e.world.x - from.x)})
	if o.get("slow"):
		e.slow = maxf(e.slow, o.slow)
	if o.get("bleed") and not e.dead:
		e.dot_t = 3.0
		e.dot_d = maxf(e.dot_d, o.bleed)

func _mult(e: Enemy, mult: float, o: Dictionary) -> float:
	return mult * 2 if o.get("exec") and e.hp / e.max_hp < .3 else mult

func hit_arc(ang: float, r: float, arc: float, mult: float, o := {}) -> int:
	var n := 0
	for e in foes():
		var dv: Vector2 = e.world - pos()
		var d := dv.length()
		if d < r + e.r and (d < .5 or absf(angle_difference(ang, atan2(dv.y, dv.x))) < arc / 2):
			w_hit(e, _mult(e, mult, o), o, pos())
			n += 1
	return n

func hit_circ(c: Vector2, r: float, mult: float, o := {}) -> int:
	var n := 0
	for e in foes():
		if e.world.distance_to(c) < r + e.r and not (o.has("set") and o.set.has(e)):
			if o.has("set"):
				o.set[e] = true
			w_hit(e, _mult(e, mult, o), o, c)
			n += 1
	return n

func hit_line(c: Vector2, ang: float, ln: float, w: float, mult: float, o := {}) -> int:
	var cs := cos(ang)
	var sn := sin(ang)
	var n := 0
	for e in foes():
		var dx: float = e.world.x - c.x
		var dy: float = e.world.y - c.y
		var al := dx * cs + dy * sn
		var pe := absf(-dx * sn + dy * cs)
		if al > -.3 and al < ln and pe < w + e.r:
			w_hit(e, mult, o, c)
			n += 1
	return n

## an element's hit (eHit): frost slows, poison keeps eating
func e_hit(el: String, e: Enemy, dmg: float, o := {}) -> void:
	if e.dead:
		return
	var oo := o.duplicate()
	oo.col = Color(Data.skill_info.elements[el].col)
	if el == "frost":
		oo.slow = 2
	L.hit_enemy(e, dmg, oo)
	if el == "poison" and not e.dead:
		e.dot_t = 3.0
		e.dot_d = maxf(e.dot_d, dmg * .12)

func _ecol(el: String, i := 1) -> Color:
	return Color(Data.skill_info.elements[el].c[i])

# ---------- effects, small ----------

func shock(c: Vector2, r: float, col: Color) -> void:
	L.rings.append({"x": c.x, "y": c.y, "r": .2, "max": r, "v": r * 2.2, "col": col, "dmg": 0})

func slam_fx(c: Vector2, r: float) -> void:
	shock(c, r, Color("#c8b48c"))
	L.gore(c, 0, 12, "rock", .3)
	L._smoke(c, 5)
	L.shake = maxf(L.shake, 5)

func boom(c: Vector2, r: float, el: String) -> void:
	var col := Color("#ff9a30") if el == "fire" else (Color("#9ae050") if el == "poison" else Color("#c8e4ff"))
	L.burst(c, col, int(14 * r), 2.5 * r)
	shock(c, r * 1.3, col)
	L._flash(c, r)
	L.flashes.append({"x": c.x, "y": c.y, "r": 120 * r, "a": .8, "t": 0.0, "life": .25})

func zap(a: Vector2, b: Vector2) -> void:
	bolts.append({"a": a, "b": b, "t": .22, "seed": R.next()})
	L.sparks(b, .7, 0, 6, [Color.WHITE, Color("#cfe0ff"), Color("#7aa4ff")], 3.2)

func ghosts(c: Vector2) -> void:
	L.parts.append({"k": "smoke", "x": c.x, "y": c.y, "z": .4, "vx": 0.0, "vy": 0.0, "vz": .2, "t": 0.0, "life": .35, "col": Color(.5, .45, .7, .5), "s": 5.0, "g": 0.0})

# ---------- the warrior (040, 470) ----------

func _whirl(l: int, ang: float, _tx: float, _ty: float) -> void:
	P.cast = .35
	P.whirl = .35
	for k in 4:
		L.slash_fx(pos(), ang + k * 1.571, 2.4, 1.9, Color8(235, 225, 205), .5)
	L._smoke(pos(), 5)
	for e in foes():
		if e.world.distance_to(pos()) < 1.9 + e.r:
			L.weapon_hit(e, 1.1 + l * .15)
	L.rings.append({"x": P.x, "y": P.y, "r": .4, "max": 2.0, "v": 10.0, "col": Color("#e8e2d0"), "dmg": 0})

func _slam(l: int, ang: float, _tx: float, _ty: float) -> void:
	P.cast = .4
	var p0 := pos()
	for k in range(1, 13):
		var c := p0 + dir(ang) * k * .5
		if not L.walkable(c.x, c.y):
			break
		later(k * .025, func(): L.gore(c, ang, 4, "rock", .6); L._smoke(c, 2); shock(c, .8, Color8(200, 180, 140)))
	L.shake = maxf(L.shake, 6)
	for e in foes():
		var dx: float = e.world.x - p0.x
		var dy: float = e.world.y - p0.y
		var al := dx * cos(ang) + dy * sin(ang)
		var pe := absf(-dx * sin(ang) + dy * cos(ang))
		if al > 0 and al < 6.2 and pe < 1 + e.r:
			L.weapon_hit(e, 1.4 + l * .15)
			if not e.dead:
				L.hit_enemy(e, 0, {"kb": .9, "from": ang})

func _charge(l: int, ang: float, tx: float, ty: float) -> void:
	var d := minf(6, pos().distance_to(Vector2(tx, ty)))
	P.dash = {"ang": ang, "left": maxf(1, d), "l": l}
	P.cast = 0.0

func _cry(l: int, _ang: float, _tx: float, _ty: float) -> void:
	P.cryT = 30.0
	P.cryB = 20 + l * 3
	shock(pos(), 5, Color8(255, 120, 60))
	L.shake = maxf(L.shake, 5)
	L.ftext(pos() - Vector2(0, .4), "Kriegsschrei!", Color("#ff8a5a"), true)
	for e in foes():
		if e.world.distance_to(pos()) > 5:
			continue
		e.slow = maxf(e.slow, 3)
		if not e.boss:
			L.hit_enemy(e, 0, {"kb": 1.4})

func _atem(l: int, _ang: float, _tx: float, _ty: float) -> void:
	P.atemT = 30.0
	P.atemL = l
	shock(pos(), 2.2, Color8(255, 140, 120))
	L.ftext(pos() - Vector2(0, .5), "Zweiter Atem", Color("#ff9a8a"), true)

func _schwur(l: int, _ang: float, _tx: float, _ty: float) -> void:
	P.oathT = 30.0
	P.oathB = 60 + l * 8
	shock(pos(), 4, Color8(255, 220, 140))
	L.shake = maxf(L.shake, 4)
	L.ftext(pos() - Vector2(0, .5), "Heiliger Schwur", Color("#ffe08a"), true)
	for k in 26:
		var a := k / 26.0 * TAU
		L.parts.append({"k": "mote", "x": P.x + cos(a) * 1.4, "y": P.y + sin(a) * 1.4, "z": .2, "vx": 0.0, "vy": 0.0, "vz": R.rnd(1, 2.4), "t": 0.0, "life": R.rnd(.6, 1.1), "col": R.pick([Color("#fff0a8"), Color("#ffd88a"), Color.WHITE]), "s": R.rnd(1.2, 2), "g": -.03})

func _ward(l: int, _ang: float, _tx: float, _ty: float) -> void:
	P.ward = spell_base("ward", l)
	P.wardMax = P.ward
	P.wardT = 15.0
	L.burst(pos(), Color("#ece4cf"), 22, 2)

# ---------- the mage: four shapes in four elements (470) ----------

func _m_bolt(l: int, ang: float, tx: float, ty: float) -> void: _m_cast("m_bolt", l, ang, tx, ty)
func _m_ring(l: int, ang: float, tx: float, ty: float) -> void: _m_cast("m_ring", l, ang, tx, ty)
func _m_jump(l: int, ang: float, tx: float, ty: float) -> void: _m_cast("m_jump", l, ang, tx, ty)
func _m_storm(l: int, ang: float, tx: float, ty: float) -> void: _m_cast("m_storm", l, ang, tx, ty)
func _m_fuse(l: int, ang: float, tx: float, ty: float) -> void: _m_cast("m_fuse", l, ang, tx, ty)

func _m_cast(id: String, l: int, ang: float, tx: float, ty: float) -> void:
	var el: String = Game.m_elem()
	var now := Game.t
	var prev = m_last.id if m_last and now - m_last.t < 1.6 and m_last.id != id else null
	var fuse: bool = P.get("fuseT", 0) > 0
	m_last = {"id": id, "t": now}
	var col := Color(Data.skill_info.elements[el].col)
	var res := func(n: String): L.ftext(pos() - Vector2(0, .9), "Resonanz: " + n, col, true)
	match id:
		"m_bolt":
			var dmg := spell_base("fire", l)
			if prev == "m_ring":
				res.call("Kranz")
			if prev == "m_ring" or fuse:
				for k in 8:
					m_bolt(el, ang + k * PI / 4, dmg * .7, l)
			else:
				m_bolt(el, ang, dmg, l)
		"m_ring":
			var dmg := spell_base("nova", l)
			m_ring(el, pos(), dmg, l)
			if prev == "m_bolt" and m_impact and now - m_impact.t < 2:
				res.call("Einschlag")
				m_ring(el, m_impact.p, dmg * .8, l, true)
			if prev == "m_jump" and m_jump_from != null:
				res.call("Doppelring")
				m_ring(el, m_jump_from, dmg * .8, l, true)
		"m_jump":
			var e := pos()
			var d := minf(8, pos().distance_to(Vector2(tx, ty)))
			var s := 0.0
			while s <= d:
				var c := pos() + dir(ang) * s
				if L.free_at(c.x, c.y, P.r):
					e = c
				s += .25
			var dmg := spell_base("blink", l)
			m_jump_from = pos()
			m_burst(el, pos(), dmg)
			P.x = e.x
			P.y = e.y
			P.path = []
			P.iframe = .25
			m_burst(el, pos(), dmg)
			if prev == "m_storm" or fuse:
				res.call("Sturmlauf")
				m_storm(el, pos(), spell_base("meteor", l) * .6, false)
		"m_storm":
			var dist := minf(10, pos().distance_to(Vector2(tx, ty)))
			var c := pos() + dir(ang) * dist
			var big: bool = prev == "m_ring" or prev == "m_bolt"
			if big:
				res.call("Entfesselt")
			m_storm(el, c, spell_base("meteor", l) * (1.4 if big else 1.0), big)
			if fuse:
				var t: Enemy = null
				var bd := 12.0
				for e in foes():
					var dd: float = e.world.distance_to(c)
					if dd > 2.5 and dd < bd and e.world.distance_to(pos()) < 11:
						bd = dd
						t = e
				var c2 := t.world if t else c + Vector2(R.rnd(-3, 3), R.rnd(-3, 3))
				later(.35, func(): m_storm(el, c2, spell_base("meteor", l) * .8, false))
		"m_fuse":
			P.fuseT = 10 + l * .5
			for k in 4:
				shock(pos(), 3 + k * .6, _ecol(Data.skill_info.elements.keys()[k]))
			L.shake = maxf(L.shake, 5)
			L.ftext(pos() - Vector2(0, .6), "Verschmelzung", Color("#ffe8b0"), true)

func m_bolt(el: String, a: float, dmg: float, l: int, o := {}) -> void:
	var from: Vector2 = o.get("from", pos())
	var c := from + dir(a) * .4
	var col := Color(Data.skill_info.elements[el].col)
	var impact := func(p: Vector2):
		m_impact = {"p": p, "t": Game.t}
		if P.get("fuseT", 0) > 0 and not o.get("child", false):
			m_ring(el, p, dmg * .5, l, true)
	var mk := func(sp: float, extra: Dictionary):
		var p := {"x": c.x, "y": c.y, "vx": cos(a) * sp, "vy": sin(a) * sp, "owner": "p", "dmg": dmg, "kind": {"fire": "glut", "frost": "frost", "light": "light", "poison": "poison"}[el], "r": .3, "life": 1.3, "col": col}
		p.merge(extra, true)
		L.proj.append(p)
	match el:
		"fire":
			mk.call(10, {"aoe": 1.4, "boomE": "fire", "on_boom": func(p): impact.call(Vector2(p.x, p.y))})
		"frost":
			mk.call(17, {"pierce": true, "slow": 2, "big": true, "life": 1.0, "on_hit": func(_e, p):
				if not p.get("imp"):
					p.imp = true
					impact.call(Vector2(p.x, p.y))})
		"light":
			# no ball but a spark: it strikes the first foe in its line at once, or runs on to a wall
			var ca := cos(a)
			var sa := sin(a)
			var hit: Enemy = null
			var end := 10.0
			for e in foes():
				var dx: float = e.world.x - c.x
				var dy: float = e.world.y - c.y
				var t := dx * ca + dy * sa
				if t < 0 or t > end or absf(dy * ca - dx * sa) > .45 + e.r or not L.los(c, e.world):
					continue
				end = t
				hit = e
			if not hit:
				var s := .2
				while s < end:
					if not L.walkable(c.x + ca * s, c.y + sa * s):
						end = s
						break
					s += .2
			var b := hit.world if hit else c + Vector2(ca, sa) * end
			bolts.append({"a": c, "b": b, "t": .2, "seed": R.next()})
			L.sparks(b, .7, a + PI, 10, [Color.WHITE, Color("#cfe0ff"), Color("#7aa4ff")], 6)
			L.flashes.append({"x": b.x, "y": b.y, "r": 90.0, "a": .8, "t": 0.0, "life": .2})
			if hit:
				e_hit(el, hit, dmg * .85)
				impact.call(hit.world)
				jump_on(el, hit, dmg * .6, 2, {hit: true})
		_:
			mk.call(9, {"dmg": dmg * .7, "on_hit": func(e, p):
				impact.call(Vector2(p.x, p.y))
				if not e.dead:
					e.dot_t = 3.0
					e.dot_d = maxf(e.dot_d, dmg * .15)
				zones.append({"k": "mcloud", "x": p.x, "y": p.y, "r": 1.6, "t": 0.0, "dur": 3.0, "tick": .5, "acc": 0.0, "dmg": dmg * .12})})
	L._flash(c, .8)

func jump_on(el: String, from: Enemy, dmg: float, n: int, hit: Dictionary) -> void:
	var cur := from
	for k in n:
		var nx: Enemy = null
		var nd := 4.0
		for e in foes():
			if hit.has(e):
				continue
			var d: float = e.world.distance_to(cur.world)
			if d < nd:
				nd = d
				nx = e
		if not nx:
			break
		hit[nx] = true
		zap(cur.world, nx.world)
		e_hit(el, nx, dmg)
		cur = nx

func m_ring(el: String, c: Vector2, dmg: float, l: int, child := false) -> void:
	var on_hit = null
	if el == "light":
		on_hit = func(e):
			if R.next() < .5:
				jump_on(el, e, dmg * .4, 1, {e: true})
	elif el == "poison":
		on_hit = func(e):
			if not e.dead:
				e.dot_t = 3.0
				e.dot_d = maxf(e.dot_d, dmg * .15)
	L.rings.append({"x": c.x, "y": c.y, "r": .3, "max": 4.6, "v": 9.0, "col": _ecol(el), "hcol": Color(Data.skill_info.elements[el].col), "hit": {}, "dmg": dmg * .7 if el == "poison" else dmg, "slow": 2.5 if el == "frost" else 0.0, "on_hit": on_hit})
	if el == "light":
		for k in 12:
			var a := k / 12.0 * TAU
			bolts.append({"a": c, "b": c + dir(a) * R.rnd(2.6, 4.4), "t": R.rnd(.12, .24), "seed": R.next()})
	else:
		for k in 36:
			var a := k / 36.0 * TAU
			L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": .3 + R.rnd(0, .4), "vx": cos(a) * 9, "vy": sin(a) * 9, "vz": R.rnd(0, 1), "t": 0.0, "life": .5, "col": _ecol(el, R.rint(0, 2)), "s": R.rnd(2, 3.5), "g": .1})
	L.flashes.append({"x": c.x, "y": c.y, "r": 160.0, "a": .9, "t": 0.0, "life": .4})
	if el == "fire":
		zones.append({"k": "burn", "x": c.x, "y": c.y, "r": 2.0, "t": 0.0, "dur": 3.0, "tick": .5, "acc": 0.0, "dmg": dmg * .1})
	if P.get("fuseT", 0) > 0 and not child:
		for k in 8:
			m_bolt(el, k * PI / 4, spell_base("fire", l) * .5, l, {"from": c, "child": true})

func m_storm(el: String, c: Vector2, dmg: float, big: bool) -> void:
	var r := 2.4 * (1.35 if big else 1.0)
	match el:
		"fire": zones.append({"k": "meteor", "x": c.x, "y": c.y, "r": r, "t": 0.0, "dur": .9, "dmg": dmg})
		"frost": zones.append({"k": "hail", "x": c.x, "y": c.y, "r": r + .2, "t": 0.0, "dur": 2.4, "tick": .3, "acc": .3, "dmg": dmg * .2})
		"light": zones.append({"k": "thunder", "x": c.x, "y": c.y, "r": r + .6, "t": 0.0, "dur": 1.65, "tick": .27, "acc": .27, "dmg": dmg * .45})
		_: zones.append({"k": "mcloud", "x": c.x, "y": c.y, "r": r + .6, "t": 0.0, "dur": 4.0, "tick": .5, "acc": 0.0, "dmg": dmg * .15, "big": true})

func m_burst(el: String, c: Vector2, dmg: float) -> void:
	if el == "light":
		L.sparks(c, .5, 0, 26, [Color.WHITE, Color("#cfe0ff"), Color("#7aa4ff")], 8)
		shock(c, 1.8, Color("#b4c8ff"))
		for k in 3:
			bolts.append({"a": c, "b": c + Vector2(R.rnd(-1.6, 1.6), R.rnd(-1.6, 1.6)), "t": .2, "seed": R.next()})
	else:
		boom(c, .9, el)
	for e in foes():
		if e.world.distance_to(c) < 1.8 + e.r:
			e_hit(el, e, dmg * R.rnd(.85, 1.15))

# ---------- the huntress: twin blades (640) and the shadow step (040) ----------

func _d_flurry(l: int, _a: float, _tx: float, _ty: float) -> void:
	for k in 4:
		later(k * .085, func():
			L.slash_fx(pos(), P.face + (.4 if k % 2 else -.4), 1.7, 1.75, Color8(225, 235, 255), .5)
			hit_arc(P.face, 1.9, 1.9, .5 + l * .05))

func _d_dash(l: int, a: float, tx: float, ty: float) -> void:
	var d := minf(6, maxf(2.5, pos().distance_to(Vector2(tx, ty))))
	var s0 := pos()
	P.dash = {"ang": a, "left": d, "l": roundi(l * .6)}
	later(.11, func():
		hit_line(s0, a, d, .7, .8 + l * .08)
		L.slash_fx(s0 + dir(a) * d * .5, a, .5, d * .55, Color8(200, 215, 255), .5))

func _d_cross(l: int, a: float, _tx: float, _ty: float) -> void:
	var b := w_avg() * .18 * (1 + l * .1)
	L.slash_fx(pos(), a + .55, 1.4, 2, Color8(235, 240, 255), .6)
	later(.07, func(): L.slash_fx(pos(), a - .55, 1.4, 2, Color8(235, 240, 255), .6))
	hit_arc(a, 2.1, 1.7, 1.5 + l * .14, {"bleed": b})

func _d_fan(l: int, a: float, _tx: float, _ty: float) -> void:
	var p0 := pos()
	for i in 7:
		var q := a + (i - 3) * .17
		var hit := {}
		for k in range(1, 12):
			var c := p0 + dir(q) * k * .65
			later(k * .038, func():
				if not L.walkable(c.x, c.y) or hit.has("_stop"):
					hit["_stop"] = true
					return
				L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": .7, "vx": cos(q) * 3, "vy": sin(q) * 3, "vz": 0.0, "t": 0.0, "life": .12, "col": R.pick([Color.WHITE, Color("#cfe0ff"), Color("#9ab8e8")]), "s": 2.2, "g": 0.0})
				hit_circ(c, .55, .7 + l * .07, {"set": hit}))

func _d_dance(l: int, _a: float, _tx: float, _ty: float) -> void:
	for k in range(1, 11):
		later(k * .25, func(): P.whirl = .3; L.slash_fx(pos(), Game.t * 9, 3.0, 1.8, Color8(225, 235, 255), .5); hit_circ(pos(), 2, .45 + l * .05))
	L.ftext(pos() - Vector2(0, .4), "Klingentanz", Color("#cfe0ff"), true)

func _d_exec(l: int, _a: float, tx: float, ty: float) -> void:
	leap_to(Vector2(tx, ty), 6, .38, roundi(l * .5), func():
		L.slash_fx(pos(), P.face, TAU, 1.9, Color8(235, 240, 255), .5)
		hit_circ(pos(), 1.9, 2.4 + l * .25, {"exec": true}))

func _dash(l: int, ang: float, _tx: float, _ty: float) -> void:
	var e := pos()
	var s := 0.0
	while s <= 5:
		var c := pos() + dir(ang) * s
		if not L.free_at(c.x, c.y, P.r):
			break
		e = c
		if int(s * 4) % 2 == 0:
			ghosts(c)
		s += .25
	L._smoke(pos(), 5)
	P.x = e.x
	P.y = e.y
	P.iframe = .4
	P.shadowT = 3.0
	P.shadowB = 30 + l * 3
	P.veilT = minf(3, 2 + l * .1)
	L._smoke(pos(), 5)
	P.path = []

# ---------- the long blade, the hammer, the spear (640) ----------

func _g_cleave(l: int, a: float, _tx: float, _ty: float) -> void:
	L.slash_fx(pos(), a, 2.8, 2.6, Color8(255, 235, 200), .5)
	hit_arc(a, 2.7, 2.8, 1.2 + l * .12, {"kb": .4})

func _g_lunge(l: int, a: float, _tx: float, _ty: float) -> void:
	var s0 := pos()
	P.dash = {"ang": a, "left": 3.5, "l": roundi(l * .5)}
	later(.09, func(): hit_line(s0, a, 4.3, .7, 1.6 + l * .15); L.slash_fx(s0, a, .35, 4.2, Color8(255, 235, 200), .5))

func _g_quake(l: int, a: float, _tx: float, _ty: float) -> void:
	var set := {}
	for k in range(1, 9):
		later(k * .045, func():
			var c := pos() + dir(a) * k * .8
			if not L.walkable(c.x, c.y):
				return
			shock(c, 1.1, Color8(255, 220, 160))
			L._smoke(c, 2)
			hit_circ(c, 1.1, 1 + l * .1, {"set": set, "kb": .5}))
	L.shake = maxf(L.shake, 6)

func _g_parry(l: int, _a: float, _tx: float, _ty: float) -> void:
	P.ward = roundi(Game.d.life * (.22 + l * .02))
	P.wardMax = P.ward
	P.wardT = 8.0
	shock(pos(), 1.6, Color8(255, 230, 180))
	L.ftext(pos() - Vector2(0, .5), "Klingenwall", Color("#ffd890"), true)

func _g_spin(l: int, _a: float, _tx: float, _ty: float) -> void:
	for k in 6:
		later(k * .15, func(): P.whirl = .3; L.slash_fx(pos(), Game.t * 9, 3.0, 2.2, Color8(255, 235, 200), .5); hit_circ(pos(), 2.3, .75 + l * .07))

func _g_judg(l: int, _a: float, tx: float, ty: float) -> void:
	leap_to(Vector2(tx, ty), 7, .55, roundi(l * .8), func():
		shock(pos(), 3, Color8(255, 220, 150))
		hit_circ(pos(), 3, 1.5 + l * .15, {"slow": 2}))

func _h_smash(l: int, _a: float, _tx: float, _ty: float) -> void:
	later(.11, func():
		var c := pos() + dir(P.face) * 1.2
		slam_fx(c, 1.4)
		hit_circ(c, 1.5, 1.8 + l * .15, {"kb": 1}))

func _h_quake(l: int, _a: float, _tx: float, _ty: float) -> void:
	slam_fx(pos(), 3.5)
	hit_circ(pos(), 3.5, 1.1 + l * .1, {"slow": 2})
	L.shake = maxf(L.shake, 8)

func _h_leap(l: int, _a: float, tx: float, ty: float) -> void:
	leap_to(Vector2(tx, ty), 6, .5, l, func(): pass)

func _h_throw(l: int, a: float, _tx: float, _ty: float) -> void:
	var p0 := pos()
	var step := {"k": 0}
	var fly := func(self_ref: Callable):
		step.k += 1
		var c: Vector2 = p0 + dir(a) * step.k * .5
		var hit := false
		for e in foes():
			if e.world.distance_to(c) < .6 + e.r:
				hit = true
		L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": .9, "vx": 0.0, "vy": 0.0, "vz": 0.0, "t": 0.0, "life": .1, "col": Color("#d0c8b8"), "s": 3.0, "g": 0.0})
		if hit or step.k >= 16 or not L.walkable(c.x, c.y):
			slam_fx(c, 1.6)
			hit_circ(c, 1.6, 2 + l * .18, {"kb": .8})
			return
		later(.028, func(): self_ref.call(self_ref))
	fly.call(fly)

func _h_storm(l: int, _a: float, tx: float, ty: float) -> void:
	for k in 3:
		later(k * .15, func():
			var c := Vector2(tx + R.rnd(-1.4, 1.4), ty + R.rnd(-1.4, 1.4))
			bolts.append({"a": c - Vector2(1.6, 1.6), "b": c, "t": .25, "seed": R.next()})
			L.flashes.append({"x": c.x, "y": c.y, "r": 140.0, "a": 1.0, "t": 0.0, "life": .3})
			shock(c, 1.3, Color8(180, 200, 255))
			L.sparks(c, .3, 0, 10, [Color.WHITE, Color("#cfe0ff"), Color("#7aa4ff")], 7)
			hit_circ(c, 1.3, 1.3 + l * .12)
			L.shake = maxf(L.shake, 3))

func _h_titan(l: int, _a: float, _tx: float, _ty: float) -> void:
	P.cast = .55
	L.rings.append({"x": P.x, "y": P.y, "r": .3, "max": 4.0, "v": 7.0, "col": Color("#ffc070"), "dmg": 0})
	later(.45, func():
		slam_fx(pos(), 4)
		boom(pos(), .8, "fire")
		hit_circ(pos(), 4, 3 + l * .25, {"kb": 1.2})
		L.shake = maxf(L.shake, 12)
		L.hitstop = .12)

func _sp_thrust(l: int, a: float, _tx: float, _ty: float) -> void:
	L.slash_fx(pos(), a, .35, 3.3, Color8(220, 255, 220), .5)
	hit_line(pos(), a, 3.4, .55, 1.25 + l * .12)

func _sp_vault(l: int, a: float, _tx: float, _ty: float) -> void:
	P.dash = {"ang": a, "left": 2.4, "l": 0, "quiet": true}
	later(.17, func():
		P.dash = null
		leap_to(pos() + dir(a) * 3.2, 3.4, .4, roundi(l * .4), func():
			L.slash_fx(pos(), a, .6, 2, Color8(220, 255, 220), .5)
			hit_circ(pos(), 1.8, 1.8 + l * .18, {"kb": .5})))

func _sp_sweep(l: int, _a: float, _tx: float, _ty: float) -> void:
	P.whirl = .35
	L.slash_fx(pos(), P.face, TAU, 2.5, Color8(220, 255, 220), .5)
	hit_circ(pos(), 2.6, 1.1 + l * .1, {"kb": .9})

func _sp_throw(l: int, a: float, _tx: float, _ty: float) -> void:
	var p0 := pos()
	for k in range(1, 19):
		var c := p0 + dir(a) * k * .5
		later(k * .016, func(): L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": .9, "vx": cos(a) * 4, "vy": sin(a) * 4, "vz": 0.0, "t": 0.0, "life": .1, "col": Color("#e8f0d8"), "s": 2.4, "g": 0.0}))
	later(.12, func(): hit_line(p0, a, 9, .5, 1.8 + l * .15))

func _sp_wall(l: int, _a: float, _tx: float, _ty: float) -> void:
	for k in range(1, 11):
		later(k * .5, func(): shock(pos(), 2.2, Color8(190, 255, 200)); hit_circ(pos(), 2.2, .6 + l * .06))
	L.ftext(pos() - Vector2(0, .5), "Lanzenwall", Color("#b0f0b8"), true)

func _sp_rain(l: int, _a: float, tx: float, ty: float) -> void:
	for k in 10:
		later(k * .1, func():
			var r := sqrt(R.next()) * 3
			var q := R.rnd(0, TAU)
			var c := Vector2(tx, ty) + dir(q) * r
			L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": 3.5, "vx": 0.0, "vy": 0.0, "vz": -14.0, "t": 0.0, "life": .25, "col": Color("#e8f0d8"), "s": 2.6, "g": 0.0})
			later(.22, func(): shock(c, 1, Color8(190, 255, 200)); L._smoke(c, 2); hit_circ(c, 1, 1 + l * .1)))

# ---------- the alchemist: arrows (040) and flasks (900) ----------

func arrow(ang: float, dmg: float, o := {}) -> void:
	var sp: float = o.get("sp", 15.0)
	var p := {"x": P.x + cos(ang) * .4, "y": P.y + sin(ang) * .4, "vx": cos(ang) * sp, "vy": sin(ang) * sp, "owner": "p", "dmg": dmg, "kind": "arrow", "r": .28, "life": 1.1}
	if P.get("oilT", 0) > 0:
		# oiled arrows: each one dipped in the next element
		oil_i = (oil_i + 1) % 4
		var el: String = Data.skill_info.elements.keys()[oil_i]
		var b: float = P.get("oilB", 30) / 100.0
		p.col = Color(Data.skill_info.elements[el].col)
		p.oil = el
		p.on_hit = func(e, q):
			e_hit(el, e, q.dmg * b)
			if el == "light" and not e.dead:
				jump_on(el, e, q.dmg * b * .6, 1, {e: true})
	p.merge(o, true)
	L.proj.append(p)

func _multi(l: int, ang: float, _tx: float, _ty: float) -> void:
	var n := 5 + int(l / 4)
	for k in n:
		arrow(ang + (k - (n - 1) / 2.0) * .13, p_dmg(.6 + l * .06))

func lob(tx: float, ty: float, el: String, o: Dictionary) -> void:
	var d := maxf(1.2, minf(9, pos().distance_to(Vector2(tx, ty))))
	var a := atan2(ty - P.y, tx - P.x)
	var sp := 11.0
	var t := d / sp
	var p := {"x": P.x + cos(a) * .4, "y": P.y + sin(a) * .4, "vx": cos(a) * sp, "vy": sin(a) * sp, "owner": "p", "kind": "flask", "fl": el, "r": .22, "life": t, "life0": t, "aoe": 1.6,
		"boomE": "frost" if el == "frost" else ("poison" if el == "poison" else "fire"), "col": Color(Data.skill_info.elements[el].col) if Data.skill_info.elements.has(el) else Color("#ffd070")}
	p.merge(o, true)
	L.proj.append(p)

func _glass(c: Vector2, col: Color) -> void:
	for k in 12:
		var a := R.rnd(0, TAU)
		var v := R.rnd(2, 5)
		L.parts.append({"k": "spark", "x": c.x, "y": c.y, "z": .4, "vx": cos(a) * v, "vy": sin(a) * v, "vz": R.rnd(1, 3), "t": 0.0, "life": .45, "col": R.pick([Color("#e8f4f0"), Color("#bcd8d0"), col]), "s": R.rnd(1, 2), "g": .1})

func _a_fire(l: int, _a: float, tx: float, ty: float) -> void:
	lob(tx, ty, "fire", {"dmg": al_d(1.1 + l * .12), "on_boom": func(p): _glass(Vector2(p.x, p.y), Color("#ff8a2a")); zones.append({"k": "burn", "x": p.x, "y": p.y, "r": 1.8, "t": 0.0, "dur": 3.0, "tick": .5, "acc": 0.0, "dmg": p.dmg * .12})})

func _a_frost(l: int, _a: float, tx: float, ty: float) -> void:
	lob(tx, ty, "frost", {"dmg": al_d(.3), "aoe": 1.0, "on_boom": func(p): _glass(Vector2(p.x, p.y), Color("#9ad0ff")); m_ring("frost", Vector2(p.x, p.y), al_d(.9 + l * .1), l, true)})

func _a_plague(l: int, _a: float, tx: float, ty: float) -> void:
	lob(tx, ty, "poison", {"dmg": al_d(.4), "aoe": 1.2, "on_boom": func(p): _glass(Vector2(p.x, p.y), Color("#8ae050")); m_storm("poison", Vector2(p.x, p.y), al_d(1.6 + l * .16), false)})

func _a_heal(l: int, _a: float, _tx: float, _ty: float) -> void:
	var amt: float = Game.d.life * (12 + l * 1.5) / 100.0 * (1 + Game.d.potPow / 200.0)
	heals.append({"x": P.x, "y": P.y, "t": 0.0, "dur": 4.0, "rate": amt / 4})
	P.poisonT = 0.0
	shock(pos(), 2.6, Color8(255, 230, 140))
	L.ftext(pos() - Vector2(0, .6), "Heilnebel", Color("#ffe08a"), true)

func _a_oil(l: int, _a: float, _tx: float, _ty: float) -> void:
	P.oilT = 15.0 + l
	P.oilB = 30 + l * 4
	var ks: Array = Data.skill_info.elements.keys()
	for k in 4:
		shock(pos(), 1.6 + k * .5, _ecol(ks[k]))
	L.ftext(pos() - Vector2(0, .6), "Alchemistenöl", Color("#ffd8a0"), true)

# ---------- moving: the charge and leaps (200-update.js, 640 leapTo) ----------

func leap_to(t: Vector2, max_d: float, dur: float, l: int, fn: Callable) -> void:
	var a := atan2(t.y - P.y, t.x - P.x)
	var d := minf(max_d, maxf(1.5, pos().distance_to(t)))
	var c := pos() + dir(a) * d
	if not L.free_at(c.x, c.y, .3):
		# back along the line to the last free spot
		var s := d
		while s > 0 and not L.free_at(c.x, c.y, .3):
			s -= .25
			c = pos() + dir(a) * s
	P.leap = {"sx": P.x, "sy": P.y, "tx": c.x, "ty": c.y, "t": 0.0, "dur": dur, "l": l, "fn": fn}
	P.iframe = dur + .1
	P.cast = 0.0
	P.face = a

## the hero moves by a skill this frame: true if so, and the level leaves walking alone
func hero_motion(dt: float) -> bool:
	if P.get("leap"):
		var J: Dictionary = P.leap
		J.t += dt
		var p := minf(1, J.t / J.dur)
		P.x = J.sx + (J.tx - J.sx) * p
		P.y = J.sy + (J.ty - J.sy) * p
		if R.next() < .5:
			ghosts(pos())
		if p >= 1:
			P.leap = null
			slam_fx(pos(), 2.4)
			L.shake = maxf(L.shake, 10)
			L.hitstop = .12
			for e in foes():
				if e.world.distance_to(pos()) < 2.4 + e.r:
					L.weapon_hit(e, 1.6 + J.l * .18)
					if not e.dead:
						L.hit_enemy(e, 0, {"kb": 1, "from": atan2(e.world.y - P.y, e.world.x - P.x)})
			if J.fn and not P.dead:
				J.fn.call()
		return true
	if P.get("dash"):
		var D: Dictionary = P.dash
		var st := minf(D.left, 16 * dt)
		var o := pos()
		var n := L.move_ent(o, dir(D.ang) * st, P.r)
		P.x = n.x
		P.y = n.y
		D.left -= st
		ghosts(pos())
		var hit_e := false
		for e in foes():
			if e.world.distance_to(pos()) < e.r + .5:
				hit_e = true
		if D.left <= 0 or hit_e or o.distance_to(n) < st * .3:
			if not D.get("quiet"):
				for e in foes():
					if e.world.distance_to(pos()) < 1.7 + e.r:
						L.weapon_hit(e, 1.5 + D.l * .2)
				slam_fx(pos(), 1.8)
				L.kick(D.ang, 6)
				L.hitstop = .1
			P.dash = null
			P.iframe = .15
		return true
	return false

# ---------- every frame ----------

func _process(dt: float) -> void:
	if L.hitstop > 0:
		return
	for k in cds.keys():
		cds[k] = maxf(0, cds[k] - dt)
	for k in ["cast", "whirl", "cryT", "shadowT", "veilT", "venomT", "oilT"]:
		if P.get(k, 0) > 0:
			P[k] = maxf(0, P[k] - dt)
	if P.get("wardT", 0) > 0:
		P.wardT -= dt
		if P.wardT <= 0:
			P.ward = 0.0
	var d := Game.d
	if P.get("atemT", 0) > 0:
		P.atemT -= dt
		Game.hp = minf(d.life, Game.hp + d.life * (.012 + P.get("atemL", 1) * .0015) * dt)
		Game.st = minf(d.stam, Game.st + d.stam * .12 * dt)
	if P.get("oathT", 0) > 0:
		P.oathT -= dt
	if P.get("fuseT", 0) > 0:
		P.fuseT -= dt
	# moments later
	var due := []
	for q in queue:
		q.t -= dt
		if q.t <= 0:
			due.append(q)
	queue = queue.filter(func(q): return q.t > 0)
	if not P.dead:
		for q in due:
			q.f.call()
	for b in bolts:
		b.t -= dt
	bolts = bolts.filter(func(b): return b.t > 0)
	_zones(dt)
	_traps(dt)
	for h in heals:
		h.t += dt
		if Vector2(h.x, h.y).distance_to(pos()) < 2.6 and not P.dead:
			Game.hp = minf(d.life, Game.hp + h.rate * dt)
		if R.next() < dt * 28:
			var a := R.rnd(0, TAU)
			var r := R.rnd(0, 2.4)
			L.parts.append({"k": "mote", "x": h.x + cos(a) * r, "y": h.y + sin(a) * r, "z": .1, "vx": 0.0, "vy": 0.0, "vz": R.rnd(.6, 1.4), "t": 0.0, "life": R.rnd(.6, 1), "col": R.pick([Color("#fff4c0"), Color("#f0d860"), Color("#c8f0a0")]), "s": R.rnd(1, 2), "g": -.02})
	heals = heals.filter(func(h): return h.t < h.dur)
	# poison and bleeding on foes
	for e in L.enemies:
		if e.dot_t > 0 and not e.dead:
			e.dot_t -= dt
			e.hp -= e.dot_d * dt * e.dmg_taken
			if R.next() < dt * 6:
				L.parts.append({"k": "mote", "x": e.world.x, "y": e.world.y, "z": .8, "vx": 0.0, "vy": 0.0, "vz": .5, "t": 0.0, "life": .5, "col": Color("#9ae050"), "s": 1.0, "g": 0.0})
			if e.hp <= 0:
				L.kill_enemy(e)
	# a few motes while buffs run
	if P.get("cryT", 0) > 0 and R.next() < dt * 6:
		L.parts.append({"k": "spark", "x": P.x + R.rnd(-.3, .3), "y": P.y + R.rnd(-.3, .3), "z": R.rnd(.5, 1.4), "vx": 0.0, "vy": 0.0, "vz": 1.0, "t": 0.0, "life": .5, "col": Color("#ff7a3a"), "s": 1.0, "g": 0.0})

func _zones(dt: float) -> void:
	for z in zones:
		z.t += dt
		var c := Vector2(z.x, z.y)
		match z.k:
			"meteor":
				if not z.get("hit") and z.t >= z.dur:
					z.hit = true
					boom(c, 2, "fire")
					L.shake = maxf(L.shake, 8)
					for e in foes():
						if e.world.distance_to(c) < z.r + e.r:
							L.hit_enemy(e, z.dmg * R.rnd(.9, 1.1), {"col": Color("#ffb070"), "kb": .5, "from": atan2(e.world.y - c.y, e.world.x - c.x)})
					zones.append({"k": "burn", "x": c.x, "y": c.y, "r": 2.0, "t": 0.0, "dur": 3.0, "tick": .5, "acc": 0.0, "dmg": z.dmg * .12})
				elif not z.get("hit") and R.next() < .5:
					L.parts.append({"k": "ember", "x": c.x + R.rnd(-.3, .3), "y": c.y + R.rnd(-.3, .3), "z": 4 * (1 - z.t / z.dur) + .3, "vx": 0.0, "vy": 0.0, "vz": -3.0, "t": 0.0, "life": .3, "col": Color("#ffc070"), "s": 2.0, "g": 0.0})
			"burn", "rain", "hail", "mcloud":
				z.acc += dt
				var el: String = {"burn": "fire", "rain": "", "hail": "frost", "mcloud": "poison"}[z.k]
				var rate: float = {"burn": 20, "rain": 40, "hail": 25, "mcloud": 40 if z.get("big") else 18}[z.k]
				if R.next() < dt * rate:
					var a := R.rnd(0, TAU)
					var r := R.rnd(0, z.r)
					var fall: bool = z.k == "rain" or z.k == "hail"
					L.parts.append({"k": "spark" if fall else "mote", "x": c.x + cos(a) * r, "y": c.y + sin(a) * r, "z": 3.0 if fall else .1, "vx": 0.0, "vy": 0.0, "vz": -14.0 if fall else R.rnd(.6, 1.6), "t": 0.0, "life": .22 if fall else R.rnd(.4, .8),
						"col": R.pick({"burn": [Color("#ffc070"), Color("#ff7a1a")], "rain": [Color("#e8e2d0")], "hail": [Color.WHITE, Color("#c8e4ff"), Color("#6ad0ff")], "mcloud": [Color("#9ae050"), Color("#c8f878"), Color("#4a8a2a")]}[z.k]), "s": R.rnd(1, 2.4), "g": 0.0})
				if z.acc >= z.tick:
					z.acc = 0.0
					for e in foes():
						if e.world.distance_to(c) < z.r + e.r:
							if el == "":
								L.hit_enemy(e, z.dmg * R.rnd(.85, 1.15), {"col": Color("#e8e2d0")})
							elif z.k == "burn":
								L.hit_enemy(e, z.dmg, {"col": Color("#ff9a50")})
							else:
								e_hit(el, e, z.dmg * R.rnd(.85, 1.15))
			"thunder":
				z.acc += dt
				if z.acc >= z.tick:
					z.acc = 0.0
					var cand := foes().filter(func(e): return e.world.distance_to(c) < z.r + e.r)
					var t := (R.pick(cand) as Enemy).world if cand.size() else c + Vector2(R.rnd(-z.r, z.r), R.rnd(-z.r, z.r)) * .7
					bolts.append({"a": t - Vector2(1.6, 1.6), "b": t, "t": .25, "seed": R.next()})
					L.flashes.append({"x": t.x, "y": t.y, "r": 130.0, "a": 1.0, "t": 0.0, "life": .3})
					shock(t, 1.2, Color8(180, 200, 255))
					L.sparks(t, .3, 0, 12, [Color.WHITE, Color("#cfe0ff"), Color("#7aa4ff")], 7)
					L.shake = maxf(L.shake, 2)
					for e in foes():
						if e.world.distance_to(t) < 1.1 + e.r:
							e_hit("light", e, z.dmg * R.rnd(.85, 1.15))
	zones = zones.filter(func(z): return z.t < z.dur or (z.k == "meteor" and not z.get("hit")))

func _traps(dt: float) -> void:
	for t in traps:
		t.life -= dt
		if t.arm > 0:
			t.arm -= dt
			continue
		var c := Vector2(t.x, t.y)
		for e in foes():
			if e.world.distance_to(c) < 1.2 + e.r:
				t.life = 0
				shock(c, 2.2, Color8(160, 220, 90))
				for q in foes():
					if q.world.distance_to(c) < 2.2 + q.r:
						L.hit_enemy(q, t.dmg * R.rnd(.9, 1.1), {"col": Color("#b8e070")})
						q.dot_t = 3.0
						q.dot_d = t.dmg * .15
				break
	traps = traps.filter(func(t): return t.life > 0)

# ---------- player projectiles (200-update.js) ----------

## a hero's projectile touches a foe: true if it is spent
func proj_hit(p: Dictionary, e: Enemy) -> bool:
	if p.get("aoe"):
		explode(p)
		return true
	if p.has("hit") and p.hit.has(e):
		return false
	var d := Game.d
	var cr: bool = R.next() * 100 < d.crit + (P.get("shadowB", 0) if P.get("shadowT", 0) > 0 else 0)
	L.hit_enemy(e, p.dmg * R.rnd(.9, 1.1) * (1.9 if cr else 1.0), {"crit": cr, "kb": .4 if p.get("big") else .12, "from": atan2(p.vy, p.vx), "col": p.get("col", Color("#f2ecd8")), "slow": p.get("slow", 0)})
	if p.get("on_hit"):
		p.on_hit.call(e, p)
	L.sparks(Vector2(p.x, p.y), .6, atan2(-p.vy, -p.vx), 5, [Color.WHITE, Color("#e8e0c8")], 3)
	if d.ls > 0:
		Game.hp = minf(d.life, Game.hp + p.dmg * d.ls / 200.0)
	if p.get("pierce"):
		if not p.has("hit"):
			p.hit = {}
		p.hit[e] = true
		return false
	return true

func explode(p: Dictionary) -> void:
	if p.owner != "p" or not p.get("aoe"):
		return
	var c := Vector2(p.x, p.y)
	boom(c, p.aoe / 1.3, p.get("boomE", "fire"))
	if p.get("on_boom"):
		p.on_boom.call(p)
	for e in foes():
		if e.world.distance_to(c) < p.aoe + e.r:
			L.hit_enemy(e, p.dmg * R.rnd(.85, 1.15), {"col": p.get("col", Color("#ffb070"))})
