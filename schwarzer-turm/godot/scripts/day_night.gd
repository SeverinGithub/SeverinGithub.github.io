class_name DayNight
## Day and night over the islands (370-living-world.js, 720-night-2.js, 740-rest-until-hour.js): the sky keeps a clock of
## eight minutes a day, half of it day, then dusk, night and dawn. At night the darkness of the tower lies over the sky
## and only the lights cut through it, foes made after dark are stronger and carry more magic, and werewolves and night
## ghosts come hunting on the islands and pay for it. At dusk and dawn a warm glow lies over everything. The bonfires in
## the sky let you rest until morning or until night. The tower has no clock: down there it is always dark.
## The weather of 370 lives in Weather, the chance encounters and bounties in WorldEvents. Not yet: the night's sounds.

const DAYLEN := 480.0
static var nt_t := 20.0          # the next pack of night hunters (NT.t)
static var nt_warned := false

static var R := Rng.unseeded()

## where in the day: 0–.5 day · .5–.6 dusk · .6–.9 night · .9–1 dawn (dayPhase)
static func phase() -> float:
	return fposmod(Game.day_t / DAYLEN, 1.0)

## how dark the night is, 0 by day, 1 deep in it (nightA); only in the sky
static func a() -> float:
	if Game.floor_no != 0:
		return 0.0
	var p := phase()
	if p < .5: return 0.0
	if p < .6: return (p - .5) / .1
	if p < .9: return 1.0
	return 1 - (p - .9) / .1

## the hour's name for the HUD (dayName)
static func hour_name() -> String:
	var p := phase()
	if p < .5: return "Tag"
	if p < .6: return "Abend"
	if p < .9: return "Nacht"
	return "Morgen"

## the warm glow of dusk and dawn, 0–1 (drawWeather)
static func dusk() -> float:
	var p := phase()
	if p > .44 and p < .62: return sin((p - .44) / .18 * PI)
	if p > .86 and p < .98: return sin((p - .86) / .12 * PI)
	return 0.0

## the clock runs only in the sky, and only while a hero plays (updWorld)
static func tick(L: Level, dt: float) -> void:
	if not L.ow or not Game.in_play or L.title_cam != null:
		if Game.night and not L.ow:
			Game.night = false
			Game.recalc()
		return
	Game.day_t += dt
	Weather.tick(L, dt)
	WorldEvents.tick(L, dt)
	var was := Game.night
	Game.night = a() > .6
	if Game.night != was:
		Game.recalc()
		if Game.night:
			Game.banner.emit("DIE NACHT BRICHT HEREIN", "Gegner sind stärker, die Beute ist besser", "")
			Game.log_msg("Nacht: Gegner +30% Leben, +20% Schaden · +50% Magiefund", Color("#9ab0ff"))
		else:
			Game.banner.emit("DER MORGEN GRAUT", "", "")
	_hunt(L, dt)

## foes made after dark are night creatures: tougher, harder hitting, worth more (the makeEnemy wrapper of 370)
static func buff(e: Enemy) -> void:
	if not Game.night or Game.floor_no != 0:
		return
	e.hp *= 1.3
	e.max_hp = e.hp
	e.dmg = [e.dmg[0] * 1.2, e.dmg[1] * 1.2]
	e.xp *= 1.35
	e.sub += " · Nachtgestalt"

# ---------- the night's hunters (nightTick in 720) ----------

