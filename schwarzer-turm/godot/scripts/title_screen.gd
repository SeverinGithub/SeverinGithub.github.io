class_name TitleScreen
extends Control
## The title (#title in src/shell.html, 440-menus.js, 840-title.js): the hill at dusk behind, the tower to the right and
## the hero of the last save before it, embers drifting up; on the left the crest, "Der Schwarze Turm" in gold,
## a few lines, and the menu: Fortsetzen (with who and how far), Neuer Held, Helden, Einstellungen, Steuerung.
## Signals go to tower.gd, which starts or continues the game.

signal pick(what: String)        # "continue", "new", "heroes", "settings", "controls", "quit"

var _embers: Array = []
var _bg: ColorRect
var _ember_layer: Control
var _col: VBoxContainer
var _cont: Button

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	_bg = ColorRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	_bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var m := ShaderMaterial.new()
	m.shader = load("res://shaders/title_bg.gdshader")
	_bg.material = m
	add_child(_bg)
	_ember_layer = Control.new()
	_ember_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	_ember_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var add := CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	_ember_layer.material = add
	_ember_layer.draw.connect(_draw_embers)
	add_child(_ember_layer)
	_col = VBoxContainer.new()
	_col.add_theme_constant_override("separation", 14)
	add_child(_col)
	resized.connect(_place)
	build.call_deferred()

func _place() -> void:
	var w := minf(500, size.x * .92)
	_col.size = Vector2(w, 0)
	_col.reset_size()
	_col.position = Vector2(clampf(size.x * .07, 28, 128), roundf((size.y - _col.size.y) / 2))

## the panel's pieces, in the browser's order; they slide in one after the other (tIn)
func build() -> void:
	Ui.clear(_col)
	var crest := TextureRect.new()
	var img := Image.new()
	img.load_svg_from_string(FileAccess.get_file_as_string("res://assets/ui/crest.svg"), 2.0)
	crest.texture = ImageTexture.create_from_image(img)
	crest.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	crest.custom_minimum_size = Vector2(74, 74)
	crest.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	_col.add_child(_glow_wrap(crest))
	_col.add_child(_title_block())
	_col.add_child(_rule())
	var p := Ui.label("Auf dem grünen Hügel steht ein Turm, der tiefer in die Erde reicht als in den Himmel. Steig hinab, sammle Klingen und Rüstungen, bezwinge die Hüter der Tiefe.", 17, Color("#ddd2b8"), "italic")
	p.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	p.custom_minimum_size = Vector2(minf(360, size.x * .8), 0)
	p.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	p.add_theme_constant_override("line_spacing", 3)
	_col.add_child(p)
	var menu := VBoxContainer.new()
	menu.add_theme_constant_override("separation", 2)
	menu.custom_minimum_size = Vector2(420, 0)
	menu.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	var cur := Save.current()
	var h := Save.find(cur)
	if not h.is_empty() and not Save.read(cur).is_empty():
		_cont = TitleButton.new()
		_cont.big = true
		_cont.text = "Fortsetzen"
		_cont.info = Save.desc(h) if h.get("n", "") == "" else "%s · %s" % [h.n, Save.desc(h)]
		_cont.pressed.connect(func(): pick.emit("continue"))
		menu.add_child(_cont)
	for e in [["Neuer Held", "new"], ["Helden", "heroes"], ["Einstellungen", "settings"], ["Steuerung", "controls"]]:
		if e[1] == "heroes" and Save.all().is_empty():
			continue
		var b := TitleButton.new()
		b.text = e[0]
		var what: String = e[1]
		b.pressed.connect(func(): pick.emit(what))
		menu.add_child(b)
	var mt := MarginContainer.new()
	mt.add_theme_constant_override("margin_top", 10)
	mt.add_child(menu)
	_col.add_child(mt)
	var k := 0
	for c in _col.get_children():
		c.modulate.a = 0
		var tw := create_tween()
		tw.tween_interval(k * .12 + (.02 if k < 4 else .14))
		tw.tween_property(c, "modulate:a", 1.0, .6).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
		k += 1
	_place()
	if _cont:
		_cont.grab_focus.call_deferred()

func _glow_wrap(c: Control) -> Control:
	var w := Control.new()
	w.custom_minimum_size = c.custom_minimum_size
	w.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	w.draw.connect(func():
		for r in range(46, 20, -4):
			w.draw_circle(Vector2(37, 37), r, Color(1, .55, .16, .035)))
	w.add_child(c)
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	return w

