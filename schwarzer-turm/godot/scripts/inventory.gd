class_name Inventory
extends Control
## The bag and what the hero wears (pInv, buildInv in 260-ui.js), a stone plate on the right of the UI layer:
## the heading with Sortieren and Schließen, the ten equipment sockets (EQLAYOUT), the 10×5 grid of cells, the glut and
## a hint. A cell is up to 48 units (--cell). Left click takes an item into the hand and puts it down again, centred
## under the pointer like the browser (swapping with one item in the way, a green or red ghost shows where), on a slot
## it is worn; right click wears or drinks it, on a slot takes it off; shift-click drops it. I or B opens and closes it.

const EQ := [["helm", "Helm", 5, 1, 2, 2], ["amulet", "Amulett", 7, 2, 1, 1], ["weapon", "Waffe", 1, 2, 2, 4], ["armor", "Rüstung", 5, 3, 2, 3],
	["offhand", "Schild", 9, 2, 2, 4], ["ring1", "Ring", 4, 6, 1, 1], ["belt", "Gürtel", 5, 6, 2, 1], ["ring2", "Ring", 7, 6, 1, 1],
	["gloves", "Handschuhe", 1, 6, 2, 2], ["boots", "Stiefel", 9, 6, 2, 2]]

## the mount's slot, once Ser Haldor has fallen (the buildInv wrapper of 550)
const MOUNT := ["mount", "Reittier", 7, 3, 2, 2]

func _eq() -> Array:
	return EQ + [MOUNT] if Game.rg.get("mslot") else EQ

var level: Level
var ui: UiLayer
var cell := 48.0
var _grid_at := Vector2.ZERO     # top left of the grid, in the panel
var _eq_at := Vector2.ZERO
var _hover_it = null             # item under the mouse
var _hover_slot := ""
var _m := Vector2.ZERO
var _btns: HBoxContainer
var pin = null                   # test: an item whose tooltip stays open
var mode := ""                   # "shop" while a trader's window is open (a click sells), "stash" beside the chest
var stash: Control               # the bottomless chest's panel, for shift-click

func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	_btns = HBoxContainer.new()
	_btns.add_theme_constant_override("separation", 8)
	for b in [["Sortieren", sort_bag], ["Schließen", close]]:
		var bt := Ui.button(b[0], b[1], 13)
		bt.custom_minimum_size = Vector2(0, 30)
		_btns.add_child(bt)
	add_child(_btns)

func place() -> void:
	var a := ui.area()
	cell = maxf(16, floorf(minf(48, (a.x / 2 - 60) / 10)))
	var w := cell * 10 + 48
	position = Vector2(a.x - 12 - w, 12)
	size = Vector2(w, a.y - 12 - 140)
	_eq_at = Vector2(24 + cell, 22 + 30 + 18 + 12)
	_grid_at = Vector2(24, _eq_at.y + cell * .8 * 7 + 12)
	_btns.reset_size()
	_btns.position = Vector2(size.x - 24 - _btns.size.x, 20)

func toggle() -> void:
	visible = not visible
	if visible:
		place()
	elif Game.hand:
		_return_hand()

func close() -> void:
	if visible:
		toggle()

func _process(_dt: float) -> void:
	ui.overlay.cell = cell
	if not visible:
		return
	_m = get_local_mouse_position()
	queue_redraw()
	var show: bool = pin != null or (Game.hand == null and _hover_it != null and Rect2(Vector2.ZERO, size).has_point(_m))
	if show:
		var it: Dictionary = pin if pin else _hover_it
		var at := _m
		if pin:
			at = _grid_at + Vector2(it.gx + .5, it.gy + .5) * cell
		var lines := Items.tip(it, "equipped" if Game.eq.values().has(it) else "")
		if mode == "shop" and not Game.eq.values().has(it):
			lines.append(["Klick: verkaufen für %d Glut" % Shop.sell_price(it), Ui.EMBER, "small"])
		elif mode == "stash" and not Game.eq.values().has(it):
			lines.append(["Shift+Klick: in die Truhe legen", Ui.PAPER_DIM, "small"])
		ui.overlay.tip(lines, at + position, Items.ground_pic(it) if it.slot == "rune" else null)

func _unhandled_key_input(ev: InputEvent) -> void:
	if Game.in_play and not get_tree().paused and ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode in [KEY_I, KEY_B]:
		toggle()
		get_viewport().set_input_as_handled()