static func _hunt(L: Level, dt: float) -> void:
	var P := L.P
	if P.dead:
		return
	var n := a()
	var pp := Vector2(P.x, P.y)
	# they fade with the morning, and stay behind when you walk far away (the chance foes' rule in worldEvents)
	for e in L.enemies:
		if e.night and not e.dead and (n < .3 or e.world.distance_to(pp) > 45):
			e.dead = true
			e.die_t = 99
			if n < .3:
				L._smoke(e.world, 6)
	if n < .3:
		nt_warned = false
		return
	if n < .85:
		return
	var wg: WorldGen = L.ow.wg
	var I = wg.island_of(int(floor(P.x / WorldGen.CH)), int(floor(P.y / WorldGen.CH)))
	if I == null or I.kind == "home" or I.kind == "boss":
		return
	if not nt_warned:
		nt_warned = true
		Game.log_msg("In der Nacht jagen Werwölfe und Nachtgeister auf den Inseln. Sie bringen bessere Beute.", Color("#9ab0ff"))
	nt_t -= dt
	if nt_t > 0:
		return
	nt_t = R.rnd(22, 38)
	if L.enemies.filter(func(e): return e.night and not e.dead and e.world.distance_to(pp) < 30).size() >= 6:
		return
	var deep := WorldGen.lvl_at(P.x, P.y) >= 10
	for i in R.rint(2, 3):
		var s = spot(L, 9, 13)
		if s == null:
			continue
		var id := ("grauwolf" if deep and R.next() < .5 else "werwolf") if R.next() < .55 else "nachtgeist"
		var e := Enemy.make(id, s, "champ" if R.next() < .18 else "normal", Game.mlvl, R)
		e.night = true
		e.aggro = true
		L._add_enemy(e)
		L._smoke(s, 4)

## a free spot r0–r1 away from the hero (evSpot)
static func spot(L: Level, r0: float, r1: float):
	for k in 30:
		var aa := R.rnd(0, 7)
		var r := R.rnd(r0, r1)
		var x: float = L.P.x + cos(aa) * r
		var y: float = L.P.y + sin(aa) * r
		if L.walkable(x, y) and L.free_at(x, y, .4):
			return Vector2(x, y)
	return null

## what a night hunter leaves behind: often a good piece, and blue glut (the killEnemy wrapper of 720)
static func on_kill(L: Level, e: Enemy) -> void:
	if not e.night:
		return
	if R.next() < (.9 if e.rank == "champ" else .45):
		L.drop_item(Items.make(Game.mlvl + 2, {"mf": Game.d.mf + 120, "boost": .35}), e.world.x, e.world.y)
	var gl := roundi(8 * Game.mlvl)
	Game.glut += gl
	L.ftext(e.world - Vector2(0, .3), "+%d Glut" % gl, Color("#9ab0ff"))

# ---------- resting until an hour (740) ----------

## rest at a bonfire in the sky until the next morning or the next nightfall
static func rest_until(L: Level, o: Prop, k: String) -> void:
	var ph := .005 if k == "day" else .62
	var base := floorf(Game.day_t / DAYLEN) * DAYLEN
	var t := base + ph * DAYLEN
	if t <= Game.day_t + 5:
		t += DAYLEN
	Game.day_t = t
	# the hour turns before the foes rise, so those who wake at night are night creatures; no second banner for it
	var was := Game.night
	Game.night = a() > .6
	if Game.night and not was:
		Game.log_msg("Nacht: Gegner +30% Leben, +20% Schaden · +50% Magiefund", Color("#9ab0ff"))
	L.rest_at(o)
	var n := k == "night"
	Game.banner.emit("DIE NACHT IST DA" if n else "EIN NEUER MORGEN", "Du hast bis zur Dunkelheit gerastet" if n else "Du hast bis zum Sonnenaufgang gerastet", "")

# ---------- painted ----------

## the warm wash of dusk and dawn over the world, before the palette (drawWeather)
class Dusk extends ColorRect:
	func _init() -> void:
		set_anchors_preset(Control.PRESET_FULL_RECT)
		mouse_filter = Control.MOUSE_FILTER_IGNORE
		color = Color(1, 110 / 255.0, 40 / 255.0, 0)

	func _process(_dt: float) -> void:
		var k := DayNight.dusk() if Game.floor_no == 0 else 0.0
		color.a = k * .13
		visible = color.a > .002

## the night ghosts' cold blue glow, added over the darkness (the drawEnemy wrapper of 720)
class Glow extends Node2D:
	var L: Level

	func _init(level: Level) -> void:
		L = level
		var add := CanvasItemMaterial.new()
		add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		material = add

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		for e in L.enemies:
			if not e.night or e.dead or e.type != "wraith":
				continue
			var sp := Iso.to_screen(e.world) - Vector2(0, 20)
			Prop.glow(self, sp, 34, Color(120 / 255.0, 170 / 255.0, 1, .22 + sin(Game.t * 4) * .06))
