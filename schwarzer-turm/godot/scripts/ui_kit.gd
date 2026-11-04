class_name Ui
## The painted UI of the browser game (buildUI in 010-palette.js, src/style.css) for Godot's Control nodes:
## the same textures (stone, gold frame, sockets, bevelled buttons, tooltip frame, divider, orb rings, exported to
## assets/ui/ by the browser) shown two screen pixels per texture pixel, and the same four typefaces
## (Pirata One for headings, IM Fell English for text, its italic and small caps for labels and buttons).
## Everything is built in code: Ui.theme() for the widgets, Ui.plate() for the stone panels, small helpers for the rest.

const PAPER := Color("#ece4cf")
const PAPER_DIM := Color("#a39b88")
const GOLD := Color("#e3b04b")
const HEAD := Color("#e8c878")
const H3 := Color("#c8a860")
const EMBER := Color("#ff8a2a")
const BAD := Color("#ff5a4a")
const GOOD := Color("#8fe36a")
const BTN_TXT := Color("#e4d2a8")
const BTN_HOVER := Color("#fff2c8")
const RAR := {"normal": Color("#ece4cf"), "magic": Color("#7aa4ff"), "rare": Color("#ffd94f"), "unique": Color("#e8973a"), "rune": Color("#f0b25a"), "runeword": Color("#cdbf94")}

static var _tex := {}
static var _font := {}
static var _theme: Theme

## a texture of assets/ui/, every pixel doubled (the browser shows them at 2 CSS px)
static func tx(k: String) -> Texture2D:
	if not _tex.has(k):
		var img: Image = load("res://assets/ui/%s.png" % k).get_image()
		img.resize(img.get_width() * 2, img.get_height() * 2, Image.INTERPOLATE_NEAREST)
		_tex[k] = ImageTexture.create_from_image(img)
	return _tex[k]

## display, body, italic, sc
static func font(k: String) -> Font:
	if not _font.has(k):
		var f: FontFile = load({"display": "res://assets/fonts/PirataOne-Regular.ttf", "body": "res://assets/fonts/IMFeENrm28P.ttf",
			"italic": "res://assets/fonts/IMFeENit28P.ttf", "sc": "res://assets/fonts/IMFeENsc28P.ttf"}[k])
		_font[k] = f
	return _font[k]

## a typeface with letter-spacing (CSS letter-spacing in px)
static func spaced(k: String, px: float) -> Font:
	var key := "%s@%d" % [k, roundi(px)]
	if not _font.has(key):
		var v := FontVariation.new()
		v.base_font = font(k)
		v.spacing_glyph = roundi(px)
		_font[key] = v
	return _font[key]

## a box from a texture of assets/ui/ (border-image in the browser): m is the doubled slice width
static func box(k: String, m: int, pad := -1, center := true) -> StyleBoxTexture:
	var s := StyleBoxTexture.new()
	s.texture = tx(k)
	s.set_texture_margin_all(m)
	s.set_content_margin_all(m if pad < 0 else pad)
	s.axis_stretch_horizontal = StyleBoxTexture.AXIS_STRETCH_MODE_TILE_FIT
	s.axis_stretch_vertical = StyleBoxTexture.AXIS_STRETCH_MODE_TILE_FIT
	s.draw_center = center
	return s

