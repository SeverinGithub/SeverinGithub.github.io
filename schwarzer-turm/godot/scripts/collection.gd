class_name Collection
extends PanelContainer
## The collection (J, buildColl in 260-ui.js): every base form and every unique, grouped like the browser (weapons,
## shields, helms, armour, gloves/boots/belts, jewellery, then the uniques). What you found shows its picture, the
## rest stands as a dark shape; the tooltip names it. A bar on top shows how far you are.

const GROUPS := [["Waffen", ["weapon"]], ["Schilde", ["offhand"]], ["Helme", ["helm"]], ["Rüstungen", ["armor"]],
	["Handschuhe, Stiefel, Gürtel", ["gloves", "boots", "belt"]], ["Schmuck", ["ring", "amulet"]]]

var ui: UiLayer
var _v: VBoxContainer
var _built := ""
var _tab := 0

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

func toggle() -> void:
	visible = not visible
	if visible:
		for n in get_tree().get_nodes_in_group("left_panel"):
			if n != self:
				n.visible = false
		var a := ui.area()
		position = Vector2(12, 12)
		size = Vector2(minf(420, a.x / 2 - 24), a.y - 12 - 140)
		if _built != str(Game.found.size()):
			_build()

func _unhandled_key_input(ev: InputEvent) -> void:
	if Game.in_play and not get_tree().paused and ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode == KEY_J:
		toggle()
		get_viewport().set_input_as_handled()

func _process(_dt: float) -> void:
	if visible and _built != str(Game.found.size()):
		_build()

func _build() -> void:
	_built = str(Game.found.size())
	Ui.clear(_v)
	var h := Ui.heading("Sammlung", 30)
	var close := Ui.button("Schließen", func(): visible = false, 13)
	close.custom_minimum_size = Vector2(0, 30)
	h.get_node("row").add_child(close)
	_v.add_child(h)
	var all: int = Data.items.size()
	var got := 0
	for k in Data.items:
		if Game.found.has(k):
			got += 1
	var ug := 0
	for u in Data.uniques:
		if Game.found.has("u:" + u.n):
			ug += 1
	_v.add_child(Ui.hint("%d von %d Grundformen · %d von %d einzigartigen Gegenständen entdeckt." % [got, all, ug, Data.uniques.size()]))
	_v.add_child(Progress.new(float(got + ug) / maxf(1, all + Data.uniques.size())))
	# one tab per group with how much of it is found; only the chosen group shows its tiles
	var groups := []
	for g in GROUPS:
		var bs: Array = Data.items.values().filter(func(b): return b.slot in g[1])
		bs.sort_custom(func(a, b): return a.lvl < b.lvl)
		var tiles := []
		for b in bs:
			tiles.append({"key": b.n, "name": "%s · ab Stufe %d" % [b.n, b.lvl], "ok": Game.found.has(b.n)})
		groups.append([g[0], tiles])
	var ut := []
	for u in Data.uniques:
		ut.append({"key": "U:" + u.n, "base": u.b, "name": u.n + " · " + u.b, "ok": Game.found.has("u:" + u.n), "u": true})
	groups.append(["Einzigartig", ut])
	var tabs := GridContainer.new()
	tabs.columns = 2
	tabs.add_theme_constant_override("h_separation", 4)
	tabs.add_theme_constant_override("v_separation", 4)
	for i in groups.size():
		var n: int = groups[i][1].filter(func(t): return t.ok).size()
		var b := Ui.button("%s  %d/%d" % [groups[i][0], n, groups[i][1].size()], func(): _tab = i; _build(), 13)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 30)
		b.clip_text = true
		if i == _tab:
			b.add_theme_color_override("font_color", Ui.HEAD)
			var sb := Ui.box("btnd", 8, 6)
			sb.content_margin_left = 12
			sb.content_margin_right = 12
			b.add_theme_stylebox_override("normal", sb)
		if i == groups.size() - 1:
			b.add_theme_color_override("font_color", Ui.RAR.unique)
		tabs.add_child(b)
	_v.add_child(tabs)
	var gs := Ui.sub(groups[_tab][0])
	if _tab == groups.size() - 1:
		(gs.get_child(0) as Label).add_theme_color_override("font_color", Ui.RAR.unique)
	_v.add_child(gs)
	_v.add_child(Tiles.new(groups[_tab][1], ui))

## a gold bar of how much is found
class Progress extends Control:
	var f := 0.0
	func _init(v: float) -> void:
		f = v
		custom_minimum_size = Vector2(0, 14)
	func _draw() -> void:
		var r := Rect2(Vector2.ZERO, size)
		draw_rect(r.grow(-4), Color("#0a0806"))
		var w := (size.x - 8) * f
		for y in int(size.y - 8):
			var q := y / maxf(1, size.y - 9)
			draw_rect(Rect2(4, 4 + y, w, 1), Color("#fff0a8").lerp(Color("#6a4a0a"), q))
		draw_style_box(Ui.box("sockg", 4, 0, false), r)

## a block of tiles 44 wide that wraps to the panel's width; draws them all in one go
class Tiles extends Control:
	var tiles: Array
	var ui: UiLayer
	var _hover := -1
	const T := 44.0
	const G := 4.0
	func _init(t: Array, u: UiLayer) -> void:
		tiles = t
		ui = u
		size_flags_horizontal = Control.SIZE_EXPAND_FILL
		mouse_filter = Control.MOUSE_FILTER_PASS
		resized.connect(_fit)
	func _cols() -> int:
		return maxi(1, int((size.x + G) / (T + G)))
	func _fit() -> void:
		var rows := ceili(tiles.size() / float(_cols()))
		custom_minimum_size.y = rows * (T + G)
		queue_redraw()
	func _rect(i: int) -> Rect2:
		var c := _cols()
		var tw := (size.x - (c - 1) * G) / c
		return Rect2((i % c) * (tw + G), (i / c) * (T + G), tw, T)
	func _gui_input(ev: InputEvent) -> void:
		if ev is InputEventMouseMotion:
			var h := -1
			for i in tiles.size():
				if _rect(i).has_point(ev.position):
					h = i
					break
			if h != _hover:
				_hover = h
				queue_redraw()
	func _notification(what: int) -> void:
		if what == NOTIFICATION_MOUSE_EXIT:
			_hover = -1
			queue_redraw()
	func _process(_dt: float) -> void:
		if _hover >= 0 and is_visible_in_tree():
			var t: Dictionary = tiles[_hover]
			ui.overlay.tip([[t.name if t.ok else "Noch nicht gefunden", Ui.RAR.unique if t.get("u") and t.ok else Ui.PAPER]], ui.root.get_local_mouse_position())
	func _draw() -> void:
		for i in tiles.size():
			var t: Dictionary = tiles[i]
			var r := _rect(i)
			draw_rect(r.grow(-4), Color("#24160a") if t.get("u") else Color("#0a0806"))
			var tex: Texture2D = null
			var ic: Dictionary = Data.icons.get(t.key, Data.icons.get(t.get("base", ""), {}))
			if ic.has("file"):
				tex = Data.tex("icons/" + ic.file)
			if tex:
				var ts := tex.get_size()
				var k := minf(34 / ts.x, 34 / ts.y)
				var s := ts * k
				draw_texture_rect(tex, Rect2((r.get_center() - s / 2).floor(), s), false, Color.WHITE if t.ok else Color(.15, .12, .09, .85))
			draw_style_box(Ui.box("sockg" if i == _hover else "sock", 4, 0, false), r)
