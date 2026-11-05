class_name Stash
extends Control
## The bottomless chest on the hill (pStash, buildStash in 260-ui.js): ten columns and rows without end, always four
## empty rows at the bottom; it scrolls with the wheel. The bag opens beside it. A click takes an item into the hand
## and puts it down again (one in the way is swapped), shift-click or right click moves it into the bag, and in the
## bag shift-click lays it in here. Sortieren packs the big pieces first.

const SW := 10

var ui: UiLayer
var host                         # tower.gd
var cell := 48.0
var _top := 0.0                  # top of the grid's window, in the panel
var _h := 0.0                    # height of the grid's window
var _scroll := 0.0
var _m := Vector2.ZERO
var _hover = null
var _btn: Button
var _close: Button

func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")
	_close = Ui.button("Schließen", func(): visible = false, 13)
	_close.custom_minimum_size = Vector2(0, 30)
	add_child(_close)
	_btn = Ui.button("Sortieren", sort, 14)
	_btn.custom_minimum_size = Vector2(0, 32)
	add_child(_btn)
	visibility_changed.connect(func():
		if not visible and host and host.inv_panel.mode == "stash":
			host.inv_panel.mode = "")

func open() -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	var a := ui.area()
	cell = maxf(16, floorf(minf(48, (a.x / 2 - 60) / 10)))
	position = Vector2(12, 12)
	size = Vector2(cell * 10 + 48, a.y - 12 - 140)
	_close.reset_size()
	_close.position = Vector2(size.x - 24 - _close.size.x, 20)
	_btn.reset_size()
	_btn.position = Vector2(size.x - 24 - _btn.size.x, 76)
	_top = 76 + 32 + 10
	_h = floorf((size.y - _top - 22 - 44) / cell) * cell
	_scroll = 0
	visible = true
	host.inv_panel.mode = "stash"
	if not host.inv_panel.visible:
		host.inv_panel.toggle()

# ---------- the chest's own grid (stAt, stAdd, stDel, stSort) ----------

static func at(x: int, y: int, w: int, h: int, skip = null) -> Array:
	var out := []
	for it in Game.stash:
		if it == skip:
			continue
		var s := Items.size(it)
		if x < it.gx + s.x and x + w > it.gx and y < it.gy + s.y and y + h > it.gy:
			out.append(it)
	return out

static func add(it: Dictionary) -> void:
	var s := Items.size(it)
	var y := 0
	while true:
		for x in SW - s.x + 1:
			if at(x, y, s.x, s.y).is_empty():
				it.gx = x
				it.gy = y
				Game.stash.append(it)
				return
		y += 1

static func rows() -> int:
	var m := 0
	for it in Game.stash:
		m = maxi(m, it.gy + Items.size(it).y)
	return maxi(8, m + 4)

func sort() -> void:
	var all: Array = Game.stash.duplicate()
	all.sort_custom(func(a, b):
		var sa := Items.size(a)
		var sb := Items.size(b)
		if sa.x * sa.y != sb.x * sb.y:
			return sa.x * sa.y > sb.x * sb.y
		if a.slot != b.slot:
			return str(a.slot) < str(b.slot)
		return a.get("ilvl", 0) > b.get("ilvl", 0))
	Game.stash.clear()
	for it in all:
		add(it)

# ---------- input ----------

func _fcell(p: Vector2) -> Vector2:
	return (p - Vector2(24, _top - _scroll)) / cell

func _in_grid(p: Vector2) -> bool:
	return p.x >= 24 and p.x < 24 + SW * cell and p.y >= _top and p.y < _top + _h

func _target(p: Vector2) -> Rect2i:
	var s := Items.size(Game.hand)
	var f := _fcell(p)
	return Rect2i(clampi(roundi(f.x - s.x / 2.0), 0, SW - s.x), maxi(0, roundi(f.y - s.y / 2.0)), s.x, s.y)

