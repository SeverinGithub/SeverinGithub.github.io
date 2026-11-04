class_name MapView
extends FullView
## The big map (M, 330-big-map.js): what you have seen, drawn flat in the game's own diamond grid, one colour per kind
## of ground. In the tower it is the explored part of this floor with stairs, shrine, closed chests and the boss; in the
## sky every island you set foot on with its bridges, the lit bonfires by name, traders, the black tower and the island
## lords (red while they live). Drag to move, wheel or pinch to zoom; the names show when you are close enough.
## Beyond the browser: hover a mark for its name, a legend, and the hero is an arrow that points where he looks.

var _img: ImageTexture
var _i0 := Vector2i.ZERO          # tile of the picture's top left corner
var _marks: Array = []            # [tile pos, kind, name, colour]
var _hover := -1

func _ready() -> void:
	super._ready()
	key = KEY_M
	s_min = 1.0 / 18
	s_max = 1.0
	body.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

static func iso(p: Vector2) -> Vector2:
	return Vector2(p.x - p.y, (p.x + p.y) / 2)

func _lv() -> Level:
	return host.level

func opened() -> void:
	var L := _lv()
	title = "Karte · Himmelsinseln" if L.ow else "Karte · " + FloorThemes.title(Game.floor_no)
	_prep()
	vs = 1.0 / (4 if L.ow else 7)
	_center()

func _center() -> void:
	var p := iso(Vector2(_lv().P.x, _lv().P.y))
	vx = p.x
	vy = p.y
	body.queue_redraw()

func head() -> void:
	var L := _lv()
	var info := ""
	if L.ow:
		info = "Inseln [color=#e3b04b][b]%d[/b][/color] · Leuchtfeuer [color=#ffb347][b]%d[/b][/color] · Fürsten [color=#ff8a6a][b]%d[/b][/color]/%d" % [
			Game.ow_seen.size(), Game.ow_fires.size(), Game.ow_boss.size(), WorldGen.WB.size()]
	else:
		var img: Image = L.m.get("explored")
		var seen := 0
		var all := 0
		for k in L.t.size():
			if L.t[k]:
				all += 1
				if img and img.get_pixel(k % L.w, k / L.w).a > 0:
					seen += 1
		info = "Erkundet [color=#e3b04b][b]%d %%[/b][/color]" % roundi(100.0 * seen / maxf(1, all))
	set_head(info, "Ziehen: verschieben · Rad: zoomen · Zeiger auf ein Zeichen zeigt seinen Namen",
		[["+", func(): zoom_at(1 / 1.4)], ["−", func(): zoom_at(1.4)], ["Zu mir", _center], ["Schließen (M)", close]])

# ---------- the picture and the marks (prepMap) ----------

func _prep() -> void:
	var L := _lv()
	_marks.clear()
	if L.ow:
		_prep_sky(L)
	else:
		var img: Image = L.m.get("explored")
		if img == null:
			img = Image.create(L.w, L.h, false, Image.FORMAT_RGBA8)
		_img = ImageTexture.create_from_image(img)
		_i0 = Vector2i.ZERO
		for n in L.obj_nodes:
			var o: Dictionary = n.p
			if not L.explored(o.x, o.y):
				continue
			match o.type:
				"stairs": _marks.append([Vector2(o.x, o.y), "stairs", "Treppe hinab", Color("#7aa4ff")])
				"shrine": _marks.append([Vector2(o.x, o.y), "fire" if n.lit else "shrine", "Leuchtfeuer" + ("" if n.lit else " · erloschen"), Color("#ffb347")])
				"chest":
					if not o.get("open"):
						_marks.append([Vector2(o.x, o.y), "chest", "Truhe", Color("#c8a050")])
		for e in L.enemies:
			if e.boss and not e.dead and L.explored(e.world.x, e.world.y):
				_marks.append([e.world, "boss", e.e_name, Color("#ff6a5a")])

