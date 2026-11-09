class_name Runes
## Runes, sockets and runewords (350-runes.js with the gates of 570-loot-economy.js), the slates and the smith's upgrades
## (450-smith.js), and the grindstone that takes runes out whole again (850-names-arena-grindstone.js).
## A rune is an item {slot: "rune", rune: key}; a socketed item carries soc (how many) and runes (keys, in order);
## an upgraded one carries up (+1 … +10). Slates are no items in the bag but two counters, Game.slate_g and slate_e.

# w: in a weapon · a: in helm, armour or shield
const RUNES := [
	{"k": "asch", "n": "Asch", "l": 1, "w": {"fire": 6}, "a": {"life": 12}},
	{"k": "dorn", "n": "Dorn", "l": 2, "w": {"poison": 7}, "a": {"thorns": 6}},
	{"k": "frost", "n": "Frost", "l": 3, "w": {"cold": 6}, "a": {"res": 4}},
	{"k": "funk", "n": "Funk", "l": 5, "w": {"light": 9}, "a": {"mana": 15}},
	{"k": "blut", "n": "Blut", "l": 7, "w": {"ls": 3}, "a": {"regen": 2}},
	{"k": "fels", "n": "Fels", "l": 9, "w": {"ed": 15}, "a": {"edef": 20}},
	{"k": "wind", "n": "Wind", "l": 11, "w": {"ias": 10}, "a": {"frw": 6}},
	{"k": "eule", "n": "Eule", "l": 13, "w": {"spell": 12}, "a": {"ene": 6}},
	{"k": "baer", "n": "Bär", "l": 16, "w": {"str": 8}, "a": {"vit": 8}},
	{"k": "luchs", "n": "Luchs", "l": 19, "w": {"crit": 5}, "a": {"dex": 8}},
	{"k": "gold", "n": "Gold", "l": 22, "w": {"glutf": 25}, "a": {"mf": 15}},
	{"k": "mond", "n": "Mond", "l": 26, "w": {"mregen": 3}, "a": {"dmgred": 4}},
	{"k": "kern", "n": "Kern", "l": 31, "w": {"ed": 35}, "a": {"life": 40}},
	{"k": "krone", "n": "Krone", "l": 37, "w": {"allsk": 1}, "a": {"allsk": 1}}]
# only plain (white) gear turns runes into a word: exact socket count, exact order
const RW := [
	{"n": "Erster Funke", "s": ["weapon"], "r": ["asch", "dorn"], "m": {"fire": 10, "poison": 10, "ed": 20}},
	{"n": "Steinhaut", "s": ["helm", "armor", "offhand"], "r": ["asch", "fels"], "m": {"edef": 30, "life": 25}},
	{"n": "Zornsturm", "s": ["weapon"], "r": ["funk", "wind"], "m": {"light": 25, "ias": 20}},
	{"n": "Dornenwall", "s": ["offhand", "armor"], "r": ["dorn", "fels"], "m": {"thorns": 25, "edef": 50, "block": 6}},
	{"n": "Stille", "s": ["helm"], "r": ["eule", "mond"], "m": {"spell": 25, "mana": 40, "mregen": 3}},
	{"n": "Goldene Ernte", "s": ["helm", "armor"], "r": ["gold", "eule"], "m": {"mf": 40, "glutf": 40, "xp": 10}},
	{"n": "Glutherz", "s": ["weapon"], "r": ["asch", "funk", "asch"], "m": {"fire": 30, "ed": 40}},
	{"n": "Frostbiss", "s": ["weapon"], "r": ["frost", "frost", "wind"], "m": {"cold": 35, "crit": 6}},
	{"n": "Seelenfeuer", "s": ["weapon"], "r": ["eule", "asch", "eule"], "m": {"spell": 40, "fire": 20, "mana": 30}},
	{"n": "Rabenschwinge", "s": ["armor"], "r": ["wind", "luchs", "dorn"], "m": {"frw": 12, "dex": 15, "res": 12}},
	{"n": "Grabesruh", "s": ["offhand"], "r": ["frost", "mond", "dorn"], "m": {"res": 25, "block": 10, "thorns": 20}},
	{"n": "Blutschwur", "s": ["weapon"], "r": ["blut", "baer", "kern"], "m": {"ls": 6, "ed": 90, "life": 40}},
	{"n": "Aschenkrone", "s": ["helm"], "r": ["krone", "asch", "mond"], "m": {"allsk": 1, "life": 60, "res": 15}},
	{"n": "Wächterherz", "s": ["armor"], "r": ["fels", "blut", "mond", "kern"], "m": {"dmgred": 10, "life": 100, "regen": 6, "edef": 80}},
	{"n": "Turmbrecher", "s": ["weapon"], "r": ["kern", "fels", "baer", "krone"], "m": {"ed": 150, "str": 20, "allsk": 1, "crit": 10}}]
