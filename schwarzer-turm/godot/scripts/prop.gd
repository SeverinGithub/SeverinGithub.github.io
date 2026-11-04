class_name Prop
extends Node2D
## One thing standing on a floor: a prop from decorate (barrels, sarcophagi, banners on the wall …) or an object you can use
## (bonfire, stairs, chest). Pictures come from the exported sprites; what the browser paints from shapes every frame
## (torch, brazier, flames, bonfire, stairs, chest) is painted here the same way (drawProp and drawObj, 230-environment.js).
## The node sits on the thing's world point so the y-sorted world puts it in the browser's depth order.

const WH := 56.0                 # wall height in pixels (100-sprites.js)
var p: Dictionary                # the prop or object
var is_obj := false
var lit := false                 # a bonfire burns
var _tex: Texture2D
var _meta: Dictionary

func setup(d: Dictionary, obj := false) -> Prop:
	p = d
	is_obj = obj
	var depth := 0.0
	if obj and p.type == "stairs":
		depth = -1.0             # the hole in the floor sorts a step earlier, as in the browser
	elif p.has("face"):
		depth = .02
	position = Iso.to_screen(Vector2(p.x, p.y) + Vector2(depth, depth) * .5)
	if not obj and String(p.k).begins_with("dc") and Data.sprites.has("dc/" + p.k):
		# the small things lying about on islands (dcSprites in 760-tower-2.js)
		_meta = Data.sprites["dc/" + p.k]
		_tex = Data.sprite("dc/" + p.k)
	elif not obj and Data.sprites.has("prop/%s/%d" % [p.k, p.get("v", 0)]):
		_meta = Data.sprites["prop/%s/%d" % [p.k, p.get("v", 0)]]
		_tex = Data.sprite("prop/%s/%d" % [p.k, p.get("v", 0)])
	if p.has("face"):
		# pictures on a wall lie in the wall's plane: sheared along x or y
		transform = Transform2D(Vector2(1, .5 if p.face == "y" else -.5), Vector2(0, 1), position)
	return self

func animated() -> bool:
	return is_obj or _hv() or p.k in ["torch", "brazier", "candles", "altar", "fire", "dccand", "dcboulder", "ftwin", "ftglass", "ftbars", "ftgear", "ftcandle", "ftcruc", "ftcold"]

## a piece of the hill village (988): drawn by HillVillage
func _hv() -> bool:
	var k := String(p.get("k", ""))
	return k.begins_with("hv") or k == "ydflower"

func _process(_dt: float) -> void:
	if not is_obj and p.k == "hvfolk":
		# villagers walk their rounds; the node goes with them, so they sort right
		var L = get_parent().get_parent()
		if L is Level and Vector2(L.P.x, L.P.y).distance_to(Vector2(p.x, p.y)) < 60:
			HillVillage.walk(p, _dt, Vector2(L.P.x, L.P.y), L)
		position = Iso.to_screen(Vector2(p.x, p.y))
	if not is_obj and p.k == "dcboulder":
		# the boulder rolls: the node goes with it, so it sorts right
		p.x = p.trap.x
		p.y = p.trap.y
		position = Iso.to_screen(Vector2(p.x, p.y))
	if animated():
		queue_redraw()

