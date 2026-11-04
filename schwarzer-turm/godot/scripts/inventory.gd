class_name Inventory
extends Control
## The bag and what the hero wears (pInv in 260-ui.js): equipment slots above, the 10×5 grid below, 24 pixels a cell.
## Left click takes an item into the hand and puts it down again (swapping with one item in the way), on a slot it is worn;
## right click wears or drinks it, on a slot takes it off; shift-click drops it. I or B opens and closes it.
## Painted like the HUD; the item under the mouse gets its tooltip.

const C := 24                    # cell size
const PW := 262
const PH := 334
const SLOTS := {                 # slot → [x, y, w, h] in panel pixels and cells
	"helm": [107, 24, 2, 2], "amulet": [161, 24, 1, 1], "weapon": [18, 40, 2, 4], "armor": [107, 76, 2, 3],
	"offhand": [196, 40, 2, 4], "gloves": [18, 140, 2, 2], "ring1": [77, 112, 1, 1], "ring2": [161, 112, 1, 1],
	"belt": [107, 152, 2, 1], "boots": [196, 140, 2, 2],
}
const GX := 11
const GY := 196

var level: Level
var _hover_it = null             # item under the mouse
var _hover_slot := ""

func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	size = Vector2(PW, PH)

func _process(_dt: float) -> void:
	var vs := get_viewport_rect().size
	position = Vector2(vs.x - PW - 8, 22)
	if visible or Game.hand:
		queue_redraw()

