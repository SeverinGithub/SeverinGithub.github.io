class_name WorldEvents
## Chance encounters on the islands and the traders' bounties (370-living-world.js).
## Out on the islands, now and then, when nothing is chasing you: an ambush of champions breaks from the bushes, a pedlar
## is set upon and wants rescuing, a glut thief runs off with stolen glut, or a shooting star falls and leaves a chest
## where it strikes. Every trader offers two bounties, one at a time: slay so many of a kind, champions or uniques, open
## chests, catch a glut thief; it pays out on the spot in glut, a rare piece and sometimes a rune.
## What came by chance and stays behind when you walk 45 steps away is gone (foes, the pedlar, the star's chest).

const BFAM := {"skel": "Knochenwichte", "ghoul": "Grabschänder", "spider": "Spinnen", "archer": "Knochenschützen", "cult": "Aschekultisten",
	"wraith": "Klageseelen", "golem": "Steinkolosse", "scorp": "Skorpione"}
const PEDLARS := ["Jorek", "Bertolt", "Ansgar", "Mechthild", "Ruprecht", "Gisela"]

static var R := Rng.unseeded()
static var ev = null               # the pedlar in need: {o, node, foes} (G.ev)
static var ev_t := -1.0            # seconds until the next encounter (G.evT), unset until the first island

# ---------- the encounters (worldEvents) ----------

static func tick(L: Level, dt: float) -> void:
	var P := L.P
	var pp := Vector2(P.x, P.y)
	for e in L.enemies:
		if e.ev and not e.dead and e.world.distance_to(pp) > 45:
			e.dead = true
			e.die_t = 99
	for n in L.obj_nodes.duplicate():
		if n.p.get("ev") and Vector2(n.p.x, n.p.y).distance_to(pp) > 45:
			_drop_obj(L, n)
	if ev != null:
		if not is_instance_valid(ev.node) or not L.obj_nodes.has(ev.node):
			ev = null
		elif ev.foes.all(func(e): return e.dead):
			var o: Dictionary = ev.o
			ev = null
			o["quote"] = "„Ich steh tief in deiner Schuld, Wanderer.“"
			var it := Items.make(Game.mlvl + 1, {"rarity": "unique" if R.next() < .02 else ("rare" if R.next() < .25 else "magic"), "mf": Game.d.mf})
			L.drop_item(it, o.x + .6, o.y + .6)
			var gl := 30 * Game.mlvl
			Game.glut += gl
			L.ftext(Vector2(o.x, o.y), "+%d Glut" % gl, Color("#ff9a3a"))
			Quests.inc("rescue")
			Game.log_msg("%s ist gerettet und schenkt dir %s." % [o.name, it.name], Color("#e8d8b0"))
	if P.dead:
		return
	var wg: WorldGen = L.ow.wg
	var I = wg.island_of(int(floor(P.x / WorldGen.CH)), int(floor(P.y / WorldGen.CH)))
	if I == null or I.kind == "home" or I.kind == "boss":
		return
	if ev != null or L.enemies.any(func(e): return not e.dead and e.aggro and e.world.distance_to(pp) < 11):
		return
	if ev_t < 0:
		ev_t = R.rnd(70, 110)
	ev_t -= dt
	if ev_t > 0:
		return
	ev_t = R.rnd(100, 170)
	start(L, R.pick(["ambush", "ambush", "merchant", "thief", "thief", "meteor"]))

## begin one encounter by name (also the test switch --ev)
static func start(L: Level, k: String) -> void:
	match k:
		"ambush": _ambush(L)
		"merchant": _merchant(L)
		"thief": _thief(L)
		"meteor": _meteor(L)

static func _drop_obj(L: Level, n: Prop) -> void:
	L.obj_nodes.erase(n)
	L.m.objs.erase(n.p)
	n.queue_free()

## a foe of the right depth for chance encounters (evVid): no golems, nothing deeper than here
static func _vid() -> String:
	var ok := Data.variants.values().filter(func(v): return v.get("minF", 999) <= maxi(1, Game.mlvl) and v.base != "golem")
	return R.pick(ok).id if ok.size() else "skel"

static func _ambush(L: Level) -> void:
	var id := _vid()
	var k := 0
	for i in R.rint(3, 5):
		var s = DayNight.spot(L, 6, 8)
		if s == null:
			continue
		var e := Enemy.make(id, s, "champ", Game.mlvl, R)
		e.aggro = true
		e.ev = true
		L._add_enemy(e)
		L._smoke(s, 5)
		k += 1
	if k:
		Game.banner.emit("HINTERHALT!", "Champions brechen aus dem Gebüsch", "")
		L.shake = 6

