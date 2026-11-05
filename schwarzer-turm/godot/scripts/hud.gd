class_name Hud
extends Control
## The heads-up display (#hud, #topinfo, #target, #bossbar, #banner, #log in src/shell.html, 270-hud.js, buildBelt in
## 260-ui.js), drawn sharp on the UI layer where one unit is about one CSS pixel: a stone bar along the bottom under
## a gold edge, the life and mana orbs in their rings at both ends, between them stamina, the belt (two potions,
## six skills, the flask, the small buttons for the panels) and experience; top left where you are and your glut,
## top centre the foe under the mouse, a boss's bar above the belt, banners across the middle, the log above the
## life orb, names over things you point at.

var level: Level
var host                         # tower.gd, for the panel buttons
var msgs: Array = []             # {text, col, t}
var ban = null                   # {title, sub, kind, t}
var orb_l: Orb
var orb_m: Orb
var belt: Belt

const BLOOD := Color("#c42a1c")
const ORB_L := ["#200000", "#7a0a06", "#c42a1c", "#ff8a6a"]
const ORB_P := ["#0e1a04", "#3a6a10", "#7ab030", "#c8f878"]
const ORB_M := ["#020820", "#0e2a7a", "#2a64e0", "#9ac4ff"]

func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	Game.message.connect(func(text, col): msgs.append({"text": text, "col": col, "t": 0.0}))
	Game.banner.connect(func(title, sub, kind): ban = {"title": title, "sub": sub, "kind": kind, "t": 0.0})
	orb_l = Orb.new()
	orb_l.ring = "ringL"
	add_child(orb_l)
	orb_m = Orb.new()
	orb_m.ring = "ringM"
	add_child(orb_m)
	belt = Belt.new()
	belt.hud = self
	add_child(belt)
	resized.connect(_place)
	_place()

func _os() -> float:
	return minf(216, size.y * .3)

func _place() -> void:
	var os := _os()
	orb_l.size = Vector2(os, os)
	orb_l.position = Vector2(6, size.y - 2 - os)
	orb_m.size = Vector2(os, os)
	orb_m.position = Vector2(size.x - 6 - os, size.y - 2 - os)
	belt.fit()
	belt.position = Vector2(roundf((size.x - belt.size.x) / 2), size.y - 8 - belt.size.y)

func _process(dt: float) -> void:
	visible = Game.in_play and not Game.d.is_empty()
	if not visible:
		return
	for m in msgs:
		m.t += dt
	msgs = msgs.filter(func(m): return m.t < 10)
	if msgs.size() > 7:
		msgs = msgs.slice(msgs.size() - 7)
	if ban:
		ban.t += dt
		if ban.t > 3.4:
			ban = null
	var d := Game.d
	var pz: bool = level != null and level.P.get("poisonT", 0) > 0
	orb_l.set_level(Game.hp / d.life, ORB_P if pz else ORB_L, "%d / %d" % [ceili(Game.hp), d.life])
	orb_m.set_level(Game.mp / d.mana, ORB_M, "%d / %d" % [floori(Game.mp), d.mana])
	if belt.sig() != belt.last:
		belt.fit()
		_place()
	belt.queue_redraw()
	queue_redraw()

# ---------- drawing ----------

func _draw() -> void:
	if Game.d.is_empty():
		return
	_world_texts()
	_bar_strip()
	_top_info()
	_target()
	_boss()
	_hover_names()
	_log()
	_banner()

## the stone bar along the bottom: a shadow above, the gold edge on top, stone that darkens downwards (#hudbar)
func _bar_strip() -> void:
	var y := size.y - 84
	for k in 24:
		draw_rect(Rect2(0, y - 24 + k, size.x, 1), Color(0, 0, 0, .6 * pow(k / 24.0, 2)))
	var st := Ui.tx("stone")
	draw_texture_rect(st, Rect2(0, y, size.x, 84), true)
	for k in 84:
		draw_rect(Rect2(0, y + k, size.x, 1), Color(0, 0, 0, lerpf(.18, .5, k / 84.0)))
	# the frame's top edge (border-image 8 / 16px, round)
	var fr := Ui.tx("frame")
	var n := maxi(1, roundi(size.x / 16))
	var w := size.x / n
	for i in n:
		draw_texture_rect_region(fr, Rect2(i * w, y, w, 16), Rect2(16, 0, 16, 16))

