class_name Figure
extends Node2D
## A baked figure from assets/figures/<key>.png: 8 rows of directions, columns for walk, attack and idle (see Data.figures).
## Position is the figure's world point in screen space (Iso.to_screen); the sheet's anchor sits on it.
## Its parent sorts by y (y_sort_enabled): screen y is (x+y)·16, so that is the browser's depth order by x+y.

@export var key := "hero_krieger"
var world := Vector2.ZERO        # tile coordinates, like e.x/e.y in the browser game
var face := 0.0                  # world angle
var anim := "idle"               # idle, walk, attack
var _t := 0.0
var _tex: Texture2D
var _meta: Dictionary
var _spr: Sprite2D

const FPS := {"walk": 10.0, "attack": 12.0, "idle": 1.0}

func _ready() -> void:
	_meta = Data.figures.get(key, {})
	_tex = load("res://assets/figures/%s.png" % key)
	_spr = Sprite2D.new()
	_spr.texture = _tex
	_spr.centered = false
	_spr.region_enabled = true
	add_child(_spr)
	_apply()

func play(name: String) -> void:
	if anim != name:
		anim = name
		_t = 0.0

func _process(dt: float) -> void:
	_t += dt
	if anim == "attack" and _t * FPS.attack >= float(_meta.get("attack", [0, 1])[1]):
		play("idle")
	position = Iso.to_screen(world)
	_apply()

func _apply() -> void:
	if _meta.is_empty():
		return
	var cell := int(_meta.cell)
	var span: Array = _meta.get(anim, _meta.idle)
	var col := int(span[0]) + int(_t * FPS.get(anim, 1.0)) % int(span[1])
	_spr.region_rect = Rect2(col * cell, Iso.dir_row(face) * cell, cell, cell)
	_spr.position = -Vector2(_meta.anchor[0], _meta.anchor[1])
