class_name Talents
## The talent path (920-talent-tree-path.js, 340-talent-tree.js): every class climbs its own tree upwards. A trunk
## winds up from the class root in four tiers of five steps, each closed by a milestone; on steps 2 and 4 of a tier
## short twigs reach out left and right to the class's two themes and end in a notable, once per tier a fork carries
## the wanderer's gifts (bag rows, flasks, stacks); two keystones crown it. Higher tiers cost more points.
## One point per level, more for beacons, lords and bosses (Game.tbonus). Built here line for line, so ids, places,
## values and costs are those of the browser.

const TRING := ["Grundlagen", "Fortgeschritten", "Meisterschaft", "Legende"]
const TCOST := [1, 2, 3, 4]
const TKEYC := 5
const TMUL := [1.0, 1.8, 2.6, 3.4]
const TMOD := {"str": " Stärke", "dex": " Geschick", "vit": " Vitalität", "ene": " Energie", "ed": "% Waffenschaden", "ias": "% Angriffstempo",
	"crit": "% kritische Trefferchance", "ls": "% Lebensraub", "lok": " Leben pro Tötung", "mok": " Mana pro Tötung", "poison": " Giftschaden",
	"fire": " Feuerschaden", "cold": " Kälteschaden", "light": " Blitzschaden", "spell": "% Zauberschaden", "mana": " Mana", "mregen": " Manaregeneration",
	"regen": " Lebensregeneration", "life": " Leben", "lifeP": "% maximales Leben", "manaP": "% maximales Mana", "tdef": "% Verteidigung",
	"res": "% alle Widerstände", "block": "% Blockchance", "thorns": " Dornenschaden", "dmgred": " Schadensreduktion", "frw": "% Lauftempo",
	"stam": " Ausdauer", "glutf": "% mehr Glut", "mf": "% magische Funde", "xp": "% Erfahrung", "cdr": "% schnellere Abklingzeiten",
	"mcost": "% weniger Manakosten", "potPow": "% stärkere Tränke", "flask": " Flakon-Ladung", "flaskH": "% Flakon-Heilung",
	"potStack": " Tränke pro Stapel", "invRows": " Inventarreihe", "shopDisc": "% Rabatt bei Händlern", "sellB": "% mehr Verkaufserlös"}