const SOCK := {"weapon": 4, "armor": 4, "helm": 3, "offhand": 3}
const SLOTPL := {"weapon": "Waffen", "armor": "Rüstungen", "helm": "Helme", "offhand": "Schilde"}
const COL := Color("#f0b25a")
const RWCOL := Color("#cdbf94")
const SLATE := {"g": {"n": "Grabschiefer", "col": Color("#b8c8d8"), "d": "Ein schwarzer Splitter aus alten Gräbern. Die Toten tragen ihn bei sich, als hätten sie ihn nie loslassen wollen."},
	"e": {"n": "Glutschiefer", "col": Color("#ff9a3a"), "d": "Schiefer, durch den noch Glut läuft. Nur die Starken tragen ihn, und sie geben ihn nicht freiwillig her."}}
const UNDEAD := ["skel", "ghoul", "wraith", "archer"]
const UPMAX := 10

static var R := Rng.unseeded()

static func by(k: String) -> Dictionary:
	for r in RUNES:
		if r.k == k:
			return r
	return RUNES[0]

static func idx(k: String) -> int:
	for i in RUNES.size():
		if RUNES[i].k == k:
			return i
	return 0

## a runeword asks for its highest rune's level
static func rw_lvl(w: Dictionary) -> int:
	var l := 1
	for k in w.r:
		l = maxi(l, by(k).l)
	return l

static func rw_named(n: String) -> Dictionary:
	for w in RW:
		if w.n == n:
			return w
	return {}

## runes come once three guardians have fallen (runeOK in 570); before, a stone without a sign
static func ok() -> bool:
	return Game.boss_dead.values().count(true) >= 3

static func grp(it: Dictionary) -> String:
	return "w" if it.slot == "weapon" else "a"

static func txt(m: Dictionary) -> String:
	var a := []
	for k in m:
		a.append(Data.mod_line(k, m[k]))
	return ", ".join(a)

# ---------- making ----------

static func make(k: String) -> Dictionary:
	var r := by(k)
	return {"b": "Rune:" + k, "slot": "rune", "cls": "rune", "rune": k, "rar": "rune", "name": r.n + "-Rune", "ilvl": r.l, "mods": {}, "req": {"lvl": r.l, "str": 0, "dex": 0}}

## what a rune drop gives: the rune, or before the third guardian a plain stone
static func make_gated(k: String, lv: int) -> Dictionary:
	return make(k) if ok() else Items.junk("stein", lv)

## low runes are common, every step up is rarer; bosses roll as if deeper
static func pick(lv: int, boss: bool) -> String:
	var ok_r := RUNES.filter(func(r): return r.l <= lv + (5 if boss else 0))
	var ws := []
	var tot := 0.0
	for r in ok_r:
		var w := pow(.6, idx(r.k) * (.7 if boss else 1.0))
		ws.append(w)
		tot += w
	var x := R.next() * tot
	for i in ok_r.size():
		x -= ws[i]
		if x <= 0:
			return ok_r[i].k
	return ok_r[0].k

