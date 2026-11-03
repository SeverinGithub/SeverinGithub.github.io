class_name Hero
extends Node2D
## The hero in layers (data/hero_layers.json): a body sheet for class and pose, and on it every worn piece as grey sheets
## that ramp_map.gdshader colours with the piece's materials. All sheets share one grid, so one frame rect serves every layer.
## Each class wears gear its own way (a mantle on the huntress, a robe on the mage), so layers are keyed "<class>:<base>".
## Equip with names from Data.items, tiers included: hero.equip("weapon", "Blutstahl-Langschwert").

@export var cls := "krieger"
var world := Vector2.ZERO
var face := 0.0
var anim := "idle"
var gear := {}                   # slot → item base name
var unique := {}                 # slot → unique name, for its own colours
var _t := 0.0
var _sprites: Array[Sprite2D] = []
static var _L: Dictionary = {}
const SHADER := preload("res://shaders/ramp_map.gdshader")
const FPS := {"walk": 10.0, "attack": 14.0, "idle": 1.0}

func _ready() -> void:
	if _L.is_empty():
		var f := FileAccess.open("res://data/hero_layers.json", FileAccess.READ)
		_L = JSON.parse_string(f.get_as_text())
	rebuild()

func equip(slot: String, item: String, unique_name := "") -> void:
	if item == "":
		gear.erase(slot)
		unique.erase(slot)
	else:
		gear[slot] = item
		unique[slot] = unique_name
	if is_inside_tree():
		rebuild()

func play(name: String) -> void:
	if anim != name:
		anim = name
		_t = 0.0

## The body follows the weapon: a bow, a crossbow or the warrior's great weapons, hammers and spears move the arms differently.
## Under most helms mage, huntress and alchemist wear hood and collar differently: then the helmed version (_h) of body and armour.
func _body_key() -> String:
	var key := ""
	if gear.has("weapon"):
		var lay := _layer(gear.weapon)
		if lay.has("body") and String(lay.body).begins_with(cls + "_"):
			key = lay.body
	if key == "":
		for k in _L.bodies:
			if _L.bodies[k].cls == cls and not _L.bodies[k].get("helmed", false):
				key = k
				break
	if key == "":
		return "krieger_melee"
	if _helmed() and _L.bodies.has(key + "_h"):
		return key + "_h"
	return key

func _helmed() -> bool:
	return gear.has("helm") and _layer(gear.helm).get("helmed", false)

func rebuild() -> void:
	for s in _sprites:
		s.queue_free()
	_sprites.clear()
	_add("res://assets/hero/body_%s.png" % _body_key(), null)
	for slot in _L.order:
		if not gear.has(slot):
			continue
		var look: Dictionary = _L.looks.get(gear[slot], {})
		var lay := _layer(gear[slot], slot == "armor" and _helmed())
		if lay.is_empty():
			continue
		# a unique brings its own colours (PXU: main, second, grip, gem), like itemRamps in the browser
		var u: Array = _L.unique_looks.get(unique.get(slot, ""), [])
		var m := {"p": _pick(u, 0, look.p), "s": _pick(u, 1, look.s), "t": _pick(u, 2, look.t), "g": _pick(u, 3, look.g)}
		for k in _L.pass_order:
			if not (k in lay.passes):
				continue
			var mat: ShaderMaterial = null
			if k.begins_with("d"):
				mat = _shader(_derived(_ramp(m[lay.derived[k].src], false), lay.derived[k]), false)
			elif k != "f":
				mat = _shader(_ramp(m[k], k == "g"), k == "g")
			_add("res://assets/hero/%s_%s.png" % [lay.file, k], mat)
	_apply()

## the layer of an item base for this class, else as the first class it was baked for wears it
func _layer(item: String, helmed := false) -> Dictionary:
	var root := String(_L.looks.get(item, {}).get("layer", ""))
	if root == "":
		return {}
	if helmed and _L.layers.has(cls + ":" + root + ":h"):
		return _L.layers[cls + ":" + root + ":h"]
	if _L.layers.has(cls + ":" + root):
		return _L.layers[cls + ":" + root]
	for c in ["krieger", "jaegerin", "magier", "alchemist"]:
		if _L.layers.has(c + ":" + root):
			return _L.layers[c + ":" + root]
	return {}

func _pick(u: Array, i: int, fallback: String) -> String:
	return u[i] if i < u.size() and u[i] is String and u[i] != "" else fallback

func _ramp(ramp_name: String, is_gem: bool) -> Array:
	var ramp: Array = (_L.gems if is_gem else _L.ramps).get(ramp_name, ["#000000", "#555555", "#aaaaaa", "#ffffff"])
	return ramp.map(func(h): return Color.html(h))

## a colour the game mixes while drawing (mixR, then darkR: the huntress's mantle and hood, the alchemist's apron)
func _derived(ramp: Array, rec: Dictionary) -> Array:
	var out := []
	for i in ramp.size():
		out.append((ramp[i] as Color).lerp(Color.html(rec.mix[i]), float(rec.t)))
	if rec.dark:
		out = [out[0], out[0], out[1], out[2]]
	return out

func _shader(ramp: Array, is_gem: bool) -> ShaderMaterial:
	var mat := ShaderMaterial.new()
	mat.shader = SHADER
	mat.set_shader_parameter("gem", is_gem)
	for i in 4:
		mat.set_shader_parameter("c%d" % i, ramp[min(i, ramp.size() - 1)])
	return mat

func _add(path: String, mat: ShaderMaterial) -> void:
	if not ResourceLoader.exists(path):
		return
	var s := Sprite2D.new()
	s.texture = load(path)
	s.centered = false
	s.region_enabled = true
	s.material = mat
	add_child(s)
	_sprites.append(s)

func _process(dt: float) -> void:
	_t += dt
	if anim == "attack" and _t * FPS.attack >= float(_L.attack[1]):
		play("idle")
	position = Iso.to_screen(world)
	z_index = int((world.x + world.y) * 10.0)
	_apply()

func _apply() -> void:
	if _L.is_empty():
		return
	var cell := int(_L.cell)
	var span: Array = _L.get(anim, _L.idle)
	var col := int(span[0]) + int(_t * FPS.get(anim, 1.0)) % int(span[1])
	var r := Rect2(col * cell, Iso.dir_row(face) * cell, cell, cell)
	for s in _sprites:
		s.region_rect = r
		s.position = -Vector2(_L.anchor[0], _L.anchor[1])
