class_name Hud
extends Control
## The heads-up display over the world (270-hud.js, simplified): life and mana orbs, stamina and experience,
## flask and glut, the floor's name, the foe under the mouse, the message log and big banners.
## Painted, no scene tree of widgets yet; inventory and panels come with the item step.

var level: Level
var msgs: Array = []             # {text, col, t}
var ban = null                   # {title, sub, kind, t}

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	Game.message.connect(func(text, col): msgs.append({"text": text, "col": col, "t": 0.0}))
	Game.banner.connect(func(title, sub, kind): ban = {"title": title, "sub": sub, "kind": kind, "t": 0.0})

func _process(dt: float) -> void:
	for m in msgs:
		m.t += dt
	msgs = msgs.filter(func(m): return m.t < 8)
	if msgs.size() > 6:
		msgs = msgs.slice(msgs.size() - 6)
	if ban:
		ban.t += dt
		if ban.t > 3.4:
			ban = null
	queue_redraw()

func _draw() -> void:
	var sz := get_viewport_rect().size
	var font := ThemeDB.fallback_font
	var d := Game.d
	if d.is_empty():
		return
	# orbs
	_orb(Vector2(46, sz.y - 46), 34, Game.hp / d.life, Color("#8a1410"), Color("#d8382a"), "%d/%d" % [ceili(Game.hp), d.life])
	_orb(Vector2(sz.x - 46, sz.y - 46), 34, Game.mp / d.mana, Color("#14246a"), Color("#3a6ad8"), "%d/%d" % [ceili(Game.mp), d.mana])
	# stamina and experience between them
	var x0 := 92.0
	var x1 := sz.x - 92.0
	_bar(Rect2(x0, sz.y - 22, x1 - x0, 5), Game.st / d.stam, Color("#c8b060"))
	_bar(Rect2(x0, sz.y - 13, x1 - x0, 4), float(Game.xp) / Game.xp_next(Game.lvl), Color("#a080e0"))
	_text(Vector2(x0, sz.y - 28), "Stufe %d · Flakon %d/%d · %d Glut" % [Game.lvl, Game.flasks, Game.flask_max, Game.glut], 11, Color("#ece4cf"))
	_text_r(Vector2(sz.x - 10, 18), "Ebene %d" % Game.floor_no, 14, Color("#ece4cf"))
	# the foe under the mouse, or the one you strike
	var e: Enemy = null
	if level:
		e = level.hover_e if level.hover_e else (level.P.get("target") if level.P.get("target") else null)
	if e and not e.dead:
		var w := 220.0
		var r := Rect2(sz.x / 2 - w / 2, 8, w, 9)
		var col := Color("#e8973a") if e.rank == "unique" or e.boss else (Color("#7aa4ff") if e.rank == "champ" else Color("#ece4cf"))
		_bar(r, e.hp / e.max_hp, Color("#9a1a12"))
		_text_c(Vector2(sz.x / 2, 31), e.e_name, 13, col)
		_text_c(Vector2(sz.x / 2, 44), e.sub, 10, Color("#a39b88"))
	if level and level.hover_o:
		var o: Prop = level.hover_o
		var s := get_viewport().get_canvas_transform() * Iso.to_screen(Vector2(o.p.x, o.p.y))
		var txt := ""
		match o.p.type:
			"shrine": txt = "Leuchtfeuer" + ("" if o.lit else " (erloschen)")
			"stairs": txt = "Hinab zu Ebene %d" % (Game.floor_no + 1)
			"chest": txt = "" if o.p.open else "Truhe"
		if txt != "":
			_text_c(s - Vector2(0, 46), txt, 12, Color("#ffd88a") if o.p.type == "shrine" else Color("#ece4cf"))
	# messages
	var y := sz.y - 96.0
	for i in range(msgs.size() - 1, -1, -1):
		var m: Dictionary = msgs[i]
		var c: Color = m.col
		c.a = clampf(8 - m.t, 0, 1)
		_text(Vector2(12, y), m.text, 11, c)
		y -= 15
	# banner
	if ban:
		var a := clampf(minf(ban.t / .3, (3.4 - ban.t) / .6), 0, 1)
		var col := Color("#d83a2a") if ban.kind == "death" else (Color("#e8c878") if ban.kind == "boss" else Color("#ffe08a"))
		col.a = a
		_text_c(Vector2(sz.x / 2, sz.y * .32), ban.title, 26, col)
		if ban.sub != "":
			_text_c(Vector2(sz.x / 2, sz.y * .32 + 22), ban.sub, 13, Color(.93, .89, .81, a))

func _orb(c: Vector2, r: float, f: float, dark: Color, bright: Color, label: String) -> void:
	draw_circle(c, r + 3, Color("#0c0a08"))
	draw_circle(c, r, Color("#1a1612"))
	f = clampf(f, 0, 1)
	# the liquid: a circle cut at its level, drawn as a polygon
	var top := c.y + r - 2 * r * f
	var pts := PackedVector2Array()
	for k in 49:
		var a := k / 48.0 * TAU
		var p := c + Vector2(cos(a), sin(a)) * r
		pts.append(Vector2(p.x, maxf(p.y, top)))
	if f > 0:
		draw_colored_polygon(pts, dark)
		draw_circle(c + Vector2(-r * .3, -r * .3), r * .35, Color(bright, .25))
	draw_arc(c, r + 1.5, 0, TAU, 48, Color("#5a4a30"), 2)
	_text_c(c + Vector2(0, 4), label, 10, Color("#ece4cf"))

func _bar(r: Rect2, f: float, col: Color) -> void:
	draw_rect(r.grow(1), Color("#0c0a08"))
	draw_rect(Rect2(r.position, Vector2(r.size.x * clampf(f, 0, 1), r.size.y)), col)

func _text(at: Vector2, s: String, size: int, col: Color) -> void:
	var font := ThemeDB.fallback_font
	draw_string_outline(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, 3, Color(0, 0, 0, .85 * col.a))
	draw_string(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, col)

func _text_c(at: Vector2, s: String, size: int, col: Color) -> void:
	var w := ThemeDB.fallback_font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	_text(at - Vector2(w / 2, 0), s, size, col)

func _text_r(at: Vector2, s: String, size: int, col: Color) -> void:
	var w := ThemeDB.fallback_font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	_text(at - Vector2(w, 0), s, size, col)
