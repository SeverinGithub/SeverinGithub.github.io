class_name Enemy
extends Figure
## One foe, made like makeEnemy (080-maps.js): its kind from Data.monsters, its variant from Data.variants, scaled by the floor's
## monster level and its rank (normal, champ, minion, unique, boss). The level runs its mind (updEnemy, see level.gd);
## this node only holds the numbers and shows them: the hit squash, the lunge, the fall when it dies.

const ELITE_AFF := {"schnell": "Schnell", "feuer": "Feuerverzaubert", "stein": "Steinhaut", "stark": "Extra stark", "kalt": "Kälteverzaubert"}

var type := ""
var vid := ""
var mon: Dictionary               # e.d in the browser: hp, dmg, spd, r, range, wind, cd, xp, kind, proj
var rank := "normal"
var e_name := ""
var sub := ""
var hp := 1.0
var max_hp := 1.0
var dmg := [1.0, 2.0]
var spd := 1.0
var r := .3
var cd := 0.0
var aggro := false
var flash := 0.0
var slow := 0.0
var hit_t := 0.0
var lunge_t := 0.0
var charge := 0.0
var xp := 0.0
var aff: Array = []
var scale_f := 1.0               # the size beyond the baked sheet (champions and uniques stand taller)
var dmg_taken := 1.0
var elem = null
var proj = null
var pack: Array = []
var dead := false
var die_t := 0.0
var fall_a := 0.0
var kv := Vector2.ZERO           # knockback
var boss := false
var moves: Array = []
var p2 := false
var summoned := false
var lc := {}                     # sight-line cache (eLos)
var dot_t := 0.0                 # poison or bleeding: seconds left, damage per second
var dot_d := 0.0
var ck := ""                     # the sky chunk it belongs to
var wb := ""                     # an island lord's id
var trial := false               # a guard of a trial room (770-chests.js)
var wall := false                # a cracked wall in front of a hidden chamber (760-tower-2.js)
var cracks: Array = []           # its cracks: x, y, angle, length

static func make(vid_: String, at: Vector2, rk := "normal", ml := 1, R: Rng = null) -> Enemy:
	if R == null:
		R = Rng.unseeded()
	var v: Dictionary = Data.variants.get(vid_, Data.variants.skel)
	var d: Dictionary = Data.monsters[v.base]
	var e := Enemy.new()
	e.key = "enemy_" + v.id
	e.type = v.base
	e.vid = v.id
	e.mon = d
	e.world = at
	e.rank = rk
	e.e_name = v.n
	var hs: float = (1 + (ml - 1) * .32) * v.hp
	var ds: float = (1 + (ml - 1) * .2) * v.dmg
	e.r = d.r * sqrt(v.scale)
	e.hp = d.hp * .7 * hs
	e.dmg = [d.dmg[0] * ds, d.dmg[1] * ds]
	e.spd = d.spd * v.spd * R.rnd(.9, 1.1)
	e.cd = R.rnd(.3, 1.2)
	e.face = R.rnd(0, 6)
	e.xp = d.xp * (1 + (ml - 1) * .35) * (v.hp * .6 + v.dmg * .4)
	e.elem = v.get("elem")
	e.proj = v.get("proj")
	if rk == "champ":
		e.hp *= 2.6
		e.dmg = [e.dmg[0] * 1.4, e.dmg[1] * 1.4]
		e.spd *= 1.12
		e.xp *= 3
		e.sub = "Champion"
		e.scale_f = 1.1
	elif rk == "minion":
		e.hp *= 1.4
		e.xp *= 1.5
		e.sub = "Gefolge"
	elif rk == "unique":
		e.hp *= 4.2
		e.dmg = [e.dmg[0] * 1.6, e.dmg[1] * 1.6]
		e.xp *= 6
		e.scale_f = 1.2
		e.e_name = R.pick(["Grimm", "Asch", "Morr", "Kral", "Vel", "Hrok", "Zeph", "Ulv", "Brann", "Teer"]) + R.pick(["zahn", "fang", "mar", "grim", "wolf", "hart", "brand", "kiel"]) + " " + R.pick(["der Verfluchte", "die Hungrige", "der Knochenbrecher", "der Rastlose", "die Graue", "der Leichenfresser", "der Schwarze", "die Stumme"])
		var ks := ELITE_AFF.keys()
		while e.aff.size() < 2:
			var k: String = R.pick(ks)
			if not k in e.aff:
				e.aff.append(k)
		if "schnell" in e.aff: e.spd *= 1.5
		if "stein" in e.aff: e.dmg_taken = .6
		if "stark" in e.aff: e.dmg = [e.dmg[0] * 1.5, e.dmg[1] * 1.5]
		e.sub = " · ".join(e.aff.map(func(k): return ELITE_AFF[k]))
	e.sub = (e.sub + " · " if e.sub != "" else "") + "Stufe %d" % ml
	e.max_hp = e.hp
	return e