## "Der" spaced wide with a fading line after it, then "Schwarze / Turm" in gold with a black drop and a warm glow
func _title_block() -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 4)
	var der := HBoxContainer.new()
	der.add_theme_constant_override("separation", 14)
	var dfs := clampf(size.x * .015, 15, 20)
	var dl := Ui.label("Der", dfs, Color("#caa96a"), "sc")
	dl.add_theme_font_override("font", Ui.spaced("sc", .55 * dfs))
	dl.add_theme_constant_override("shadow_offset_y", 2)
	der.add_child(dl)
	var line := Control.new()
	line.custom_minimum_size = Vector2(64, 1)
	line.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	line.draw.connect(func():
		for x in 64:
			line.draw_rect(Rect2(x, 0, 1, 1), Color(.89, .69, .29, .8 * (1 - x / 64.0))))
	der.add_child(line)
	var dm := MarginContainer.new()
	dm.add_theme_constant_override("margin_left", 4)
	dm.add_child(der)
	v.add_child(dm)
	v.add_child(GoldTitle.new())
	return v

## the thin gold rule with an ember diamond (.trule)
func _rule() -> Control:
	var r := Control.new()
	r.custom_minimum_size = Vector2(minf(300, size.x * .7), 12)
	r.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	r.draw.connect(func():
		var w := r.size.x
		for x in int(w):
			var q := x / w
			var a := .9 - q / .7 * .55 if q < .7 else .35 * (1 - (q - .7) / .3)
			r.draw_rect(Rect2(x, 6, 1, 1), Color(.89, .69, .29, a))
		for k in range(16, 0, -3):
			r.draw_circle(Vector2(18, 6.5), k * .6, Color(1, .54, .16, .05))
		var dia := PackedVector2Array([Vector2(18, 1), Vector2(23.5, 6.5), Vector2(18, 12), Vector2(12.5, 6.5)])
		r.draw_colored_polygon(dia, Color("#1a0e06"))
		dia = PackedVector2Array([Vector2(18, 2.5), Vector2(22, 6.5), Vector2(18, 10.5), Vector2(14, 6.5)])
		r.draw_colored_polygon(dia, Ui.EMBER))
	return r

# ---------- embers drifting up out of the dusk (titleEmbers) ----------

func _spawn(any: bool) -> Dictionary:
	return {"x": randf() * size.x, "y": randf() * size.y if any else size.y + 10, "v": 18 + randf() * 42, "f": .6 + randf() * 1.4, "p": randf() * 6.28,
		"s": 8 + randf() * 22, "r": .6 + randf() * 1.6, "l": 0.0, "L": 5 + randf() * 7}

func _process(dt: float) -> void:
	dt = minf(dt, .05)
	var t := Time.get_ticks_msec() / 1000.0
	(_bg.material as ShaderMaterial).set_shader_parameter("t", t)
	while _embers.size() < mini(110, int(size.x / 12)):
		_embers.append(_spawn(true))
	for i in _embers.size():
		var e: Dictionary = _embers[i]
		e.l += dt
		e.y -= e.v * dt
		e.x += sin(t * e.f + e.p) * e.s * dt
		if e.y < -10 or e.l > e.L:
			_embers[i] = _spawn(false)
	_ember_layer.queue_redraw()

func _draw_embers() -> void:
	var t := Time.get_ticks_msec() / 1000.0
	for e in _embers:
		# brighter towards the tower, fading as they rise
		var a: float = minf(1, e.l * 1.5) * maxf(0, 1 - e.l / e.L) * (.45 + .55 * (e.x / size.x)) * (.7 + .3 * sin(t * 1000 / 120 * e.f + e.p))
		var R: float = e.r * 3.4
		var c := Vector2(e.x, e.y)
		_ember_layer.draw_circle(c, R, Color(1, .35, .08, a * .18))
		_ember_layer.draw_circle(c, R * .55, Color(1, .55, .2, a * .45))
		_ember_layer.draw_circle(c, R * .25, Color(1, .89, .67, a))