## what a slain foe leaves of runes and slates (runeDrop in 350, the killEnemy wrapper in 450): [items], [g, e]
static func drops(e) -> Dictionary:
	var out := []
	if ok():
		var ch: float = 1.0 if e.wb != "" or e.rank == "boss" else ({"unique": .12, "champ": .035}.get(e.rank, .006))
		var n := int(floor(ch)) + (1 if R.next() < fmod(ch, 1.0) else 0)
		if Game.night and R.next() < .04:
			n += 1
		for k in n:
			out.append(make(pick(Game.mlvl, e.boss or e.wb != "")))
	var g := 0
	var x := 0
	match e.rank:
		"boss":
			g = R.rint(3, 5)
			x = R.rint(1, 2)
		"unique":
			g = R.rint(1, 2)
			x = 1 if R.next() < .35 else 0
		"champ":
			g = 1 if R.next() < .3 else 0
			x = 1 if R.next() < .04 else 0
		_:
			g = 1 if R.next() < (.06 if e.type in UNDEAD else .025) else 0
			x = 1 if R.next() < .003 else 0
	for i in g:
		out.append(slate("g"))
	for i in x:
		out.append(slate("e"))
	return {"out": out}

## the chance of a rune in a chest of this look (chestLoot's rn)
const CHEST_RN := {"barrel": .03, "crate": .03, "wood": .05, "iron": .08, "moss": .1, "royal": .12, "crystal": 1.0, "gold": .4, "emerald": 1.0, "vault": .6, "trial": .35}

static func chest_rune(lk: String, cl: int):
	if ok() and R.next() < CHEST_RN.get(lk, 0.0):
		return make(pick(cl, lk == "emerald" or lk == "vault"))
	return null

## sockets now and then in plain, magic and rare gear (rollSockets)
static func roll_sockets(it: Dictionary) -> Dictionary:
	if not SOCK.has(it.slot) or it.rar == "unique":
		return it
	var ch: float = {"normal": .28, "magic": .14, "rare": .07}.get(it.rar, 0.0)
	if R.next() >= ch:
		return it
	var mx := max_soc(it)
	it.soc = R.rint(1, mx) if it.rar == "normal" else (R.rint(1, mini(2, mx)) if it.rar == "magic" else 1)
	it.runes = []
	return it

static func max_soc(it: Dictionary) -> int:
	var s := Items.size(it)
	return mini(SOCK.get(it.slot, 0), s.x * s.y)

static func can_sock(it) -> bool:
	return it is Dictionary and it.get("soc", 0) > 0 and it.get("runes", []).size() < it.soc

# ---------- setting a rune ----------

## the rune goes into the next free socket; a full plain piece with the right order wakes as a runeword (insertRune)
static func insert(rn: Dictionary, it: Dictionary) -> bool:
	if not can_sock(it):
		return false
	var r := by(rn.rune)
	if not it.has("runes"):
		it.runes = []
	if it.runes.is_empty():
		it.req0 = it.req.lvl          # what the grindstone gives back (850)
		it.name0 = it.name
	it.runes.append(r.k)
	var m: Dictionary = r[grp(it)]
	for k in m:
		it.mods[k] = it.mods.get(k, 0) + m[k]
	it.req.lvl = maxi(it.req.lvl, r.l)
	Quests.inc("socket")
	if not Sound.sample("chest", .35):
		Sound.sfx("pick")
	Game.log_msg("%s sitzt in %s: %s." % [r.n, it.name, txt(m)], COL)
	if it.runes.size() == it.soc:
		var w = _word(it)
		if w and it.rar == "normal":
			for k in w.m:
				it.mods[k] = it.mods.get(k, 0) + w.m[k]
			it.rw = w.n
			it.rar = "runeword"
			it.name = w.n
			it.req.lvl = maxi(it.req.lvl, rw_lvl(w))
			Quests.inc("runeword")
			Game.found["rw:" + w.n] = 1
			Game.banner.emit("RUNENWORT", w.n, "boss")
			Sound.sfx("unique")
			Game.log_msg("Die Runen erwachen: %s!" % w.n, RWCOL)
		elif w:
			Game.log_msg("Die Runen flackern, doch nur in gewöhnlichen Gegenständen werden sie zum Wort.", Ui.PAPER_DIM)
	if Game.eq.values().has(it):
		Game._gear()
	return true