const TB8 := [
	{"id": "kr", "n": "Krieger", "col": "#d0583a", "cls": "krieger", "C": [{"ed": 4}, {"str": 4}, {"ias": 2}],
		"A": {"n": "Schlächter", "m": [{"ed": 5}, {"crit": 1}], "x": {"ls": 1}, "names": ["Fleischhauer", "Schlachtruf", "Klingenrausch", "Knochenbrecher", "Blutbad", "Schlächtermeister", "Henkerstreich", "Endloses Gemetzel"]},
		"B": {"n": "Sturmbrecher", "m": [{"ias": 3}, {"str": 4}], "x": {"stam": 15}, "names": ["Sturmlauf", "Ansturm", "Eiserne Faust", "Donnerschritt", "Unaufhaltsam", "Brecher der Mauern", "Kriegsherr", "Titanenschritt"]},
		"M": [["Erste Narben", {"life": 20, "ed": 8}], ["Veteran", {"life": 35, "ed": 12, "str": 8}], ["Kriegsmeister", {"ed": 18, "ias": 8, "life": 50}], ["Legende des Schlachtfelds", {"ed": 25, "str": 15, "lifeP": 8}]],
		"K": [["Berserker", {"ed": 45, "ias": 15, "tdef": -35}], ["Unbeugsam", {"lifeP": 25, "dmgred": 8, "ias": -10}]]},
	{"id": "bp", "n": "Blutpfad", "col": "#b0303e", "C": [{"ls": 1}, {"lok": 2}, {"regen": 1}],
		"A": {"n": "Aderlass", "m": [{"ls": 1}, {"ed": 4}], "x": {"lok": 4}, "names": ["Erster Biss", "Blutdurst", "Rote Ernte", "Aderlass", "Vampirhunger", "Blutrausch", "Lebensdieb", "Ewiger Hunger"]},
		"B": {"n": "Lebenskraft", "m": [{"regen": 1}, {"lifeP": 1}], "x": {"life": 15}, "names": ["Zähes Blut", "Heilendes Fleisch", "Starkes Herz", "Lebensquell", "Unverwüstlich", "Zweites Herz", "Phönixblut", "Ewiges Leben"]},
		"M": [["Blutzoll", {"ls": 2, "lok": 6}], ["Blutsbande", {"lifeP": 6, "regen": 3, "ls": 2}], ["Blutfürst", {"ls": 3, "lok": 12, "lifeP": 8}], ["Herr des Blutes", {"ls": 4, "lifeP": 12, "regen": 6}]],
		"K": [["Blutopfer", {"ls": 6, "lok": 25, "lifeP": -15}], ["Unsterblicher Wille", {"lifeP": 30, "regen": 10, "ls": -3}]]},
	{"id": "ja", "n": "Jägerin", "col": "#7ab04a", "cls": "jaegerin", "C": [{"dex": 4}, {"crit": 1}, {"ias": 2}],
		"A": {"n": "Klingentanz", "m": [{"ias": 3}, {"dex": 4}], "x": {"frw": 3}, "names": ["Flinke Hand", "Wirbelschritt", "Doppelschnitt", "Schattenfuß", "Tanz der Klingen", "Messerwind", "Tausend Schnitte", "Klingensturm"]},
		"B": {"n": "Meuchlerin", "m": [{"crit": 1}, {"poison": 3}], "x": {"ls": 1}, "names": ["Scharfes Auge", "Giftzahn", "Kehlschnitt", "Lautloser Tod", "Nachtmahr", "Witwenkuss", "Todesstoß", "Herz der Nacht"]},
		"M": [["Lehrling der Schatten", {"dex": 10, "crit": 3}], ["Klingenschwester", {"ias": 8, "dex": 12, "frw": 5}], ["Schattenmeisterin", {"crit": 6, "ias": 10, "dex": 15}], ["Königin der Nacht", {"crit": 10, "dex": 25, "frw": 10}]],
		"K": [["Assassine", {"crit": 18, "ed": 20, "lifeP": -15}], ["Phantom", {"frw": 25, "ias": 20, "tdef": -30}]]},
	{"id": "wa", "n": "Wanderer", "col": "#e3c04b", "C": [{"frw": 2}, {"glutf": 4}, {"xp": 2}],
		"A": {"n": "Schatzsucher", "m": [{"mf": 5}, {"glutf": 4}], "x": {"sellB": 5}, "names": ["Glückspilz", "Goldnase", "Tiefe Säcke", "Schatzsucher", "Fortunas Liebling", "Drachenhort", "Königsbeute", "Glückskind"]},
		"B": {"n": "Reisender", "m": [{"frw": 2}, {"stam": 8}], "x": {"xp": 3}, "names": ["Leichter Schritt", "Packesel", "Langer Atem", "Wegkundig", "Weltenbummler", "Sternenkarte", "Windläufer", "Pfadfinder"]},
		"M": [["Erste Reise", {"invRows": 1, "frw": 4}], ["Feilscher", {"shopDisc": 10, "sellB": 15, "mf": 10}], ["Tiefe Taschen", {"invRows": 1, "mf": 15}], ["Weltenwanderer", {"invRows": 1, "xp": 12, "frw": 10}]],
		"K": [["Glücksritter", {"mf": 60, "glutf": 40, "lifeP": -10}], ["Ewiger Reisender", {"frw": 25, "stam": 60, "xp": 15, "ed": -10}]]},
	{"id": "al", "n": "Alchemist", "col": "#e8903a", "cls": "alchemist", "C": [{"potPow": 5}, {"regen": 1}, {"poison": 3}],
		"A": {"n": "Phiolenwerfer", "m": [{"potPow": 5}, {"poison": 3}], "x": {"cdr": 2}, "names": ["Glasbläser", "Säurespritzer", "Brandmischung", "Frostkolben", "Seuchenhauch", "Kesselmeister", "Große Mischung", "Feuer im Glas"]},
		"B": {"n": "Trankkunde", "m": [{"flaskH": 4}, {"regen": 1}], "x": {"mregen": 1}, "names": ["Kräuterkunde", "Heiltrank", "Zweiter Schluck", "Elixierkenner", "Lebenswasser", "Allheilmittel", "Ewiger Trank", "Stein der Weisen"]},
		"M": [["Lehrling des Kessels", {"potPow": 10, "potStack": 2}], ["Trankgürtel", {"flask": 1, "flaskH": 10}], ["Meister der Elixiere", {"potPow": 25, "potStack": 2, "regen": 3}], ["Großmeister der Mixturen", {"flask": 1, "potPow": 30, "res": 10}]],
		"K": [["Glasbrecher", {"potPow": 60, "cdr": 10, "lifeP": -15}], ["Unsterbliche Mixtur", {"flaskH": 50, "regen": 8, "potPow": -20}]]},
	{"id": "el", "n": "Elemente", "col": "#3ac0c8", "C": [{"fire": 3}, {"cold": 3}, {"light": 3}],
		"A": {"n": "Glut und Blitz", "m": [{"fire": 3}, {"light": 3}], "x": {"spell": 3}, "names": ["Funke", "Glutatem", "Blitzschlag", "Flammenzunge", "Gewitterherz", "Höllenfeuer", "Donnergott", "Sonnenkern"]},
		"B": {"n": "Frost und Gift", "m": [{"cold": 3}, {"poison": 3}], "x": {"res": 3}, "names": ["Raureif", "Giftranke", "Eiszapfen", "Sumpfatem", "Gletscherherz", "Pestwind", "Ewiges Eis", "Seuchenkönig"]},
		"M": [["Elementarschüler", {"res": 8, "fire": 5, "cold": 5, "light": 5}], ["Sturmbinder", {"light": 12, "res": 10}], ["Herz der Elemente", {"fire": 12, "cold": 12, "res": 12}], ["Elementarfürst", {"fire": 15, "cold": 15, "light": 15, "poison": 15, "res": 15}]],
		"K": [["Elementarbrand", {"fire": 40, "cold": 40, "light": 40, "poison": 40, "ed": -20}], ["Elementarhaut", {"res": 35, "life": 60, "spell": -15}]]},
	{"id": "ma", "n": "Magier", "col": "#5a8ae8", "cls": "magier", "C": [{"spell": 5}, {"ene": 4}, {"mana": 8}],
		"A": {"n": "Zerstörer", "m": [{"spell": 6}, {"crit": 1}], "x": {"cdr": 2}, "names": ["Funkenflug", "Glutherz", "Feuersturm", "Aschenregen", "Weltenbrand", "Sternenfall", "Zorn der Sonne", "Letzter Funke"]},
		"B": {"n": "Arkanist", "m": [{"mregen": 1}, {"mcost": 2}], "x": {"manaP": 3}, "names": ["Klarer Geist", "Manaquell", "Runenleser", "Tiefer Brunnen", "Arkane Flut", "Gedankenschnelle", "Ewiger Quell", "Allwissen"]},
		"M": [["Funkenträger", {"spell": 10, "mana": 20}], ["Runenkundiger", {"spell": 15, "mregen": 3, "cdr": 4}], ["Erzmagier", {"spell": 20, "manaP": 10, "mcost": 5}], ["Herr der Asche", {"spell": 30, "cdr": 8, "ene": 15}]],
		"K": [["Glaskanone", {"spell": 60, "lifeP": -20}], ["Ewige Quelle", {"manaP": 40, "mregen": 10, "mcost": 15, "spell": -15}]]},
	{"id": "wc", "n": "Wächter", "col": "#b8b0a0", "C": [{"vit": 4}, {"life": 10}, {"tdef": 6}],
		"A": {"n": "Bollwerk", "m": [{"tdef": 6}, {"block": 1}], "x": {"dmgred": 1}, "names": ["Schildwall", "Eichenhaut", "Bollwerk", "Steinwacht", "Torhüter", "Festungsgeist", "Mauer aus Eisen", "Ewige Wacht"]},
		"B": {"n": "Eisenhaut", "m": [{"res": 3}, {"life": 8}], "x": {"thorns": 6}, "names": ["Dornenpanzer", "Feuerfest", "Sturmfest", "Zähe Natur", "Unberührbar", "Dornenkrone", "Elementarschild", "Schwur des Wächters"]},
		"M": [["Wachposten", {"life": 30, "tdef": 15}], ["Schildbruder", {"res": 8, "block": 4, "life": 40}], ["Bastion", {"dmgred": 4, "lifeP": 8, "tdef": 25}], ["Unerschütterlich", {"dmgred": 8, "lifeP": 15, "res": 10}]],
		"K": [["Lebende Festung", {"dmgred": 12, "lifeP": 25, "frw": -15, "ias": -8}], ["Dornenherz", {"thorns": 120, "res": 15, "ed": -15}]]}]