func _has_point(p: Vector2) -> bool:
	return visible and Rect2(Vector2.ZERO, size).has_point(p)

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion:
		_hover = null
		if _in_grid(ev.position):
			var c := _fcell(ev.position).floor()
			var h := at(int(c.x), int(c.y), 1, 1)
			_hover = h[0] if h.size() else null
		return
	if not (ev is InputEventMouseButton and ev.pressed):
		return
	accept_event()
	var maxs := maxf(0, rows() * cell - _h)
	if ev.button_index == MOUSE_BUTTON_WHEEL_DOWN:
		_scroll = minf(maxs, _scroll + cell)
		return
	if ev.button_index == MOUSE_BUTTON_WHEEL_UP:
		_scroll = maxf(0, _scroll - cell)
		return
	if not _in_grid(ev.position):
		return
	var c := _fcell(ev.position).floor()
	var hit := at(int(c.x), int(c.y), 1, 1)
	if ev.button_index == MOUSE_BUTTON_RIGHT or (ev.button_index == MOUSE_BUTTON_LEFT and ev.shift_pressed and Game.hand == null):
		if Game.hand == null and hit.size():
			_to_bag(hit[0])
		return
	if ev.button_index != MOUSE_BUTTON_LEFT:
		return
	if Game.hand == null:
		if hit.size():
			Game.stash.erase(hit[0])
			Game.hand = hit[0]
			_hover = null
		return
	if Game.hand.slot == "rune" and hit.size() and Runes.try_hand(hit[0]):
		return
	var it: Dictionary = Game.hand
	var t := _target(ev.position)
	var in_way := at(t.position.x, t.position.y, t.size.x, t.size.y)
	if in_way.size() > 1:
		Game.log_msg("Dort ist kein Platz.", Ui.PAPER_DIM)
		return
	it.gx = t.position.x
	it.gy = t.position.y
	Game.stash.append(it)
	Game.hand = null
	if in_way.size() == 1:
		Game.stash.erase(in_way[0])
		Game.hand = in_way[0]

func _to_bag(it: Dictionary) -> void:
	Game.stash.erase(it)
	if not Items.inv_add(it):
		Game.stash.append(it)
		Game.log_msg("Das Inventar ist voll.", Ui.BAD)
	_hover = null

# ---------- drawing ----------

func _process(_dt: float) -> void:
	if not visible:
		return
	_m = get_local_mouse_position()
	queue_redraw()
	if _hover and Game.hand == null:
		var lines := Items.tip(_hover, "")
		lines.append(["Shift+Klick oder Rechtsklick: ins Inventar", Ui.PAPER_DIM, "small"])
		ui.overlay.tip(lines, _m + position)

func _draw() -> void:
	draw_style_box(Ui.plate_box(Vector4(8, 6, 8, 6)), Rect2(Vector2.ZERO, size))
	Ui.draw_heading(self, Rect2(24, 22, size.x - 48, 48), "Bodenlose Truhe")
	var n := Game.stash.size()
	Ui.shadow_text(self, Ui.font("italic"), Vector2(24, 98), "%d %s · unten ist immer Platz" % [n, "Gegenstand" if n == 1 else "Gegenstände"], 13, Ui.PAPER_DIM)
	var rr := rows()
	var clip := Rect2(24, _top, SW * cell, _h)
	var y0 := _top - _scroll
	for y in rr:
		var ry := y0 + y * cell
		if ry + cell <= _top or ry >= _top + _h:
			continue
		for x in SW:
			var r := Rect2(24 + x * cell, ry, cell, cell)
			draw_rect(r.grow(-4), Color("#0a0806"))
			draw_style_box(Ui.box("sock", 4, 0, false), r)
	for it in Game.stash:
		var s := Items.size(it)
		var r := Rect2(24 + it.gx * cell, y0 + it.gy * cell, s.x * cell, s.y * cell)
		if not clip.intersects(r):
			continue
		if not clip.encloses(r):
			continue
		if Inventory.R_TINT.has(it.rar):
			draw_rect(r, Inventory.R_TINT[it.rar])
		var tex := Items.icon(it)
		if tex:
			draw_texture_rect(tex, r, false)
			Runes.draw_socks(self, it, r, cell)
		if it == _hover:
			draw_rect(r.grow(-1), Color("#c8962a"), false, 2)
	if Game.hand and _in_grid(_m):
		var t := _target(_m)
		var r := Rect2(24 + t.position.x * cell, y0 + t.position.y * cell, t.size.x * cell, t.size.y * cell)
		var bad := at(t.position.x, t.position.y, t.size.x, t.size.y).size() > 1
		draw_rect(r, Color(196 / 255.0, 42 / 255.0, 28 / 255.0, .25) if bad else Color(108 / 255.0, 188 / 255.0, 32 / 255.0, .22))
		draw_rect(r.grow(-1), Color(1, .42, .31, .7) if bad else Color(200 / 255.0, 248 / 255.0, 120 / 255.0, .6), false, 2)
	# a thin rail shows how far down you are
	var total := rr * cell
	if total > _h:
		var rx := 24 + SW * cell + 4
		draw_rect(Rect2(rx, _top, 4, _h), Color("#0a0806"))
		draw_rect(Rect2(rx, _top + _scroll / total * _h, 4, _h * _h / total), Color("#6a4a20"))
	var it_f := Ui.font("italic")
	var hy := _top + _h + 6
	for l in Ui.wrap_text(it_f, "Klick: aufnehmen und ablegen · Shift+Klick oder Rechtsklick: ins Inventar · im Inventar legt Shift+Klick in die Truhe", size.x - 48, 13):
		hy += 17
		Ui.shadow_text(self, it_f, Vector2(24, hy), l, 13, Ui.PAPER_DIM)
