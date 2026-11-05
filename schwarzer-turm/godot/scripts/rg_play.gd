class_name RgPlay
## The dead lands in play, part 2 (550-dead-lands-play.js): Ser Haldor, the giant knight on his bone horse who waits in the
## cloister's boss hall; Gram, his horse, who follows the hero once his lord has fallen and is ridden from a slot of its own
## in the bag (H mounts and dismounts: twice as fast, harder to hit, poison barely bites, cold does not slow); and Act VI of
## the chronicle, which Eldrik's map leads through the city, the cloister, the forest and up to the castle gate.
## The horse is baked from the browser's rig (tools/godot-export-mount.js); Hero lays it under and over the rider.

## Ser Haldor (makeRgBoss): 1.7 times an island lord, a little faster, calls horses, knights and royal knights to his side
static func make_boss(at: Vector2, ml: int) -> Enemy:
	var hs := 1 + (ml - 1) * .32
	var ds := 1 + (ml - 1) * .2
	var e := Enemy.new()
	e.key = "enemy_rg_haldor"
	e.type = "boss"
	e.boss = true
	e.rank = "boss"
	e.mon = {"kind": "boss", "range": 2.6}
	e.moves = ["charge", "sweep", "slam", "charge", "summon"]
	e.sum_p = ["rg_ross", "rg_ritter", "rg_koenig"]
	e.world = at
	e.r = 1.0
	e.e_name = "Ser Haldor, der Riesenritter"
	e.bsub = "Herr des Riesenklosters"
	e.sub = "Herr des Riesenklosters · Stufe %d" % ml
	e.hp = 620 * hs * 1.7
	e.dmg = [14 * ds, 23 * ds]
	e.spd = 2.7
	e.cd = 1.6
	e.face = PI
	e.xp = 480 * (1 + (ml - 1) * .35) * 1.6
	e.wb = "rgk"
	e.rgz = "church"
	e.max_hp = e.hp
	return e

## his fall: the hind gate of the cloister rises, a new slot opens in the bag, and Gram stays behind (the killEnemy wrapper)
static func on_kill(L: Level, e: Enemy) -> void:
	if e.rgz != "":
		Quests.inc("k_rg_" + {"church": "clo", "castle": "wood"}.get(e.rgz, e.rgz))
	if e.wb != "rgk":
		return
	Game.rg.open_t = 0.0
	DeadLands.open_gate(L.ow.wg)
	Game.rg.mslot = 1
	if not owns_mount():
		L.drop_item(make_mount(), e.world.x, e.world.y)
	L.get_tree().create_timer(2.6).timeout.connect(func():
		Game.banner.emit("EIN NEUER PLATZ IM INVENTAR", "Reittier · Leg Gram hinein und sitz mit H auf", "boss")
		Game.log_msg("Das Hintertor des Klosters hebt sich.", Color("#e8c878")))
	L.get_tree().current_scene.save_game()

# ---------- Gram, the bone horse ----------

static func make_mount() -> Dictionary:
	return {"slot": "mount", "b": "Knochenross", "cls": "mount", "rar": "unique", "name": "Gram, das Knochenross", "ilvl": maxi(60, Game.mlvl),
		"mods": {}, "req": {"lvl": 1, "str": 0, "dex": 0}, "mount": 1}

static func owns_mount() -> bool:
	var has := func(a: Array) -> bool: return a.any(func(i): return i is Dictionary and i.get("slot") == "mount")
	return Game.eq.has("mount") or has.call(Game.inv) or has.call(Game.stash) or (Game.hand is Dictionary and Game.hand.get("slot") == "mount")

static func riding() -> bool:
	return bool(Game.rg.get("ride", false)) and Game.eq.has("mount") and Game.hp > 0

## H: up into the saddle or down again (toggleRide)
static func toggle(L: Level) -> void:
	if not Game.eq.has("mount"):
		Game.log_msg("Kein Reittier im Reittier-Platz." if Game.rg.get("mslot") else "Du hast kein Reittier.", Color("#a39b88"))
		return
	Game.rg.ride = not Game.rg.get("ride", false)
	if Game.rg.ride:
		Game.rg.rode = 1
		L.hero.rear_up()
	Game.recalc()
	L.ftext(Vector2(L.P.x, L.P.y), "Aufgesessen" if Game.rg.ride else "Abgesessen", Color("#e8dcc0"))
	L.burst(Vector2(L.P.x, L.P.y), Color(200 / 255.0, 190 / 255.0, 170 / 255.0, .6), 8, 1.5)
	if Game.rg.ride and not Game.rg.has("tip"):
		Game.rg.tip = 1
		Game.log_msg("Auf Gram: doppelt so schnell, schwerer zu treffen, Gift wirkt kaum.", Color("#e8dcc0"))