## the item in the hand goes back into the bag, or to the ground if there is no room
func _return_hand() -> void:
	if Game.hand and not Items.inv_add(Game.hand):
		Game.drop_item.emit(Game.hand)
	Game.hand = null

## everything out and back in, the big pieces first (the browser's Sortieren)
func sort_bag() -> void:
	var all: Array = Game.inv.duplicate()
	all.sort_custom(func(a, b):
		var sa := Items.size(a)
		var sb := Items.size(b)
		if sa.x * sa.y != sb.x * sb.y:
			return sa.x * sa.y > sb.x * sb.y
		if a.slot != b.slot:
			return str(a.slot) < str(b.slot)
		return str(a.name) < str(b.name))
	Game.inv.clear()
	for it in all:
		if not Items.inv_add(it):
			Game.drop_item.emit(it)

func _has_point(p: Vector2) -> bool:
	return visible and Rect2(Vector2.ZERO, size).has_point(p)

func _fcell(p: Vector2) -> Vector2:
	return (p - _grid_at) / cell

func _in_grid(p: Vector2) -> bool:
	var c := _fcell(p)
	return c.x >= 0 and c.y >= 0 and c.x < Items.IW and c.y < Items.IH

func _slot_rect(e: Array) -> Rect2:
	var u := cell * .8
	return Rect2(_eq_at + Vector2((e[2] - 1) * u, (e[3] - 1) * u), Vector2(e[4] * u, e[5] * u)).grow(-2)

func _slot_at(p: Vector2) -> String:
	for e in _eq():
		if _slot_rect(e).has_point(p):
			return e[0]
	return ""

## where the item in the hand would land: centred under the pointer, kept inside (handTarget)
func _hand_target(p: Vector2) -> Rect2i:
	var sz := Items.size(Game.hand)
	var f := _fcell(p)
	return Rect2i(clampi(roundi(f.x - sz.x / 2.0), 0, Items.IW - sz.x), clampi(roundi(f.y - sz.y / 2.0), 0, Items.IH - sz.y), sz.x, sz.y)

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion:
		_hover_it = null
		_hover_slot = _slot_at(ev.position)
		if _hover_slot:
			_hover_it = Game.eq.get(_hover_slot)
		elif _in_grid(ev.position):
			var c := _fcell(ev.position).floor()
			var at := Items.inv_at(int(c.x), int(c.y), 1, 1)
			_hover_it = at[0] if at.size() else null
		return
	if not (ev is InputEventMouseButton and ev.pressed):
		return
	accept_event()
	var p: Vector2 = ev.position
	var slot := _slot_at(p)
	var in_grid := _in_grid(p)
	if ev.button_index == MOUSE_BUTTON_RIGHT:
		if Game.hand:
			return
		if slot:
			Game.unequip(slot)
		elif in_grid:
			var c := _fcell(p).floor()
			var at := Items.inv_at(int(c.x), int(c.y), 1, 1)
			if at.size():
				_use(at[0])
		_hover_it = null
		return
	if ev.button_index != MOUSE_BUTTON_LEFT:
		return
	if slot:
		_click_slot(slot)
	elif in_grid:
		_click_grid(p, ev.shift_pressed)

func _use(it: Dictionary) -> void:
	if it.slot == "potion":
		if level:
			level.drink(it)
	elif not it.slot in ["junk", "rune", "slate"]:
		Game.equip(it)

func _click_grid(p: Vector2, shift: bool) -> void:
	if Game.hand == null:
		var c := _fcell(p).floor()
		var at := Items.inv_at(int(c.x), int(c.y), 1, 1)
		if at.is_empty():
			return
		var it: Dictionary = at[0]
		if mode == "shop" and not shift:
			Shop.sell(it)
			_hover_it = null
			return
		Game.inv.erase(it)
		if shift and mode == "stash" and stash:
			stash.add(it)
		elif shift:
			Game.drop_item.emit(it)
		else:
			Game.hand = it
		_hover_it = null
		return
	# a rune in the hand goes into the socket of the item under the pointer (the gridClick wrapper in 350)
	if Game.hand.slot == "rune":
		var c := _fcell(p).floor()
		var under := Items.inv_at(int(c.x), int(c.y), 1, 1)
		if under.size() and Runes.try_hand(under[0]):
			return
	# put down where the ghost shows; one item in the way is swapped into the hand
	var it: Dictionary = Game.hand
	var t := _hand_target(p)
	var hit := Items.inv_at(t.position.x, t.position.y, t.size.x, t.size.y)
	if hit.size() > 1:
		Game.log_msg("Dort ist kein Platz.", Ui.PAPER_DIM)
		return
	# junk on a stack of its kind joins it
	if hit.size() == 1 and it.slot == "junk" and hit[0].slot == "junk" and hit[0].jk == it.jk:
		Game.hand = null
		Items.inv_add(it)
		return
	it.gx = t.position.x
	it.gy = t.position.y
	Game.inv.append(it)
	Game.hand = null
	if hit.size() == 1:
		Game.inv.erase(hit[0])
		Game.hand = hit[0]

