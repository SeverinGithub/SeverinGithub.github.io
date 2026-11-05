class_name UiLayer
extends CanvasLayer
## The layer every window lives on: title, menus, dialogs, panels. Drawn at the screen's own resolution, so text and
## frames are sharp; one unit here is about one CSS pixel of the browser (s screen pixels: 1 up to 1080 rows,
## 1.5 at 1440, 2 at 2160), whatever size the world's pixels have. `root` is a full-screen Control in those units.
## Modal windows (menu, dialog) sit over a dark wash that closes them on a click outside.

var root: Control
var s := 1.0
var modal: Control = null        # the open menu or dialog
var _wash: ColorRect
var on_close := Callable()       # what a click on the wash or Esc does with the modal
var overlay: Overlay             # the item in the hand and the tooltip, above every panel

func _ready() -> void:
	layer = 20
	root = Control.new()
	root.theme = Ui.theme()
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(root)
	_wash = ColorRect.new()
	_wash.color = Color(0, 0, 0, .55)
	_wash.set_anchors_preset(Control.PRESET_FULL_RECT)
	_wash.visible = false
	_wash.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and ev.pressed and on_close.is_valid():
			on_close.call())
	root.add_child(_wash)
	overlay = Overlay.new()
	overlay.ui = self
	root.add_child(overlay)
	Screen.resized.connect(fit)
	get_tree().root.size_changed.connect(fit)
	fit()

func fit() -> void:
	var win := Vector2(get_tree().root.size)
	var g := Vector2(get_tree().root.content_scale_size)
	if g.x <= 0:
		g = win
	var k := win.y / g.y
	s = maxf(1.0, roundf(win.y / 1000.0 * 2) / 2)
	var f := s / k
	transform = Transform2D.IDENTITY.scaled(Vector2(f, f))
	root.size = g / f
	root.position = Vector2.ZERO

## a panel goes under the wash and the overlay, above what is there already
func add_panel(c: Control) -> void:
	root.add_child(c)
	root.move_child(c, _wash.get_index())

## the size of the screen in UI units
func area() -> Vector2:
	return root.size

## show a window over a dark wash, centred; close_cb runs on Esc or a click beside it
func open_modal(c: Control, close_cb := Callable(), wash := true) -> void:
	close_modal()
	modal = c
	on_close = close_cb
	_wash.visible = wash
	_wash.mouse_filter = Control.MOUSE_FILTER_STOP if wash else Control.MOUSE_FILTER_IGNORE
	root.add_child(c)
	center(c)
	# wrapped text knows its height only once it has its width: shrink to fit again after the first layout
	c.minimum_size_changed.connect(func(): center.call_deferred(c))
	center.call_deferred(c)

func center(c: Control) -> void:
	if not is_instance_valid(c):
		return
	c.reset_size()
	c.position = ((area() - c.size) / 2).round()

func close_modal() -> void:
	if modal:
		modal.queue_free()
	modal = null
	on_close = Callable()
	_wash.visible = false

## Over all panels: the item held on the mouse (#hand, with its drop shadow) at the size of the bag's cells, and the
## tooltip a panel asked for this frame (tip(), Ui.draw_tip).
class Overlay extends Control:
	var ui: UiLayer
	var cell := 48.0
	var _tip := []
	var _tip_at := Vector2.ZERO
	var _tip_pic: Texture2D = null
	var _tip_f := -9
	func _ready() -> void:
		set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		mouse_filter = Control.MOUSE_FILTER_IGNORE
	## show these lines beside at (in UI units) this frame
	func tip(lines: Array, at: Vector2, pic: Texture2D = null) -> void:
		_tip = lines
		_tip_at = at
		_tip_pic = pic
		_tip_f = Engine.get_process_frames()
	func _process(_dt: float) -> void:
		queue_redraw()
	func _draw() -> void:
		if ui.modal:
			return
		var m := get_local_mouse_position()
		if Game.hand:
			var sz := Items.size(Game.hand)
			var hs := Vector2(sz.x, sz.y) * cell
			var r := Rect2(m - hs / 2, hs)
			var tex := Items.icon(Game.hand)
			if tex:
				draw_texture_rect(tex, Rect2(r.position + Vector2(0, 6), r.size), false, Color(0, 0, 0, .55))
				draw_texture_rect(tex, r, false)
				Runes.draw_socks(self, Game.hand, r, cell)
		elif _tip.size() and Engine.get_process_frames() - _tip_f <= 1:
			Ui.draw_tip(self, _tip_at, _tip, Rect2(Vector2.ZERO, size), _tip_pic)