func _draw() -> void:
	var o := Iso.to_screen(Vector2(p.x, p.y)) - position if not p.has("face") else Vector2.ZERO
	var sx := o.x
	var sy := o.y
	var t := Game.t
	if _hv():
		var L = get_parent().get_parent()
		HillVillage.draw(self, p, sx, sy, t, Vector2(L.P.x, L.P.y) if L is Level else Vector2(-1e4, -1e4), Game.get("night") == true)
		return
	if is_obj:
		if String(p.type).begins_with("tw"):
			ThemeDraw.obj(self, p, sx, sy, t, ThemeRun.room, Game.tw.lift.has(Game.floor_no))
			return
		_draw_obj(sx, sy, t)
		return
	if String(p.k).begins_with("ft"):
		ThemeDraw.prop(self, p, sx, sy, t)
		return
	match p.k:
		"torch":
			var hx := sx
			var hy := sy - WH * .62
			draw_rect(Rect2(hx - 2, hy - 2, 4, 12), Color("#0a0a0c"))
			draw_rect(Rect2(hx - 1.5, hy - 6, 3, 8), Color("#4a3420"))
			flame(self, hx, hy - 6, 6, p.ph, t)
			return
		"brazier":
			shadow(self, sx, sy, .32)
			draw_colored_polygon(PackedVector2Array([Vector2(sx - 9, sy), Vector2(sx - 4, sy - 16), Vector2(sx + 4, sy - 16), Vector2(sx + 9, sy)]), Color("#0d0d10"))
			ellipse(self, sx, sy - 18, 12, 5, Color("#2a2a30"))
			ellipse(self, sx, sy - 19, 9, 3.4, Color("#ff6a1a"))
			flame(self, sx, sy - 19, 10, p.ph, t)
			return
		"shaft", "fog":
			return
		"dcboulder":
			_draw_boulder(sx, sy, t)
			return
		"fire":
			# an open fire: two crossed logs, three flames and a warm glow (drawProp in 230-environment.js)
			var s2: float = p.get("s", 1.0)
			var y0: float = sy - p.get("h", 0.0)
			if not p.get("h"):
				draw_line(Vector2(sx - 7 * s2, sy - 1), Vector2(sx + 6 * s2, sy - 3), Color("#2a1a0c"), 3)
				draw_line(Vector2(sx - 5 * s2, sy - 4), Vector2(sx + 7 * s2, sy), Color("#2a1a0c"), 3)
			flame(self, sx, y0 - 2, 8 * s2, p.ph, t)
			flame(self, sx + 4 * s2, y0, 5 * s2, p.ph + 1, t)
			flame(self, sx - 4 * s2, y0, 5 * s2, p.ph + 2, t)
			glow(self, Vector2(sx, y0 - 6), 46 * s2, Color(1, .59, .2, .28))
			return
	if _tex == null:
		return
	if p.has("face"):
		var top: float = {"banner": -WH + 3, "chains": -WH + 2, "niche": -WH * .66, "wallweb": -WH}.get(p.k, -WH * .6)
		draw_texture(_tex, Vector2(-float(_meta.ax), top))
		return
	if String(p.k).begins_with("dc"):
		var tw := float(_meta.w)
		if float(_meta.h) > 24:
			shadow(self, sx, sy, tw / 90)
		if p.get("f"):
			draw_texture_rect(_tex, Rect2(roundf(sx) + float(_meta.ax), roundf(sy - float(_meta.ay)), -tw, float(_meta.h)), false)
		else:
			draw_texture(_tex, Vector2(roundf(sx - float(_meta.ax)), roundf(sy - float(_meta.ay))))
		if p.k == "dccand":
			for xh in [[2, 7], [6, 10], [10, 5], [13, 8]]:
				flame(self, roundf(sx - float(_meta.ax) + xh[0] + 1), roundf(sy - float(_meta.ay) + 13 - xh[1]), 1.6, p.get("ph", 0.0) + xh[0], t)
		return
	draw_texture(_tex, Vector2(sx - float(_meta.ax), sy - float(_meta.ay)))
	if p.k == "candles":
		# the browser keeps where each wick stands (SPR.prop.candlesTop); until that is exported, three small flames on top
		var ay := float(_meta.ay)
		for c in [Vector2(-6, -ay + 9), Vector2(1, -ay + 6), Vector2(7, -ay + 10)]:
			flame(self, sx + c.x, sy + c.y, 2.6, p.ph + c.x, t)
	elif p.k == "altar":
		flame(self, sx - 12, sy - 30, 3, p.ph, t)
		flame(self, sx + 12, sy - 30, 3, p.ph + 2, t)