static func _merchant(L: Level) -> void:
	var s = DayNight.spot(L, 6, 8)
	if s == null:
		_ambush(L)
		return
	var o := {"type": "merchant", "x": s.x, "y": s.y, "name": "Hausierer " + R.pick(PEDLARS), "quote": "„Hilfe! Schafft sie mir vom Hals!“",
		"lvl": maxi(Game.lvl, Game.mlvl), "ev": true}
	var node := L.add_obj(o)
	var id := _vid()
	var foes := []
	for i in R.rint(4, 6):
		var a := R.rnd(0, 7)
		var at := Vector2(o.x + cos(a) * R.rnd(1.4, 2.6), o.y + sin(a) * R.rnd(1.4, 2.6))
		if not L.walkable(at.x, at.y):
			continue
		var e := Enemy.make(id, at, "champ" if i == 0 else "normal", Game.mlvl, R)
		e.ev = true
		e.face = atan2(o.y - at.y, o.x - at.x)
		L._add_enemy(e)
		foes.append(e)
	ev = {"o": o, "node": node, "foes": foes}
	Game.banner.emit("EIN HÄNDLER IN NOT", o.name + " wird überfallen", "")
	Game.log_msg("Rette %s: besiege die Angreifer." % o.name, Color("#e8d8b0"))

static func _thief(L: Level) -> void:
	var s = DayNight.spot(L, 5, 7)
	if s == null:
		return
	var e := Enemy.make("wraith", s, "unique", Game.mlvl, R)
	e.e_name = "Glutdieb"
	e.sub = "Flieht mit gestohlener Glut · Stufe %d" % Game.mlvl
	e.thief = true
	e.thief_t = 24.0
	e.aff = []
	e.spd = 3.5
	e.aggro = true
	e.ev = true
	e.dmg_taken = 1.0
	e.hp *= .8
	e.max_hp = e.hp
	e.thief_ph = R.rnd(0, 6)
	L._add_enemy(e)
	e._spr.self_modulate = Color(.42, .3, .24)      # all in char, as his palette in the browser
	Game.banner.emit("EIN GLUTDIEB!", "Fang ihn, bevor er verschwindet", "")

static func _meteor(L: Level) -> void:
	var s = DayNight.spot(L, 5, 7)
	if s == null:
		_thief(L)
		return
	Game.banner.emit("STERNSCHNUPPE", "Etwas Glühendes stürzt vom Himmel", "")
	L.tele.append({"shape": "circle", "x": s.x, "y": s.y, "r": 1.6, "t": 0.0, "dur": 2.4, "dmg": Game.d.life * .3, "elem": "fire", "owner": null, "meteor": true, "on_done": "meteor"})

## where the star struck: a royal chest in a scorched ring (onDone of evMeteor)
static func meteor_done(L: Level, tl: Dictionary) -> void:
	L.add_obj({"type": "chest", "x": tl.x, "y": tl.y, "ev": true, "star": true, "open": false})
	L.shake = 10
	L.flashes.append({"x": tl.x, "y": tl.y, "r": 300.0, "a": 1.0, "t": 0.0, "life": 1.5})
	L.sparks(Vector2(tl.x, tl.y), .3, -1.57, 30, [Color("#ffd080"), Color("#ff9a30"), Color.WHITE], 6)

# ---------- the glut thief runs (the updEnemy wrapper) ----------

static func thief_update(L: Level, e: Enemy, dt: float) -> void:
	e.flash = maxf(0, e.flash - dt)
	e.hit_t = maxf(0, e.hit_t - dt)
	e.slow = maxf(0, e.slow - dt)
	e.thief_t -= dt
	if e.thief_t <= 0:
		e.dead = true
		e.die_t = 99
		L._smoke(e.world, 10)
		Game.log_msg("Der Glutdieb ist entkommen.", Color("#a39b88"))
		return
	var d := e.world.distance_to(Vector2(L.P.x, L.P.y))
	var a := atan2(e.world.y - L.P.y, e.world.x - L.P.x) + sin(Game.t * 1.7 + e.thief_ph) * .7
	var sp := e.spd * (.5 if e.slow > 0 else 1.0) * (1.15 if d < 4 else .8)
	var o := e.world
	e.world = L.move_ent(e.world, Vector2(cos(a), sin(a)) * sp * dt, e.r)
	if e.world.distance_to(o) < sp * dt * .3:
		var b := a + (1.6 if R.next() < .5 else -1.6)
		e.world = L.move_ent(e.world, Vector2(cos(b), sin(b)) * sp * dt, e.r)
	e.face = a
	if e.anim != "walk":
		e.play("walk")
	if R.next() < dt * 14:
		L.parts.append({"k": "spark", "x": e.world.x, "y": e.world.y, "z": .5, "vx": R.rnd(-.5, .5), "vy": R.rnd(-.5, .5), "vz": R.rnd(.3, 1), "t": 0.0, "life": .6,
			"col": Color(R.pick(["#ffc070", "#ff9a30"])), "s": R.rnd(1, 2), "g": -1.0})

