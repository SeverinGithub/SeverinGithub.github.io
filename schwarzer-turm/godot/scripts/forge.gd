class_name Forge
extends Control
## Brannoc's forge (openForge, forgeFrame in 450-smith.js): he talks to you, word by word; on the left what you carry
## that can be forged, worn first; on the right a big anvil. Click or drag a piece onto it, strike, and the hammer
## winds up, falls hard and bounces: at the moment it lands you pay, the piece goes up a step (+8 % damage or defence,
## +3 % spell power on a staff), sparks fly, the window shakes and a +N rises. Up to +5 grave slate is enough, from +6
## it wants ember slate. Walking off closes it, like Esc.

const SAY := {
	"open": ["Na, da bist du ja. Leg mir auf den Amboss, was besser werden soll.", "Komm her. Zeig mir, was du an Stahl mit dir rumschleppst.", "Die Esse ist heiß. Was soll ich dir schmieden?", "Du riechst nach Gräbern. Gut. Dann hast du hoffentlich Schiefer dabei."],
	"empty": "Du trägst nichts, was ich schmieden könnte. Komm wieder, wenn du Stahl am Leib hast.",
	"ember": "Ab hier frisst das Eisen Glutschiefer. Ohne den kann ich dir nicht helfen.",
	"max": "Mehr geht nicht. Das ist ein Meisterstück. Ich bin stolz auf uns beide.",
	"first": "Ich war Waffenmeister der Turmwache, bevor die Brücken fielen. Jetzt hau ich auf Eisen, bis es mir gehorcht. Leg was auf den Amboss."}

const W := 600.0
const H := 380.0
const AS := 1.25                 # the anvil scene is 220 × 150, drawn this much bigger
const TILE := 46.0

var ui: UiLayer
var host                         # tower.gd
var it = null                    # the piece on the anvil
var _say := ""
var _shown := 0.0
var _anim := 0.0                 # the hammer's stroke, 0 when it rests
var _hit := false
var _parts: Array = []
var _pop = null                  # {t, txt}
var _shake := 0.0
var _at := Vector2.ZERO          # where the hero stood when it opened
var _m := Vector2.ZERO
var _hover = null
var _drag = null                 # {it, from, moved}
var _go: Button
var _close: Button
var _anv := Rect2()              # the anvil scene, in the panel
var _list := Rect2()

func _ready() -> void:
	visible = false
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")
	_go = Ui.button("Schmieden", strike, 16)
	add_child(_go)
	_close = Ui.button("✕", func(): visible = false, 14)
	_close.custom_minimum_size = Vector2(34, 32)
	add_child(_close)

func open() -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	host.inv_panel.close()
	var a := ui.area()
	size = Vector2(W, H)
	position = ((a - size) / 2).floor()
	_close.reset_size()
	_close.position = Vector2(W - 20 - _close.size.x, 18)
	_list = Rect2(20, 96, 250, 200)
	_anv = Rect2(300, 92, 220 * AS, 150 * AS)
	_go.custom_minimum_size = Vector2(220, 36)
	_go.reset_size()
	_go.position = Vector2(_anv.get_center().x - _go.size.x / 2, H - 20 - _go.size.y)
	_at = Vector2(host.level.P.x, host.level.P.y)
	_anim = 0
	_parts.clear()
	_pop = null
	if it and not Runes.forge_items().has(it):
		it = null
	var its := Runes.forge_items()
	say(SAY.first if not Game.smith_met else (SAY.empty if its.is_empty() else SAY.open.pick_random()))
	Game.smith_met = 1
	visible = true
	_info()

func say(t: String) -> void:
	_say = t
	_shown = 0

func _pick_line(x: Dictionary) -> String:
	return [x.name + ". Gutes Stück. Daraus mach ich dir mehr.", x.name + ", hm? Das kriegen wir besser hin.", "Leg " + x.name + " schön flach hin. So. Jetzt schau zu."].pick_random()

func _done_line(x: Dictionary) -> String:
	return ["Hörst du das? So klingt guter Stahl. +%d." % x.up, "Da hast du's. +%d. Pass besser drauf auf als auf den letzten." % x.up, "+%d. Fühl mal, wie's jetzt in der Hand liegt." % x.up, "Noch warm. +%d. Geh und zeig's den Toten." % x.up].pick_random()