func _draw_obj(sx: float, sy: float, t: float) -> void:
	match p.type:
		"shrine":
			shadow(self, sx, sy, .5)
			draw_colored_polygon(PackedVector2Array([Vector2(sx - 16, sy), Vector2(sx - 11, sy - 14), Vector2(sx + 11, sy - 14), Vector2(sx + 16, sy)]), Color("#1d1d21"))
			draw_rect(Rect2(sx - 11, sy - 17, 22, 4), Color("#3a3a42"))
			var fl := sin(t * 9) * 2
			if lit:
				glow(self, Vector2(sx, sy - 28), 30, Color(1, .75, .35, .6))
				var pts := PackedVector2Array([Vector2(sx - 6, sy - 17)])
				pts.append_array(quad(Vector2(sx - 6, sy - 17), Vector2(sx, sy - 44 - fl), Vector2(sx + 6, sy - 17)))
				draw_colored_polygon(pts, Color("#fff1c8"))
				for k in 6:
					var a := t * .4 + k
					draw_line(Vector2(sx, sy - 28), Vector2(sx + cos(a) * 40, sy - 28 + sin(a) * 24), Color(1, .86, .59, .35), 1)
			else:
				draw_rect(Rect2(sx - 5, sy - 20, 10, 3), Color("#7a3010"))
		"stairs":
			var dia := PackedVector2Array([Vector2(sx, sy - 14), Vector2(sx + 30, sy + 1), Vector2(sx, sy + 16), Vector2(sx - 30, sy + 1)])
			draw_colored_polygon(dia, Color.BLACK)
			for k in 4:
				draw_line(Vector2(sx - 22 + k * 6, sy - 3 + k * 3), Vector2(sx + 2 + k * 6, sy - 15 + k * 3 + 12), Color("#4a4c58"), 1.5)
			dia.append(dia[0])
			draw_polyline(dia, Color(122 / 255.0, 164 / 255.0, 1, .4 + sin(t * 3) * .2), 2)
		"merchant":
			# a hooded trader with a lantern (drawObj in 230-environment.js)
			shadow(self, sx, sy, .4)
			draw_colored_polygon(PackedVector2Array([Vector2(sx, sy - 40), Vector2(sx + 11, sy - 2), Vector2(sx - 11, sy - 2)]), Color("#2b1d12"))
			draw_circle(Vector2(sx, sy - 38), 5, Color("#e8dcc0"))
			ellipse(self, sx, sy - 42, 13, 3.5, Color("#141210"))
			draw_colored_polygon(PackedVector2Array([Vector2(sx - 6, sy - 43), Vector2(sx, sy - 54), Vector2(sx + 6, sy - 43)]), Color("#141210"))
			glow(self, Vector2(sx + 12, sy - 20), 14, Color(1, .86, .55, .9))
			draw_rect(Rect2(sx + 10, sy - 23, 4, 6), Color("#ffe2a0"))
		"stash":
			var pl := .5 + sin(t * 2) * .25
			glow(self, Vector2(sx, sy - 8), 46, Color(.47, .35, 1, .28 * pl))
			var c := Data.sprite("prop/stash/0")
			draw_texture(c, Vector2(sx - 40, sy - 44))
		"colossus":
			var c := Data.sprite("colossus")
			var hp := Iso.to_screen(Game.hero_at)
			var behind: bool = Game.hero_at.x + Game.hero_at.y < p.x + p.y and absf(hp.x - position.x) < 60 and hp.y < position.y
			draw_texture(c, Vector2(sx - 85, sy - 268), Color(1, 1, 1, .45 if behind else 1.0))
		"chest":
			_draw_chest(sx, sy, t)

## a rolling boulder (drawBoulder in 760-tower-2.js): its lane glows red while it rumbles, it grows back after it broke
func _draw_boulder(sx: float, sy: float, _t: float) -> void:
	var b: Dictionary = p.trap
	var re: float = maxf(0, 1 - b.cd / 1.2) if b.st == 0 and b.cd > 0 else 1.0
	var sh: float = sin(b.t * 60) * 1.5 if b.st == 1 else 0.0
	if b.st == 1:
		var e := Iso.to_screen(Vector2(b.x0 + cos(b.ang) * b.len, b.y0 + sin(b.ang) * b.len)) - position
		draw_line(Vector2(sx, sy), e, Color(1, .35, .24, .25 + b.t * .5), 18)
		draw_circle(Vector2(sx, sy), 9, Color(1, .35, .24, .25 + b.t * .5))
		draw_circle(e, 9, Color(1, .35, .24, .25 + b.t * .5))
	if re <= 0:
		return
	ellipse(self, sx, sy, 18, 8, Color(0, 0, 0, .45 * re))
	var c := Vector2(roundf(sx + sh), roundf(sy - 15))
	draw_circle(c, 16, Color(Color("#3a362e"), re))
	draw_circle(c + Vector2(-1, -1), 13, Color(Color("#6a6258"), re))
	draw_circle(c + Vector2(-4, -5), 6, Color(Color("#9a9284"), re))
	var rot: float = b.rot * (1.0 if cos(b.ang) >= 0 else -1.0)
	for k in 3:
		draw_arc(c, 9 + k * 2.5, k * 2 + rot, k * 2 + 1.6 + rot, 8, Color(Color("#2a2620"), re), 1.2)

