class_name Grind
extends PanelContainer
## The grindstone on the hill (openGrind in 850-names-arena-grindstone.js): every socketed piece you carry, worn first,
## with its runes; a click lays it on the stone, the runes come out whole into the bag (or fall beside the stone), the
## sockets stay open, a runeword falls apart. What came off shows on top. Walking off closes it.

var ui: UiLayer
var host                         # tower.gd
var _v: VBoxContainer
var _at := Vector2.ZERO
var _res = null                  # what the last grind gave: {it, rs, rw}
var _hover = null
var _sig := ""

func _ready() -> void:
	add_theme_stylebox_override("panel", Ui.plate_box(Vector4(16, 12, 16, 14)))
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(sc)
	_v = VBoxContainer.new()
	_v.add_theme_constant_override("separation", 6)
	_v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(_v)
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")

func open() -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	var a := ui.area()
	size = Vector2(minf(460, a.x - 24), minf(520, a.y - 160))
	position = ((a - size) / 2).floor()
	_at = Vector2(host.level.P.x, host.level.P.y)
	_res = null
	_sig = ""
	visible = true

func _process(_dt: float) -> void:
	if not visible:
		return
	var L = host.level
	if not Game.in_play or L == null or Vector2(L.P.x, L.P.y).distance_to(_at) > .8:
		visible = false
		return
	var sig := str(Runes.grind_list().size()) + "|" + str(_res != null)
	if sig != _sig:
		_sig = sig
		_build()
	if _hover:
		ui.overlay.tip(Items.tip(_hover, ""), ui.root.get_local_mouse_position())

func _grind(it: Dictionary) -> void:
	var r := Runes.grind(it)
	if r.is_empty():
		return
	for k in r.rs:
		var rn := Runes.make(k)
		if not Items.inv_add(rn):
			var o = _stone()
			host.level.drop_item(rn, o.x if o else host.level.P.x, o.y if o else host.level.P.y)
	host.level.grind_spark()
	var names := []
	for k in r.rs:
		names.append(Runes.by(k).n)
	Game.log_msg("Der Schleifstein löst %s aus %s: %s." % ["eine Rune" if r.rs.size() == 1 else "%d Runen" % r.rs.size(), it.name, ", ".join(names)], Runes.COL)
	_res = {"it": it, "rs": r.rs, "rw": r.rw}
	_hover = null
	_sig = ""

func _stone():
	for n in host.level.obj_nodes:
		if n.p.type == "grind":
			return n.p
	return null

func _build() -> void:
	Ui.clear(_v)
	_hover = null
	var h := Ui.heading("Schleifstein", 30)
	var close := Ui.button("Weitergehen", func(): visible = false, 13)
	close.custom_minimum_size = Vector2(0, 30)
	h.get_node("row").add_child(close)
	_v.add_child(h)
	if _res:
		_v.add_child(Ui.sub("Vom Stein"))
		var row := HFlowContainer.new()
		row.add_theme_constant_override("h_separation", 10)
		row.add_child(_chip(Items.icon(_res.it), _res.it.name, Items.RCOL.get(_res.it.rar, Ui.PAPER), "%d Sockel frei" % _res.it.soc))
		for k in _res.rs:
			row.add_child(_chip(Runes.icon("Rune:" + k), Runes.by(k).n, Runes.COL, "Rune"))
		_v.add_child(row)
		if _res.rw:
			_v.add_child(Ui.hint("Das Runenwort „%s“ ist verklungen." % _res.rw))
	_v.add_child(Ui.hint("Leg einen gesockelten Gegenstand auf den Stein. Der Stein schleift die Runen heil heraus, die Sockel bleiben offen. Ein Runenwort zerfällt dabei."))
	var L := Runes.grind_list()
	if L.is_empty():
		_v.add_child(Ui.hint("Du trägst nichts, in dem eine Rune sitzt."))
	for e in L:
		var it: Dictionary = e[0]
		var names := []
		for k in it.runes:
			names.append(Runes.by(k).n)
		var b := Button.new()
		b.custom_minimum_size = Vector2(0, 52)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(_grind.bind(it))
		b.mouse_entered.connect(func(): _hover = it)
		b.mouse_exited.connect(func():
			if _hover == it:
				_hover = null)
		var hb := HBoxContainer.new()
		hb.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hb.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		hb.offset_left = 8
		hb.add_theme_constant_override("separation", 10)
		var ic := TextureRect.new()
		ic.texture = Items.icon(it)
		ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		ic.custom_minimum_size = Vector2(40, 40)
		ic.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
		hb.add_child(ic)
		var tv := VBoxContainer.new()
		tv.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tv.alignment = BoxContainer.ALIGNMENT_CENTER
		tv.add_theme_constant_override("separation", 0)
		var n := Ui.label(it.name, 16, Items.RCOL.get(it.rar, Ui.PAPER))
		n.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tv.add_child(n)
		var s := Ui.label(" · ".join(names) + " · " + e[1], 13, Ui.PAPER_DIM, "italic")
		s.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tv.add_child(s)
		hb.add_child(tv)
		b.add_child(hb)
		_v.add_child(b)

func _chip(tex: Texture2D, nm: String, col: Color, small: String) -> Control:
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 6)
	var ic := TextureRect.new()
	ic.texture = tex
	ic.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	ic.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	ic.custom_minimum_size = Vector2(34, 34)
	ic.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	hb.add_child(ic)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 0)
	v.add_child(Ui.label(nm, 15, col))
	v.add_child(Ui.label(small, 12, Ui.PAPER_DIM, "italic"))
	hb.add_child(v)
	return hb
