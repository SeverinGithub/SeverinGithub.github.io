class_name Quests
## The chronicle (320-quest-chronicle.js): one long line of fifty quests in five acts, always exactly one of them active.
## Counters (Game.qc) run all the time; a quest counts from where they stood when it began (Game.qb). Done gives glut,
## 12 % of a level's experience and, at the end of each act, a talent point. In the sky the quest points to a place
## (target), which the tracker top left, the map and the compass on the HUD show.
## The arena's statue is not in Godot yet: its quest waits in the line, marked, and is passed over without reward
## (LATER) until the arena comes.

const QACT := ["Akt I · Der Hügel", "Akt II · Die Himmelsinseln", "Akt III · Feuer und Nebel", "Akt IV · Die Tiefe", "Akt V · Der schwarze Himmel"]
const FAMN := {"skel": "Skelette", "archer": "Knochenschützen", "ghoul": "Ghule", "spider": "Spinnen", "cult": "Kultisten", "wraith": "Klageseelen", "golem": "Kolosse", "scorp": "Skorpione"}
const FAMK := {"skel": ["ruins", "grave", "village"], "archer": ["ruins", "grave"], "ghoul": ["grave", "forest"], "spider": ["forest"], "scorp": ["forest"],
	"cult": ["grave", "village"], "wraith": ["ruins", "grave"], "golem": ["ruins"]}
const KINDN := {"village": "brennendes Dorf", "ruins": "Ruinen", "grave": "Gräberinsel", "camp": "Lager", "forest": "Waldinsel", "wild": "wilde Insel", "rock": "Felsinsel", "boss": "Bossinsel"}
const LATER := {"arena": "Kommt mit der Arena"}

static var Q: Array = []
static var _tc := {}             # the target, remembered per quest and chunk (G.qtc)
static var tgt = null            # where the current quest wants you: {x, y, l} or null (G.qtgt)
static var _t := 0.0

static func _k(a, fam, n, t, d): return {"a": a, "ty": "kill", "fam": fam, "n": n, "t": t, "d": d}
static func _f(a, f, t, d): return {"a": a, "ty": "floor", "f": f, "t": t, "d": d}
static func _d(a, f, t, d): return {"a": a, "ty": "dboss", "f": f, "t": t, "d": d, "boss": true}
static func _w(a, wb, t, d): return {"a": a, "ty": "wboss", "wb": wb, "t": t, "d": d, "boss": true}
static func _v(a, kind, n, t, d): return {"a": a, "ty": "visit", "kind": kind, "n": n, "t": t, "d": d}
static func _x(a, n, t, d): return {"a": a, "ty": "explore", "n": n, "t": t, "d": d}
static func _l(a, n, t, d): return {"a": a, "ty": "fires", "n": n, "t": t, "d": d}
static func _c(a, ty, n, t, d): return {"a": a, "ty": ty, "n": n, "t": t, "d": d}