const TCLS := {"krieger": "kr", "jaegerin": "ja", "alchemist": "al", "magier": "ma"}
const TGEN := {"krieger": "wc", "jaegerin": "wa", "alchemist": "bp", "magier": "el"}
const TUTIL := [["Tiefe Taschen", {"invRows": 1, "glutf": 10}], ["Trankgürtel", {"flask": 1, "flaskH": 10}], ["Trankstapel", {"potStack": 2, "shopDisc": 10}], ["Weltentasche", {"invRows": 1, "mf": 20}]]
const D := 90
const STEPS := 5
const TIER := 6

static var TREE := {}
static var EDGE: Array = []      # [a, b, cls]

static func ty(t: int, s: int) -> float:
	return -(t * TIER + s + 1) * D

static func tx(t: int, s: int) -> float:
	return float(_jround(sin((t * TIER + s) * .9) * 28))

static func top() -> float:
	return ty(3, STEPS) - 170

## JS Math.round for halves (towards +∞), so negative halves round like the browser
static func _jround(v: float) -> int:
	return int(floor(v + .5))

static func _scale(m: Dictionary, f: float) -> Dictionary:
	var o := {}
	for k in m:
		var v: float = m[k] * f
		o[k] = _jround(v) if v < 0 else maxi(1, _jround(v))
	return o

