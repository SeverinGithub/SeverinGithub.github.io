extends Node
## Game state shared by every scene, as G and P in the browser game (050-state.js, 070-player-stats.js).
## Reached everywhere as the autoload `Game`. The level (scripts/level.gd) runs the world, this holds what outlives a floor.

signal floor_changed(f: int)
signal message(text: String, col: Color)
signal banner(title: String, sub: String, kind: String)

# ---------- settings (CFG in 440-menus.js), kept in user://settings.cfg ----------
var cfg := {"music": 70, "sfx": 80, "voice": 80, "mute": false, "shake": true, "hitstop": true, "numbers": true}

func _ready() -> void:
	var c := ConfigFile.new()
	if c.load("user://settings.cfg") == OK:
		for k in cfg:
			cfg[k] = c.get_value("cfg", k, cfg[k])

func save_cfg() -> void:
	var c := ConfigFile.new()
	for k in cfg:
		c.set_value("cfg", k, cfg[k])
	c.save("user://settings.cfg")

var in_play := false             # a hero plays (not the title)
var ow_at = null                 # where to stand when the sky is entered next (travel, a save)

# ---------- G ----------
var seed_value := 1
var floor_no := 1
var max_floor := 0
var respawn_floor := 1
var mlvl := 1                    # monster level of the current floor
var lit := {}                    # floor → bonfire lit
var boss_dead := {}
var boss_seen := {}
var ow_fires := {}               # bonfires lit in the sky: chunk key → {x, y, name}
var ow_clear := {}               # chunks whose foes are slain, until the next rest
var ow_boss := {}                # island lords slain: id → 1
var ow_seen := {}                # sky chunks walked on, beyond the hill: "cx,cy" → 1 (G.owSeen)
var ow_respawn = null            # the sky's bonfire you rested at last: {x, y}
var place := ""                  # where in the sky the hero stands (floorName)
var hero_at := Vector2.ZERO      # where the hero stands, for pictures that fade when he walks behind them
var t := 0.0

# ---------- P ----------
var cls := "krieger"
var stats := {"str": 15, "dex": 15, "vit": 15, "ene": 10}
var lvl := 1
var xp := 0
var pts := 0
var spts := 1
var glut := 0
var maps := {}                   # floor → its map, kept while you play (G.maps)
var no_traps := false            # test: no spike plates and fire spouts, so floors can be compared with the browser
var tw := {"done": {}, "lift": {}, "crypt": {}, "seen": {}, "br": {}}   # solved rooms, unlocked lifts, plundered crypts, sights found, bridges raised (twS in 984)
var crypt = null                 # the crypt you are in (G.maps.crypt), floor -1; gone when you leave it
var crypt_name := ""
var crypt_lvl := 1
var bless_t := 0.0               # the blood altar's blessing: +30 % damage while it lasts
var slate_g := 0                 # grave slate and ember slate for Brannoc's forge (P.slateG, P.slateE)
var slate_e := 0
var smith_met := 0               # Brannoc has said who he is
var smith_hit := 0.0             # the anvil glows a moment after the forge window strikes (G.smithHit)
var keys := 0                    # chest keys for the locked chests (770-chests.js)
var eq := {}                     # slot → item {b, slot, cls, dmg, speed, def, block, mods, req}; rings in ring1 and ring2
var inv: Array = []              # items in the bag, each with its cell gx, gy (see Items)
var stash: Array = []            # the bottomless chest on the hill, ten columns wide (Stash)
var tree: Array = []             # talents learnt (Talents), the class root is free
var tbonus := 0                  # talent points beyond one per level: beacons, lords, bosses
var qi := 0                      # the chronicle: index of the active quest (P.qi)
var qb := 0                      # its counter when it began (P.qb)
var qc := {}                     # counters: kill, k_<kind>, buy, sell, chest (P.qc)
var found := {}                  # the collection: base names, "u:<unique>" (discover in 260-ui.js)
var hand = null                  # the item held on the mouse
var slv := [1, 0, 0, 0, 0, 0]    # skill levels per slot 1–6: a point stays with its slot, whichever skill fills it (640-weapon-arts.js)
var sel := 0                     # the slot right click repeats
signal gear_changed
signal drop_item(it)             # the level lays it at the hero's feet
var hp := 1.0
var mp := 1.0
var st := 1.0
var flask_max := 3
var flasks := 3
var flask_pow := 0
var d := {}                      # derived values, see recalc()

