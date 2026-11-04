extends Node
## The screen (autoload `Screen`): the game keeps the browser's pixel grid of about 430 rows, whatever the monitor.
## Every game pixel becomes a whole block of k×k screen pixels, k chosen so the picture stays close to 430 rows high;
## a wider screen (21:9) shows more to the sides instead of shrinking or stretching anything. Nothing is ever blurred
## or drawn with uneven pixels. F11 or Alt+Enter toggles full screen, Ctrl+Plus/Minus makes the pixels bigger or smaller
## (Ctrl+0 back to the default); on a Mac also Cmd+Ctrl+F or Cmd+Enter; both are kept in user://screen.cfg.
## Test (after --): --screen=3440x1440 pretends to be such a monitor (the window gets the size of one game picture).

const ROWS := 430.0                # the browser's picture height, the size everything was drawn for
const MIN_ROWS := 300              # never fewer rows than this (bigger pixels), never narrower than MIN_COLS
const MIN_COLS := 520
const CFG := "user://screen.cfg"

var zoom := 0                      # steps away from the default k: +1 bigger pixels, -1 smaller
var fake := Vector2i.ZERO          # --screen: the monitor we pretend to have
var k := 1                         # screen pixels per game pixel, now
signal resized                     # the game picture changed size (the world's SubViewport follows)

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var root := get_tree().root
	# the root draws at full resolution (sharp text and panels); the world itself is drawn in its own SubViewport
	# at the game picture's size and blown up pixel for pixel (tower.gd, world_vp)
	root.content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
	root.content_scale_aspect = Window.CONTENT_SCALE_ASPECT_EXPAND
	root.content_scale_stretch = Window.CONTENT_SCALE_STRETCH_INTEGER
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--screen="):
			var p: PackedStringArray = a.substr(9).split("x")
			fake = Vector2i(int(p[0]), int(p[1]))
	var cf := ConfigFile.new()
	if fake == Vector2i.ZERO and cf.load(CFG) == OK:
		zoom = cf.get_value("screen", "zoom", 0)
		if cf.get_value("screen", "full", false):
			DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
	root.size_changed.connect(_fit)
	_fit()

## the whole number of screen pixels per game pixel that keeps the picture nearest 430 rows, moved by zoom
func scale_for(sz: Vector2i) -> int:
	var best := maxi(1, roundi(sz.y / ROWS))
	var most := maxi(1, mini(sz.y / MIN_ROWS, sz.x / MIN_COLS))
	return clampi(best + zoom, 1, maxi(most, 1))

func _fit() -> void:
	var root := get_tree().root
	var sz := fake if fake != Vector2i.ZERO else get_tree().root.size
	if sz.x <= 0 or sz.y <= 0:
		return
	k = scale_for(sz)
	var game := Vector2i(sz.x / k, sz.y / k)
	if fake != Vector2i.ZERO:
		# a pretend monitor: the window shows exactly one game picture, one to one
		if DisplayServer.window_get_size() != game:
			DisplayServer.window_set_size(game)
		root.content_scale_size = game
		resized.emit()
		return
	if root.content_scale_size != game:
		root.content_scale_size = game
		resized.emit()
		print("Bildschirm: Fenster %s → Spielbild %s, Pixel ×%d" % [sz, game, k])

func _input(ev: InputEvent) -> void:
	if not (ev is InputEventKey and ev.pressed and not ev.echo):
		return
	var kc: Key = ev.keycode
	# F11 is "show desktop" on a Mac, so there also Cmd+Ctrl+F (the Mac's own) and Cmd+Enter
	if kc == KEY_F11 or (kc == KEY_ENTER and (ev.alt_pressed or ev.meta_pressed)) or (kc == KEY_F and ev.meta_pressed and ev.ctrl_pressed):
		var full := DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN
		DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED if full else DisplayServer.WINDOW_MODE_FULLSCREEN)
	elif ev.is_command_or_control_pressed() and (kc == KEY_EQUAL or kc == KEY_PLUS or kc == KEY_KP_ADD):
		zoom += 1
	elif ev.is_command_or_control_pressed() and (kc == KEY_MINUS or kc == KEY_KP_SUBTRACT):
		zoom -= 1
	elif ev.is_command_or_control_pressed() and (kc == KEY_0 or kc == KEY_KP_0):
		zoom = 0
	else:
		return
	get_viewport().set_input_as_handled()
	_zoomed()

## one step bigger (+1) or smaller (-1) pixels, from the settings
func step_zoom(d: int) -> void:
	zoom += d
	_zoomed()

func _zoomed() -> void:
	# keep zoom within what this screen allows
	var sz := get_tree().root.size
	var base := maxi(1, roundi(sz.y / ROWS))
	zoom = clampi(zoom, 1 - base, maxi(1, mini(sz.y / MIN_ROWS, sz.x / MIN_COLS)) - base)
	_fit()
	_save()
	var full_now := DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN
	if Game.has_signal("message"):
		var g := get_tree().root.content_scale_size
		Game.message.emit("Bild %d×%d · Pixel ×%d%s" % [g.x, g.y, k, " · Vollbild" if full_now else ""], Color("#a39b88"))

func _save() -> void:
	if fake != Vector2i.ZERO:
		return
	var cf := ConfigFile.new()
	cf.set_value("screen", "zoom", zoom)
	cf.set_value("screen", "full", DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN)
	cf.save(CFG)