## in the saddle: +100 % pace past every cap, 40 % more defence and 30 on top (the recalc wrapper)
static func recalc(d: Dictionary) -> void:
	if Game.rg.get("ride") and not Game.eq.has("mount"):
		Game.rg.ride = false
	if riding():
		d.frw += 100
		d.def = roundi(d.def * 1.4 + 30)
		d.mounted = 1

## the horse takes a share of every blow, and poison barely reaches the rider (the hurtPlayer wrapper)
static func hurt(dmg: float, elem) -> float:
	return dmg * (.4 if elem == "poison" else .85) if riding() else dmg

static func tip(act: String) -> Array:
	var m := Color("#7aa4ff")
	return [["Gram, das Knochenross", Color("#e8973a")], ["Reittier · aus dem Riesenkloster", Color("#e8973a")],
		["+100% Lauftempo", m], ["+40% Verteidigung", m], ["15% weniger Schaden, das Ross fängt ihn ab", m], ["60% weniger Giftschaden", m], ["Kälte verlangsamt dich nicht", m],
		["„Er hat seinem Herrn bis in den Tod gedient. Jetzt dient er dir.“", Color("#c8b88a")],
		["Im Reittier-Platz · Taste H: auf- und absitzen" if act == "equipped" else "In den Reittier-Platz legen, dann mit H aufsitzen", Color("#a39b88")]]

# ---------- Act VI of the chronicle (RGQ) ----------

const ACT := "Akt VI · Die Totenstadt"
const STORY := {
	"Die Karte des Chronisten": "Da bist du ja. Die Aschemutter ist tot, und ich dachte, die Chronik endet hier. Aber sieh: auf der letzten Seite eine Karte. Eine Stadt am Westrand, ein Kloster, ein Wald, und dahinter etwas, das ich nicht zu zeichnen wage. Hier, nimm sie. Folge dem Pfeil.",
	"Die stille Stadt": "Die Stadt ist nicht verbrannt, nicht zerstört. Alles steht noch, jede Tür, jedes Fenster. Nur die Menschen sind fort. Oder genauer: sie sind noch da, nur ohne Fleisch.",
	"Bürger aus Knochen": "Bauern mit Mistgabeln, Metzger, Wachen, ein paar Ritter dazwischen. Sie arbeiten weiter, als wäre nichts geschehen, bis sie dich sehen. Dann nicht mehr.",
	"Das Riesenkloster": "Hinter dem Osttor liegt das Riesenkloster. Die Mönche haben es für Ritter gebaut, die größer waren als jeder Mensch. Niemand weiß, woher sie kamen.",
	"Die Ritter des Klosters": "Im Kloster gibt es keine Bauern mehr. Nur Rösser, Reiter, Riesen und die königliche Garde. Und sie tragen Waffen, die ich noch nie gesehen habe.",
	"Der Riesenritter": "Ser Haldor. Er war der Letzte, der den Eid geschworen hat. Er sitzt noch immer auf seinem Ross und wartet auf einen König, der nie kommt. Erlöse ihn. Und wenn sein Ross dich danach ansieht: lass es nicht stehen.",
	"Ein Ross aus Knochen": "Gram heißt das Tier, so steht es in der Chronik. Er läuft doppelt so schnell wie du, und Gift macht ihm nichts aus. Leg ihn in den Reittier-Platz und sitz auf.",
	"Der dunkelrote Wald": "Hinter dem Kloster beginnt der Wald, dessen Blätter rot sind wie geronnenes Blut. Selbst am Mittag ist es dort dunkel. Bleib im Sattel.",
	"Hexenhäuser": "Im Wald wohnen Hexen. Sie kochen Dinge, über die ich nicht schreiben will. Finde drei ihrer Häuser, dann weiß ich, wie weit ihr Reich reicht.",
	"Durch das Dickicht": "Spinnen, Ghule, Dornenknechte und Hexen. Der Wald will nicht, dass jemand die Burg erreicht. Zeig ihm, dass er sich irrt.",
	"Am Fuß der Riesenburg": "Die Riesenburg. Ich habe sie nur in Träumen gesehen. Türme über Türmen, eine Kuppel aus grünem Kupfer, und Steine, die in der Luft schweben. Geh hin. Aber ich glaube, das Tor ist noch verschlossen."}