static func _word(it: Dictionary):
	for w in RW:
		if it.slot in w.s and w.r == it.runes:
			return w
	return null

## a rune in the hand laid on an item: true when the click was about the rune (sockTry)
static func try_hand(it) -> bool:
	if Game.hand == null or Game.hand.slot != "rune" or it == null or it == Game.hand:
		return false
	if it.slot in ["rune", "potion", "junk"]:
		Game.log_msg("Eine Rune passt nur in einen Sockel.", Ui.PAPER_DIM)
		return true
	if can_sock(it):
		insert(Game.hand, it)
		Game.hand = null
	else:
		Game.log_msg("Alle Sockel sind belegt." if it.get("soc", 0) else "Dieser Gegenstand hat keine Sockel. Odalinde kann welche schlagen.", Ui.PAPER_DIM)
	return true

## a new rune for the collection (the discover wrapper)
static func discover(it: Dictionary) -> void:
	if not Game.found.has("r:" + it.rune):
		Game.found["r:" + it.rune] = 1
		Game.log_msg("Neue Rune für die Sammlung: " + it.name, COL)

# ---------- Odalinde: a rune pouch and a hammer for sockets ----------

static func sock_cost(it: Dictionary) -> int:
	return roundi((120 + it.ilvl * 22) * (1 - Game.d.get("shopDisc", 0) / 100.0))

static func bag_cost() -> int:
	return roundi((60 + maxi(1, Game.mlvl) * 14) * (1 - Game.d.get("shopDisc", 0) / 100.0))

## plain gear without sockets, worn or in the bag: [[item, worn]]
static func sock_list() -> Array:
	var out := []
	for it in Game.inv:
		if SOCK.has(it.slot) and it.rar == "normal" and not it.get("soc"):
			out.append([it, false])
	for k in Game.eq:
		var it = Game.eq[k]
		if it and SOCK.has(it.slot) and it.rar == "normal" and not it.get("soc"):
			out.append([it, true])
	return out

static func buy_bag() -> void:
	var c := bag_cost()
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut.", Ui.BAD)
		return
	var it := make(pick(maxi(1, Game.mlvl), false))
	if not Items.inv_add(it):
		Game.log_msg("Das Inventar ist voll.", Ui.BAD)
		return
	Game.glut -= c
	Quests.inc("buy")
	discover(it)
	Game.log_msg("Aus dem Beutel: " + it.name, COL)

static func buy_sockets(it: Dictionary) -> void:
	var c := sock_cost(it)
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut.", Ui.BAD)
		return
	if it.get("soc"):
		return
	Game.glut -= c
	it.soc = R.rint(1, max_soc(it))
	it.runes = []
	Game.log_msg("Odalinde schlägt %d Sockel in %s." % [it.soc, it.name], Color("#f0b25a"))

# ---------- the grindstone ----------

## the level the piece asked before its first rune (grindReq)
static func grind_req(it: Dictionary) -> int:
	if it.has("req0"):
		return it.req0
	var b: Dictionary = Data.items.get(it.b, {})
	if b.is_empty():
		return it.req.lvl
	if it.rar == "unique":
		for u in Data.uniques:
			if u.n == it.name:
				return maxi(int(b.lvl), int(u.lvl))
	return int(b.lvl) if it.rar == "normal" or it.has("rw") else maxi(int(b.lvl), int(it.ilvl * .7))