## the theme every window uses
static func theme() -> Theme:
	if _theme:
		return _theme
	var t := Theme.new()
	t.default_font = font("body")
	t.default_font_size = 15
	# buttons: bevelled wood-and-iron, small caps, a warm glow on hover
	for st in [["normal", "btn"], ["hover", "btnh"], ["pressed", "btnd"], ["disabled", "btn"], ["focus", "btnh"]]:
		var b := box(st[1], 8, 6)
		b.content_margin_left = 12
		b.content_margin_right = 12
		if st[0] == "focus":
			b.draw_center = false
			b.modulate_color = Color(1, 1, 1, 0)
		t.set_stylebox(st[0], "Button", b)
	t.set_font("font", "Button", font("sc"))
	t.set_font_size("font_size", "Button", 15)
	t.set_color("font_color", "Button", BTN_TXT)
	t.set_color("font_hover_color", "Button", BTN_HOVER)
	t.set_color("font_pressed_color", "Button", BTN_HOVER)
	t.set_color("font_focus_color", "Button", BTN_TXT)
	t.set_color("font_disabled_color", "Button", BTN_TXT * Color(1, 1, 1, .45))
	t.set_color("font_outline_color", "Button", Color.BLACK)
	t.set_constant("outline_size", "Button", 3)
	t.set_color("font_color", "Label", PAPER)
	t.set_color("font_shadow_color", "Label", Color(0, 0, 0, .9))
	t.set_constant("shadow_offset_x", "Label", 0)
	t.set_constant("shadow_offset_y", "Label", 1)
	t.set_color("default_color", "RichTextLabel", PAPER)
	t.set_font("normal_font", "RichTextLabel", font("body"))
	t.set_font("italics_font", "RichTextLabel", font("italic"))
	t.set_font("bold_font", "RichTextLabel", font("sc"))
	t.set_font_size("normal_font_size", "RichTextLabel", 15)
	t.set_font_size("italics_font_size", "RichTextLabel", 15)
	t.set_font_size("bold_font_size", "RichTextLabel", 15)
	t.set_color("font_shadow_color", "RichTextLabel", Color(0, 0, 0, .9))
	t.set_constant("shadow_offset_y", "RichTextLabel", 1)
	t.set_constant("shadow_offset_x", "RichTextLabel", 0)
	# the tooltip frame: dark glass in a thin gold line with four bright rivets
	t.set_stylebox("panel", "TooltipPanel", box("tipf", 8, 10))
	t.set_font("font", "TooltipLabel", font("body"))
	t.set_font_size("font_size", "TooltipLabel", 14)
	t.set_color("font_color", "TooltipLabel", PAPER)
	# sliders and checkboxes of the settings
	var rail := StyleBoxFlat.new()
	rail.bg_color = Color("#0a0806")
	rail.border_color = Color("#3a2a14")
	rail.set_border_width_all(1)
	rail.content_margin_top = 3
	rail.content_margin_bottom = 3
	t.set_stylebox("slider", "HSlider", rail)
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color("#c8962a")
	fill.content_margin_top = 3
	fill.content_margin_bottom = 3
	t.set_stylebox("grabber_area", "HSlider", fill)
	t.set_stylebox("grabber_area_highlight", "HSlider", fill)
	t.set_icon("grabber", "HSlider", _knob(Color("#e8c878")))
	t.set_icon("grabber_highlight", "HSlider", _knob(Color("#fff2c8")))
	t.set_font("font", "CheckBox", font("body"))
	t.set_color("font_color", "CheckBox", PAPER)
	t.set_color("font_hover_color", "CheckBox", BTN_HOVER)
	t.set_color("font_pressed_color", "CheckBox", PAPER)
	t.set_color("font_hover_pressed_color", "CheckBox", BTN_HOVER)
	for st in ["normal", "hover", "pressed", "hover_pressed", "focus"]:
		t.set_stylebox(st, "CheckBox", StyleBoxEmpty.new())
	t.set_icon("checked", "CheckBox", _check(true))
	t.set_icon("unchecked", "CheckBox", _check(false))
	t.set_font("font", "LineEdit", font("body"))
	t.set_font_size("font_size", "LineEdit", 17)
	t.set_color("font_color", "LineEdit", PAPER)
	t.set_color("font_placeholder_color", "LineEdit", PAPER_DIM)
	var le := StyleBoxFlat.new()
	le.bg_color = Color(0, 0, 0, .35)
	le.border_color = Color("#3a2a14")
	le.border_width_bottom = 1
	le.content_margin_left = 4
	le.content_margin_right = 4
	t.set_stylebox("normal", "LineEdit", le)
	var lef := le.duplicate()
	lef.border_color = GOLD
	t.set_stylebox("focus", "LineEdit", lef)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, .3)
	t.set_stylebox("scroll", "VScrollBar", sb)
	var gr := StyleBoxFlat.new()
	gr.bg_color = Color("#5a4a2e")
	gr.content_margin_left = 3
	gr.content_margin_right = 3
	t.set_stylebox("grabber", "VScrollBar", gr)
	var grh := gr.duplicate()
	grh.bg_color = Color("#8a6a3a")
	t.set_stylebox("grabber_highlight", "VScrollBar", grh)
	t.set_stylebox("grabber_pressed", "VScrollBar", grh)
	_theme = t
	return t