static func all() -> Array:
	if Q.size():
		return Q
	Q = [
		_k(0, null, 5, "Erstes Blut", "Besiege 5 Gegner. Im Turm und auf den Inseln hinter den Brücken findest du genug davon."),
		_f(0, 1, "Der Turm ruft", "Betritt den Schwarzen Turm durch das Tor auf dem Hügel."),
		_k(0, "skel", 10, "Knochenbrecher", "Besiege 10 Skelette."),
		_f(0, 2, "Tiefer hinab", "Erreiche Ebene 2 des Schwarzen Turms."),
		_c(0, "buy", 1, "Handel mit Odalinde", "Kauf dir etwas bei einem Händler. Odalinde wartet neben dem Turm."),
		_c(0, "chest", 2, "Truhenjäger", "Öffne 2 Truhen."),
		_d(0, 3, "Der Hügeltyrann", "Steig hinab bis Ebene 3 und besiege Morgrath, den Hügeltyrann."),
		_x(1, 3, "Über die Brücken", "Verlass den Hügel und erkunde 3 Himmelsinseln."),
		_v(1, "village", 1, "Brennende Dörfer", "Finde ein brennendes Dorf auf den Inseln."),
		_l(1, 1, "Ein Feuer im Dunkeln", "Entzünde ein Leuchtfeuer auf den Himmelsinseln. Lager haben immer eins."),
		_k(1, "spider", 15, "Spinnenplage", "Besiege 15 Spinnen. Sie hausen in den Wäldern."),
		_c(1, "buy", 3, "Wanderhändler", "Kauf 3 Dinge bei Händlern. In den Lagern ziehen Händler umher."),
		_c(1, "socket", 1, "Gemeißelte Worte", "Setze eine Rune in einen Gegenstand mit Sockel. Runen fallen von Gegnern, Odalinde schlägt Sockel und verkauft Runenbeutel."),
		_c(1, "talent", 3, "Erste Talente", "Lerne 3 Knoten im Talentbaum (P)."),
		_w(1, 0, "Rußklaue", "Rußklaue plündert die Dörfer nahe dem Hügel. Finde sein Revier und besiege ihn."),
		_v(1, "grave", 1, "Die Gräberinseln", "Betritt eine Gräberinsel."),
		_k(1, "ghoul", 15, "Ghulfeuer", "Besiege 15 Ghule."),
		_v(1, "ruins", 2, "Ruinen der Alten", "Erkunde 2 Ruineninseln."),
		_d(1, 6, "Die Ascheweberin", "Besiege die Ascheweberin auf Ebene 6."),
		_x(2, 12, "Kartograph", "Erkunde 12 Himmelsinseln. Deine Karte (M) zeigt, was du schon gesehen hast."),
		_l(2, 4, "Feuerkette", "Entzünde 4 Leuchtfeuer, damit du schnell reisen kannst."),
		_w(2, 1, "Die Nebelweberin", "Im Nebel weit draußen spinnt die Nebelweberin ihre Fäden. Besiege sie."),
		_k(2, "archer", 20, "Pfeilregen", "Besiege 20 Knochenschützen."),
		_c(2, "runeword", 1, "Das erste Wort", "Schmiede ein Runenwort: die richtigen Runen in der richtigen Reihenfolge in einem gewöhnlichen Gegenstand. Die Rezepte stehen in der Sammlung (J)."),
		_f(2, 8, "Die Mitte des Turms", "Erreiche Ebene 8."),
		_c(2, "lvl", 15, "Erfahren", "Erreiche Stufe 15."),
		_k(2, "scorp", 20, "Sandstacheln", "Besiege 20 Skorpione."),
		_w(2, 2, "Moosfaust", "Der Grabwächter Moosfaust duldet niemanden auf seiner Insel. Besiege ihn."),
		_d(2, 9, "Graukeil", "Besiege Graukeil, den Wächter der Tiefe, auf Ebene 9."),
		_c(3, "chest", 15, "Schatzsucher", "Öffne 15 Truhen."),
		_x(3, 25, "Weit gereist", "Erkunde 25 Himmelsinseln."),
		_c(3, "sell", 10, "Trödler", "Verkaufe 10 Gegenstände."),
		_k(3, "cult", 25, "Ende des Kults", "Besiege 25 Kultisten."),
		_w(3, 3, "Kaltherz", "An der Frostfurt wartet Kaltherz. Besiege ihn."),
		_d(3, 12, "Morgraths Rückkehr", "Morgrath ist zurück, stärker als zuvor. Besiege ihn auf Ebene 12."),
		_c(3, "unique", 3, "Legenden", "Finde 3 einzigartige Gegenstände."),
		_c(3, "talent", 15, "Meister der Talente", "Lerne 15 Knoten im Talentbaum."),
		_w(3, 4, "Die Brutkönigin", "Die Brutkönigin brütet weit draußen neue Spinnen aus. Besiege sie."),
		_k(4, "wraith", 30, "Seelenruhe", "Besiege 30 Klageseelen."),
		_l(4, 8, "Leuchtfeuer der Welt", "Entzünde 8 Leuchtfeuer."),
		_d(4, 15, "Die zweite Weberin", "Besiege die Ascheweberin auf Ebene 15."),
		_w(4, 5, "Glutkoloss Vharn", "Vharn glüht am Rand der Welt. Besiege den Glutkoloss."),
		_k(4, "golem", 25, "Steinbrecher", "Besiege 25 Kolosse."),
		_c(4, "lvl", 30, "Held der Inseln", "Erreiche Stufe 30."),
		_d(4, 18, "Graukeil erwacht", "Besiege Graukeil auf Ebene 18."),
		_w(4, 6, "Der Schattenkönig", "Der Schattenkönig herrscht über die fernen Inseln. Besiege ihn."),
		_x(4, 60, "Die ganze Welt", "Erkunde 60 Himmelsinseln."),
		_f(4, 21, "Ebene 21", "Steig bis Ebene 21 hinab."),
		_c(4, "arena", 10, "Der Wächter der Statue", "Seit du Ebene 20 erreicht hast, ist die Statue in der Arena wach. Schlag sie und besiege 10 Gegner, die sie herbeiruft."),
		_w(4, 7, "Aschemutter, die Letzte", "Am äußersten Rand wartet die Aschemutter, Ursprung aller Asche. Beende es.")]
	for i in Q.size():
		Q[i].i = i
		Q[i].glut = floori(40 + i * 38 + .5)
		Q[i].tp = i == Q.size() - 1 or Q[i + 1].a != Q[i].a
	return Q