func _prep_sky(L: Level) -> void:
	var wg: WorldGen = L.ow.wg
	var cs := []
	for k in Game.ow_seen:
		var ab: PackedStringArray = k.split(",")
		cs.append(Vector2i(int(ab[0]), int(ab[1])))
	for cy in range(39, 41):
		for cx in range(39, 42):
			cs.append(Vector2i(cx, cy))
	for c in cs:
		wg.ow_island(c.x, c.y)
		wg.ow_bridge(c.x, c.y, c.x + 1, c.y)
		wg.ow_bridge(c.x - 1, c.y, c.x, c.y)
		wg.ow_bridge(c.x, c.y, c.x, c.y + 1)
		wg.ow_bridge(c.x, c.y - 1, c.x, c.y)
	for c in cs:
		var k := "%d,%d" % [c.x, c.y]
		if not wg.cdata.has(k):
			wg.cdata[k] = wg.ow_content(c.x, c.y)
	var c0 := cs[0] as Vector2i
	var c1 := c0
	for c in cs:
		c0 = Vector2i(mini(c0.x, c.x), mini(c0.y, c.y))
		c1 = Vector2i(maxi(c1.x, c.x), maxi(c1.y, c.y))
	var CH := WorldGen.CH
	_i0 = c0 * CH
	var sz := (c1 - c0 + Vector2i.ONE) * CH
	var img := Image.create(sz.x, sz.y, false, Image.FORMAT_RGBA8)
	for c in cs:
		for j in range(c.y * CH, c.y * CH + CH):
			for i in range(c.x * CH, c.x * CH + CH):
				var tt: int = wg.t[j * wg.w + i]
				if tt:
					var k := 8 if tt == 9 and wg.under[j * wg.w + i] == 8 else tt
					img.set_pixel(i - _i0.x, j - _i0.y, Level.MCOL.get(k, Level.MCOL[1]))
	_img = ImageTexture.create_from_image(img)
	_marks.append([Vector2(wg.tower.x, wg.tower.y), "tower", "Der Schwarze Turm", Color("#c8b8e8")])
	for o in wg.home.objs:
		if o.type == "merchant":
			_marks.append([Vector2(o.x, o.y), "trader", "Odalinde", Color("#e8d090")])
		elif o.type == "shrine":
			_marks.append([Vector2(o.x, o.y), "fire", "Leuchtfeuer am Hügel", Color("#ffc070")])
	for k in Game.ow_seen:
		var c = wg.cdata.get(k)
		if c == null:
			continue
		for o in c.objs:
			if o.type == "shrine" and not Game.ow_fires.has(o.key):
				_marks.append([Vector2(o.x, o.y), "shrine", "Leuchtfeuer · noch nicht entzündet", Color("#8a8276")])
			elif o.type == "merchant":
				_marks.append([Vector2(o.x, o.y), "trader", o.name, Color("#e8d090")])
	for k in Game.ow_fires:
		var f: Dictionary = Game.ow_fires[k]
		var nm := String(f.name)
		for pre in ["Leuchtfeuer am ", "Leuchtfeuer an der "]:
			nm = nm.trim_prefix(pre)
		_marks.append([Vector2(f.x, f.y), "fire", nm, Color("#ffc070")])
	for i in WorldGen.WB.size():
		var b: Dictionary = WorldGen.WB[i]
		var dead := Game.ow_boss.has(b.id)
		var seen := Game.ow_seen.has("%d,%d" % [wg.wb_at[i].x, wg.wb_at[i].y])
		if seen or dead:
			_marks.append([wg.wb_pos(i), "deadboss" if dead else "boss", b.n + (" · besiegt" if dead else ""), Color("#8a8276") if dead else Color("#ff8a6a")])

# ---------- input ----------

func body_hover(w: Vector2, _at: Vector2) -> void:
	_hover = -1
	var bd := 12.0 * vs
	for i in _marks.size():
		var d := w.distance_to(iso(_marks[i][0]))
		if d < bd:
			bd = d
			_hover = i

func tick() -> void:
	if _hover >= 0 and _hover < _marks.size():
		var mk: Array = _marks[_hover]
		ui.overlay.tip([[mk[2], mk[3]]], ui.root.get_local_mouse_position())
	body.queue_redraw()

# ---------- drawing (drawBigMap) ----------