## a floor guardian (makeBoss). Bosses are not baked yet: a great stone figure stands in for all three.
static func make_boss(f: int, at: Vector2, ml: int) -> Enemy:
	var bi := int(f / 3) - 1
	var def: Dictionary = Data.bosses[bi % 3]
	var cyc := int(bi / 3)
	var hs := 1 + (ml - 1) * .32
	var ds := 1 + (ml - 1) * .2
	var e := Enemy.new()
	e.key = {"knight": "enemy_grabritter", "weaver": "enemy_brutmutter", "warden": "enemy_golem"}.get(def.look, "enemy_golem")
	e.scale_f = 1.6 if e.key != "enemy_golem" else 1.3
	e.type = "boss"
	e.boss = true
	e.rank = "boss"
	e.mon = {"kind": "boss", "range": 2}
	e.moves = def.moves
	e.world = at
	e.r = .8
	e.e_name = def.n + (" " + ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][cyc + 1] if cyc else "")
	e.sub = "Hüter der Tiefe"
	e.hp = 560 * hs * (1 + cyc * .5)
	e.dmg = [12 * ds, 20 * ds]
	e.spd = 2.3
	e.cd = 1.5
	e.face = 2.3
	e.xp = 420 * (1 + (ml - 1) * .35)
	e.max_hp = e.hp
	return e

## an island lord (makeWBoss in 310-overworld-bosses.js); like the floor guardians a stand-in figure for now
static func make_wboss(i: int, at: Vector2, ml: int) -> Enemy:
	var b: Dictionary = WorldGen.WB[i]
	var hs := 1 + (ml - 1) * .32
	var ds := 1 + (ml - 1) * .2
	var e := Enemy.new()
	e.key = {"knight": "enemy_grabritter", "weaver": "enemy_brutmutter"}.get(b.look, "enemy_golem")
	e.scale_f = (1.6 if e.key != "enemy_golem" else 1.3) * b.scale / 2.1
	e.type = "boss"
	e.boss = true
	e.rank = "boss"
	e.mon = {"kind": "boss", "range": 2}
	e.moves = b.moves
	e.world = at
	e.r = .8
	e.e_name = b.n
	e.sub = "Herr der Himmelsinseln · Stufe %d" % ml
	e.hp = 620 * hs
	e.dmg = [13 * ds, 21 * ds]
	e.spd = 2.3
	e.cd = 1.5
	e.face = 2.3
	e.xp = 480 * (1 + (ml - 1) * .35)
	e.wb = b.id
	e.max_hp = e.hp
	return e

func _ready() -> void:
	super._ready()
	if wall:
		_spr.visible = false

func _process(dt: float) -> void:
	if dead:
		die_t += dt
	super._process(dt)
	if wall:
		visible = not dead
		position += Vector2(randf_range(-1, 1), 0) if hit_t > 0 else Vector2.ZERO
		queue_redraw()
		return
	_pose()

## a cracked wall: a warm glow behind, cracks that widen with every blow, rubble at its foot (drawWall in 760-tower-2.js)
func _draw() -> void:
	if not wall:
		return
	var p := 1 - hp / max_hp
	var t := Game.t
	var g := .15 + p * .2 + sin(t * 2) * .05
	for k in 5:
		draw_circle(Vector2(0, -26), 30 * (1 - k / 5.0), Color(1, .75, .43, g * .3))
	var n := ceili(3 + p * 4)
	for k in mini(n, cracks.size()):
		var c: Array = cracks[k]
		var pts := PackedVector2Array([Vector2(c[0], c[1])])
		var cx: float = c[0]
		var cy: float = c[1]
		for s in 4:
			var a: float = c[2] + (.6 if s % 2 else -.5)
			cx += cos(a) * c[3] / 4
			cy += sin(a) * c[3] / 4
			pts.append(Vector2(cx, cy))
		draw_polyline(pts, Color("#fff4d0") if flash > 0 else Color("#120d08"), 1.6)
		draw_polyline(pts, Color(1, .78, .47, .25 + p * .5), .7)
	for k in 6:
		draw_rect(Rect2(-12 + k * 4.5, -2 + k % 3, 3 + k % 2, 2), Color("#5a544a") if k % 2 else Color("#3e3a34"))

## squash when struck, lean into the lunge, fall over when slain (drawEnemy in 220-figures.js)
func _pose() -> void:
	var s := scale_f
	var rot := 0.0
	var off := Vector2.ZERO
	var sq := Vector2.ONE
	modulate = Color(1, 1, 1, 1)
	if dead:
		var p := minf(1, die_t / .45)
		var ea := 1 - pow(1 - p, 3)
		if type == "wraith" or type == "golem":
			var q := minf(1, die_t / .3)
			modulate.a = 1 - q
			sq = Vector2(1 + q, maxf(0, 1 - q * 2))
		else:
			modulate.a = maxf(0, 1 - (die_t - 18) / 6) if die_t > 18 else 1.0
			var fd := 1.0 if _scr_dir(fall_a).x >= 0 else -1.0
			rot = fd * ea * PI / 2
	else:
		if hit_t > 0:
			var q := hit_t / .22
			var rd := _scr_dir(face + PI)
			off = Vector2(rd.x * q * 6, rd.y * q * 3)
			sq = Vector2(1 + q * .14, 1 - q * .12)
		if lunge_t > 0:
			var l := sin(lunge_t / .22 * PI) * 6
			var fd := _scr_dir(face)
			off += Vector2(fd.x * l, fd.y * l * .5)
		if flash > 0:
			modulate = Color(2.2, 2.2, 2.2, 1)
	position += off
	rotation = rot
	scale = sq * s

## screen direction of a world angle (scrDir in 210-render.js)
static func _scr_dir(a: float) -> Vector2:
	var v := Vector2(cos(a) - sin(a), (cos(a) + sin(a)) * .5)
	return v.normalized() if v.length() > 0 else Vector2.RIGHT