## the runes come out whole, the sockets stay open, a runeword falls apart (grindItem): {rs, rw} or {}
static func grind(it: Dictionary) -> Dictionary:
	var rs: Array = it.get("runes", []).duplicate()
	if rs.is_empty():
		return {}
	var g := grp(it)
	var sub := func(m: Dictionary) -> void:
		for k in m:
			it.mods[k] = it.mods.get(k, 0) - m[k]
			if absf(it.mods[k]) < 1e-6:
				it.mods.erase(k)
	var rw: String = it.get("rw", "")
	if rw:
		var w := rw_named(rw)
		if w:
			sub.call(w.m)
		it.erase("rw")
		it.rar = "normal"
		it.name = it.name0 if it.get("name0", rw) != rw else it.b
	for k in rs:
		sub.call(by(k)[g])
	it.req.lvl = grind_req(it)
	it.runes = []
	it.erase("req0")
	it.erase("name0")
	if (it.get("up", 0)) > 0:
		up_name(it)
	if Game.eq.values().has(it):
		Game._gear()
	return {"rs": rs, "rw": rw}

## what carries runes, worn first: [[item, where]]
static func grind_list() -> Array:
	var out := []
	for k in Game.eq:
		var it = Game.eq[k]
		if it and it.get("runes", []).size():
			out.append([it, "angelegt"])
	for it in Game.inv:
		if it.get("runes", []).size():
			out.append([it, "Inventar"])
	return out

# ---------- slates and the smith's upgrades ----------

static func slate(k: String) -> Dictionary:
	return {"b": "Slate:" + k, "slot": "slate", "slate": k, "cls": "slate", "rar": "rune" if k == "e" else "normal", "name": SLATE[k].n, "ilvl": 1, "mods": {}, "req": {"lvl": 1, "str": 0, "dex": 0}}

static func can_forge(it) -> bool:
	return it is Dictionary and not it.slot in ["potion", "rune", "slate", "junk"] and (it.has("dmg") or it.get("def", 0) > 0 or it.get("block", 0) > 0)

## glut, grave slate and ember slate for the next step (forgeCost)
static func forge_cost(it: Dictionary) -> Dictionary:
	var n: int = it.get("up", 0)
	return {"gl": roundi((40 + it.ilvl * 7) * pow(n + 1, 1.75)), "g": n + 1 if n < 5 else 3, "e": 0 if n < 5 else n - 4}

static func up_name(it: Dictionary) -> void:
	var re := RegEx.create_from_string(" \\+\\d+$")
	it.name = re.sub(it.name, "") + " +%d" % it.up

## worn first, then the bag (forgeItems)
static func forge_items() -> Array:
	var eq := Game.eq.values().filter(func(x): return can_forge(x))
	return eq + Game.inv.filter(func(x): return can_forge(x) and not eq.has(x))

## the stat the anvil shows (statOf)
static func stat_of(it: Dictionary) -> String:
	if it.has("dmg"):
		var d := Items.dmg(it)
		return "%d–%d Schaden" % d
	return "%d Verteidigung" % Items.defense(it)

## pay and raise by one (forgeImpact); false with what is missing in why
static func can_pay(it: Dictionary) -> String:
	var c := forge_cost(it)
	if Game.glut < c.gl:
		return "gl:%d" % (c.gl - Game.glut)
	if Game.slate_g < c.g:
		return "g:%d" % (c.g - Game.slate_g)
	if Game.slate_e < c.e:
		return "e:%d" % (c.e - Game.slate_e)
	return ""

static func forge(it: Dictionary) -> void:
	var c := forge_cost(it)
	Game.glut -= c.gl
	Game.slate_g -= c.g
	Game.slate_e -= c.e
	it.up = it.get("up", 0) + 1
	up_name(it)
	Game._gear()

# ---------- pictures ----------

static func icon(k: String) -> Texture2D:
	var i: Dictionary = Data.icons.get(k, {})
	return Data.tex("icons/" + i.file) if i.has("file") else null

static func sock_pic(k: String) -> Texture2D:
	var i: Dictionary = Data.icons.get("Rune:" + k, {})
	return Data.tex("icons/sock_" + i.file) if i.has("file") else null