func place_on_anvil(x: Dictionary) -> void:
	if _anim > 0 or not Runes.forge_items().has(x):
		return
	it = x
	say(SAY.max if x.get("up", 0) >= Runes.UPMAX else _pick_line(x))
	_info()

func strike() -> void:
	if it == null or _anim > 0 or it.get("up", 0) >= Runes.UPMAX:
		return
	var why := Runes.can_pay(it)
	if why != "":
		var n := int(why.split(":")[1])
		match why.split(":")[0]:
			"gl": say("Glut, Wanderer. Mir fehlen noch %d Glut. Auch ein Schmied muss essen." % n)
			"g": say("Dir fehlt Grabschiefer. Bring mir noch %d, dann schlag ich zu." % n)
			"e": say(SAY.ember if Game.slate_e <= 0 else "Dir fehlt Glutschiefer. Noch %d Stück, und das Eisen gehorcht." % n)
		return
	_anim = .001
	_hit = false
	_go.disabled = true

## the moment the hammer lands
func _impact() -> void:
	Runes.forge(it)
	for k in 46:
		var a := -PI * randf_range(.05, .95)
		var v := randf_range(40, 160)
		_parts.append({"x": 110.0, "y": 58.0, "vx": cos(a) * v, "vy": sin(a) * v, "l": randf_range(.4, .9), "t": 0.0, "c": Color(["#ffffff", "#fff4d0", "#ffc070", "#ff7a1a"].pick_random())})
	_pop = {"t": 0.0, "txt": "+%d" % it.up}
	_shake = .35
	if host.level:
		host.level.forge_spark()
	host.save_game()
	say(SAY.max if it.up >= Runes.UPMAX else _done_line(it))

func _info() -> void:
	var mx: bool = it != null and it.get("up", 0) >= Runes.UPMAX
	_go.disabled = it == null or mx or _anim > 0
	_go.text = "Schmieden" if it == null else ("Meisterstück" if mx else "Schmieden auf +%d" % (it.get("up", 0) + 1))

# ---------- input ----------

func _tile_rect(i: int) -> Rect2:
	var c := int(_list.size.x / (TILE + 4))
	return Rect2(_list.position + Vector2((i % c) * (TILE + 4), (i / c) * (TILE + 4)), Vector2(TILE, TILE))

func _tile_at(p: Vector2):
	var its := Runes.forge_items()
	for i in its.size():
		if _tile_rect(i).has_point(p):
			return its[i]
	return null

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion:
		_hover = _tile_at(ev.position)
		if _drag and ev.position.distance_to(_drag.from) > 6:
			_drag.moved = true
		return
	if ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_LEFT:
		accept_event()
		if ev.pressed:
			var t = _tile_at(ev.position)
			if t:
				_drag = {"it": t, "from": ev.position, "moved": false}
			elif _anv.has_point(ev.position) and it:
				strike()
		elif _drag:
			var d = _drag
			_drag = null
			if not d.moved or _anv.grow(10).has_point(ev.position):
				place_on_anvil(d.it)

func _has_point(p: Vector2) -> bool:
	return visible and Rect2(Vector2.ZERO, size).has_point(p)

# ---------- every frame ----------

func _process(dt: float) -> void:
	if not visible:
		return
	dt = minf(dt, .05)
	var L = host.level
	if not Game.in_play or L == null or Vector2(L.P.x, L.P.y).distance_to(_at) > .6:
		visible = false
		return
	_m = get_local_mouse_position()
	if _shown < _say.length():
		_shown = minf(_say.length(), _shown + dt * 80)
	if _anim > 0:
		_anim += dt
		if _anim >= .47 and not _hit:
			_hit = true
			_impact()
		if _anim >= 1.1:
			_anim = 0
			_info()
	for p in _parts:
		p.t += dt
		p.x += p.vx * dt
		p.y += p.vy * dt
		p.vy += 260 * dt
	_parts = _parts.filter(func(p): return p.t < p.l)
	if _pop:
		_pop.t += dt
		if _pop.t > 1.3:
			_pop = null
	_shake = maxf(0, _shake - dt)
	var s := _shake * 14
	pivot_offset = Vector2.ZERO
	position = ((ui.area() - size) / 2).floor() + (Vector2(randf_range(-s, s), randf_range(-s, s)) if s > 0 else Vector2.ZERO)
	queue_redraw()
	if _hover and _drag == null:
		ui.overlay.tip(Items.tip(_hover, "equipped" if Game.eq.values().has(_hover) else ""), _m + position)