## "Schwarze / Turm" in Pirata One, gold from top to bottom over the whole word, a black drop under it
class GoldTitle extends Control:
	var fs := 100
	func _ready() -> void:
		var m := ShaderMaterial.new()
		m.shader = load("res://shaders/gold_text.gdshader")
		material = m
		_fit()
		get_parent().resized.connect(_fit)
	func _fit() -> void:
		var w := _w()
		fs = int(clampf(w * .084, 64, 124))
		var f := Ui.font("display")
		var lh := fs * .84
		custom_minimum_size = Vector2(f.get_string_size("Schwarze", HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 12, lh * 2 + fs * .2)
		(material as ShaderMaterial).set_shader_parameter("top", 0.0)
		(material as ShaderMaterial).set_shader_parameter("height", lh * 2 + fs * .12)
		queue_redraw()
	func _w() -> float:
		var n: Node = self
		while n and not n is TitleScreen:
			n = n.get_parent()
		return (n as Control).size.x if n else 1280.0
	func _draw() -> void:
		var f := Ui.font("display")
		var lh := fs * .84
		var asc := f.get_ascent(fs)
		for k in 2:
			var y := asc * .92 + k * lh
			var txt: String = ["Schwarze", "Turm"][k]
			draw_string(f, Vector2(0, y), txt, HORIZONTAL_ALIGNMENT_LEFT, -1, fs)

## a title menu entry: no frame, small caps spaced wide, a diamond that grows into an ember and a line that runs out
## on hover; the big one (Fortsetzen) sits in a warm box with who and how far under it
class TitleButton extends Button:
	var big := false
	var info := ""
	var h := 0.0
	var _tw: Tween
	func _ready() -> void:
		flat = true
		focus_mode = Control.FOCUS_ALL
		mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		alignment = HORIZONTAL_ALIGNMENT_LEFT
		for s in ["normal", "hover", "pressed", "focus", "disabled"]:
			add_theme_stylebox_override(s, StyleBoxEmpty.new())
		var fs := 24 if big else 21
		add_theme_font_override("font", Ui.spaced("sc", .16 * fs))
		add_theme_font_size_override("font_size", fs)
		custom_minimum_size = Vector2(0, (68 if info != "" else 54) if big else 46)
		mouse_entered.connect(func(): _hover(true))
		mouse_exited.connect(func(): _hover(false))
		focus_entered.connect(func(): _hover(true))
		focus_exited.connect(func(): _hover(false))
		_apply()
	func _hover(on: bool) -> void:
		if _tw:
			_tw.kill()
		_tw = create_tween()
		_tw.tween_method(_set_h, h, 1.0 if on else 0.0, .25)
	func _set_h(v: float) -> void:
		h = v
		_apply()
	func _apply() -> void:
		var pad := (38.0 + 6 * h) if big else (30.0 + 8 * h)
		var c := Color("#fff0c8") if big else Color("#d6c49c").lerp(Color("#fff2c8"), h)
		add_theme_color_override("font_color", c)
		add_theme_color_override("font_hover_color", c)
		add_theme_color_override("font_focus_color", c)
		add_theme_color_override("font_pressed_color", Color("#ffd88a"))
		add_theme_color_override("font_outline_color", Color(1, .59, .24, .35 * h))
		add_theme_constant_override("outline_size", int(8 * h))
		add_theme_constant_override("h_separation", 0)
		var sb := StyleBoxEmpty.new()
		sb.content_margin_left = pad
		sb.content_margin_bottom = 16 if big and info != "" else 0
		for s in ["normal", "hover", "pressed", "focus"]:
			add_theme_stylebox_override(s, sb)
		queue_redraw()
	func _draw() -> void:
		var sz := size
		if big:
			# the warm box: a gradient from the left, a gold line round it
			for x in int(sz.x):
				var q := x / sz.x
				var col := Color(150 / 255.0, 70 / 255.0, 14 / 255.0, .42).lerp(Color(60 / 255.0, 24 / 255.0, 6 / 255.0, .2), minf(1, q / .7)) if q < .7 else Color(60 / 255.0, 24 / 255.0, 6 / 255.0, .2 * (1 - (q - .7) / .3))
				draw_rect(Rect2(x, 0, 1, sz.y), col)
			for k in 8:
				draw_rect(Rect2(k, k, sz.x - 2 * k, sz.y - 2 * k), Color(1, .54, .16, (.02 + .02 * h) * (1 - k / 8.0)), false, 1)
			draw_rect(Rect2(Vector2(-1, -1), sz + Vector2(2, 2)), Color.BLACK, false, 1)
			draw_rect(Rect2(Vector2.ZERO, sz), Color(1, .78, .43, .9) if h > .5 else Color(.89, .69, .29, .6), false, 1)
			var pulse := .5 + .5 * sin(Time.get_ticks_msec() / 1000.0 * TAU / 2.4)
			_diamond(Vector2(16 + 4 * h, sz.y / 2 - (8 if info != "" else 0)), 1.0, Ui.EMBER, .5 + .5 * pulse)
			if info != "":
				var f := Ui.font("sc")
				draw_string(f, Vector2(38 + 6 * h, sz.y - 12), info, HORIZONTAL_ALIGNMENT_LEFT, sz.x - 44, 14, Color("#c9a86a"))
			queue_redraw()
			return
		var cy := 23.0
		_diamond(Vector2(8 + 6 * h + 4, cy), .45 + .55 * h, Color("#6a5634").lerp(Ui.EMBER, h), h)
		var lw := (sz.x - 30) * (.3 + .7 * h)
		for x in int(lw):
			draw_rect(Rect2(30 + x, sz.y - 3, 1, 1), Color(.89, .69, .29, .55 * (1 - x / lw) * (.5 + .5 * h)))
	func _diamond(c: Vector2, s: float, col: Color, glow: float) -> void:
		var r := 5.6 * s
		if glow > 0:
			for k in range(5, 0, -1):
				draw_circle(c, r + k * 2.0, Color(col.r, col.g, col.b, .06 * glow))
		draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r, 0), c + Vector2(0, r), c + Vector2(-r, 0)]), col)