static func _knob(c: Color) -> Texture2D:
	var img := Image.create(12, 16, false, Image.FORMAT_RGBA8)
	img.fill(Color.BLACK)
	img.fill_rect(Rect2i(2, 2, 8, 12), c)
	img.fill_rect(Rect2i(2, 2, 8, 2), c.lightened(.3))
	return ImageTexture.create_from_image(img)

static func _check(on: bool) -> Texture2D:
	var img := Image.create(18, 18, false, Image.FORMAT_RGBA8)
	img.fill(Color("#3a2a14"))
	img.fill_rect(Rect2i(1, 1, 16, 16), Color("#0a0806"))
	if on:
		img.fill_rect(Rect2i(4, 4, 10, 10), GOLD)
		img.fill_rect(Rect2i(4, 4, 10, 3), Color("#fff0a8"))
	return ImageTexture.create_from_image(img)

# ---------- the stone plates: panels, dialogs, menus ----------

## a stone plate in its gold frame (.panel and #dialog): stone tiled at 128 px under a dark wash, frame 16 px
class PlateBox extends StyleBox:
	var wash := Color(8 / 255.0, 6 / 255.0, 4 / 255.0, .67)
	var pad := Vector4(14, 22, 14, 18)
	func _get_minimum_size() -> Vector2:
		return Vector2(32, 32)
	func _draw(ci: RID, r: Rect2) -> void:
		var stone: Texture2D = Ui.tx("stone")
		var inner := r.grow(-8)
		RenderingServer.canvas_item_add_texture_rect(ci, inner, stone.get_rid(), true)
		RenderingServer.canvas_item_add_rect(ci, inner, wash)
		var fr: StyleBoxTexture = Ui.box("frame", 16, 0, false)
		fr.draw(ci, r)

static func plate_box(pad := Vector4(16, 14, 16, 16)) -> StyleBox:
	var b := PlateBox.new()
	b.content_margin_left = pad.x
	b.content_margin_top = pad.y
	b.content_margin_right = pad.z
	b.content_margin_bottom = pad.w
	return b

## a PanelContainer that is a stone plate with a column inside; returns [plate, column]
static func plate(gap := 10, pad := Vector4(18, 16, 18, 18)) -> Array:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", plate_box(pad))
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", gap)
	p.add_child(v)
	return [p, v]

## a heading in Pirata One, gold with a black drop, over the gold divider (.panel h2)
static func heading(text: String, size := 30) -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 2)
	var row := HBoxContainer.new()
	row.name = "row"
	var l := Label.new()
	l.text = text
	l.name = "title"
	l.add_theme_font_override("font", font("display"))
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", HEAD)
	l.add_theme_constant_override("shadow_offset_y", 2)
	l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(l)
	v.add_child(row)
	var d := TextureRect.new()
	d.texture = tx("div")
	d.stretch_mode = TextureRect.STRETCH_SCALE
	d.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	d.custom_minimum_size = Vector2(0, 16)
	d.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	v.add_child(d)
	return v

## a sub heading in small caps with a dark rule under it (.panel h3)
static func sub(text: String) -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 3)
	var l := label(text, 15, H3, "sc")
	v.add_child(l)
	var r := ColorRect.new()
	r.color = Color("#3a2a14")
	r.custom_minimum_size = Vector2(0, 2)
	v.add_child(r)
	return v

static func label(text: String, size := 15, col := PAPER, f := "body") -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", font(f))
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", col)
	return l

## a hint in italics, dim, wrapping (.hint)
static func hint(text: String, size := 14) -> Label:
	var l := label(text, size, PAPER_DIM, "italic")
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	l.custom_minimum_size = Vector2(80, 0)
	return l

static func button(text: String, cb: Callable, size := 15) -> Button:
	var b := Button.new()
	b.text = text
	b.add_theme_font_size_override("font_size", size)
	b.custom_minimum_size = Vector2(0, 34)
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	b.pressed.connect(cb)
	return b

## a socket frame around an icon (.slot): sock, or sockg when chosen
static func socket(sel := false) -> StyleBoxTexture:
	var s := box("sockg" if sel else "sock", 4, 4)
	return s

## a row of label and value, the value right aligned (the stat lists)
static func row(name: String, value: String, vcol := PAPER) -> HBoxContainer:
	var h := HBoxContainer.new()
	var a := label(name, 15)
	a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	h.add_child(a)
	var b := label(value, 15, vcol, "sc")
	b.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	h.add_child(b)
	return h