static func cur():
	var qs := all()
	return qs[Game.qi] if Game.qi < qs.size() else null

static func cnt(k: String) -> int:
	return int(Game.qc.get(k, 0))

## count one more of something a quest may want: kill, k_<kind>, buy, sell, chest (qInc)
static func inc(k: String, n := 1) -> void:
	Game.qc[k] = cnt(k) + n

static func key(q: Dictionary) -> String:
	if q.ty == "kill":
		return "k_" + q.fam if q.fam else "kill"
	return q.ty if q.ty in ["buy", "sell", "chest", "arena"] else ""

static var _seen_cache := {}

static func seen_kind(k) -> int:
	var wg = _wg()
	if wg == null:
		return _seen_cache.get(str(k), 0)
	var n := 0
	for c in Game.ow_seen:
		var ab: PackedStringArray = c.split(",")
		var I = wg.island_of(int(ab[0]), int(ab[1]))
		if I and (k == null or I.kind == k) and I.kind != "home":
			n += 1
	_seen_cache[str(k)] = n
	return n

static func _wg():
	var s = Engine.get_main_loop().current_scene
	return s.wg if s and "wg" in s else null

## [done, needed] (qProg)
static func prog(q: Dictionary) -> Array:
	var base := cnt(key(q)) - Game.qb if key(q) != "" else 0
	match q.ty:
		"kill", "buy", "sell", "chest", "arena": return [base, q.n]
		"floor": return [mini(Game.max_floor, q.f), q.f]
		"dboss": return [1 if Game.boss_dead.get(q.f) else 0, 1]
		"wboss": return [1 if Game.ow_boss.has(WorldGen.WB[q.wb].id) else 0, 1]
		"visit": return [seen_kind(q.kind), q.n]
		"explore": return [seen_kind(null), q.n]
		"fires": return [Game.ow_fires.size(), q.n]
		"lvl": return [Game.lvl, q.n]
		"socket":
			var n := 0
			for it in Game.eq.values() + Game.inv + Game.stash:
				if it is Dictionary:
					n += it.get("runes", []).size()
			return [maxi(cnt("socket"), n), q.n]
		"runeword":
			return [maxi(cnt("runeword"), Game.found.keys().filter(func(k): return String(k).begins_with("rw:")).size()), q.n]
		"talent": return [Game.tree.size(), q.n]
		"unique":
			var n := 0
			for k in Game.found:
				if String(k).begins_with("u:"):
					n += 1
			return [n, q.n]
	return [0, 1]

static func start() -> void:
	var q = cur()
	Game.qb = cnt(key(q)) if q and key(q) != "" else 0
	_tc = {}

## the nearest island that passes the test, looking outward ring by ring (nearIsland)
static func _near(wg: WorldGen, at: Vector2, test: Callable, skip_seen := false):
	var cx := int(floor(at.x / WorldGen.CH))
	var cy := int(floor(at.y / WorldGen.CH))
	var best = null
	var bd := 1e9
	for r in 15:
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var I = wg.island_of(cx + dx, cy + dy)
				if I == null or not test.call(I) or (skip_seen and Game.ow_seen.has("%d,%d" % [I.cx, I.cy])):
					continue
				var d := Vector2(I.x - at.x, I.y - at.y).length()
				if d < bd:
					bd = d
					best = I
		if best and r >= 2:
			break
	return best

