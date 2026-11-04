extends Node
## All game data, exported from the browser version by tools/godot-export.js (data/*.json).
## Reached everywhere as the autoload `Data`, e.g. Data.items["Gladius"], Data.figures["hero_krieger"].

var items: Dictionary = {}        # every base item, material tiers included (BASE)
var uniques: Array = []           # UNIQ
var unique_looks: Dictionary = {} # PXU: colours of a unique's picture
var monsters: Dictionary = {}     # MON: the monster kinds
var variants: Dictionary = {}     # VAR: every named enemy variant
var bosses: Array = []
var skills: Array = []
var classes: Dictionary = {}
var affixes: Array = []
var mod_text: Dictionary = {}     # "ed": "+{v}% erhöhter Schaden"
var mod_order: Array = []
var palette: Dictionary = {}
var sprites: Dictionary = {}      # "grass/0": {w, h, ax, ay}
var icons: Dictionary = {}        # item name → {file, size}
var figures: Dictionary = {}      # "enemy_skel" → {cell, anchor, dirs, walk, attack, idle}
var loot: Dictionary = {}         # slot weights and codes, rarity colours, junk kinds and families (tools/godot-export-items.js)
var item_rules: Dictionary = {}   # per base: implicit mods of class gear, whose kit it is, who may wield it; dragon pieces; staff elements
var skill_info: Dictionary = {}   # every skill: name, req, cd, mana and description per level, icons, weapon sets, elements (tools/godot-export-skills.js)
var ground: Dictionary = {}       # picture key → ground picture (pxCanvas): base name, "U:" + unique, "Junk:" + kind, potL, potM

func _ready() -> void:
	items = _load("items")
	uniques = _load("uniques")
	unique_looks = _load("unique_looks")
	monsters = _load("monsters")
	variants = _load("variants")
	bosses = _load("bosses")
	skills = _load("skills")
	classes = _load("classes")
	affixes = _load("affixes")
	mod_text = _load("mod_text")
	mod_order = _load("mod_order")
	palette = _load("palette")
	sprites = _load("sprites")
	icons = _load("icons")
	figures = _load("figures")
	loot = _load("loot")
	item_rules = _load("item_rules")
	ground = _load("ground")
	skill_info = _load("skill_info")
	print("Daten geladen: %d Grundteile, %d Unikate, %d Gegnerarten, %d Figuren" % [items.size(), uniques.size(), variants.size(), figures.size()])

func _load(name: String) -> Variant:
	var path := "res://data/%s.json" % name
	var f := FileAccess.open(path, FileAccess.READ)
	if f == null:
		push_error("Fehlt: " + path)
		return {}
	var v = JSON.parse_string(f.get_as_text())
	return v if v != null else {}

## The text of one modifier line, as in the browser tooltip.
func mod_line(key: String, value) -> String:
	var t: String = mod_text.get(key, key + " {v}")
	if value is float and value == roundf(value):
		value = int(value)
	return t.replace("{v}", str(value))

## A world picture. Kept here once loaded: a texture drawn with draw_texture() must outlive the draw call,
## or the floor turns white once nothing else holds it.
var _spr_cache := {}
func sprite(path: String) -> Texture2D:
	if not _spr_cache.has(path):
		_spr_cache[path] = load("res://assets/sprites/%s.png" % path)
	return _spr_cache[path]

## any picture under assets/, held like sprite()
func tex(path: String) -> Texture2D:
	if not _spr_cache.has(path):
		_spr_cache[path] = load("res://assets/" + path)
	return _spr_cache[path]

func icon(item_name: String) -> Texture2D:
	var i: Dictionary = icons.get(item_name, {})
	return tex("icons/" + i.file) if i.has("file") else null