static func _merge(ms: Array) -> Dictionary:
	var o := {}
	for m in ms:
		for k in m:
			o[k] = o.get(k, 0) + m[k]
	return o

static func _b(id: String) -> Dictionary:
	for b in TB8:
		if b.id == id:
			return b
	return {}

static func build() -> void:
	if not TREE.is_empty():
		return
	var add := func(id: String, x: float, y: float, o: Dictionary) -> void:
		var n := o.duplicate()
		n.id = id
		n.x = x
		n.y = y
		n.adj = []
		TREE[id] = n
	var link := func(a: String, b: String) -> void:
		TREE[a].adj.append(b)
		TREE[b].adj.append(a)
		EDGE.append([a, b, TREE[a].cls])
	for cls in TCLS:
		var b := _b(TCLS[cls])
		var g := _b(TGEN[cls])
		var sk: Array = Data.classes[cls].skills if Data.classes.has(cls) else []
		add.call(b.id + "s0", 0, 0, {"cls": cls, "col": b.col, "k": "root", "n": b.n, "m": _scale(b.C[0], 2), "c": 0, "t": -1})
		var gate: String = b.id + "s0"
		for t in 4:
			var f: float = TMUL[t]
			var c: int = TCOST[t]
			var prev := gate
			for s in STEPS:
				var id: String = b.id + "t%d" % t + "c%d" % s
				var x0 := tx(t, s)
				var y0 := ty(t, s)
				add.call(id, x0, y0, {"cls": cls, "col": b.col, "k": "small", "m": _scale(b.C[(s + t) % 3], f), "c": c, "t": t})
				link.call(prev, id)
				prev = id
				if s != 1 and s != 3:
					continue
				var hi := 1 if s == 3 else 0
				for side in [-1, 1]:
					var T: Dictionary = b.A if side < 0 else b.B
					var sd := "L" if side < 0 else "R"
					var tcol := "#d8a860" if side < 0 else "#7fa8d8"
					var p := id
					for j in 3:
						var tw: String = b.id + "t%d" % t + sd + str(hi) + "n%d" % j
						var x: float = x0 + side * (95 + j * 85)
						var y: float = y0 - 20 - j * 32
						if j < 2:
							add.call(tw, x, y, {"cls": cls, "col": tcol, "k": "small", "m": _scale(T.m[j], f), "c": c, "t": t, "th": T.n})
						else:
							var mm := _merge(T.m + T.m + [T.x]) if hi else _merge(T.m)
							add.call(tw, x, y, {"cls": cls, "col": b.col, "k": "not", "n": T.names[t * 2 + hi], "th": T.n, "m": _scale(mm, f * (2.6 if hi else 2.2)), "c": c, "t": t})
						link.call(p, tw)
						p = tw
					if hi and side == (1 if t % 2 else -1):
						var j1: Dictionary = TREE[b.id + "t%d" % t + sd + "1n1"]
						var u0: String = b.id + "t%du0" % t
						var u1: String = b.id + "t%du1" % t
						add.call(u0, j1.x + side * 25, j1.y - 80, {"cls": cls, "col": "#e3c04b", "k": "small", "m": _scale(g.C[t % 3], f), "c": c, "t": t, "th": g.n})
						add.call(u1, j1.x + side * 50, j1.y - 160, {"cls": cls, "col": "#e3c04b", "k": "not", "n": TUTIL[t][0], "th": g.n, "m": (TUTIL[t][1] as Dictionary).duplicate(), "c": c, "t": t})
						link.call(j1.id, u0)
						link.call(u0, u1)
			var mi: String = b.id + "M%d" % t
			var m: Dictionary = (b.M[t][1] as Dictionary).duplicate()
			if t < sk.size():
				m["sk_" + sk[t]] = 1
			add.call(mi, 0, ty(t, STEPS), {"cls": cls, "col": b.col, "k": "mile", "n": b.M[t][0], "ring": t, "m": m, "c": c, "t": t})
			link.call(prev, mi)
			gate = mi
		for ki in 2:
			var kd: Array = b.K[ki]
			var m: Dictionary = (kd[1] as Dictionary).duplicate()
			if 4 + ki < sk.size():
				m["sk_" + sk[4 + ki]] = 1
			var id: String = b.id + "K%d" % ki
			add.call(id, (1 if ki else -1) * 150, top(), {"cls": cls, "col": b.col, "k": "key", "n": kd[0], "m": m, "c": TKEYC, "t": 4})
			link.call(gate, id)