## what a kill counts for the bounties, and the thief's loot (the killEnemy wrapper)
static func on_kill(L: Level, e: Enemy) -> void:
	if e.rank == "unique":
		Quests.inc("uniq")
	if e.rank == "champ":
		Quests.inc("champ")
	if not e.thief:
		return
	var gl := 45 * maxi(1, Game.mlvl)
	Game.glut += gl
	L.ftext(e.world - Vector2(0, .5), "+%d Glut" % gl, Color("#ff9a3a"))
	L.drop_item(Items.make(Game.mlvl + 1, {"mf": Game.d.mf, "boost": .3}), e.world.x, e.world.y)
	for k in 3:
		L.drop_item(Items.junk_for(e, Game.mlvl), e.world.x, e.world.y)
	if Runes.ok():
		L.drop_item(Runes.make(Runes.pick(Game.mlvl, true)), e.world.x, e.world.y)
	Game.banner.emit("GLUTDIEB GESTELLT", "Seine Beute gehört dir", "")
	Quests.inc("thief")

# ---------- bounties ----------

## one bounty from a seed (makeBounty): its kind, how many, and what it pays
static func make_bounty(seed: int) -> Dictionary:
	var r := Rng.new(seed)
	var lv := maxi(1, Game.lvl)
	var ty: String = r.pick(["fam", "fam", "fam", "uniq", "champ", "chest", "thief"])
	var b := {}
	match ty:
		"fam":
			var f: String = r.pick(BFAM.keys().filter(func(k): return k != "golem" or lv >= 8))
			var n := 10 + int(floor(r.next() * 16))
			b = {"ty": ty, "key": "k_" + f, "n": n, "t": "Besiege %d %s" % [n, BFAM[f]]}
		"uniq":
			var n := 2 + int(floor(r.next() * 2))
			b = {"ty": ty, "key": "uniq", "n": n, "t": "Besiege %d einzigartige Gegner" % n}
		"champ":
			var n := 6 + int(floor(r.next() * 6))
			b = {"ty": ty, "key": "champ", "n": n, "t": "Besiege %d Champions" % n}
		"chest":
			var n := 3 + int(floor(r.next() * 3))
			b = {"ty": ty, "key": "chest", "n": n, "t": "Öffne %d Truhen" % n}
		_:
			b = {"ty": ty, "key": "thief", "n": 1, "t": "Stelle einen Glutdieb"}
	var k: float = b.n / 12.0 if ty == "fam" else (2.2 if ty == "thief" else (b.n * .9 if ty == "uniq" else 1.4))
	b["glut"] = roundi((40 + lv * 22) * k)
	b["rune"] = r.next() < .5
	return b

## a trader's two offers, new whenever you have grown a level (bountyOffers)
static func offers(o: Dictionary) -> Array:
	if not o.has("bo") or o.get("bo_l") != Game.lvl:
		o["bo_l"] = Game.lvl
		var s := randi() % 1000000000
		o["bo"] = [make_bounty(s), make_bounty(s + 77)]
	return o["bo"]

static func prog(b: Dictionary) -> int:
	return mini(b.n, Quests.cnt(b.key) - b.base)

static func take(o: Dictionary, i: int) -> void:
	var x: Dictionary = offers(o)[i].duplicate()
	x["base"] = Quests.cnt(x.key)
	Game.bounty = x
	o.erase("bo")
	Game.log_msg("Kopfgeld angenommen: " + x.t, Color("#ffd88a"))

static func drop() -> void:
	Game.bounty = null
	Game.log_msg("Kopfgeld aufgegeben.", Color("#a39b88"))

## paid on the spot once it is done (bountyTick)
static func bounty_tick(L: Level) -> void:
	var b = Game.bounty
	if b == null or prog(b) < b.n:
		return
	Game.bounty = null
	Game.glut += b.glut
	var it := Items.make(maxi(Game.mlvl, Game.lvl), {"rarity": "rare" if R.next() < .2 else "magic", "mf": Game.d.mf})
	if not Items.inv_add(it):
		L.drop_item(it, L.P.x, L.P.y)
	if b.rune and Runes.ok():
		var ru := Runes.make(Runes.pick(maxi(Game.mlvl, Game.lvl), false))
		if not Items.inv_add(ru):
			L.drop_item(ru, L.P.x, L.P.y)
	Quests.inc("bounty")
	Game.banner.emit("KOPFGELD ERFÜLLT", "+%d Glut · %s%s" % [b.glut, it.name, " · eine Rune" if b.rune else ""], "")
	Game.log_msg("Kopfgeld kassiert: " + b.t, Color("#ffd88a"))