# ---------- drawing ----------

func _draw() -> void:
	draw_style_box(Ui.plate_box(Vector4(8, 6, 8, 6)), Rect2(Vector2.ZERO, size))
	_portrait(Vector2(20, 20), 2)
	var hf := Ui.font("display")
	Ui.shadow_text(self, hf, Vector2(80, 40), "Brannoc", 24, Ui.HEAD)
	var it_f := Ui.font("italic")
	var y := 58.0
	for l in Ui.wrap_text(it_f, _say.substr(0, int(_shown)), W - 80 - 70, 15):
		Ui.shadow_text(self, it_f, Vector2(80, y), l, 15, Ui.PAPER)
		y += 18
	# the list
	Ui.shadow_text(self, Ui.font("sc"), Vector2(_list.position.x, _list.position.y - 8), "Deine Ausrüstung", 14, Ui.HEAD)
	var its := Runes.forge_items()
	var worn := Game.eq.values()
	for i in its.size():
		var x: Dictionary = its[i]
		var r := _tile_rect(i)
		if not _list.grow(2).encloses(r):
			break
		draw_rect(r.grow(-3), Color("#0a0806"))
		if Inventory.R_TINT.has(x.rar):
			draw_rect(r.grow(-3), Inventory.R_TINT[x.rar])
		var tex := Items.ground_pic(x)
		if tex:
			draw_texture_rect(tex, Rect2(r.get_center() - tex.get_size() / 2, tex.get_size()).abs(), false, Color(1, 1, 1, .35) if _drag and _drag.it == x and _drag.moved else Color.WHITE)
		if worn.has(x):
			draw_circle(r.position + Vector2(8, 8), 3, Ui.HEAD)
		if x.get("up"):
			Ui.shadow_text(self, Ui.font("sc"), Vector2(r.position.x, r.end.y - 5), "+%d" % x.up, 12, Color("#ffd88a"), HORIZONTAL_ALIGNMENT_RIGHT, r.size.x - 5)
		draw_style_box(Ui.box("sockg" if x == it or x == _hover else "sock", 4, 0, false), r)
	if its.is_empty():
		Ui.shadow_text(self, it_f, _list.position + Vector2(0, 16), "Nichts zum Schmieden.", 14, Ui.PAPER_DIM)
	# what you have to pay with
	var cy := H - 30.0
	var sc := Ui.font("sc")
	Ui.shadow_text(self, sc, Vector2(20, cy), "%d Glut" % Game.glut, 15, Ui.EMBER)
	var sx := 20 + sc.get_string_size("%d Glut" % Game.glut, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x + 16
	for k in ["g", "e"]:
		var t := Runes.icon("Slate:" + k)
		if t:
			draw_texture_rect(t, Rect2(sx, cy - 17, 22, 22), false)
		Ui.shadow_text(self, sc, Vector2(sx + 25, cy), str(Game.slate_g if k == "g" else Game.slate_e), 15, Runes.SLATE[k].col)
		sx += 64
	_anvil()
	_info_text()
	# the piece being dragged
	if _drag and _drag.moved:
		var tex := Items.ground_pic(_drag.it)
		if tex:
			draw_texture_rect(tex, Rect2(_m - tex.get_size(), tex.get_size() * 2), false)
		if _anv.grow(10).has_point(_m):
			draw_rect(_anv, Color(1, .85, .54, .6), false, 2)

func _info_text() -> void:
	var y := _anv.end.y + 18
	var cx := _anv.get_center().x
	var body := Ui.font("body")
	var sm := Ui.font("italic")
	if it == null:
		Ui.shadow_text(self, sm, Vector2(_anv.position.x, y), "Zieh einen Gegenstand auf den Amboss.", 14, Ui.PAPER_DIM, HORIZONTAL_ALIGNMENT_CENTER, _anv.size.x)
		return
	var n: int = it.get("up", 0)
	Ui.shadow_text(self, body, Vector2(_anv.position.x, y), it.name, 16, Items.RCOL.get(it.rar, Ui.PAPER), HORIZONTAL_ALIGNMENT_CENTER, _anv.size.x)
	y += 18
	var cur := Runes.stat_of(it)
	var line := cur
	if n < Runes.UPMAX:
		it.up = n + 1
		line += "  →  " + Runes.stat_of(it)
		if n:
			it.up = n
		else:
			it.erase("up")
	Ui.shadow_text(self, sm, Vector2(_anv.position.x, y), line, 14, Ui.PAPER, HORIZONTAL_ALIGNMENT_CENTER, _anv.size.x)
	y += 18
	if n >= Runes.UPMAX:
		Ui.shadow_text(self, sm, Vector2(_anv.position.x, y), "Meisterstück", 14, Color("#ffd88a"), HORIZONTAL_ALIGNMENT_CENTER, _anv.size.x)
		return
	# the price, red where you are short
	var c := Runes.forge_cost(it)
	var parts := [["%d Glut" % c.gl, Game.glut >= c.gl, null], [str(c.g), Game.slate_g >= c.g, "g"]]
	if c.e:
		parts.append([str(c.e), Game.slate_e >= c.e, "e"])
	var sc := Ui.font("sc")
	var tw := 0.0
	for p in parts:
		tw += sc.get_string_size(p[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x + (20 if p[2] else 0) + 14
	var x := cx - tw / 2
	for p in parts:
		if p[2]:
			var t := Runes.icon("Slate:" + p[2])
			if t:
				draw_texture_rect(t, Rect2(x, y - 15, 18, 18), false)
			x += 20
		Ui.shadow_text(self, sc, Vector2(x, y), p[0], 14, Ui.PAPER if p[1] else Ui.BAD)
		x += sc.get_string_size(p[0], HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x + 14

## a rectangle in the anvil scene's own 220 × 150 units
func _R(x: float, y: float, w: float, h: float, c: Color) -> void:
	draw_rect(Rect2(roundf(x), roundf(y), w, h), c)

## the anvil scene, drawn small and big (forgeFrame)
func _anvil() -> void:
	var t := Game.t
	draw_set_transform(_anv.position, 0, Vector2(AS, AS))
	# the glow of the hearth: a radial gradient round the bottom middle, cut to the scene (createRadialGradient)
	draw_texture_rect_region(_glow_tex(), Rect2(0, 0, 220, 150), Rect2(50, 10, 220, 150), Color(1, 1, 1, (.55 + sin(t * 5) * .06) / .55))
	# block, anvil body, horn
	_R(80, 104, 60, 34, Color("#3a2a1a")); _R(80, 104, 60, 3, Color("#5a4028")); _R(84, 112, 52, 1, Color("#24180e")); _R(84, 124, 52, 1, Color("#24180e"))
	_R(92, 86, 36, 18, Color("#24262c")); _R(96, 82, 28, 6, Color("#2c2e34")); _R(64, 64, 92, 22, Color("#2c2e34")); _R(64, 64, 92, 3, Color("#8a8f9a")); _R(64, 67, 92, 2, Color("#4b4f59")); _R(64, 84, 92, 2, Color("#141518"))
	draw_colored_polygon(PackedVector2Array([Vector2(156, 64), Vector2(190, 70), Vector2(156, 82)]), Color("#2c2e34"))
	_R(156, 64, 20, 2, Color("#8a8f9a")); _R(48, 64, 16, 10, Color("#2c2e34")); _R(48, 64, 16, 2, Color("#6b7076"))
	var glow: float = maxf(0, 1 - _pop.t * 1.5) if _pop else 0.0
	if glow > 0:
		draw_rect(Rect2(66, 62, 88, 4), Color(1, (160 + glow * 80) / 255.0, 60 / 255.0, glow * .8))
	# the piece on the anvil, or a dashed place for it
	if it:
		var tex := Items.ground_pic(it)
		if tex:
			var bob := 0.0 if _anim > 0 else sin(t * 2)
			if glow > 0:
				Prop.glow(self, Vector2(110, 48 + bob), 22, Color(1, .78, .4, .9 * glow))
			draw_texture(tex, (Vector2(110, 48 + bob) - tex.get_size() / 2).round())
	else:
		var a := .35 + sin(t * 3) * .15
		_dashed(Rect2(92, 30, 36, 32), Color(1, .85, .54, a))
	# the hammer: rests raised, winds up, falls hard, bounces
	var ang := 1.3 + sin(t * 1.6) * .04
	if _anim > 0:
		var k := _anim
		ang = 1.3 + k / .35 * .4 if k < .35 else (1.7 - (k - .35) / .12 * 1.22 if k < .47 else (.48 + (k - .47) / .28 * .2 if k < .75 else .68 + minf(1, (k - .75) / .35) * .62))
	var base := Transform2D(0, Vector2(AS, AS), 0, _anv.position)
	draw_set_transform_matrix(base * Transform2D(ang, Vector2(196, 96)))
	_R(-80, -3, 80, 6, Color("#5a3a1a")); _R(-80, -3, 80, 2, Color("#7a5430")); _R(-8, -4, 8, 8, Color("#3a2410"))
	_R(-100, -13, 22, 26, Color("#3a3c44")); _R(-100, -13, 3, 26, Color("#9aa0aa")); _R(-81, -13, 3, 26, Color("#1a1b20")); _R(-100, -13, 22, 2, Color("#6b7076"))
	draw_set_transform(_anv.position, 0, Vector2(AS, AS))
	# sparks and the +N
	for p in _parts:
		_R(p.x, p.y, 2, 2, Color(p.c, maxf(0, 1 - p.t / p.l)))
	if _pop:
		var k: float = _pop.t
		var a := maxf(0, 1 - maxf(0, k - .8) / .5)
		var f := Ui.font("body")
		draw_string(f, Vector2(85, 29 - k * 14), _pop.txt, HORIZONTAL_ALIGNMENT_CENTER, 52, 22, Color(0, 0, 0, a))
		draw_string(f, Vector2(84, 28 - k * 14), _pop.txt, HORIZONTAL_ALIGNMENT_CENTER, 52, 22, Color(1, .85, .54, a))
	draw_set_transform(Vector2.ZERO)

static var _gt: GradientTexture2D

## 320 × 320, centre at 160,160: rgba(140,50,10,.55) fading out to nothing at the rim
static func _glow_tex() -> Texture2D:
	if _gt == null:
		var g := Gradient.new()
		g.set_color(0, Color(140 / 255.0, 50 / 255.0, 10 / 255.0, .55))
		g.set_color(1, Color(10 / 255.0, 6 / 255.0, 4 / 255.0, 0))
		g.set_offset(0, 10 / 160.0)
		_gt = GradientTexture2D.new()
		_gt.gradient = g
		_gt.fill = GradientTexture2D.FILL_RADIAL
		_gt.fill_from = Vector2(.5, .5)
		_gt.fill_to = Vector2(1, .5)
		_gt.width = 320
		_gt.height = 320
	return _gt

func _dashed(r: Rect2, c: Color) -> void:
	var pts := [r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y), r.position]
	for i in 4:
		draw_dashed_line(pts[i], pts[i + 1], c, 1, 3)

## Brannoc: bald, sooty, grey beard (paintPortrait), 24 × 24 pixels
func _portrait(at: Vector2, k: float) -> void:
	var R := func(x: float, y: float, w: float, h: float, c: String) -> void: draw_rect(Rect2(at + Vector2(x, y) * k, Vector2(w, h) * k), Color(c))
	R.call(0, 0, 24, 24, "#120c08"); R.call(0, 18, 24, 6, "#3a2414"); R.call(4, 17, 16, 7, "#5a3a22")
	R.call(6, 4, 12, 13, "#c89a74"); R.call(6, 4, 12, 3, "#e0b48a"); R.call(5, 8, 2, 4, "#b0835e"); R.call(17, 8, 2, 4, "#b0835e"); R.call(8, 9, 2, 1, "#140c06"); R.call(14, 9, 2, 1, "#140c06"); R.call(8, 8, 3, 1, "#6a4a2a"); R.call(13, 8, 3, 1, "#6a4a2a"); R.call(11, 10, 2, 3, "#a87452")
	R.call(7, 13, 10, 6, "#8a8478"); R.call(8, 13, 8, 1, "#b0a898"); R.call(10, 14, 4, 1, "#3a1a0a"); R.call(9, 18, 6, 2, "#6a6458"); R.call(15, 5, 2, 2, "#4a3a30"); R.call(7, 15, 2, 1, "#5a544a")
	draw_rect(Rect2(at, Vector2(24, 24) * k), Color("#c8962a"), false, 1)
