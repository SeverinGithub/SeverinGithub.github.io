class_name CharPanel
extends PanelContainer
## The character panel (C, buildChar in 260-ui.js): level, experience, deepest floor, the four attributes with a +
## for every free point, and the fighting values. A stone plate on the left, rebuilt while it is open.

const ATTR := [["str", "Stärke", "Erhöht Waffenschaden"], ["dex", "Geschick", "Erhöht Krit, Verteidigung, Blocken, Ausdauer"],
	["vit", "Vitalität", "+4 Leben pro Punkt"], ["ene", "Energie", "+2 Mana und +2 % Zauberschaden pro Punkt"]]

var ui: UiLayer
var _v: VBoxContainer
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

func _process(_dt: float) -> void:
	if not visible:
		return
	var d := Game.d
	var sig := "%d|%d|%d|%d|%s|%d|%d|%d" % [Game.lvl, Game.xp, Game.pts, roundi(Game.hp), str(d.s), roundi(Game.mp), Game.flasks, Game.max_floor]
	if sig != _sig:
		_sig = sig
		_build()

func _build() -> void:
	Ui.clear(_v)
	var d := Game.d
	var s: Dictionary = d.s
	var h := Ui.heading(Save.cls_name(Game.cls) if Save.find(Save.current()).get("n", "") == "" else Save.find(Save.current()).n, 30)
	var close := Ui.button("Schließen", func(): visible = false, 13)
	close.custom_minimum_size = Vector2(0, 30)
	h.get_node("row").add_child(close)
	_v.add_child(h)
	_v.add_child(_grid([["Stufe", str(Game.lvl)], ["Erfahrung", "%d / %d" % [Game.xp, Game.xp_next(Game.lvl)]], ["Tiefste Ebene", str(Game.max_floor)]]))
	var sub := Ui.sub("Attribute" + (" · %d Punkte frei" % Game.pts if Game.pts else ""))
	if Game.pts:
		(sub.get_child(0) as Label).add_theme_color_override("font_color", Ui.GOLD)
	_v.add_child(sub)
	for a in ATTR:
		var row := HBoxContainer.new()
		row.tooltip_text = a[2]
		row.mouse_filter = Control.MOUSE_FILTER_PASS
		var n := Ui.label(a[1], 16)
		n.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(n)
		var val: String = str(roundi(s[a[0]]))
		var b := Ui.label(val, 16, Ui.PAPER, "sc")
		row.add_child(b)
		if roundi(s[a[0]]) != roundi(Game.stats[a[0]]):
			row.add_child(Ui.label("(%d)" % Game.stats[a[0]], 13, Ui.RAR.magic, "sc"))
		var k: String = a[0]
		var plus := Ui.button("+", func():
			if Game.pts > 0:
				Game.stats[k] += 1
				Game.pts -= 1
				Game.recalc(), 15)
		plus.custom_minimum_size = Vector2(32, 30)
		plus.disabled = Game.pts <= 0
		row.add_child(plus)
		var m := MarginContainer.new()
		m.add_theme_constant_override("margin_top", 4)
		m.add_child(row)
		_v.add_child(m)
	_v.add_child(Ui.sub("Kampfwerte"))
	var dmg := "%d–%d" % [d.dmin, d.dmax] + (" +%d" % d.ele if d.get("ele", 0) else "")
	_v.add_child(_grid([["Waffenschaden", dmg], ["Angriffe pro Sekunde", "%.2f" % d.aspd], ["Kritische Treffer", "%.1f %%" % d.crit],
		["Verteidigung", str(d.def)], ["Blockchance", "%d %%" % roundi(d.block)], ["Widerstände", "%d %%" % d.res],
		["Leben", "%d / %d" % [roundi(Game.hp), d.life]], ["Mana", "%d / %d" % [roundi(Game.mp), d.mana]], ["Ausdauer", str(d.stam)],
		["Zauberschaden", "+%d %%" % roundi((d.spellMul - 1) * 100)], ["Lebensraub", "%s %%" % str(d.ls)], ["Laufgeschwindigkeit", "+%d %%" % d.frw],
		["Magiefund", "%d %%" % d.mf], ["Heilflakon", "%d / %d · %d %%" % [Game.flasks, Game.flask_max, 45 + Game.flask_pow * 8 + d.flaskH]]]))

## two columns, names left, values right (.derived)
func _grid(rows: Array) -> Control:
	var g := GridContainer.new()
	g.columns = 2
	g.add_theme_constant_override("v_separation", 1)
	for r in rows:
		var a := Ui.label(r[0], 15)
		a.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		g.add_child(a)
		var b := Ui.label(r[1], 15, Ui.PAPER, "sc")
		b.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		g.add_child(b)
	return g