func _unhandled_key_input(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode in [KEY_I, KEY_B]:
		visible = not visible
		if not visible and Game.hand:
			_return_hand()
		get_viewport().set_input_as_handled()

## the item in the hand goes back into the bag, or to the ground if there is no room
func _return_hand() -> void:
	if Game.hand and not Items.inv_add(Game.hand):
		Game.drop_item.emit(Game.hand)
	Game.hand = null

func _has_point(p: Vector2) -> bool:
	return visible and Rect2(Vector2.ZERO, size).has_point(p)

func _cell(p: Vector2) -> Vector2i:
	return Vector2i(floori((p.x - GX) / C), floori((p.y - GY) / C))

func _slot_at(p: Vector2) -> String:
	for k in SLOTS:
		var s: Array = SLOTS[k]
		if Rect2(s[0], s[1], s[2] * C, s[3] * C).has_point(p):
			return k
	return ""

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion:
		_hover_it = null
		_hover_slot = _slot_at(ev.position)
		if _hover_slot:
			_hover_it = Game.eq.get(_hover_slot)
		else:
			var c := _cell(ev.position)
			var at := Items.inv_at(c.x, c.y, 1, 1)
			_hover_it = at[0] if at.size() else null
		return
	if not (ev is InputEventMouseButton and ev.pressed):
		return
	accept_event()
	var p: Vector2 = ev.position
	var slot := _slot_at(p)
	var c := _cell(p)
	var in_grid := c.x >= 0 and c.y >= 0 and c.x < Items.IW and c.y < Items.IH
	if ev.button_index == MOUSE_BUTTON_RIGHT:
		if Game.hand:
			return
		if slot:
			Game.unequip(slot)
		elif in_grid:
			var at := Items.inv_at(c.x, c.y, 1, 1)
			if at.size():
				_use(at[0])
		_hover_it = null
		return
	if ev.button_index != MOUSE_BUTTON_LEFT:
		return
	if slot:
		_click_slot(slot)
	elif in_grid:
		_click_grid(c, ev.shift_pressed)

func _use(it: Dictionary) -> void:
	if it.slot == "potion":
		if level:
			level.drink(it)
	elif it.slot != "junk":
		Game.equip(it)

func _click_grid(c: Vector2i, shift: bool) -> void:
	var at := Items.inv_at(c.x, c.y, 1, 1)
	if Game.hand == null:
		if at.is_empty():
			return
		var it: Dictionary = at[0]
		Game.inv.erase(it)
		if shift:
			Game.drop_item.emit(it)
		else:
			Game.hand = it
		_hover_it = null
		return
	# put down where the hand is, the item's top left cell under the pointer; one item in the way is swapped into the hand
	var it: Dictionary = Game.hand
	var sz := Items.size(it)
	var x := clampi(c.x, 0, Items.IW - sz.x)
	var y := clampi(c.y, 0, Items.IH - sz.y)
	var hit := Items.inv_at(x, y, sz.x, sz.y)
	if hit.size() > 1:
		return
	# junk on a stack of its kind joins it
	if hit.size() == 1 and it.slot == "junk" and hit[0].slot == "junk" and hit[0].jk == it.jk:
		Game.hand = null
		Items.inv_add(it)
		return
	it.gx = x
	it.gy = y
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
	var it: Dictionary = Game.hand
	var want: String = it.slot
	if not (slot == want or (want == "ring" and slot.begins_with("ring"))):
		return
	if not Items.can_use(it):
		Game.log_msg("Anforderungen nicht erfüllt.", Color("#ff5a4a"))
		return
	Game.hand = null
	var prev = Game.eq.get(slot)
	Game.inv.append(it)                # equip() takes it out of the bag again
	if prev:
		Game.eq.erase(slot)
	Game.equip_to(it, slot)
	if prev:
		Game.hand = prev

func _draw() -> void:
	var font := ThemeDB.fallback_font
	if visible:
		draw_rect(Rect2(Vector2.ZERO, size), Color(6 / 255.0, 5 / 255.0, 4 / 255.0, .94))
		draw_rect(Rect2(Vector2.ZERO, size), Color("#5a4a30"), false, 2)
		_text(Vector2(10, 16), "Inventar", 14, Color("#e8c878"))
		var g := "%d Glut" % Game.glut
		_text(Vector2(PW - 10 - font.get_string_size(g, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x, 16), g, 11, Color("#ff9a3a"))
		for k in SLOTS:
			var s: Array = SLOTS[k]
			var r := Rect2(s[0], s[1], s[2] * C, s[3] * C)
			var it = Game.eq.get(k)
			var ok: bool = Game.hand != null and (Game.hand.slot == k or (Game.hand.slot == "ring" and k.begins_with("ring")))
			draw_rect(r, Color(1, 1, 1, .04) if not ok else Color(.5, .8, .4, .14))
			draw_rect(r, Color("#3a3226"), false, 1)
			if it:
				_item_bg(r, it)
				_icon(it, r, true)
			elif not ok:
				var lbl: String = Items.SLOTNAME.get(k.trim_suffix("1").trim_suffix("2"), k)
				var tw := font.get_string_size(lbl, HORIZONTAL_ALIGNMENT_LEFT, -1, 8).x
				if tw < r.size.x + 4:
					draw_string(font, r.get_center() + Vector2(-tw / 2, 3), lbl, HORIZONTAL_ALIGNMENT_LEFT, -1, 8, Color(1, 1, 1, .18))
		var d := Game.d
		_text(Vector2(10, 190), "Schaden %d–%d · Verteidigung %d · Leben %d" % [d.dmin, d.dmax, d.def, d.life], 10, Color("#a39b88"))
		for y in Items.IH:
			for x in Items.IW:
				draw_rect(Rect2(GX + x * C, GY + y * C, C, C), Color(1, 1, 1, .03))
				draw_rect(Rect2(GX + x * C, GY + y * C, C, C), Color("#2a241c"), false, 1)
		for it in Game.inv:
			var sz := Items.size(it)
			var r := Rect2(GX + it.gx * C, GY + it.gy * C, sz.x * C, sz.y * C)
			_item_bg(r, it)
			_icon(it, r)
			if it.get("n", 1) > 1:
				_text(r.position + Vector2(r.size.x - 3 - font.get_string_size(str(it.n), HORIZONTAL_ALIGNMENT_LEFT, -1, 9).x, r.size.y - 2), str(it.n), 9, Color("#ece4cf"))
		_text(Vector2(10, PH - 6), "Rechtsklick: anlegen / trinken · Shift-Klick: fallen lassen", 9, Color("#6a6254"))
	# the hand follows the mouse
	var mp := get_local_mouse_position()
	if Game.hand:
		var sz := Items.size(Game.hand)
		_icon(Game.hand, Rect2(mp - Vector2(sz.x * C, sz.y * C) * .5, Vector2(sz.x * C, sz.y * C)))
	elif visible and _hover_it:
		_tooltip(_hover_it, mp)

func _item_bg(r: Rect2, it: Dictionary) -> void:
	var col: Color = Items.RCOL.get(it.rar, Items.RCOL.normal)
	if it.rar != "normal":
		draw_rect(r.grow(-1), Color(col, .12))
	if it.slot != "potion" and it.slot != "junk" and not Items.can_use(it):
		draw_rect(r.grow(-1), Color(.8, .1, .1, .25))

## in a slot the picture keeps its own size, centred; in the grid it fills its cells
func _icon(it: Dictionary, r: Rect2, centred := false) -> void:
	var tex := Items.icon(it)
	if tex == null:
		return
	if centred:
		draw_texture(tex, (r.get_center() - tex.get_size() / 2).floor())
	else:
		draw_texture_rect(tex, r, false)

func _tooltip(it: Dictionary, at: Vector2) -> void:
	var font := ThemeDB.fallback_font
	var lines := Items.tip(it, "equipped" if Game.eq.values().has(it) else "")
	var w := 0.0
	for l in lines:
		w = maxf(w, font.get_string_size(l[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x)
	w += 16
	var h := lines.size() * 14 + 10
	# to the left of the panel, at the height of the mouse
	var p := Vector2(-w - 6, clampf(at.y - h / 2, -position.y + 4, get_viewport_rect().size.y - position.y - h - 4))
	draw_rect(Rect2(p, Vector2(w, h)), Color(6 / 255.0, 5 / 255.0, 4 / 255.0, .96))
	draw_rect(Rect2(p, Vector2(w, h)), Color("#5a4a30"), false, 1.5)
	var y := p.y + 16
	for l in lines:
		var tw := font.get_string_size(l[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
		draw_string(font, Vector2(p.x + (w - tw) / 2, y), l[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, l[1])
		y += 14

func _text(at: Vector2, s: String, sz: int, col: Color) -> void:
	var font := ThemeDB.fallback_font
	draw_string_outline(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, 3, Color(0, 0, 0, .85))
	draw_string(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, col)