func body_draw(c: Control) -> void:
	c.draw_rect(Rect2(Vector2.ZERO, c.size), Color("#07080c"))
	if _img == null:
		return
	# the ground: the picture laid into the diamond grid, pixel for tile
	var z := 1.0 / vs
	var o := to_screen(iso(Vector2(_i0)))
	# a soft shadow under the islands first, so they float over the dark like in the game
	for q in 3:
		c.draw_set_transform_matrix(Transform2D(Vector2(z, z / 2), Vector2(-z, z / 2), o + Vector2(0, (q + 1) * maxf(1.5, z * .5))))
		c.draw_texture(_img, Vector2.ZERO, Color(0, 0, 0, .35 - q * .1))
	c.draw_set_transform_matrix(Transform2D(Vector2(z, z / 2), Vector2(-z, z / 2), o))
	c.draw_texture(_img, Vector2.ZERO)
	c.draw_set_transform_matrix(Transform2D.IDENTITY)
	var names := z >= 3
	var sc := Ui.font("sc")
	# names never sit on each other: the hero's first, then the lords, stairs, tower, fires and traders; one that
	# would cover another is left out (its mark still says it under the mouse)
	var taken: Array[Rect2] = []
	var L := _lv()
	var hp := to_screen(iso(Vector2(L.P.x, L.P.y)))
	var lab := func(p: Vector2, s: String, col: Color, dy: float) -> void:
		var wdt := sc.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, 14).x
		var rr := Rect2(p.x - wdt / 2 - 2, p.y + dy - 13, wdt + 4, 17)
		for o2 in taken:
			if o2.intersects(rr):
				return
		taken.append(rr)
		var at := p + Vector2(-150, dy)
		c.draw_string_outline(sc, at, s, HORIZONTAL_ALIGNMENT_CENTER, 300, 14, 4, Color.BLACK)
		c.draw_string(sc, at, s, HORIZONTAL_ALIGNMENT_CENTER, 300, 14, col)
	var now := Time.get_ticks_msec() / 1000.0
	lab.call(hp, "Du", Color.WHITE, -16)
	var order: Array = range(_marks.size())
	var rank := {"boss": 0, "deadboss": 1, "stairs": 2, "tower": 3, "fire": 4, "trader": 5}
	order.sort_custom(func(a, b): return rank.get(_marks[a][1], 9) < rank.get(_marks[b][1], 9))
	if _hover >= 0:
		order.erase(_hover)
		order.push_front(_hover)
	for i: int in order:
		var mk: Array = _marks[i]
		var p := to_screen(iso(mk[0]))
		if p.x < -80 or p.y < -80 or p.x > c.size.x + 80 or p.y > c.size.y + 80:
			continue
		var hov := i == _hover
		var col: Color = mk[3]
		match mk[1]:
			"tower":
				c.draw_rect(Rect2(p.x - 5, p.y - 26, 10, 26), Color("#14121a"))
				c.draw_rect(Rect2(p.x - 5, p.y - 26, 10, 26), Color("#8a7aa0"), false, 1.5)
				c.draw_colored_polygon(PackedVector2Array([p + Vector2(-7, -26), p + Vector2(0, -36), p + Vector2(7, -26)]), Color("#8a7aa0"))
				lab.call(p, mk[2], col, -42)
				continue
			"fire":
				var fl := 1 + .15 * sin(now * 7 + i)
				c.draw_circle(p, 9 * fl, Color(1, .6, .2, .18))
				c.draw_circle(p, 5, Color("#ff9a30"))
				c.draw_arc(p, 5, 0, TAU, 16, Color("#ffe0a0"), 2, true)
			"shrine":
				c.draw_circle(p, 4, Color("#5a5248"))
				c.draw_arc(p, 4, 0, TAU, 12, Color.BLACK, 2, true)
			"trader", "chest":
				var r := 6.0 if mk[1] == "trader" else 4.0
				var pts := PackedVector2Array([p + Vector2(0, -r), p + Vector2(r, 0), p + Vector2(0, r), p + Vector2(-r, 0)])
				c.draw_colored_polygon(pts, Color("#e3b04b") if mk[1] == "trader" else col)
				pts.append(pts[0])
				c.draw_polyline(pts, Color.BLACK, 2, true)
			"stairs":
				c.draw_circle(p, 6, col)
				c.draw_arc(p, 6, 0, TAU, 16, Color.BLACK, 2, true)
				lab.call(p, mk[2], Color("#9ac4ff"), -12)
				continue
			"boss", "deadboss":
				_skull(c, p, col if mk[1] == "deadboss" else Color("#ff4a3a"), 1.0 + (.12 * sin(now * 4) if mk[1] == "boss" else 0.0))
				lab.call(p, mk[2], col, -16)
				continue
		if hov:
			c.draw_arc(p, 11, 0, TAU, 24, Color.WHITE, 1.5, true)
		if (names or hov) and mk[1] in ["fire", "trader", "shrine", "chest"]:
			lab.call(p, mk[2], col, -10)
	# the quest's goal: a gold ring that breathes
	var qt = Quests.tgt
	if qt and L.ow:
		var qp := to_screen(iso(Vector2(qt.x, qt.y)))
		var pa := .6 + sin(now * 3.3) * .4
		c.draw_arc(qp, 14, 0, TAU, 32, Color(1, .85, .54, pa), 3, true)
		c.draw_arc(qp, 20 + 4 * pa, 0, TAU, 32, Color(1, .85, .54, pa * .3), 2, true)
		lab.call(qp, "Quest: " + qt.l, Color("#ffd88a"), 34)
	# where you stand: an arrow that points where you look, inside a breathing ring
	var f: float = L.P.face
	var dir := (iso(Vector2(cos(f), sin(f)))).normalized()
	var nrm := Vector2(-dir.y, dir.x)
	c.draw_arc(hp, 11 + 2 * sin(now * 3), 0, TAU, 28, Color(1, 1, 1, .5), 1.5, true)
	var tri := PackedVector2Array([hp + dir * 9, hp - dir * 6 + nrm * 6, hp - dir * 3, hp - dir * 6 - nrm * 6])
	c.draw_colored_polygon(tri, Color.WHITE)
	tri.append(tri[0])
	c.draw_polyline(tri, Color.BLACK, 1.5, true)
	_legend(c)