# ---------- the hero's tree (tHas, tCost, tSpent, tPts, tCan) ----------

static func start() -> String:
	return TCLS.get(Game.cls, "") + "s0" if TCLS.has(Game.cls) else ""

static func has(id: String) -> bool:
	return id == start() or Game.tree.has(id)

static func spent() -> int:
	var n := 0
	for id in Game.tree:
		if TREE.has(id):
			n += TREE[id].c
	return n

static func points() -> int:
	return maxi(0, Game.lvl - 1 + Game.tbonus - spent())

static func can(id: String) -> bool:
	if not TREE.has(id):
		return false
	var n: Dictionary = TREE[id]
	if n.cls != Game.cls or has(id) or points() < n.c:
		return false
	for a in n.adj:
		if has(a):
			return true
	return false

static func miles() -> int:
	return Game.tree.filter(func(id): return TREE.has(id) and TREE[id].k == "mile").size()

static func reset_cost() -> int:
	return 25 * Game.lvl

## the sum of every talent held, for recalc
static func mods() -> Dictionary:
	build()
	var m := {}
	for id in Game.tree + [start()]:
		if TREE.has(id):
			for k in TREE[id].m:
				m[k] = m.get(k, 0) + TREE[id].m[k]
	return m

static func mod_text(k: String, v) -> String:
	if k.begins_with("sk_"):
		return "+%d auf %s" % [v, Game.sk_name(k.substr(3))]
	return ("+" if v > 0 else "") + str(v) + TMOD.get(k, " " + k)

static func learn(id: String) -> void:
	if not can(id):
		return
	var n: Dictionary = TREE[id]
	var hpf: float = Game.hp / Game.d.life
	Game.tree.append(id)
	Game.recalc()
	if n.m.has("flask"):
		Game.flasks += n.m.flask
	if n.m.has("lifeP"):
		Game.hp = roundf(hpf * Game.d.life)
	if n.m.has("potStack"):
		Items.stack_potions()
	if n.k in ["not", "key", "mile"]:
		var sub := "Großes Talent erlernt"
		if n.k == "key":
			sub = "Schlussstein erlernt"
		elif n.k == "mile":
			sub = "Meilenstein %d/4 · " % miles() + ("„%s“ öffnet sich, %d Punkte je Talent" % [TRING[n.ring + 1], TCOST[n.ring + 1]] if n.ring < 3 else "die Schlusssteine öffnen sich")
		Game.banner.emit(String(n.n).to_upper(), sub, "boss" if n.k == "mile" else "")

## clearing the tree: stacked potions split, items out of vanished rows move, no more flasks than fit (treeClear)
static func clear() -> void:
	Game.tree = []
	Game.recalc()
	for it in Game.inv.duplicate():
		if it.slot == "potion" and it.get("n", 1) > 1:
			var extra: int = it.n - 1
			it.n = 1
			for k in extra:
				var q: Dictionary = it.duplicate(true)
				q.n = 1
				if not Items.inv_add(q):
					Game.drop_item.emit(q)
	for it in Game.inv.duplicate():
		if it.gy + Items.size(it).y > Items.IH:
			Game.inv.erase(it)
			if not Items.inv_add(it):
				Game.drop_item.emit(it)
	Game.recalc()
	Game.flasks = mini(Game.flasks, Game.fmax())

static func reset() -> void:
	if Game.tree.is_empty():
		return
	var c := reset_cost()
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut zum Zurücksetzen.", Color("#ff5a4a"))
		return
	Game.glut -= c
	clear()
	Game.log_msg("Der Talentbaum ist zurückgesetzt.", Color("#e8c878"))
