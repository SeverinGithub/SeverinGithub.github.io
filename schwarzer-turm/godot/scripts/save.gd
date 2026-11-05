class_name Save
## Heroes and their saves (790-heroes.js, 280-save.js): every hero keeps a save of their own under user://heroes/,
## a new hero never replaces an old one, and the list remembers who played last. A save holds the whole of G and P
## that outlives a floor, and where the hero stood; the world itself grows again from the seed.

const DIR := "user://heroes"
const INDEX := "user://heroes/index.cfg"
## what of Game goes into a save
const KEEP := ["seed_value", "max_floor", "respawn_floor", "lit", "boss_dead", "boss_seen", "ow_fires", "ow_boss", "ow_seen", "ow_respawn",
	"cls", "stats", "lvl", "xp", "pts", "spts", "glut", "keys", "slate_g", "slate_e", "smith_met", "eq", "inv", "stash", "tree", "tbonus", "found", "qi", "qb", "qc", "slv", "sel", "flask_max", "flasks", "flask_pow", "tw", "rg", "day_t"]

static func _cfg() -> ConfigFile:
	var c := ConfigFile.new()
	c.load(INDEX)
	return c

## every hero: [{id, n, cls, lvl, fl, t}], last played first
static func all() -> Array:
	var c := _cfg()
	var out := []
	for id in c.get_sections():
		if id == "_":
			continue
		var h := {"id": id}
		for k in c.get_section_keys(id):
			h[k] = c.get_value(id, k)
		out.append(h)
	out.sort_custom(func(a, b): return a.get("t", 0) > b.get("t", 0))
	return out

static func current() -> String:
	return _cfg().get_value("_", "cur", "")

static func set_current(id: String) -> void:
	var c := _cfg()
	c.set_value("_", "cur", id)
	c.save(INDEX)

static func find(id: String) -> Dictionary:
	for h in all():
		if h.id == id:
			return h
	return {}

static func cls_name(c: String) -> String:
	return Data.classes.get(c, {"n": "Held"}).n

static func name_of(h: Dictionary) -> String:
	return h.n if h.get("n", "") != "" else cls_name(h.get("cls", ""))

## Krieger · Stufe 4 · tiefste Ebene 3 · 04.11.2026 23:10 (hDesc)
static func desc(h: Dictionary) -> String:
	var s := "%s · Stufe %d · tiefste Ebene %d" % [cls_name(h.get("cls", "")), h.get("lvl", 1), h.get("fl", 0)]
	if h.get("t"):
		var d := Time.get_datetime_dict_from_unix_time(int(h.t) + int(Time.get_time_zone_from_system().bias) * 60)
		s += " · %02d.%02d.%d %02d:%02d" % [d.day, d.month, d.year, d.hour, d.minute]
	return s

static func new_id() -> String:
	return "%x%04x" % [int(Time.get_unix_time_from_system()), randi() % 65536]

## a new hero gets a place of their own before the first step
static func begin_new(cls: String) -> void:
	DirAccess.make_dir_recursive_absolute(DIR)
	var id := new_id()
	var c := _cfg()
	c.set_value(id, "n", "")
	c.set_value(id, "cls", cls)
	c.set_value(id, "lvl", 1)
	c.set_value(id, "fl", 0)
	c.set_value(id, "t", int(Time.get_unix_time_from_system()))
	c.set_value("_", "cur", id)
	c.save(INDEX)

## save the hero who plays now; pos is {f, x, y}
static func write(pos: Dictionary) -> bool:
	var id := current()
	if id == "":
		return false
	DirAccess.make_dir_recursive_absolute(DIR)
	var d := {"pos": pos, "v": 1}
	for k in KEEP:
		d[k] = Game.get(k)
	var f := FileAccess.open("%s/%s.save" % [DIR, id], FileAccess.WRITE)
	if f == null:
		Game.log_msg("Speichern fehlgeschlagen.", BAD_COL)
		return false
	f.store_var(d)
	f.close()
	var c := _cfg()
	c.set_value(id, "cls", Game.cls)
	c.set_value(id, "lvl", Game.lvl)
	c.set_value(id, "fl", Game.max_floor)
	c.set_value(id, "t", int(Time.get_unix_time_from_system()))
	c.save(INDEX)
	return true

const BAD_COL := Color("#ff5a4a")

## the save of a hero, or {} if there is none
static func read(id: String) -> Dictionary:
	var p := "%s/%s.save" % [DIR, id]
	if id == "" or not FileAccess.file_exists(p):
		return {}
	var f := FileAccess.open(p, FileAccess.READ)
	var d = f.get_var()
	return d if d is Dictionary else {}

## put a save back into Game; returns where the hero stood
static func apply(d: Dictionary) -> Dictionary:
	Game.start_new(d.get("cls", "krieger"))
	for k in ["slate_g", "slate_e", "smith_met"]:     # saves from before the forge
		Game.set(k, 0)
	for k in KEEP:
		if d.has(k):
			Game.set(k, d[k])
	Game.maps = {}
	Game.recalc()
	Game.hp = Game.d.life
	Game.mp = Game.d.mana
	Game.st = Game.d.stam
	return d.get("pos", {})

static func rename(id: String, n: String) -> void:
	var c := _cfg()
	if c.has_section(id):
		c.set_value(id, "n", n.strip_edges().left(24))
		c.save(INDEX)

static func delete(id: String) -> void:
	var c := _cfg()
	if c.has_section(id):
		c.erase_section(id)
	DirAccess.remove_absolute("%s/%s.save" % [DIR, id])
	if c.get_value("_", "cur", "") == id:
		var rest: Array = Array(c.get_sections()).filter(func(s): return s != "_")
		rest.sort_custom(func(a, b): return c.get_value(a, "t", 0) > c.get_value(b, "t", 0))
		c.set_value("_", "cur", rest[0] if rest.size() else "")
	c.save(INDEX)