const CBON := {
	"krieger": {"life": 1.25, "mana": .7},
	"jaegerin": {"aspd": 1.15, "frw": 10, "crit": 5},
	"magier": {"life": .85, "mana": 1.3},
	"alchemist": {"potPow": 40, "flaskH": 15},
}

static func xp_next(l: int) -> int:
	return int(floor(80 * pow(l, 1.75)))

## the door leads to the deepest floor whose bonfire is lit (topFloor in 180-interaction.js)
func top_floor() -> int:
	var f := 1
	for k in lit:
		if lit[k] and int(k) > f:
			f = int(k)
	return f

func start_new(c: String) -> void:
	seed_value = randi() % 1000000000
	lit = {}
	boss_dead = {}
	boss_seen = {}
	ow_fires = {}
	ow_clear = {}
	ow_boss = {}
	ow_seen = {}
	ow_respawn = null
	max_floor = 0
	respawn_floor = 1
	cls = c
	var C: Dictionary = Data.classes.get(c, Data.classes.krieger)
	stats = C.stats.duplicate()
	lvl = 1
	xp = 0
	pts = 0
	spts = 1
	glut = 0
	keys = 0
	slate_g = 0
	slate_e = 0
	smith_met = 0
	maps = {}
	tw = {"done": {}, "lift": {}, "crypt": {}, "seen": {}, "br": {}}
	crypt = null
	bless_t = 0.0
	eq = {"weapon": start_weapon(C.wc), "armor": item_of("Lederwams")}
	inv = []
	stash = []
	tree = []
	qi = 0
	qb = 0
	qc = {}
	tbonus = 0
	found = {}
	hand = null
	slv = [1, 0, 0, 0, 0, 0]
	sel = 0
	flask_max = 3
	flasks = 3
	recalc()
	hp = d.life
	mp = d.mana
	st = d.stam
	for k in ["life", "life", "mana"]:
		Items.inv_add(Items.potion(k, 1))

## the class's first weapon (startWeapon in 040-classes.js)
func start_weapon(wc: String) -> Dictionary:
	var best := {}
	for b in Data.items.values():
		if b.slot == "weapon" and b.get("cls") == wc and (best.is_empty() or b.lvl < best.lvl):
			best = b
	var it := item_of(best.n)
	if it.cls == "staff":
		it.mods["spell"] = 10 + best.lvl * 2
	return it

## a plain item of a base, no affixes yet
func item_of(base_name: String) -> Dictionary:
	var b: Dictionary = Data.items[base_name]
	var it := {"b": b.n, "name": b.n, "slot": b.slot, "cls": b.get("cls", ""), "rar": "normal", "ilvl": 1, "mods": {}, "req": {"lvl": 1, "str": 0, "dex": 0}}
	for k in ["dmg", "speed", "twoH", "def", "block"]:
		if b.has(k):
			it[k] = b[k].duplicate() if b[k] is Array else b[k]
	return it