static func quests() -> Array:
	var a := 5
	var z := func(zn: String, t: String, d: String) -> Dictionary: return {"a": a, "ty": "rg", "rg": "zone", "z": zn, "t": t, "d": d}
	var k := func(fam: String, n: int, t: String, d: String) -> Dictionary: return {"a": a, "ty": "kill", "rg": "kill", "fam": fam, "n": n, "t": t, "d": d}
	return [
		{"a": a, "ty": "rg", "rg": "map", "t": "Die Karte des Chronisten", "d": "Sprich mit Eldrik am Turm. Er hat in der Chronik etwas gefunden, das weiter reicht als die Aschemutter. Seine Karte liegt in der Chronik (L)."},
		z.call("city", "Die stille Stadt", "Folge Eldriks Karte über das Totentor bis zur Stadt am Westrand der Welt."),
		k.call("rg_city", 60, "Bürger aus Knochen", "Die ganze Stadt ist auf den Beinen, und keiner von ihnen lebt. Besiege 60 Skelette in der Stadt."),
		z.call("clo", "Das Riesenkloster", "Hinter dem Osttor der Stadt führt der Pilgerweg zum Kloster. Betritt seinen Vorhof."),
		k.call("rg_clo", 40, "Die Ritter des Klosters", "Besiege 40 Ritter, Reiter und Rösser im Kloster."),
		{"a": a, "ty": "rg", "rg": "boss", "t": "Der Riesenritter", "d": "Im Bosssaal hinter dem Kirchenschiff wartet Ser Haldor auf seinem Knochenross. Besiege ihn.", "boss": true},
		{"a": a, "ty": "rg", "rg": "ride", "t": "Ein Ross aus Knochen", "d": "Leg Gram in den neuen Reittier-Platz im Inventar und sitz auf (H)."},
		z.call("wood", "Der dunkelrote Wald", "Reite durch das Hintertor des Klosters in den dunkelroten Wald."),
		{"a": a, "ty": "rg", "rg": "huts", "n": 3, "t": "Hexenhäuser", "d": "Im Wald stehen Hexenhäuser. Finde 3 von ihnen."},
		k.call("rg_wood", 50, "Durch das Dickicht", "Kämpf dich durch den Wald: besiege 50 seiner Bewohner."),
		z.call("castle", "Am Fuß der Riesenburg", "Am Ende des Waldes ragt die Riesenburg in den Himmel. Erreiche ihr Tor.")]

## [done, needed] of a quest of the act (the qProg wrapper)
static func prog(q: Dictionary) -> Array:
	var S := DeadLands.S()
	match q.rg:
		"map": return [1 if Game.rg.get("map") else 0, 1]
		"zone": return [1 if S.seen.has(q.z) or (q.z == "clo" and S.seen.has("church")) else 0, 1]
		"boss": return [1 if Game.ow_boss.has("rgk") else 0, 1]
		"ride": return [1 if Game.rg.get("rode") else 0, 1]
		"huts": return [S.hut.size(), q.n]
	return [0, 1]

## Eldrik's map is in the chronicle: Eldrik himself does not stand on the hill yet, so opening the chronicle (L) hands it over
static func take_map() -> void:
	var q = Quests.cur()
	if q and q.get("rg") == "map" and not Game.rg.get("map"):
		Game.rg.map = 1
		Game.log_msg("Du erhältst Eldriks Karte. Der Pfeil zeigt dir den Weg.", Color("#ffd88a"))

## where a quest of the act points (the qTarget wrapper)
static func target(q: Dictionary, L: Level):
	var wg: WorldGen = L.ow.wg
	var at := func(p: int, qq: int, l: String) -> Dictionary:
		var v := wg._rg_w(p, qq)
		return {"x": v.x + .5, "y": v.y + .5, "l": l}
	if q.rg == "map":
		return null
	if DeadLands.zone == null and q.rg != "ride":
		var I = wg.island_of(wg._rg.gcx, wg._rg.gcy)
		if Vector2(I.x - L.P.x, I.y - L.P.y).length() > 40:
			return {"x": I.x, "y": I.y, "l": "Das Totentor"}
	match q.rg:
		"zone":
			return {"city": at.call(-3, 0, "Westtor der stillen Stadt"), "clo": at.call(148, 0, "Tor des Riesenklosters"), "wood": at.call(246, 0, "Hintertor des Klosters")}.get(q.z, at.call(449, 0, "Tor der Riesenburg"))
		"kill":
			return {"rg_city": at.call(66, 0, "Marktplatz der Stadt"), "rg_clo": at.call(200, 0, "Kirchenschiff")}.get(q.fam, at.call(330, 0, "Tief im Wald"))
		"boss":
			return null if Game.ow_boss.has("rgk") else at.call(228, 0, "Bosssaal des Klosters")
		"huts":
			var best = null
			var bd := 1e9
			var H: Array = wg._rg.get("huts", [])
			for i in H.size():
				if DeadLands.S().hut.has(str(i)):
					continue
				var d := Vector2(H[i][0] - L.P.x, H[i][1] - L.P.y).length()
				if d < bd:
					bd = d
					best = {"x": H[i][0], "y": H[i][1], "l": "Hexenhaus"}
			return best if best else at.call(330, 0, "Im Wald")
	return null