static func big_pic(it: Dictionary) -> Texture2D:
	return Items.ground_pic(it)

## the sockets drawn into the icon: dark holes, the set runes sitting in them (drawSocks); r is the item's rect
static func draw_socks(ci: CanvasItem, it: Dictionary, r: Rect2, cell: float) -> void:
	var n: int = it.get("soc", 0)
	if n <= 0:
		return
	var rs: Array = it.get("runes", [])
	var W2 := r.size.x
	var H2 := r.size.y
	var cols := 2 if W2 >= 2 * cell - .5 and n == 4 else 1
	var rows := ceili(n / float(cols))
	var rad := maxf(cell / 6.0, minf(cell * .34, H2 / rows * .36))
	for i in n:
		var c := i % 2 if cols == 2 else 0
		var ro := i >> 1 if cols == 2 else i
		var x := r.position.x + (W2 * (c * .5 + .25) if cols == 2 else W2 / 2)
		var y := r.position.y + H2 * (ro + .5) / rows
		ci.draw_circle(Vector2(x, y), rad, Color("#050403"))
		ci.draw_arc(Vector2(x, y), rad - .5, 2.4, 5.6, 10, Color("#7a6c5a"), 1)
		ci.draw_arc(Vector2(x, y), rad - .5, 5.6, 8.7, 10, Color("#1a1612"), 1)
		if i < rs.size():
			var t := sock_pic(rs[i])
			if t:
				var s := roundf(rad * 2 - 2)
				ci.draw_texture_rect(t, Rect2(Vector2(x, y) - Vector2(s, s) / 2, Vector2(s, s)), false)

# ---------- tooltip lines ----------

## a rune's tooltip (runeTip)
static func rune_tip(it: Dictionary, act := "") -> Array:
	var r := by(it.rune)
	var grey := Color("#a39b88")
	var L := [[it.name, COL], ["Rune · %d. von %d" % [idx(r.k) + 1, RUNES.size()], grey],
		["Benötigt Stufe %d" % r.l, Ui.PAPER if Game.lvl >= r.l else Ui.BAD],
		["In Waffen", grey, "small"], [txt(r.w), Color("#7aa4ff")],
		["In Helmen, Rüstungen, Schilden", grey, "small"], [txt(r.a), Color("#7aa4ff")],
		["Wert: %d Glut" % Items.value(it), grey]]
	L.append([act if act and act != "equipped" else "Klick: aufnehmen, dann auf einen Sockel legen", grey, "small"])
	return L

static func slate_tip(it: Dictionary) -> Array:
	var s: Dictionary = SLATE[it.slate]
	return [[it.name, s.col], ["Schmiedewährung", Color("#a39b88")], [s.d, Color("#a39b88"), "small"], ["Brannoc auf dem Hügel schmiedet damit.", Color("#a39b88"), "small"]]

## the socket lines under an item's mods (sockHTML)
static func sock_lines(it: Dictionary) -> Array:
	var L := []
	var n: int = it.get("soc", 0)
	if n <= 0:
		return L
	var rs: Array = it.get("runes", [])
	var names := []
	for i in n:
		names.append(by(rs[i]).n if i < rs.size() else "○")
	L.append(["Sockel: " + " · ".join(names), COL])
	L.append(["Gesockelt (%d)%s" % [n, " · %d frei" % (n - rs.size()) if rs.size() < n else ""], Color("#a39b88")])
	if it.has("rw"):
		var w := ""
		for k in rs:
			w += by(k).n
		L.append(["„%s“" % w, COL])
	elif it.rar == "normal" and rs.size() < n:
		L.append(["Gewöhnlich: die richtigen Runen in der richtigen Reihenfolge ergeben ein Runenwort.", Color("#a39b88"), "small"])
	if Game.hand and Game.hand.slot == "rune" and can_sock(it):
		L.append(["Klick: %s einsetzen" % Game.hand.name, Color("#8fe36a"), "small"])
	return L