static func clear(n: Node) -> void:
	for c in n.get_children():
		n.remove_child(c)
		c.queue_free()

# ---------- drawn panels and tooltips (for Controls that paint themselves) ----------

## a panel's heading drawn by hand: Pirata One with a black drop, the divider under it (.panel h2); returns its height
static func draw_heading(ci: CanvasItem, r: Rect2, text: String, fs := 30) -> float:
	var f := font("display")
	var y := r.position.y + f.get_ascent(fs) * .92
	ci.draw_string(f, Vector2(r.position.x, y + 2), text, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, Color.BLACK)
	ci.draw_string(f, Vector2(r.position.x, y), text, HORIZONTAL_ALIGNMENT_LEFT, -1, fs, HEAD)
	var dy := r.position.y + fs + 2
	ci.draw_texture_rect(tx("div"), Rect2(r.position.x, dy, r.size.x, 16), false)
	return fs + 18

## text with the browser's shadow (0 1px 0 #000, 0 0 3px #000)
static func shadow_text(ci: CanvasItem, f: Font, at: Vector2, s: String, fs: int, col: Color, align := HORIZONTAL_ALIGNMENT_LEFT, w := -1.0) -> void:
	ci.draw_string_outline(f, at, s, align, w, fs, 3, Color(0, 0, 0, .45 * col.a))
	ci.draw_string(f, at + Vector2(0, 1), s, align, w, fs, Color(0, 0, 0, col.a))
	ci.draw_string(f, at, s, align, w, fs, col)

## lines broken to a width
static func wrap_text(f: Font, t: String, w: float, fs: int) -> Array:
	var out := []
	var cur := ""
	for word in t.split(" "):
		var nxt: String = word if cur == "" else cur + " " + word
		if cur != "" and f.get_string_size(nxt, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x > w:
			out.append(cur)
			cur = word
		else:
			cur = nxt
	if cur != "":
		out.append(cur)
	return out

## the tooltip (#tip): dark glass in the tipf frame, centred lines, the first a name in small caps; lines are
## [text, colour] and may carry a third field "small" for the closing hints. Placed beside the point like showTip,
## inside the area; returns the rect it took.
static func draw_tip(ci: CanvasItem, at: Vector2, lines: Array, area: Rect2, pic: Texture2D = null) -> Rect2:
	var rows := []
	var w := 0.0
	for i in lines.size():
		var l: Array = lines[i]
		var small: bool = l.size() > 2 and l[2] == "small"
		var f := font("sc") if i == 0 else (font("italic") if small else font("body"))
		var fs := 16 if i == 0 else (12 if small else 14)
		for s in wrap_text(f, l[0], 284, fs):
			rows.append([s, l[1], f, fs, small])
			w = maxf(w, f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x)
	var ph := 0.0
	if pic:
		ph = pic.get_height() * 2 + 4
		w = maxf(w, pic.get_width() * 2)
	var h := ph
	for r in rows:
		h += r[3] * 1.35 + (4 if r[4] else 0)
	var size := Vector2(w + 32, h + 24)
	var p := at + Vector2(18, -size.y - 10)
	if p.x + size.x > area.end.x - 8:
		p.x = at.x - size.x - 18
	if p.y < area.position.y + 8:
		p.y = at.y + 20
	if p.y + size.y > area.end.y - 8:
		p.y = area.end.y - size.y - 8
	p.x = maxf(area.position.x + 8, p.x)
	var rect := Rect2(p.round(), size)
	for k in 6:
		ci.draw_rect(Rect2(rect.position + Vector2(-k, 6 - k + 4), rect.size + Vector2(2 * k, 2 * k)), Color(0, 0, 0, .08))
	ci.draw_rect(rect.grow(-4), Color(6 / 255.0, 5 / 255.0, 4 / 255.0, .95))
	ci.draw_style_box(box("tipf", 8, 0, false), rect)
	var y := rect.position.y + 12
	if pic:
		ci.draw_texture_rect(pic, Rect2(rect.position.x + (size.x - pic.get_width() * 2) / 2, y, pic.get_width() * 2, pic.get_height() * 2), false)
		y += ph
	for r in rows:
		var fs: int = r[3]
		if r[4]:
			y += 4
		y += fs * 1.35
		shadow_text(ci, r[2], Vector2(rect.position.x, y - fs * .35), r[0], fs, r[1], HORIZONTAL_ALIGNMENT_CENTER, size.x)
	return rect