## where the current quest wants you, in the sky (qTarget)
static func target(q, L: Level):
	if q == null or L == null or L.ow == null:
		return null
	var wg: WorldGen = L.ow.wg
	var at := Vector2(L.P.x, L.P.y)
	var ck := "%d:%d:%d,%d" % [Game.seed_value, Game.qi, int(floor(at.x / WorldGen.CH)), int(floor(at.y / WorldGen.CH))]
	if _tc.get("k") == ck:
		return _tc.t
	var t = null
	var isl := func(I, l: String): return {"x": I.x, "y": I.y, "l": l} if I else null
	var home: Array = wg.home.objs
	var of := func(ty: String): return home.filter(func(o): return o.type == ty).front()
	match q.ty:
		"floor", "dboss":
			var door = of.call("door")
			t = {"x": door.x, "y": door.y, "l": "Tor des Schwarzen Turms"}
		"wboss":
			var b: Dictionary = WorldGen.WB[q.wb]
			if not Game.ow_boss.has(b.id):
				var p := wg.wb_pos(q.wb)
				t = {"x": p.x, "y": p.y, "l": "Revier von " + String(b.short).trim_prefix("der ").trim_prefix("dem ")}
		"visit":
			var I = _near(wg, at, func(I): return I.kind == q.kind, true)
			if I == null:
				I = _near(wg, at, func(I): return I.kind == q.kind)
			t = isl.call(I, KINDN[q.kind])
		"explore":
			t = isl.call(_near(wg, at, func(I): return I.kind != "home", true), "unerkundete Insel")
		"fires":
			t = isl.call(_near(wg, at, func(I): return I.kind == "camp" and not Game.ow_fires.has("%d,%d" % [I.cx, I.cy])), "Lager mit Leuchtfeuer")
		"buy":
			var od = of.call("merchant")
			var I = _near(wg, at, func(I): return I.kind == "camp")
			t = isl.call(I, "Lager mit Händler") if I and Vector2(I.x, I.y).distance_to(at) < Vector2(od.x, od.y).distance_to(at) else {"x": od.x, "y": od.y, "l": "Odalinde"}
		"chest":
			t = isl.call(_near(wg, at, func(I): return I.kind == "village" or I.kind == "rock"), "Dorf mit Truhen")
		"kill":
			if q.fam:
				var I = _near(wg, at, func(I): return I.kind in FAMK[q.fam])
				t = isl.call(I, KINDN.get(I.kind, "Insel") if I else "Insel")
	_tc = {"k": ck, "t": t}
	return t

## quest done: glut, experience, at an act's end a talent point; then the next begins (qDone)
static func done(q: Dictionary) -> void:
	Game.glut += q.glut
	var x := floori(Game.xp_next(Game.lvl) * .12 + .5)
	Game.gain_xp(x)
	if q.tp:
		Game.tbonus += 1
	Game.banner.emit("QUEST ERFÜLLT", q.t, "boss")
	Game.log_msg("Quest erfüllt: %s · +%d Glut · +%d Erfahrung%s" % [q.t, q.glut, x, " · +1 Talentpunkt" if q.tp else ""], Color("#e8c878"))
	_next(q)

static func _next(q: Dictionary) -> void:
	Game.qi += 1
	start()
	var n = cur()
	if n:
		Game.log_msg("Neue Quest: " + n.t, Color("#ffd88a"))
		if n.a != q.a:
			var tree := Engine.get_main_loop() as SceneTree
			tree.create_timer(2.7).timeout.connect(func(): Game.banner.emit(String(QACT[n.a]).to_upper(), n.t, "boss"))

## every 0.3 s: is the quest done, and where does the next one point (questTick)
static func tick(dt: float, L: Level) -> void:
	_t -= dt
	if _t > 0:
		return
	_t = .3
	var q = cur()
	if q and LATER.has(q.ty):
		Game.log_msg("„%s“ wartet noch: %s." % [q.t, LATER[q.ty]], Ui.PAPER_DIM)
		_next(q)
		q = cur()
	if q:
		var p := prog(q)
		if p[0] >= p[1]:
			done(q)
			_t = 2.8
	tgt = target(cur(), L)