func recalc() -> void:
	var m := {}
	for it in eq.values():
		for k in it.mods:
			m[k] = m.get(k, 0) + it.mods[k]
	var tm := Talents.mods()
	for k in tm:
		m[k] = m.get(k, 0) + tm[k]
	var s := {}
	for k in ["str", "dex", "vit", "ene"]:
		s[k] = stats[k] + m.get(k, 0)
	var w = eq.get("weapon")
	var sh = eq.get("offhand")
	var base: Array = w.dmg if w else [1, 3]
	var mult: float = 1 + m.get("ed", 0) / 100.0 + s.str * .008 + s.dex * .004
	var def: float = s.dex * .25
	for it in eq.values():
		def += Items.defense(it)
	def *= maxf(.1, 1 + m.get("tdef", 0) / 100.0)
	var wc: String = w.cls if w else "fist"
	d = {
		"s": s, "m": m,
		"life": roundi((40 + s.vit * 4 + lvl * 5 + m.get("life", 0)) * (1 + m.get("lifeP", 0) / 100.0)),
		"mana": roundi((15 + s.ene * 2 + lvl * 1.5 + m.get("mana", 0)) * (1 + m.get("manaP", 0) / 100.0)),
		"stam": roundi(70 + s.dex * .6 + s.vit * .4 + m.get("stam", 0)),
		"dmin": maxi(1, roundi(base[0] * mult)), "dmax": maxi(2, roundi(base[1] * mult)),
		"ele": m.get("fire", 0) + m.get("cold", 0) + m.get("light", 0) + m.get("poison", 0),
		"flask": m.get("flask", 0), "potStack": 1 + mini(4, m.get("potStack", 0)), "invRows": mini(3, m.get("invRows", 0)),
		"shopDisc": mini(30, m.get("shopDisc", 0)), "sellB": m.get("sellB", 0),
		"aspd": (w.speed if w else 1.5) * (1 + m.get("ias", 0) / 100.0),
		"crit": minf(60, 5 + s.dex * .05 + m.get("crit", 0)),
		"def": roundi(def),
		"block": minf(75, sh.get("block", 0) + s.dex * .05 + m.get("block", 0)) if sh else 0.0,
		"res": minf(75, m.get("res", 0)), "ls": minf(25, m.get("ls", 0)), "frw": minf(60, m.get("frw", 0)),
		"regen": m.get("regen", 0), "mregen": m.get("mregen", 0), "dmgred": m.get("dmgred", 0), "thorns": m.get("thorns", 0),
		"xp": m.get("xp", 0), "glutf": m.get("glutf", 0), "potPow": m.get("potPow", 0), "flaskH": m.get("flaskH", 0),
		"lok": m.get("lok", 0), "mok": m.get("mok", 0), "mf": m.get("mf", 0),
		"spellMul": 1 + s.ene * .02 + m.get("spell", 0) / 100.0, "cdr": minf(40, m.get("cdr", 0)), "mcost": minf(40, m.get("mcost", 0)), "allsk": int(m.get("allsk", 0)),
		"reach": 1.5 if wc == "spear" else (1.25 if wc == "great" else 1.05), "wcls": wc,
	}
	var cb: Dictionary = CBON.get(cls, {})
	if cb.has("life"): d.life = roundi(d.life * cb.life)
	if cb.has("mana"): d.mana = roundi(d.mana * cb.mana)
	if cb.has("aspd"): d.aspd *= cb.aspd
	for k in ["frw", "crit", "potPow", "flaskH"]:
		if cb.has(k): d[k] += cb[k]
	# the smith's steps on the weapon: +8 % damage each, the staff also gains spell power (the recalc wrapper in 450)
	if w and w.get("up", 0):
		var k: float = 1 + w.up * .08
		d.dmin = roundi(d.dmin * k + w.up * .25)
		d.dmax = roundi(d.dmax * k + w.up * .5)
		if w.cls == "staff":
			d.spellMul += w.up * .03
	Items.IH = 5 + d.invRows
	hp = minf(hp, d.life)
	mp = minf(mp, d.mana)
	st = minf(st, d.stam)

## a new find goes into the collection, with a word in the log (discover in 260-ui.js)
func discover(it) -> void:
	if it == null or it.slot in ["potion", "junk", "slate"]:
		return
	if it.slot == "rune":
		Runes.discover(it)
		return
	var neu: bool = not found.has(it.b)
	found[it.b] = 1
	if it.rar == "unique":
		var u: String = String(it.name).split(" +")[0]
		if not found.has("u:" + u):
			log_msg("Neu in der Sammlung: " + u, Color("#e8973a"))
		found["u:" + u] = 1
	elif neu:
		log_msg("Neu in der Sammlung: " + it.b, Color("#a39b88"))

## flask charges: bought ones and those of the talents (fMax)
func fmax() -> int:
	return flask_max + int(d.get("flask", 0))

## put on an item from the bag (equip in 260-ui.js); what it replaces goes into the bag, or into the hand
func equip(it: Dictionary) -> bool:
	var slot: String = it.slot
	if slot == "ring":
		slot = "ring1" if not eq.get("ring1") else ("ring2" if not eq.get("ring2") else "ring1")
	return equip_to(it, slot)

func equip_to(it: Dictionary, slot: String) -> bool:
	if not Items.can_use(it):
		log_msg("Anforderungen nicht erfüllt.", Color("#ff5a4a"))
		return false
	var prev = eq.get(slot)
	inv.erase(it)
	eq[slot] = it
	if prev and not Items.inv_add(prev):
		hand = prev
	# a two-handed weapon and a shield do not go together: the other one goes into the bag
	var other := ""
	if slot == "weapon" and it.get("twoH"):
		other = "offhand"
	elif slot == "offhand" and eq.get("weapon") and eq.weapon.get("twoH"):
		other = "weapon"
	if other and eq.get(other):
		var o = eq[other]
		eq.erase(other)
		if not Items.inv_add(o):
			if hand == null:
				hand = o
			else:
				drop_item.emit(o)
	_gear()
	return true