func _click_slot(slot: String) -> void:
	if Game.hand == null:
		var cur = Game.eq.get(slot)
		if cur:
			Game.eq.erase(slot)
			Game.hand = cur
			Game._gear()
		return
	if Game.hand.slot == "rune":
		if Game.eq.get(slot):
			Runes.try_hand(Game.eq[slot])
		else:
			Game.log_msg("Leg die Rune auf einen Gegenstand mit freiem Sockel.", Ui.PAPER_DIM)
		return
	var it: Dictionary = Game.hand
	var want: String = it.slot
	if not (slot == want or (want == "ring" and slot.begins_with("ring"))):
		return
	if not Items.can_use(it):
		Game.log_msg("Anforderungen nicht erfüllt.", Ui.BAD)
		return
	Game.hand = null
	var prev = Game.eq.get(slot)
	Game.inv.append(it)                # equip() takes it out of the bag again
	if prev:
		Game.eq.erase(slot)
	Game.equip_to(it, slot)
	if prev:
		Game.hand = prev

# ---------- drawing ----------

const R_BG := {"magic": [Color("#18223c"), Color("#070a14")], "rare": [Color("#2e2810"), Color("#0c0a04")], "unique": [Color("#36200c"), Color("#0e0804")]}
const R_TINT := {"magic": Color(40 / 255.0, 70 / 255.0, 160 / 255.0, .28), "rare": Color(160 / 255.0, 140 / 255.0, 30 / 255.0, .25), "unique": Color(180 / 255.0, 100 / 255.0, 20 / 255.0, .3)}

func _draw() -> void:
	if visible:
		_panel()