func _shadow_text(f: Font, at: Vector2, s: String, fs: int, col: Color, align := HORIZONTAL_ALIGNMENT_LEFT, w := -1.0) -> void:
	var sh := Color(0, 0, 0, .85 * col.a)
	draw_string_outline(f, at + Vector2(0, 1), s, align, w, fs, 4, Color(0, 0, 0, .35 * col.a))
	draw_string(f, at + Vector2(0, 1), s, align, w, fs, sh)
	draw_string(f, at, s, align, w, fs, col)

func _where() -> String:
	var where := Game.place if Game.floor_no == 0 else FloorThemes.title(Game.floor_no)
	if Game.floor_no > 0 and level and level.theme and level.theme.curse != "":
		where += " · " + FloorThemes.CURSE[level.theme.curse].n
	return where

## top left: the place and the glut (#topinfo)
func _top_info() -> void:
	var f := Ui.font("sc")
	# a soft dark veil behind it, so the words stay readable over bright grass
	for k in 12:
		var q := k / 12.0
		draw_rect(Rect2(0, 0, 420 * (1 - q * .5), 104 * (1 - q * .4)), Color(0, 0, 0, .045))
	_shadow_text(f, Vector2(14, 26), _where(), 16, Ui.PAPER)
	_day(f, 14 + f.get_string_size(_where(), HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x + 16)
	_shadow_text(f, Vector2(14, 46), "%d Glut" % Game.glut, 16, Ui.EMBER)
	# the slates beside it, once there are any (slateHud in 460)
	if Game.slate_g or Game.slate_e:
		var x := 14 + f.get_string_size("%d Glut" % Game.glut, HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x + 14
		for k in ["g", "e"]:
			var n: int = Game.slate_g if k == "g" else Game.slate_e
			if k == "e" and n == 0:
				continue
			var t := Runes.icon("Slate:" + k)
			if t:
				draw_texture_rect(t, Rect2(x, 30, 20, 20), false)
			_shadow_text(f, Vector2(x + 22, 46), str(n), 16, Runes.SLATE[k].col)
			x += 22 + f.get_string_size(str(n), HORIZONTAL_ALIGNMENT_LEFT, -1, 16).x + 12
	_quest_track()

## beside the place, in the sky: the hour with a little sun or moon, and that the night creatures are out (dayHUD in 370)
func _day(f: Font, x: float) -> void:
	if Game.floor_no != 0 or not level or not level.ow:
		return
	var nm := DayNight.hour_name()
	var col := Color("#9ab0ff") if Game.night else Color("#e8d8a8")
	var c := Vector2(x + 6, 20)
	if Game.night:
		draw_circle(c, 5.5, col)
		draw_circle(c + Vector2(2.6, -1.6), 4.6, Color("#1a1a2a"))
	else:
		for k in 8:
			var a := k * TAU / 8
			draw_line(c + Vector2(cos(a), sin(a)) * 6, c + Vector2(cos(a), sin(a)) * 8.5, col, 1.5)
		draw_circle(c, 4.2, col)
	_shadow_text(f, Vector2(x + 17, 26), nm + (" · Nachtgestalten" if Game.night else ""), 14, col)

## under it the chronicle's active quest and where it points: an arrow on the screen's diagonal grid and the steps
## to go, or in the tower how deep it still is (#qtrack)
func _quest_track() -> void:
	var f := Ui.font("sc")
	var q = Quests.cur()
	if q == null:
		_shadow_text(f, Vector2(14, 72), "◆ Die Chronik ist vollendet", 15, Color("#ffd88a"))
		return
	var p := Quests.prog(q)
	var head: String = "◆ " + q.t
	_shadow_text(f, Vector2(14, 72), head, 15, Color("#ff8a6a") if q.get("boss") else Color("#ffd88a"))
	if p[1] > 1:
		var hw := f.get_string_size(head, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
		_shadow_text(f, Vector2(14 + hw + 8, 72), "%d / %d" % [mini(p[0], p[1]), p[1]], 14, Ui.PAPER)
	var it := Ui.font("italic")
	var t = Quests.tgt
	if t and level and level.ow:
		var dx: float = t.x - level.P.x
		var dy: float = t.y - level.P.y
		var dd := roundi(Vector2(dx, dy).length())
		if dd < 6:
			_shadow_text(it, Vector2(14, 92), "◎ %s · hier" % t.l, 13, Ui.PAPER)
		else:
			var a := atan2((dx + dy) / 2, dx - dy)
			var c := Vector2(21, 87)
			var u := Vector2(cos(a), sin(a))
			var n := Vector2(-u.y, u.x)
			var tri := PackedVector2Array([c + u * 7, c - u * 5 + n * 5, c - u * 2, c - u * 5 - n * 5])
			draw_colored_polygon(tri, Color("#ffd88a"))
			tri.append(tri[0])
			draw_polyline(tri, Color.BLACK, 1.2, true)
			_shadow_text(it, Vector2(34, 92), "%s · %d Schritte" % [t.l, dd], 13, Ui.PAPER)
	elif level and not level.ow:
		var s := ""
		if q.ty in ["floor", "dboss"]:
			s = ("Steig weiter hinab · Ebene %d von %d" % [Game.floor_no, q.f]) if Game.floor_no < q.f else ("Der Hüter wartet auf dieser Ebene" if Game.floor_no == q.f else "Der Hüter haust auf Ebene %d" % q.f)
		elif q.ty == "wboss":
			s = "Kehre über ein Leuchtfeuer zu den Himmelsinseln zurück"
		if s != "":
			_shadow_text(it, Vector2(14, 92), s, 13, Ui.PAPER)

## a bar in a socket: 4 px iron round it, dark inside, the fill from the left
func _sock_bar(r: Rect2, f: float, col_top: Color, col_bot: Color, gold := false) -> void:
	draw_rect(r.grow(-4), Color("#0a0806"))
	var inner := r.grow(-4)
	var w := inner.size.x * clampf(f, 0, 1)
	if w > 0:
		var h := inner.size.y
		for k in int(h):
			var q := k / maxf(1, h - 1)
			draw_rect(Rect2(inner.position.x, inner.position.y + k, w, 1), col_top.lerp(col_bot, q))
	draw_style_box(Ui.box("sockg" if gold else "sock", 4, 0, false), r)

## top centre: the foe under the mouse or the one you strike (#target)
func _target() -> void:
	if level == null:
		return
	var e: Enemy = level.hover_e if level.hover_e else (level.P.get("target") if level.P.get("target") else null)
	if e == null or e.dead or e.boss:
		return
	var col := Color("#e8973a") if e.rank == "unique" else (Color("#7aa4ff") if e.rank == "champ" else Ui.PAPER)
	var cx := size.x / 2
	var fsc := Ui.font("sc")
	var w := maxf(240, fsc.get_string_size(e.e_name, HORIZONTAL_ALIGNMENT_LEFT, -1, 17).x + 20)
	_shadow_text(fsc, Vector2(cx - w / 2, 27), e.e_name, 17, col, HORIZONTAL_ALIGNMENT_CENTER, w)
	var y := 33.0
	if e.sub != "":
		_shadow_text(Ui.font("italic"), Vector2(cx - w / 2, 47), e.sub, 13, Ui.PAPER_DIM, HORIZONTAL_ALIGNMENT_CENTER, w)
		y = 52
	_sock_bar(Rect2(cx - w / 2, y + 3, w, 16), e.hp / e.max_hp, BLOOD.lightened(.15), BLOOD.darkened(.35))

## a boss near you: its name in Pirata One and a long red bar in the gold socket (#bossbar)
func _boss() -> void:
	if level == null:
		return
	var me := Vector2(level.P.x, level.P.y)
	for e in level.enemies:
		if e.boss and not e.dead and e.world.distance_to(me) < 18:
			var w := minf(620, size.x * .8)
			var x := (size.x - w) / 2
			var y := size.y - 150 - 18
			_shadow_text(Ui.font("display"), Vector2(x, y - 6), e.e_name, 26, Ui.HEAD)
			_sock_bar(Rect2(x, y, w, 18), e.hp / e.max_hp, Color("#e0402a"), Color("#7a120a"), true)
			return

## names over the things you point at
func _hover_names() -> void:
	if level == null or level.hover_o == null:
		return
	var o: Prop = level.hover_o
	var k := get_canvas_transform().get_scale().x
	var s := level.get_viewport().get_canvas_transform() * Iso.to_screen(Vector2(o.p.x, o.p.y)) / k
	var txt := ""
	var col := Color("#ffd88a") if o.p.type == "shrine" else Ui.PAPER
	match o.p.type:
		"shrine": txt = o.p.get("name", "Leuchtfeuer") + ("" if o.lit else " (erloschen)")
		"door": txt = "Den Turm betreten · Ebene %d" % Game.top_floor() if Game.top_floor() > 1 else "Den Turm betreten"
		"merchant": txt = o.p.get("name", "Odalinde") + ", Händler" + ("in" if not o.p.has("name") else "")
		"stash": txt = "Bodenlose Truhe"
		"smith":
			txt = "Brannoc, der Schmied"
			col = Color("#ffd88a")
		"grind":
			txt = "Schleifstein"
			col = Color("#e8c878")
		"anvil":
			txt = "Amboss der Vereinung"
			col = Craft.TEAL
		"enchant":
			txt = "Glyphentisch"
			col = Craft.TEAL
		"colossus": txt = "Wächter der Arena · erwacht ab Ebene 20"
		"stairs": txt = "Hinab zu Ebene %d" % (Game.floor_no + 1)
		"hvsign": txt = "Wegweiser"
		_ when String(o.p.type).begins_with("rg"):
			txt = DeadLands.obj_name(o.p)
			col = Color("#ffd88a")
		_ when String(o.p.type).begins_with("is"):
			txt = IslandSights.obj_name(o.p)
			col = Color("#ffd88a")
		_ when String(o.p.type).begins_with("tw") and level.theme:
			txt = level.theme.obj_name(o.p)
			col = Color("#ffd88a")
		"chest":
			var ci := Chests.info(o.p)
			txt = "" if o.p.open else ci.n
			col = Color(ci.get("col", "#ece4cf"))
			if Chests.look(o.p) == "vault":
				txt += " · Schlüssel nötig (du hast %d)" % Game.keys
			elif Chests.look(o.p) == "trial":
				txt += " · versiegelt, besiege die Wächter des Raums" if o.p.get("sealed") != false else " · bereit"
	if txt == "":
		return
	var up: float = {"door": 120, "colossus": 290, "merchant": 66, "stash": 48, "smith": 100, "grind": 52, "anvil": 48, "enchant": 58, "shrine": 58, "chest": 36, "twlift": 80, "twcage": 66}.get(o.p.type, 58 if String(o.p.type).begins_with("tw") or String(o.p.type).begins_with("is") else 46)
	var at := s - Vector2(0, up * level.get_viewport().get_canvas_transform().get_scale().x / k)
	var f := Ui.font("sc")
	var tw := f.get_string_size(txt, HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x
	var r := Rect2(at.x - tw / 2 - 8, at.y - 17, tw + 16, 23)
	draw_rect(r, Color(0, 0, 0, .55))
	_shadow_text(f, Vector2(at.x - tw / 2, at.y), txt, 15, col)

## the name plates of things on the ground and the numbers that fly up (drawLabels, G.texts in 210-render.js),
## laid out by the level in the world's pixels and drawn here sharp
func _world_texts() -> void:
	if level == null:
		return
	var ct := level.get_viewport().get_canvas_transform()
	var g2u := ct.get_scale().x / get_canvas_transform().get_scale().x
	var body := Ui.font("body")
	var fs := roundi(9 * g2u)
	for l in level.labels:
		var r: Rect2 = l.r
		var p := (ct * r.position) / get_canvas_transform().get_scale().x
		var rr := Rect2(p, r.size * g2u)
		draw_rect(rr, Color(40 / 255.0, 40 / 255.0, 60 / 255.0, .95) if l.gi == level.hover_i else Color(0, 0, 0, .78))
		var it: Dictionary = l.gi.it
		var nm: String = it.name + (" (%d)" % it.n if it.get("n", 1) > 1 else "")
		draw_string(body, Vector2(rr.position.x, rr.position.y + rr.size.y * .78), nm, HORIZONTAL_ALIGNMENT_CENTER, rr.size.x, fs, Items.RCOL.get(it.rar, Items.RCOL.normal))
	var sc := Ui.font("sc")
	for t in level.texts:
		var sp := (ct * (Iso.to_screen(Vector2(t.x, t.y)) - Vector2(0, t.z * 34))) / get_canvas_transform().get_scale().x
		var pop: float = 1 + (1 - t.t / .12) * .8 if t.t < .12 else 1.0
		var size := roundi((16 if t.big else 12) * pop * g2u * .75)
		var col: Color = t.col
		col.a = clampf(1 - t.t * t.t, 0, 1)
		draw_string_outline(sc, sp - Vector2(200, 0), t.txt, HORIZONTAL_ALIGNMENT_CENTER, 400, size, 4, Color(0, 0, 0, .85 * col.a))
		draw_string(sc, sp - Vector2(200, 0), t.txt, HORIZONTAL_ALIGNMENT_CENTER, 400, size, col)

## the log above the life orb: the newest at the bottom, each fades after a while (#log)
func _log() -> void:
	var f := Ui.font("body")
	var x := _os() + 16
	var maxw := minf(420, size.x * .6)
	var y := size.y - 140.0
	for i in range(msgs.size() - 1, -1, -1):
		var m: Dictionary = msgs[i]
		var c: Color = m.col
		c.a = clampf(10 - m.t, 0, 1)
		var lines := _wrap(f, m.text, maxw, 14)
		for j in range(lines.size() - 1, -1, -1):
			_shadow_text(f, Vector2(x, y), lines[j], 14, c)
			y -= 17
		y -= 2

func _wrap(f: Font, t: String, w: float, fs: int) -> Array:
	var out := []
	var cur := ""
	for word in t.split(" "):
		var tryit := word if cur == "" else cur + " " + word
		if cur != "" and f.get_string_size(tryit, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x > w:
			out.append(cur)
			cur = word
		else:
			cur = tryit
	if cur != "":
		out.append(cur)
	return out

## a big banner across the middle on a dark strip (#banner)
func _banner() -> void:
	if ban == null or ban.title == "":
		return
	var a := clampf(minf(ban.t / .5, (3.4 - ban.t) / .6), 0, 1)
	var big := int(clampf(size.x * .08, 40, 88))
	var y := size.y * .34
	var h := 18 + big + (30 if ban.sub != "" else 0) + 18
	for x in range(0, int(size.x), 4):
		var q := x / size.x
		var al := .75 * (q / .2 if q < .2 else ((1 - q) / .2 if q > .8 else 1.0))
		draw_rect(Rect2(x, y, 4, h), Color(0, 0, 0, al * a))
	var col := BLOOD if ban.kind == "death" else (Ui.GOLD if ban.kind == "boss" else Ui.PAPER)
	col.a = a
	var f := Ui.font("display")
	var base := y + 18 + f.get_ascent(big) * .9
	draw_string(f, Vector2(0, base + 3), ban.title, HORIZONTAL_ALIGNMENT_CENTER, size.x, big, Color(0, 0, 0, a))
	draw_string(f, Vector2(0, base), ban.title, HORIZONTAL_ALIGNMENT_CENTER, size.x, big, col)
	if ban.sub != "":
		_shadow_text(Ui.font("sc"), Vector2(0, base + 30), ban.sub, 18, Color(Ui.PAPER_DIM, a), HORIZONTAL_ALIGNMENT_CENTER, size.x)

## a life or mana orb: the liquid (orb.gdshader) inside the ring of the browser, the numbers on hover
class Orb extends Control:
	var ring := "ringL"
	var liquid: ColorRect
	var label := ""
	var _hot := false
	func _ready() -> void:
		mouse_filter = Control.MOUSE_FILTER_STOP
		liquid = ColorRect.new()
		liquid.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var m := ShaderMaterial.new()
		m.shader = load("res://shaders/orb.gdshader")
		liquid.material = m
		add_child(liquid)
		var r := TextureRect.new()
		r.texture = load("res://assets/ui/%s.png" % ring)
		r.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		r.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		r.stretch_mode = TextureRect.STRETCH_SCALE
		r.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		add_child(r)
		mouse_entered.connect(func(): _hot = true)
		mouse_exited.connect(func(): _hot = false)
		resized.connect(func():
			liquid.position = (size * .1389).round()
			liquid.size = (size * .7222).round())
	func set_level(f: float, cols: Array, txt: String) -> void:
		var m := liquid.material as ShaderMaterial
		m.set_shader_parameter("frac", f)
		m.set_shader_parameter("t", Time.get_ticks_msec() / 1000.0)
		for i in 4:
			m.set_shader_parameter("c%d" % i, Color(cols[i]))
		label = txt
		queue_redraw()
	func _has_point(p: Vector2) -> bool:
		return p.distance_to(size / 2) < size.x * .45
	func _draw() -> void:
		if not _hot:
			return
		var fs := int(clampf(size.x / 14, 13, 18))
		var f := Ui.font("sc")
		var y := size.y * .46 + fs
		draw_string_outline(f, Vector2(0, y), label, HORIZONTAL_ALIGNMENT_CENTER, size.x, fs, 5, Color(0, 0, 0, .8))
		draw_string(f, Vector2(0, y), label, HORIZONTAL_ALIGNMENT_CENTER, size.x, fs, Color("#f4e6c4"))

## the column between the orbs: stamina, the belt, experience (#mid, buildBelt). Slots are 46 wide in iron
## sockets, the chosen skill in gold; potions and the flask show how many are left; the small buttons open the panels.
class Belt extends Control:
	var hud
	var last := ""
	var items: Array = []        # [kind, id/key, Rect2]
	var _m := Vector2(-99, -99)
	var _down := ""
	func _ready() -> void:
		mouse_filter = Control.MOUSE_FILTER_STOP
		tooltip_text = " "
	func sig() -> String:
		return "%s|%d|%d|%d" % [Game.sk_ids(), Game.pts, Game.spts, Talents.points()]
	func fit() -> void:
		last = sig()
		items.clear()
		var x := 0.0
		var y := 20.0
		for k in [["pot", "life", "Y"], ["pot", "mana", "X"]]:
			items.append([k[0], k[1], Rect2(x, y, 46, 46), k[2]])
			x += 48
		x += 8
		var ids: Array = Game.sk_ids()
		for i in ids.size():
			items.append(["skill", i, Rect2(x, y, 46, 46), str(i + 1)])
			x += 48
		x += 8
		items.append(["flask", "", Rect2(x, y, 46, 46), "F"])
		x += 48 + 8
		for m in [["C", "char", "Charakter (C)"], ["I", "inv", "Inventar (I)"], ["K", "skills", "Fertigkeiten (K)"], ["P", "tree", "Talentbaum (P)"], ["J", "coll", "Sammlung (J)"], ["M", "map", "Karte (M)"], ["L", "quests", "Chronik (L)"], ["≡", "menu", "Menü (Esc)"]]:
			items.append(["mini", m[1], Rect2(x, y + 6, 34, 34), m[0], m[2]])
			x += 36
		size = Vector2(x - 2, 82)
	func _at(p: Vector2) -> Array:
		for it in items:
			if (it[2] as Rect2).has_point(p):
				return it
		return []
	func _get_tooltip(p: Vector2) -> String:
		var it := _at(p)
		if it.is_empty():
			return ""
		match it[0]:
			"pot": return "Heiltrank (Y)" if it[1] == "life" else "Manatrank (X)"
			"flask": return "Heilflakon (F) · %d von %d" % [Game.flasks, Game.fmax()]
			"mini": return it[4]
			"skill":
				var id: String = Game.sk_ids()[it[1]]
				var s: Dictionary = Data.skill_info.skills.get(id, {})
				var l := Game.sk_lvl(it[1])
				return "%s · %s" % [s.get("n", id), ("Stufe %d · %d Mana" % [l, Game.sk_mana(id, l)]) if l > 0 else "noch nicht gelernt"]
		return ""
	func _gui_input(ev: InputEvent) -> void:
		if ev is InputEventMouseMotion:
			_m = ev.position
			queue_redraw()
		elif ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_LEFT:
			var it := _at(ev.position)
			if ev.pressed:
				_down = str(it.slice(0, 2)) if it.size() else ""
				accept_event()
				return
			if it.is_empty() or str(it.slice(0, 2)) != _down:
				return
			accept_event()
			var L: Level = hud.level
			match it[0]:
				"pot":
					if L: L._quick_potion(it[1])
				"flask":
					if L: L._drink_flask()
				"skill":
					if Game.sk_lvl(it[1]) > 0:
						Game.sel = it[1]
				"mini":
					if hud.host: hud.host.panel_button(it[1])
	func _notification(what: int) -> void:
		if what == NOTIFICATION_MOUSE_EXIT:
			_m = Vector2(-99, -99)
			queue_redraw()
	func _pot_count(kind: String) -> int:
		var n := 0
		for it in Game.inv:
			if it.slot == "potion" and it.kind == kind:
				n += 1
		return n
	func _draw() -> void:
		var L: Level = hud.level
		var d := Game.d
		# stamina on top, experience under the belt
		hud_bar(Rect2(0, 0, size.x, 16), Game.st / d.stam, Color("#c8f878"), Color("#6cbc20"), Color("#2a6a10"))
		hud_bar(Rect2(0, 70, size.x, 12), float(Game.xp) / Game.xp_next(Game.lvl), Color("#fff0a8"), Color("#c8962a"), Color("#6a4a0a"))
		var fsc := Ui.font("sc")
		for it in items:
			var r: Rect2 = it[2]
			var hot := r.has_point(_m)
			if it[0] == "mini":
				draw_style_box(Ui.box("btnh" if hot else "btn", 8, 0), r)
				var dot: bool = (it[1] == "char" and Game.pts > 0) or (it[1] == "skills" and Game.spts > 0) or (it[1] == "tree" and Talents.points() > 0)
				var c := Ui.BTN_HOVER if hot else Ui.BTN_TXT
				draw_string(fsc, Vector2(r.position.x, r.position.y + 22), it[3], HORIZONTAL_ALIGNMENT_CENTER, r.size.x, 14, c)
				if dot:
					draw_circle(r.position + Vector2(r.size.x - 9, 10), 3, Ui.GOLD)
				continue
			var sel: bool = it[0] == "skill" and it[1] == Game.sel
			_slot_bg(r)
			var a := 1.0
			if it[0] == "skill":
				var id: String = Game.sk_ids()[it[1]]
				var l := Game.sk_lvl(it[1])
				a = 1.0 if l > 0 else .3
				var tex := Game.sk_icon(id)
				if tex:
					draw_texture_rect(tex, Rect2(r.get_center() - Vector2(19, 19), Vector2(38, 38)), false, Color(1, 1, 1, a))
				if l > 0 and L and L.sk:
					var f: float = L.sk.cd_frac(it[1])
					if f > 0:
						var ih := (r.size.y - 8) * f
						draw_rect(Rect2(r.position.x + 4, r.end.y - 4 - ih, r.size.x - 8, ih), Color(0, 0, 0, .7))
					if Game.mp < Game.sk_mana(id, l):
						draw_rect(r.grow(-4), Color(.1, .2, .6, .3))
			elif it[0] == "pot":
				var n := _pot_count(it[1])
				var tex := Items.icon(Items.potion(it[1], 1))
				if tex:
					draw_texture_rect(tex, Rect2(r.get_center() - Vector2(17, 17), Vector2(34, 34)), false, Color(1, 1, 1, 1 if n > 0 else .25))
				_count(r, str(n))
			elif it[0] == "flask":
				var ft = Data.skill_info.icons.get("flask")
				if ft:
					draw_texture_rect(Data.tex("skills/" + ft), Rect2(r.get_center() - Vector2(19, 19), Vector2(38, 38)), false, Color(1, 1, 1, 1 if Game.flasks > 0 else .35))
				_count(r, str(Game.flasks))
			draw_style_box(Ui.box("sockg" if sel or hot else "sock", 4, 0, false), r)
			if hot and not sel:
				draw_rect(r.grow(-4), Color(1, .85, .5, .08))
			var kc := Color("#c8a860", a)
			draw_string(fsc, r.position + Vector2(5, 14), it[3], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0, 0, 0, a))
			draw_string(fsc, r.position + Vector2(5, 13), it[3], HORIZONTAL_ALIGNMENT_LEFT, -1, 11, kc)
		# a free skill point, and the buffs that run, above the belt
		if Game.spts > 0:
			var t := "%d Fertigkeitspunkt%s frei (K)" % [Game.spts, "" if Game.spts == 1 else "e"]
			draw_string_outline(fsc, Vector2(0, -10), t, HORIZONTAL_ALIGNMENT_CENTER, size.x, 14, 4, Color(0, 0, 0, .8))
			draw_string(fsc, Vector2(0, -10), t, HORIZONTAL_ALIGNMENT_CENTER, size.x, 14, Ui.HEAD)
		if L and L.sk:
			var bx := 0.0
			for b in Skills.BUFFS:
				var v: float = L.P.get(b[0], 0)
				if v > 0:
					var bt := Game.sk_icon(b[1]) if Data.skill_info.skills.has(b[1]) else null
					var br := Rect2(bx, -58, 24, 24)
					draw_rect(br, Color(0, 0, 0, .6))
					if bt:
						draw_texture_rect(bt, br.grow(-1), false)
					draw_rect(br, Ui.H3, false, 1)
					draw_string_outline(fsc, Vector2(bx + 28, -40), str(ceili(v)), HORIZONTAL_ALIGNMENT_LEFT, -1, 13, 3, Color.BLACK)
					draw_string(fsc, Vector2(bx + 28, -40), str(ceili(v)), HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Ui.PAPER)
					bx += 52
	func _slot_bg(r: Rect2) -> void:
		draw_rect(r.grow(-2), Color("#070504"))
		var c := r.position + r.size * Vector2(.4, .35)
		for k in range(5, 0, -1):
			draw_circle(c, 4.0 * k, Color(30 / 255.0, 24 / 255.0, 18 / 255.0, .35))
	func _count(r: Rect2, n: String) -> void:
		var f := Ui.font("sc")
		var p := Vector2(r.position.x, r.end.y - 5)
		draw_string_outline(f, p, n, HORIZONTAL_ALIGNMENT_RIGHT, r.size.x - 5, 12, 4, Color(0, 0, 0, .9))
		draw_string(f, p, n, HORIZONTAL_ALIGNMENT_RIGHT, r.size.x - 5, 12, Color("#f4e6c4"))
	func hud_bar(r: Rect2, f: float, a: Color, b: Color, c: Color) -> void:
		var inner := r.grow(-4)
		draw_rect(inner, Color("#0a0806"))
		var w := inner.size.x * clampf(f, 0, 1)
		var h := int(inner.size.y)
		for k in h:
			var q := k / maxf(1, h - 1.0)
			var col := a.lerp(b, q / .4) if q < .4 else b.lerp(c, (q - .4) / .6)
			draw_rect(Rect2(inner.position.x, inner.position.y + k, w, 1), col)
		draw_style_box(Ui.box("sock", 4, 0, false), r)