func unequip(slot: String) -> void:
	var it = eq.get(slot)
	if not it:
		return
	if not Items.inv_add(it):
		log_msg("Das Inventar ist voll.", Color("#ff5a4a"))
		return
	eq.erase(slot)
	_gear()

func _gear() -> void:
	recalc()
	gear_changed.emit()

## drink a potion from the bag (usePotion in 170-combat.js); heal runs over time in the level
func use_potion(it: Dictionary) -> float:
	var a := roundi(it.amt * (1 + d.potPow / 100.0))
	var heal := 0.0
	if it.kind == "life":
		heal = a
	else:
		mp = minf(d.mana, mp + a)
	if it.get("n", 1) > 1:
		it.n -= 1
	else:
		inv.erase(it)
	return heal

# ---------- skills (040-classes.js, 640-weapon-arts.js, 070-player-stats.js) ----------

## the weapon set the weapon in hand brings, if the class may wield it: dual, great, hammer, spear or ""
func wset_key() -> String:
	var w = eq.get("weapon")
	if not w or not cls in Data.item_rules.wok.get(w.b, [cls]):
		return ""
	return Data.skill_info.wset.get(w.b, "")

## the six skills in slots 1–6: the class's own, or the weapon set's
func sk_ids() -> Array:
	var k := wset_key()
	return Data.skill_info.sets[k].ids if k != "" else Data.classes[cls].skills

func sk_lvl(i: int) -> int:
	if slv[i] <= 0:
		return 0
	# a milestone or keystone adds to the class skill of its slot
	var cs: Array = Data.classes.get(cls, {}).get("skills", [])
	var tb: int = int(d.m.get("sk_" + cs[i], 0)) if i < cs.size() and d.has("m") else 0
	return slv[i] + d.allsk + tb

## a slot can be learned from the level its class skill asks for
func sk_req(i: int) -> int:
	return int(Data.skill_info.skills[Data.classes[cls].skills[i]].req)

func learn(i: int) -> bool:
	if spts <= 0 or lvl < sk_req(i) or slv[i] >= 20:
		return false
	slv[i] += 1
	spts -= 1
	return true

## the staff's element, for the mage's spells
func m_elem():
	var w = eq.get("weapon")
	if w and w.cls == "staff" and cls in Data.item_rules.wok.get(w.b, [cls]):
		return w.get("elem", "fire")
	return null

func sk_name(id: String) -> String:
	var s: Dictionary = Data.skill_info.skills[id]
	if s.has("byElem"):
		var e = m_elem()
		return s.byElem[e if e else "none"].n
	return s.n

func sk_desc(id: String, l: int) -> String:
	var s: Dictionary = Data.skill_info.skills[id]
	var arr: Array = s.desc
	if s.has("byElem"):
		var e = m_elem()
		arr = s.byElem[e if e else "none"].desc
	return arr[clampi(l, 1, arr.size()) - 1]

func sk_icon(id: String) -> Texture2D:
	var key := id
	if Data.skill_info.skills[id].has("byElem"):
		var e = m_elem()
		key = id + "_" + (e if e else "none")
	var f = Data.skill_info.icons.get(key)
	return Data.tex("skills/" + f) if f else null

func sk_mana(id: String, l: int) -> int:
	var m: Array = Data.skill_info.skills[id].mana
	return maxi(1, roundi(m[mini(l, m.size() - 1)] * (1 - d.mcost / 100.0)))

func gain_xp(x: float) -> void:
	xp += roundi(x * (1 + d.xp / 100.0))
	while xp >= xp_next(lvl):
		xp -= xp_next(lvl)
		lvl += 1
		pts += 5
		spts += 1
		recalc()
		hp = d.life
		mp = d.mana
		banner.emit("Stufe %d" % lvl, "5 Attributpunkte · 1 Fertigkeitspunkt", "")

## the monster level of a tower floor (enterFloor in 150-music.js)
static func mlvl_of(f: int) -> int:
	return 1 if f == 0 else 1 + (f - 1) * 2

func log_msg(text: String, col := Color("#ece4cf")) -> void:
	message.emit(text, col)
