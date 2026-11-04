class_name FullView
extends Control
## A window over the whole screen (#pTree, .ovl in src/style.css): dark leather that glows warm in the middle, a bar
## 64 high on top with the title in Pirata One, a line of numbers, a hint and buttons; below it a body that may be
## dragged and zoomed (talent tree, map) or scrolled (chronicle). While it is open the world stands still.
## Subclasses fill `head()`, draw the body in `body_draw()` and answer clicks in `body_click()`.

var ui: UiLayer
var host                         # tower.gd
var key := KEY_NONE              # the key that opens and closes it
var title := ""
var _bar: HBoxContainer
var _info: RichTextLabel
var _hint: Label
var body: Control
var _bg: TextureRect

# view for drag and zoom: the world point in the middle of the body and world units per screen unit
var vx := 0.0
var vy := 0.0
var vs := 1.0
var s_min := .45
var s_max := 3.0
var _drag = null                 # {at, vx, vy, moved}

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	var g := Gradient.new()
	g.set_color(0, Color("#1a120a"))
	g.set_color(1, Color("#040302"))
	g.add_point(.75, Color("#040302"))
	var t := GradientTexture2D.new()
	t.gradient = g
	t.fill = GradientTexture2D.FILL_RADIAL
	t.fill_from = Vector2(.5, .5)
	t.fill_to = Vector2(1.0, 1.0)
	_bg = TextureRect.new()
	_bg.texture = t
	_bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_bg.stretch_mode = TextureRect.STRETCH_SCALE
	_bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_bg)
	body = Control.new()
	body.clip_contents = true
	body.mouse_filter = Control.MOUSE_FILTER_STOP
	body.draw.connect(func(): body_draw(body))
	body.gui_input.connect(_body_input)
	body.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	body.offset_top = 66
	add_child(body)
	var head_bg := Control.new()
	head_bg.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	head_bg.custom_minimum_size = Vector2(0, 66)
	head_bg.offset_bottom = 66
	head_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	head_bg.draw.connect(func():
		head_bg.draw_rect(Rect2(0, 0, head_bg.size.x, 64), Color(0, 0, 0, .4))
		head_bg.draw_rect(Rect2(0, 64, head_bg.size.x, 2), Color("#3a2a14"))
		head_bg.draw_rect(Rect2(0, 66, head_bg.size.x, 1), Color.BLACK))
	add_child(head_bg)
	var m := MarginContainer.new()
	m.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	m.offset_bottom = 64
	for k in ["margin_left", "margin_right"]:
		m.add_theme_constant_override(k, 16)
	add_child(m)
	_bar = HBoxContainer.new()
	_bar.add_theme_constant_override("separation", 16)
	_bar.alignment = BoxContainer.ALIGNMENT_BEGIN
	m.add_child(_bar)

## rebuild the bar: title, the numbers (BBCode), the hint and buttons [[text, callable], …]
func set_head(info: String, hint: String, buttons: Array) -> void:
	Ui.clear(_bar)
	var h := Label.new()
	h.text = title
	h.add_theme_font_override("font", Ui.font("display"))
	h.add_theme_font_size_override("font_size", 30)
	h.add_theme_color_override("font_color", Ui.HEAD)
	h.add_theme_constant_override("shadow_offset_y", 2)
	h.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_bar.add_child(h)
	_info = RichTextLabel.new()
	_info.bbcode_enabled = true
	_info.fit_content = true
	_info.autowrap_mode = TextServer.AUTOWRAP_OFF
	_info.scroll_active = false
	_info.add_theme_font_override("normal_font", Ui.font("sc"))
	_info.add_theme_font_override("bold_font", Ui.font("sc"))
	_info.add_theme_font_size_override("normal_font_size", 17)
	_info.add_theme_font_size_override("bold_font_size", 22)
	_info.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_info.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_info.text = info
	_bar.add_child(_info)
	_hint = Ui.label(hint, 13, Ui.PAPER_DIM)
	_hint.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_hint.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_hint.clip_text = true
	_hint.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	_bar.add_child(_hint)
	for b in buttons:
		var bt := Ui.button(b[0], b[1], 15)
		bt.custom_minimum_size = Vector2(40, 40)
		bt.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		if b.size() > 2 and b[2]:
			bt.disabled = true
		_bar.add_child(bt)

func toggle() -> void:
	if visible:
		close()
	else:
		open()

func open() -> void:
	for n in get_tree().get_nodes_in_group("full_view"):
		if n != self:
			n.visible = false
	host._close_panels()
	visible = true
	get_tree().paused = true
	opened()
	head()
	body.queue_redraw()

func close() -> void:
	if not visible:
		return
	visible = false
	if host._menu == "":
		get_tree().paused = false

func _enter_tree() -> void:
	add_to_group("full_view")

func _unhandled_key_input(ev: InputEvent) -> void:
	if not (ev is InputEventKey and ev.pressed and not ev.echo):
		return
	if ev.keycode == key and Game.in_play and host._menu == "":
		toggle()
		get_viewport().set_input_as_handled()
	elif visible and ev.keycode == KEY_ESCAPE:
		close()
		get_viewport().set_input_as_handled()

func _process(_dt: float) -> void:
	if visible:
		tick()

# ---------- to be filled by the views ----------

func opened() -> void:
	pass

func head() -> void:
	pass

func tick() -> void:
	pass

func body_draw(_c: Control) -> void:
	pass

func body_click(_world: Vector2, _at: Vector2) -> void:
	pass

func body_hover(_world: Vector2, _at: Vector2) -> void:
	pass

func clamp_view() -> void:
	vs = clampf(vs, s_min, s_max)

# ---------- drag, zoom, click ----------

func to_world(p: Vector2) -> Vector2:
	return Vector2(vx, vy) + (p - body.size / 2) * vs

func to_screen(w: Vector2) -> Vector2:
	return (w - Vector2(vx, vy)) / vs + body.size / 2

func zoom_at(f: float, at = null) -> void:
	var p: Vector2 = at if at != null else body.size / 2
	var w := to_world(p)
	var s0 := vs
	vs = clampf(vs * f, s_min, s_max)
	var k := vs / s0
	vx = w.x - (w.x - vx) * k
	vy = w.y - (w.y - vy) * k
	clamp_view()
	body.queue_redraw()

func _body_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton:
		if ev.button_index == MOUSE_BUTTON_WHEEL_UP and ev.pressed:
			zoom_at(1 / 1.15, ev.position)
		elif ev.button_index == MOUSE_BUTTON_WHEEL_DOWN and ev.pressed:
			zoom_at(1.15, ev.position)
		elif ev.button_index == MOUSE_BUTTON_LEFT:
			if ev.pressed:
				_drag = {"at": ev.position, "vx": vx, "vy": vy, "moved": false}
			elif _drag:
				var d = _drag
				_drag = null
				if not d.moved:
					body_click(to_world(ev.position), ev.position)
	elif ev is InputEventMouseMotion:
		if _drag:
			var dv: Vector2 = ev.position - _drag.at
			if absf(dv.x) + absf(dv.y) > 5:
				_drag.moved = true
			if _drag.moved:
				vx = _drag.vx - dv.x * vs
				vy = _drag.vy - dv.y * vs
				clamp_view()
		body_hover(to_world(ev.position), ev.position)
		body.queue_redraw()
	elif ev is InputEventMagnifyGesture:
		zoom_at(1 / ev.factor, ev.position)
	elif ev is InputEventPanGesture:
		vx += ev.delta.x * 20 * vs
		vy += ev.delta.y * 20 * vs
		clamp_view()
		body.queue_redraw()