## a drawn skull, not a font glyph: round head, two dark eyes, a jaw
func _skull(c: Control, p: Vector2, col: Color, k: float) -> void:
	var r := 7.0 * k
	c.draw_circle(p + Vector2(0, -2) * k, r + 2, Color.BLACK)
	c.draw_rect(Rect2(p + Vector2(-4.5, 1) * k, Vector2(9, 6) * k).grow(2), Color.BLACK)
	c.draw_circle(p + Vector2(0, -2) * k, r, col)
	c.draw_rect(Rect2(p + Vector2(-4.5, 1) * k, Vector2(9, 6) * k), col)
	c.draw_circle(p + Vector2(-2.6, -2) * k, 2.1 * k, Color.BLACK)
	c.draw_circle(p + Vector2(2.6, -2) * k, 2.1 * k, Color.BLACK)
	for q in 3:
		c.draw_line(p + Vector2(-3 + q * 3, 4) * k, p + Vector2(-3 + q * 3, 7) * k, Color.BLACK, 1.2)

## what the marks mean, bottom left
func _legend(c: Control) -> void:
	var L := _lv()
	var rows := [["fire", "Leuchtfeuer"], ["trader", "Händler"], ["boss", "Inselfürst"], ["quest", "Questziel"]] if L.ow else [["stairs", "Treppe"], ["fire", "Leuchtfeuer"], ["chest", "Truhe"], ["boss", "Wächter"]]
	var at := Vector2(18, c.size.y - 18 - rows.size() * 22)
	c.draw_rect(Rect2(at - Vector2(10, 14), Vector2(150, rows.size() * 22 + 6)), Color(0, 0, 0, .55))
	var f := Ui.font("sc")
	for i in rows.size():
		var p := at + Vector2(6, i * 22)
		match rows[i][0]:
			"fire":
				c.draw_circle(p, 5, Color("#ff9a30"))
				c.draw_arc(p, 5, 0, TAU, 16, Color("#ffe0a0"), 2, true)
			"trader", "chest":
				var r := 6.0 if rows[i][0] == "trader" else 4.0
				c.draw_colored_polygon(PackedVector2Array([p + Vector2(0, -r), p + Vector2(r, 0), p + Vector2(0, r), p + Vector2(-r, 0)]), Color("#e3b04b") if rows[i][0] == "trader" else Color("#c8a050"))
			"stairs":
				c.draw_circle(p, 6, Color("#7aa4ff"))
			"quest":
				c.draw_arc(p, 6, 0, TAU, 20, Color("#ffd88a"), 2.5, true)
			"boss":
				_skull(c, p, Color("#ff4a3a"), .8)
		c.draw_string(f, p + Vector2(16, 5), rows[i][1], HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Ui.PAPER)