## a chest by its kind (drawChest in 770-chests.js): glow for the fine ones, a ring and a cross while a trial is sealed,
## and a shine running across gold and emerald now and then
func _draw_chest(sx: float, sy: float, t: float) -> void:
	var lk := Chests.look(p)
	var s := Chests.info(p)
	var key := "chest/%s/%d" % [lk, 1 if p.open else 0]
	if not Data.sprites.has(key):
		key = "chest/wood/%d" % (1 if p.open else 0)
	var c := Data.sprite(key)
	var m: Dictionary = Data.sprites[key]
	var ax := float(m.ax)
	var ay := float(m.ay)
	shadow(self, sx, sy, .3 if s.get("junk") else .42)
	if s.has("glow") and not p.open:
		var a := .22 + sin(t * 2.4 + p.x) * .08 + (.12 if s.get("shine") else 0.0)
		var g: Color = s.glow
		glow(self, Vector2(sx, sy - 12), 44 if s.get("shine") else 30, Color(g.r, g.g, g.b, a * 1.6))
	var sealed: bool = p.get("sealed") != false
	if lk == "trial" and not p.open:
		var pu := .5 + sin(t * 3) * .5
		var rc := Color(190 / 255.0, 120 / 255.0, 1, .35 + pu * .3) if sealed else Color(1, 220 / 255.0, 140 / 255.0, .4 + pu * .3)
		var pts := PackedVector2Array()
		for k in 33:
			pts.append(Vector2(sx + cos(k / 32.0 * TAU) * 24, sy - 2 + sin(k / 32.0 * TAU) * 12))
		draw_polyline(pts, rc, 1.5)
		for k in 8:
			var a := k / 8.0 * TAU + t * .4
			draw_rect(Rect2(sx + cos(a) * 24 - 1, sy - 2 + sin(a) * 12 - 1, 2, 2), rc)
	draw_texture(c, Vector2(roundf(sx - ax), roundf(sy - ay)))
	if s.get("shine") and not p.open:
		var ph := fmod(t * .55 + p.x * .13, 1.0)
		if ph < .35:
			var l := roundf(sx - ax) + 2
			var r := l + c.get_width() - 4
			var x0 := sx - ax - 8 + ph / .35 * (c.get_width() + 16)
			var top := sy - ay + 5
			var poly := PackedVector2Array([Vector2(clampf(x0, l, r), top), Vector2(clampf(x0 + 4, l, r), top), Vector2(clampf(x0 - 6, l, r), sy), Vector2(clampf(x0 - 10, l, r), sy)])
			if poly[1].x - poly[0].x > .5 and poly[2].x - poly[3].x > .5:
				draw_colored_polygon(poly, Color(1, 1, 1, .55))
	if lk == "trial" and not p.open and sealed:
		var xc := Color(200 / 255.0, 140 / 255.0, 1, .55 + sin(t * 5) * .2)
		draw_line(Vector2(sx - 14, sy - 20), Vector2(sx + 14, sy - 3), xc, 1.2)
		draw_line(Vector2(sx + 14, sy - 20), Vector2(sx - 14, sy - 3), xc, 1.2)

# ---------- painting helpers, shared with the rest of the world ----------

static func shadow(ci: CanvasItem, sx: float, sy: float, r: float) -> void:
	ellipse(ci, sx, sy, r * 40, r * 20, Color(0, 0, 0, .45))

static func ellipse(ci: CanvasItem, cx: float, cy: float, rx: float, ry: float, col: Color) -> void:
	var pts := PackedVector2Array()
	for k in 24:
		var a := k / 24.0 * TAU
		pts.append(Vector2(cx + cos(a) * rx, cy + sin(a) * ry))
	ci.draw_colored_polygon(pts, col)

## a soft round glow, the radial gradients of the browser in a few rings
static func glow(ci: CanvasItem, c: Vector2, r: float, col: Color) -> void:
	for k in 5:
		var q := 1.0 - k / 5.0
		ci.draw_circle(c, r * q, Color(col.r, col.g, col.b, col.a * .28))

static func quad(a: Vector2, c: Vector2, b: Vector2, n := 8) -> PackedVector2Array:
	var out := PackedVector2Array()
	for k in range(1, n + 1):
		var u := k / float(n)
		out.append(a.lerp(c, u).lerp(c.lerp(b, u), u))
	return out

## a flickering flame (flame in 220-figures.js)
static func flame(ci: CanvasItem, x: float, y: float, sz: float, ph: float, t: float) -> void:
	var f := sin(t * 11 + ph) * .15 + sin(t * 17 + ph * 2) * .1
	glow(ci, Vector2(x, y - sz * .3), sz * 2.2, Color(1, .6, .3, .5))
	var a := Vector2(x - sz * .5, y)
	var pts := PackedVector2Array([a])
	pts.append_array(quad(a, Vector2(x - sz * .4, y - sz * (1.2 + f)), Vector2(x, y - sz * (1.7 + f))))
	pts.append_array(quad(Vector2(x, y - sz * (1.7 + f)), Vector2(x + sz * .4, y - sz * (1.1 - f)), Vector2(x + sz * .5, y)))
	ci.draw_colored_polygon(pts, Color("#ff7a1a"))
	var b := Vector2(x - sz * .22, y)
	var inner := PackedVector2Array([b])
	inner.append_array(quad(b, Vector2(x, y - sz * (1 + f)), Vector2(x + sz * .22, y)))
	ci.draw_colored_polygon(inner, Color("#ffe2a0"))

static func label(ci: CanvasItem, at: Vector2, text: String, col: Color) -> void:
	var font := Ui.font("sc")
	var w := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x
	ci.draw_string_outline(font, at - Vector2(w / 2, 0), text, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, 3, Color(0, 0, 0, .85))
	ci.draw_string(font, at - Vector2(w / 2, 0), text, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, col)
