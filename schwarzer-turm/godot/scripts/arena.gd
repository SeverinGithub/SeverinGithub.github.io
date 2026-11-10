class_name Arena
extends RefCounted
## The guardian statue in the arena east of the hill (summonArena in 170-combat.js, rewritten in
## 850-names-arena-grindstone.js). It sleeps until the hero has reached floor 20 of the tower. Every touch calls three foes
## at the hero's level, but only kinds he has already beaten; never more than twelve stand in the ring. What the statue
## calls gives experience and nothing else: no gear, no junk, no potion, no rune, not a grain of glut (see Level.kill_enemy).
## Every kind that falls anywhere is remembered with the hero (Game.kv, stOf().kv in the browser).

# the eyes, from the statue's foot: SPR.colEyes, but lifted into the visor slit (the browser's glow sat 18 pixels low, on the chin)
const EYES := [Vector2(-3.3, -194.5), Vector2(9.9, -194.5)]
const GREY := Color("#a39b88")
const GOLD := Color("#e8c878")

static var sum_t := 0.0          # the statue answers again after this moment (G.sumT)

## the kinds this hero has beaten: variant id → 1. A hero from before the arena starts with every kind of the families
## his chronicle has counted (kvOf)
static func kv_of() -> Dictionary:
	if not Game.kv is Dictionary:
		Game.kv = {}
		for v in Data.variants.values():
			if int(Game.qc.get("k_" + v.base, 0)) > 0:
				Game.kv[v.id] = 1
	return Game.kv

## a foe has fallen: remember its kind (the outermost killEnemy of 850)
static func remember(e: Enemy) -> void:
	if e.vid != "" and Data.variants.has(e.vid):
		kv_of()[e.vid] = 1

static func alive(L: Level) -> int:
	return L.enemies.filter(func(e): return e.arena and not e.dead).size()

## touch the statue: three foes step out of the smoke
static func summon(L: Level) -> bool:
	if L.ow == null or L.ow.wg.arena.is_empty():
		return false
	var A: Dictionary = L.ow.wg.arena
	if Game.max_floor < 20:
		Game.log_msg("Die Statue schläft. Sie erwacht erst, wenn du Ebene 20 des Turms erreicht hast.", GREY)
		return false
	if alive(L) >= 12:
		Game.log_msg("Die Statue schweigt. Besiege zuerst, was in der Arena steht.", GREY)
		return false
	if Game.t < sum_t and sum_t - Game.t < 1.3:
		return false
	var lvl := maxi(1, Game.lvl)
	var kv := kv_of()
	var VP: Array = L.var_pool(maxi(1, lvl / 2 + 1)).filter(func(v): return kv.has(v[0]))
	if VP.is_empty():
		Game.log_msg("Die Statue findet in dir keinen Gegner, den du schon bezwungen hast.", GREY)
		return false
	sum_t = Game.t + 1.2
	var R := L.R
	for k in 3:
		var at := Vector2(A.x, A.y)
		for tr in 20:
			var a := R.rnd(0, 6.28)
			var r := R.rnd(2.5, 6.5)
			at = Vector2(A.x + cos(a) * r, A.y + sin(a) * r)
			if L.free_at(at.x, at.y, .5):
				break
		var roll := R.next()
		var e := Enemy.make(R.wpick(VP), at, "unique" if roll < .08 else ("champ" if roll < .22 else "normal"), lvl, R)
		e.aggro = true
		e.arena = true
		e.cd = R.rnd(.6, 1.4)
		L._add_enemy(e)
		# they step out of violet smoke, the stone floor cracking under them
		for q in 10:
			L.parts.append({"k": "smoke", "x": at.x + R.rnd(-.3, .3), "y": at.y + R.rnd(-.3, .3), "z": R.rnd(0, .3), "vx": R.rnd(-.5, .5), "vy": R.rnd(-.5, .5), "vz": R.rnd(.2, .7),
				"t": 0.0, "life": R.rnd(.4, .8), "col": Color(60 / 255.0, 40 / 255.0, 70 / 255.0, .6), "s": R.rnd(4, 8), "g": 0.0})
		L.flashes.append({"x": at.x, "y": at.y, "r": 48.0, "a": .8, "t": 0.0, "life": .3})
		L.sk.shock(at, 1.4, Color8(200, 150, 255))
		L.gore(at, 0, 10, "rock", .2)
		Sound.growl(e)
	Game.statue_t = 1.6
	L.shake = maxf(L.shake, 6)
	L.hitstop = maxf(L.hitstop, .08)
	Sound.sfx("boom")
	Sound.sample("portal", .5, {"rate": .7})
	Game.log_msg("Der Wächter ruft drei Gegner herbei · Stufe %d" % lvl, GOLD)
	return true
