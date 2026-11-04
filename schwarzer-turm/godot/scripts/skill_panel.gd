class_name SkillPanel
extends PanelContainer
## The skills window (pSkill, buildSkills in 260-ui.js): a stone plate on the left with the six skills of the slots,
## each in an iron socket row: its picture with the key, name and what it does at its level with the mana it costs,
## the level (with the bonus of the gear in blue) and a + to spend a skill point. K or T opens it. The weapon in hand
## decides which six skills fill the slots; the points stay with the slots. A click on a picture chooses it for the
## right mouse button.

var ui: UiLayer
var _v: VBoxContainer
var _sig := ""

func _ready() -> void:
	add_theme_stylebox_override("panel", Ui.plate_box(Vector4(16, 12, 16, 14)))
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(sc)
	_v = VBoxContainer.new()
	_v.add_theme_constant_override("separation", 8)
	_v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(_v)
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")

func place() -> void:
	var a := ui.area()
	position = Vector2(12, 12)
	size = Vector2(minf(420, a.x / 2 - 24), a.y - 12 - 140)

func toggle() -> void:
	visible = not visible
	if visible:
		for n in get_tree().get_nodes_in_group("left_panel"):
			if n != self:
				n.visible = false
		place()
		_sig = ""
		_build()

func _unhandled_key_input(ev: InputEvent) -> void:
	if Game.in_play and not get_tree().paused and ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode in [KEY_K, KEY_T]:
		toggle()
		get_viewport().set_input_as_handled()

func _process(_dt: float) -> void:
	if not visible:
		return
	var effs := []
	for i in 6:
		effs.append(Game.sk_lvl(i))
	var sig := "%d|%d|%s|%s|%d|%s" % [Game.spts, Game.lvl, Game.slv, effs, Game.sel, Game.sk_ids()]
	if sig != _sig:
		_sig = sig
		_build()

func _build() -> void:
	Ui.clear(_v)
	var h := Ui.heading("Fertigkeiten", 30)
	var close := Ui.button("Schließen", func(): visible = false, 13)
	close.custom_minimum_size = Vector2(0, 30)
	h.get_node("row").add_child(close)
	_v.add_child(h)
	var k := Game.wset_key()
	var sub := Ui.sub((("1 Punkt frei" if Game.spts == 1 else "%d Punkte frei" % Game.spts) if Game.spts else "Keine freien Punkte") + " · Taste 1–6 wirkt, Rechtsklick wiederholt")
	if Game.spts:
		(sub.get_child(0) as Label).add_theme_color_override("font_color", Ui.GOLD)
	_v.add_child(sub)
	if k != "":
		_v.add_child(Ui.hint("Die Waffe in der Hand bringt eigene Fertigkeiten: " + Data.skill_info.sets[k].n + "."))
	var ids: Array = Game.sk_ids()
	for i in ids.size():
		_v.add_child(_row(i, ids[i]))

## one skill (.skill): the socket with its picture, name and text, level and +
func _row(i: int, id: String) -> Control:
	var lv: int = Game.slv[i]
	var eff := Game.sk_lvl(i)
	var req := Game.sk_req(i)
	var box := PanelContainer.new()
	var sb := Ui.box("sock", 4, 8)
	sb.draw_center = false
	box.add_theme_stylebox_override("panel", sb)
	box.draw.connect(func(): box.draw_rect(Rect2(Vector2(4, 4), box.size - Vector2(8, 8)), Color(10 / 255.0, 8 / 255.0, 6 / 255.0, .7)))
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	box.add_child(row)
	var slot := SkillSlot.new()
	slot.id = id
	slot.i = i
	slot.custom_minimum_size = Vector2(46, 46)
	slot.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	slot.tooltip_text = "Für die rechte Maustaste wählen" if lv else ""
	row.add_child(slot)
	var tv := VBoxContainer.new()
	tv.add_theme_constant_override("separation", 1)
	tv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	tv.add_child(Ui.label(Game.sk_name(id), 16, Ui.HEAD if lv else Ui.PAPER_DIM, "sc"))
	var d := (Game.sk_desc(id, eff) + " Mana: %d." % Game.sk_mana(id, eff)) if lv else ("Erlernbar ab Stufe %d. " % req + Game.sk_desc(id, 1))
	var dl := Ui.label(d, 13, Ui.PAPER_DIM)
	dl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tv.add_child(dl)
	row.add_child(tv)
	var rv := VBoxContainer.new()
	rv.alignment = BoxContainer.ALIGNMENT_CENTER
	rv.add_theme_constant_override("separation", 2)
	var lr := HBoxContainer.new()
	lr.alignment = BoxContainer.ALIGNMENT_CENTER
	lr.add_theme_constant_override("separation", 1)
	lr.add_child(Ui.label(str(lv), 18, Ui.PAPER, "sc"))
	if eff > lv:
		lr.add_child(Ui.label("+%d" % (eff - lv), 13, Ui.RAR.magic, "sc"))
	lr.custom_minimum_size = Vector2(36, 0)
	rv.add_child(lr)
	var plus := Ui.button("+", func(): Game.learn(i), 15)
	plus.custom_minimum_size = Vector2(32, 30)
	plus.disabled = not (Game.spts > 0 and Game.lvl >= req and lv < 20)
	plus.tooltip_text = "%s verbessern" % Game.sk_name(id)
	rv.add_child(plus)
	row.add_child(rv)
	return box

## the picture in its socket, the key in the corner, gold when it is the chosen one
class SkillSlot extends Control:
	var id := ""
	var i := 0
	func _ready() -> void:
		mouse_filter = Control.MOUSE_FILTER_STOP
		mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	func _gui_input(ev: InputEvent) -> void:
		if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT and Game.slv[i] > 0:
			Game.sel = i
	func _draw() -> void:
		var r := Rect2(Vector2.ZERO, size)
		var a := 1.0 if Game.slv[i] > 0 else .3
		draw_rect(r.grow(-2), Color("#070504"))
		var tex := Game.sk_icon(id)
		if tex:
			draw_texture_rect(tex, Rect2(r.get_center() - Vector2(19, 19), Vector2(38, 38)), false, Color(1, 1, 1, a))
		draw_style_box(Ui.box("sockg" if i == Game.sel else "sock", 4, 0, false), r)
		var f := Ui.font("sc")
		draw_string(f, Vector2(5, 14), str(i + 1), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0, 0, 0, a))
		draw_string(f, Vector2(5, 13), str(i + 1), HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color("#c8a860", a))