func _panel() -> void:
	draw_style_box(Ui.plate_box(Vector4(8, 6, 8, 6)), Rect2(Vector2.ZERO, size))
	Ui.draw_heading(self, Rect2(24, 22, size.x - 48, 48), "Inventar")
	# the sockets of what is worn
	var hand_ok := func(k: String) -> bool:
		return Game.hand != null and (Game.hand.slot == k or (Game.hand.slot == "ring" and k.begins_with("ring")))
	for e in _eq():
		var r := _slot_rect(e)
		var it = Game.eq.get(e[0])
		var cols: Array = R_BG.get(it.rar, [Color("#1a1410"), Color("#060403")]) if it else [Color("#1a1410"), Color("#060403")]
		_radial(r.grow(-4), cols[0], cols[1])
		if hand_ok.call(e[0]):
			draw_rect(r.grow(-4), Color(108 / 255.0, 188 / 255.0, 32 / 255.0, .18))
		if it:
			if not Items.can_use(it):
				draw_rect(r.grow(-4), Color(1, .24, .16, .5), false, 2)
			_icon(it, r.grow(-6), true)
		elif e[0] == "offhand" and Game.eq.get("weapon") and Game.eq.weapon.get("twoH"):
			_icon(Game.eq.weapon, r.grow(-6), true, Color(.6, .6, .6, .42))
			_label(r, "Zweihändig")
		else:
			_label(r, e[1])
		var hot: bool = r.has_point(_m) or hand_ok.call(e[0])
		draw_style_box(Ui.box("sockg" if hot else "sock", 4, 0, false), r)
	# the grid
	for y in Items.IH:
		for x in Items.IW:
			var r := Rect2(_grid_at + Vector2(x, y) * cell, Vector2(cell, cell))
			draw_rect(r.grow(-4), Color("#0a0806"))
			draw_style_box(Ui.box("sock", 4, 0, false), r)
	for it in Game.inv:
		var sz := Items.size(it)
		var r := Rect2(_grid_at + Vector2(it.gx, it.gy) * cell, Vector2(sz.x, sz.y) * cell)
		if it.slot != "potion" and it.slot != "junk" and not Items.can_use(it):
			draw_rect(r, Color(160 / 255.0, 20 / 255.0, 10 / 255.0, .35))
		elif R_TINT.has(it.rar):
			draw_rect(r, R_TINT[it.rar])
		_icon(it, r)
		if it.get("n", 1) > 1:
			var f := Ui.font("sc")
			Ui.shadow_text(self, f, Vector2(r.position.x, r.end.y - 4), str(it.n), 12, Color("#f4e6c4"), HORIZONTAL_ALIGNMENT_RIGHT, r.size.x - 4)
		if it == _hover_it:
			draw_rect(r.grow(-1), Color("#c8962a"), false, 2)
	# where the hand would land
	if Game.hand and _in_grid(_m):
		var t := _hand_target(_m)
		var r := Rect2(_grid_at + Vector2(t.position) * cell, Vector2(t.size) * cell)
		var bad := Items.inv_at(t.position.x, t.position.y, t.size.x, t.size.y).size() > 1
		draw_rect(r, Color(196 / 255.0, 42 / 255.0, 28 / 255.0, .25) if bad else Color(108 / 255.0, 188 / 255.0, 32 / 255.0, .22))
		draw_rect(r.grow(-1), Color(1, .42, .31, .7) if bad else Color(200 / 255.0, 248 / 255.0, 120 / 255.0, .6), false, 2)
	# glut and the hint
	var y := _grid_at.y + Items.IH * cell + 12 + 14
	var body := Ui.font("body")
	Ui.shadow_text(self, body, Vector2(24, y), "Glut", 14, Ui.EMBER)
	Ui.shadow_text(self, Ui.font("sc"), Vector2(24, y), str(Game.glut), 14, Ui.EMBER, HORIZONTAL_ALIGNMENT_RIGHT, size.x - 48)
	y += 12
	var it_f := Ui.font("italic")
	var hint := ("Klick: verkaufen" if mode == "shop" else ("Klick: Rune in einen Sockel setzen" if Game.hand and Game.hand.slot == "rune" else "Klick: aufnehmen und ablegen")) + " · Rechtsklick: anlegen oder trinken · Shift+Klick: " + ("in die Truhe" if mode == "stash" else "fallen lassen")
	if Game.eq.has("mount"):
		hint += " · H: " + ("absitzen" if RgPlay.riding() else "aufsitzen")
	for l in Ui.wrap_text(it_f, hint, size.x - 48, 13):
		y += 17
		Ui.shadow_text(self, it_f, Vector2(24, y), l, 13, Ui.PAPER_DIM)

static var _grads := {}

## radial-gradient(circle at 40% 35%, a, b): a small gradient texture, made once per pair of colours
func _radial(r: Rect2, a: Color, b: Color) -> void:
	var k := a.to_html() + b.to_html()
	if not _grads.has(k):
		var g := Gradient.new()
		g.set_color(0, a)
		g.set_color(1, b)
		var t := GradientTexture2D.new()
		t.gradient = g
		t.fill = GradientTexture2D.FILL_RADIAL
		t.fill_from = Vector2(.4, .35)
		t.fill_to = Vector2(1.1, 1.05)
		t.width = 64
		t.height = 64
		_grads[k] = t
	draw_texture_rect(_grads[k], r, false)

func _label(r: Rect2, t: String) -> void:
	var f := Ui.font("sc")
	if f.get_string_size(t, HORIZONTAL_ALIGNMENT_LEFT, -1, 10).x < r.size.x - 4:
		draw_string(f, Vector2(r.position.x, r.end.y - 6), t, HORIZONTAL_ALIGNMENT_CENTER, r.size.x, 10, Color("#5a4a34"))

## in a slot the picture keeps its shape and fits; in the grid it fills its cells
func _icon(it: Dictionary, r: Rect2, fit := false, mod := Color.WHITE) -> void:
	var tex := Items.icon(it)
	if tex == null:
		return
	if fit:
		var ts := tex.get_size()
		var k := minf(r.size.x / ts.x, r.size.y / ts.y)
		k = floorf(k) if k >= 1 else k
		var s := ts * k
		draw_texture_rect(tex, Rect2((r.get_center() - s / 2).floor(), s), false, mod)
		Runes.draw_socks(self, it, Rect2((r.get_center() - s / 2).floor(), s), s.x / Items.size(it).x)
	else:
		draw_texture_rect(tex, r, false, mod)
		Runes.draw_socks(self, it, r, cell)
