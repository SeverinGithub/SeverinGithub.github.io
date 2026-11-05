class_name Overworld
extends Node2D
## The sky as the level's ground (floor 0): draws the islands and bridges in view over the blue, keeps the chunks
## around the hero awake (owTick in 300-endless-sky.js) and puts their trees, stones, railings, fires, bonfires,
## chests and foes into the level, and takes them out again when the hero walks away.
## The floor is drawn like render() in 210-render.js: every tile in view, in the order of i+j, each frame.

const FADE_KINDS := ["menhir", "tree"]

var L: Level
var wg: WorldGen
var _static: Array = []          # blocks, railing posts and rocks of the awake chunks: rebuilt on every change
var _fade: Array = []            # [sprite, depth, kind] that turn see-through in front of the hero
var _objs := {}                  # chunk key (or "home") → its Prop nodes, which keep their state while awake
var _tower: Sprite2D
var _tex := {}
var _tufts := {}                 # chunk key → its grass tufts (Sprite2D), only for chunks in view
var _tuft_mat: Array = []        # one wind material per kind of tuft
var _occ := {}                   # tiles where nothing grows (grassOcc): under things
const TUFT := preload("res://shaders/tuft.gdshader")

func _init(level: Level, gen: WorldGen) -> void:
	L = level
	wg = gen

func _tx(key: String) -> Texture2D:
	if not _tex.has(key):
		_tex[key] = Data.sprite(key)
	return _tex[key]

var guide := {}                  # the trail of lights a signpost lays (G.hvGuide)
var _sign_menu: PopupMenu
var _look := false

func _process(_dt: float) -> void:
	queue_redraw()
	_grass()
	if not guide.is_empty() and not HillVillage.guide_tick(guide, _dt, Vector2(L.P.x, L.P.y)):
		guide = {}
	if _sign_menu and _sign_menu.visible and _sign_menu.get_meta("at").distance_to(Vector2(L.P.x, L.P.y)) > 3.5:
		_sign_menu.hide()
	if not _look and wg.home.get("hvDeck") and wg.home.hvDeck.has(int(floor(L.P.y)) * wg.w + int(floor(L.P.x))):
		_look = true
		Game.log_msg("Vom Steg aus sieht man weit über die Inseln.", Color("#c8d8e8"))

## a signpost was clicked: a small list of every place of the village; picking one lays a trail of lights there
func sign_open(o: Dictionary) -> void:
	if _sign_menu == null:
		_sign_menu = PopupMenu.new()
		_sign_menu.add_theme_font_size_override("font_size", 11)
		_sign_menu.id_pressed.connect(func(i):
			var g := HillVillage.guide(L, wg.home.hvDest[i])
			if not g.is_empty():
				guide = g)
		get_tree().current_scene.add_child(_sign_menu)
	_sign_menu.clear()
	_sign_menu.title = "Wegweiser"
	for e in HillVillage.dests(wg, o, Vector2(L.P.x, L.P.y)):
		_sign_menu.add_item(e[1], e[0])
	_sign_menu.set_meta("at", Vector2(L.P.x, L.P.y))
	var vp := get_tree().root
	_sign_menu.popup(Rect2i(Vector2i(vp.get_mouse_position()) + Vector2i(12, 0), Vector2i.ZERO))

# ---------- what is awake ----------

## build what lies around the hero; with force, wake everything anew (after resting or travelling)
func tick(force := false) -> void:
	if force:
		for e in L.enemies:
			if e.ck != "":
				e.queue_free()
		L.enemies = L.enemies.filter(func(e): return e.ck == "")
		for k in _objs.keys():
			if k != "home":
				_free_objs(k)
		wg.active = {}
		wg.ac = ""
	if _tower == null:
		# a new level over the same sky (back from the tower): everything wakes anew
		_build_home()
		wg.active = {}
		wg.ac = ""
	var ch = wg.tick(L.P.x, L.P.y)
	if ch == null:
		return
	for key in ch.gone:
		for e in L.enemies:
			if e.ck == key:
				e.queue_free()
		L.enemies = L.enemies.filter(func(e): return e.ck != key)
		_free_objs(key)
	for key in ch.woke:
		_add_objs(key, wg.cdata[key])
		_spawn(key)
	_rebuild_static()
	_occupied()
	for key in _tufts.keys():
		_free_tufts(key)
	var I = wg.island_of(int(floor(L.P.x / WorldGen.CH)), int(floor(L.P.y / WorldGen.CH)))
	Game.place = wg.place_name(L.P.x, L.P.y)
	Game.mlvl = 1 if I == null or I.kind == "home" else WorldGen.lvl_at(I.x, I.y)
	var here := "%d,%d" % [int(floor(L.P.x / WorldGen.CH)), int(floor(L.P.y / WorldGen.CH))]
	if I == null or I.kind == "home" or Game.ow_seen.has(here):
		return
	Game.ow_seen[here] = 1
	if I.kind == "boss" and not Game.ow_boss.has(WorldGen.WB[I.wb].id):
		Game.log_msg("Du betrittst das Revier von %s." % WorldGen.WB[I.wb].n, Color("#ff8a6a"))

func _build_home() -> void:
	# the hill grows with every fallen guardian of the deep (hvTick)
	var was = wg.home.get("hvG")
	if was != null and was != HillVillage.grow():
		HillVillage.build(wg, HillVillage.grow())
		if wg.home.hvG > was:
			Game.log_msg("Der Hügel wächst: " + HillVillage.HVGROW[wg.home.hvG], Color("#e8d8b0"))
			Game.banner.emit("Der Hügel wächst", HillVillage.HVGROW[wg.home.hvG], "")
	_tower = Sprite2D.new()
	_tower.texture = _tx("tower")
	_tower.centered = false
	# the browser sorts the tower at x+y+1.2 and draws it 150 left, 550 up from its foot
	_tower.position = Iso.to_screen(Vector2(wg.tower.x, wg.tower.y)) + Vector2(0, 1.2 * 16)
	_tower.offset = Vector2(-150, 30 - 580 - 1.2 * 16)
	# a pale light in the tower for every beaten guardian of the deep (986)
	var tl := IslandSights.TowerLights.new()
	tl.position = Vector2(0, 30 - 1.2 * 16)
	_tower.add_child(tl)
	L.world.add_child(_tower)
	_fade.append([_tower, wg.tower.x + wg.tower.y + 1.2, "tower"])
	for p in wg.home.props:
		_add_prop(p, "home")
	_objs["home"] = []
	for o in wg.home.objs:
		_add_obj(o, "home")

func _add_objs(key: String, c: Dictionary) -> void:
	_objs[key] = []
	for p in c.props:
		_add_prop(p, key)
	for o in c.objs:
		_add_obj(o, key)

func _add_prop(p: Dictionary, key: String) -> void:
	var n := Prop.new().setup(p)
	L.world.add_child(n)
	if not _objs.has(key):
		_objs[key] = []
	_objs[key].append(n)

func _add_obj(o: Dictionary, key: String) -> void:
	var n := Prop.new().setup(o, true)
	n.lit = Game.ow_fires.has(o.key) if o.get("ow") else Game.lit.get(0, false)
	L.world.add_child(n)
	L.obj_nodes.append(n)
	_objs[key].append(n)

func _free_objs(key: String) -> void:
	for n in _objs.get(key, []):
		if L.P.get("interact") == n:
			L.P.interact = null
		L.obj_nodes.erase(n)
		n.queue_free()
	_objs.erase(key)

## foes of a chunk that woke (owSpawn); a cleared chunk stays quiet until you rest
func _spawn(key: String) -> void:
	var c: Dictionary = wg.cdata[key]
	if c.boss != null and not Game.ow_boss.has(WorldGen.WB[c.boss].id):
		var e := Enemy.make_wboss(c.boss, wg.wb_pos(c.boss), c.lvl)
		e.ck = key
		L._add_enemy(e)
	if c.spawn.size() and not Game.ow_clear.has(key):
		var pack := []
		for s in c.spawn:
			if not L.free_at(s.x, s.y, .35):
				continue
			var e := Enemy.make(s.vid, Vector2(s.x, s.y), s.rank, c.lvl, L.R)
			e.ck = key
			e.pack = pack
			pack.append(e)
			L._add_enemy(e)

## trees, stones, ruins, railing posts and rocks: plain pictures, sorted with everything else
func _rebuild_static() -> void:
	for s in _static:
		s.queue_free()
	_static.clear()
	_fade = _fade.filter(func(f): return f[2] == "tower")
	for b in wg.live("blocks"):
		var key := "prop/%s/%d" % [b.k, b.v]
		if not Data.sprites.has(key):
			continue
		var meta: Dictionary = Data.sprites[key]
		var big: bool = b.get("big", false)
		var s := Sprite2D.new()
		s.texture = _tx(key)
		s.centered = false
		s.position = Iso.to_screen(Vector2(b.i + (1.0 if big else .5), b.j + (1.0 if big else .5)))
		s.offset = Vector2(-float(meta.ax), -float(meta.ay))
		L.world.add_child(s)
		_static.append(s)
		if big or b.k in FADE_KINDS:
			_fade.append([s, b.i + b.j + (2 if big else 1), "blk"])
	for key in wg.active:
		var ab: PackedStringArray = key.split(",")
		var i0 := int(ab[0]) * WorldGen.CH
		var j0 := int(ab[1]) * WorldGen.CH
		for j in range(j0, j0 + WorldGen.CH):
			for i in range(i0, i0 + WorldGen.CH):
				if wg.t[j * wg.w + i] != 3:
					continue
				var s := Sprite2D.new()
				s.texture = _tx("rock/%d" % ((i * 3 + j * 7) % 5))
				s.centered = false
				s.position = Iso.to_screen(Vector2(i + .5, j + .5))
				s.offset = Vector2(-36, -52)
				L.world.add_child(s)
				_static.append(s)
	wg.posts_gone = false

## the tower, tall trees, menhirs and houses in front of the hero turn see-through (render in 210-render.js)
func fade() -> void:
	if wg.posts_gone:
		_rebuild_static()
	var ps := Iso.to_screen(Vector2(L.P.x, L.P.y))
	var pd: float = L.P.x + L.P.y
	for f in _fade:
		var s: Sprite2D = f[0]
		var sp := s.position
		var near := false
		if f[2] == "tower":
			near = pd < f[1] and absf(ps.x - sp.x) < 75 and ps.y < sp.y - 19.2 + 20 and ps.y > sp.y - 19.2 - 520
		else:
			near = f[1] > pd + .5 and absf(sp.x - ps.x) < 40 and sp.y - ps.y < 60 and sp.y - ps.y > -10
		s.modulate.a = (.45 if f[2] == "tower" else .4) if near else 1.0

# ---------- the meadow (820-meadow.js) ----------

## the browser's tile hash without the seed (gh): the meadow looks the same in every world
static func gh(a: int, b: int, c: int) -> int:
	var x := WorldGen._imul(a, 374761393) ^ WorldGen._imul(b, 668265263) ^ WorldGen._imul(c + 1, 2246822519)
	x = WorldGen._imul(x ^ (x >> 13), 1274126177)
	return (x ^ (x >> 16)) & WorldGen.M32

## the meadow's mood: lusher, drier and sunnier patches running over many tiles
static func meadow(i: float, j: float) -> float:
	return sin(i * .19 + j * .07) + sin(i * .05 - j * .23 + 2.1) * .8 + sin((i + j) * .11 + 4) * .6

func grassy(k: int) -> bool:
	var v := wg.t[k]
	return v == 4 or (v == 9 and wg.under[k] == 4)

func _occupied() -> void:
	_occ.clear()
	var add := func(x: float, y: float, r: float) -> void:
		for i in range(floori(x - r), floori(x + r) + 1):
			for j in range(floori(y - r), floori(y + r) + 1):
				_occ[j * wg.w + i] = true
	for o in wg.live("objs"):
		add.call(o.x, o.y, .4 if o.type == "chest" else .9)
	for p in wg.live("props"):
		add.call(p.x, p.y, .5)
	for b in wg.live("blocks"):
		add.call(b.i + .5, b.j + .5, 1.4 if b.get("big", false) else .8)
	add.call(wg.tower.x, wg.tower.y, 4)

## grass tufts stand only in the chunks in view; they come and go as the camera moves
func _grass() -> void:
	if _tuft_mat.is_empty():
		for k in 8:
			var mat := ShaderMaterial.new()
			mat.shader = TUFT
			mat.set_shader_parameter("stiff", float(Data.sprites["gt/%d" % (k * 5)].k))
			_tuft_mat.append(mat)
	var inv := get_viewport().get_canvas_transform().affine_inverse()
	var vs := get_viewport_rect().size
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for c in [Vector2(-80, -80), Vector2(vs.x + 80, -80), Vector2(-80, vs.y + 120), Vector2(vs.x + 80, vs.y + 120)]:
		var wp := Iso.to_world(inv * c)
		lo = lo.min(wp)
		hi = hi.max(wp)
	var want := {}
	for cy in range(floori(lo.y / WorldGen.CH), floori(hi.y / WorldGen.CH) + 1):
		for cx in range(floori(lo.x / WorldGen.CH), floori(hi.x / WorldGen.CH) + 1):
			want[WorldGen._key(cx, cy)] = true
			if not _tufts.has(WorldGen._key(cx, cy)):
				_tufts[WorldGen._key(cx, cy)] = _make_tufts(cx, cy)
	for key in _tufts.keys():
		if not want.has(key):
			_free_tufts(key)
	# the wind and who walks through it
	var walkers := PackedVector3Array([Vector3(L.P.x, L.P.y, 1.1)])
	for e in L.enemies:
		if not e.dead and walkers.size() < 16 and absf(e.world.x - L.P.x) < 14 and absf(e.world.y - L.P.y) < 14:
			walkers.append(Vector3(e.world.x, e.world.y, .9 + e.r))
	for mat in _tuft_mat:
		mat.set_shader_parameter("t", Game.t)
		mat.set_shader_parameter("n", walkers.size())
		mat.set_shader_parameter("walkers", walkers)

func _free_tufts(key: String) -> void:
	for s in _tufts.get(key, []):
		s.queue_free()
	_tufts.erase(key)

## grassTufts for one chunk: up to three tufts a tile, their kind from the meadow's mood
func _make_tufts(cx: int, cy: int) -> Array:
	var out := []
	if cx < 0 or cy < 0 or cx >= WorldGen.WS / WorldGen.CH or cy >= WorldGen.WS / WorldGen.CH:
		return out
	for j in range(cy * WorldGen.CH, (cy + 1) * WorldGen.CH):
		for i in range(cx * WorldGen.CH, (cx + 1) * WorldGen.CH):
			var k := j * wg.w + i
			if not grassy(k) or _occ.has(k):
				continue
			var md := meadow(i, j)
			var n := 3 if md > 1 else (2 if md > .2 else (1 if md > -.8 else (1 if gh(i, j, 77) % 3 == 0 else 0)))
			for q in n:
				var r := gh(i, j, q * 31 + 5)
				var x := i + (r & 1023) / 1023.0
				var y := j + ((r >> 10) & 1023) / 1023.0
				var kind: int = ((2 if (r >> 20) % 3 == 0 else 1) if md > 1.3 else ((4 if (r >> 20) % 2 else 0) if md < -.6 else (r >> 20) % 8))
				if (r >> 23) % 9 == 0:
					kind = 7
				if md > .3 and md < .9 and (r >> 24) % 5 == 0:
					kind = 6
				if md < -1.1:
					kind = 5
				var key := "gt/%d" % (kind * 5 + (r >> 26) % 5)
				var meta: Dictionary = Data.sprites[key]
				var s := Sprite2D.new()
				s.texture = _tx(key)
				s.centered = false
				s.offset = Vector2(-float(meta.ax), -float(meta.ay))
				s.position = Iso.to_screen(Vector2(x, y)).round()
				s.material = _tuft_mat[kind]
				L.world.add_child(s)
				out.append(s)
	return out

# ---------- the ground ----------

func _clv(side: int, i: int, j: int) -> Texture2D:
	return _tx("cliffv/%d/%d" % [side, (((i * 73856093) & WorldGen.M32) ^ ((j * 19349663) & WorldGen.M32)) % 6])

func _draw() -> void:
	var inv := get_viewport().get_canvas_transform().affine_inverse()
	var vs := get_viewport_rect().size
	var c1 := Iso.to_world(inv * Vector2(0, 0))
	var c2 := Iso.to_world(inv * Vector2(vs.x, 0))
	var c3 := Iso.to_world(inv * Vector2(0, vs.y + 200))
	var c4 := Iso.to_world(inv * Vector2(vs.x, vs.y + 200))
	var w := wg.w
	var i0 := maxi(0, floori(minf(c1.x, c3.x)) - 2)
	var i1 := mini(w - 1, ceili(maxf(c2.x, c4.x)) + 2)
	var j0 := maxi(0, floori(minf(c1.y, c2.y)) - 2)
	var j1 := mini(wg.h - 1, ceili(maxf(c3.y, c4.y)) + 2)
	var t := wg.t
	var un := wg.under
	var top := inv * Vector2.ZERO
	var bot := inv * vs
	for s in range(i0 + j0, i1 + j1 + 1):
		for i in range(maxi(i0, s - j1), mini(i1, s - j0) + 1):
			var j := s - i
			var k := j * w + i
			var tt := t[k]
			if not tt:
				continue
			var sp := Iso.to_screen(Vector2(i, j))
			if sp.x < top.x - 70 or sp.x > bot.x + 70 or sp.y < top.y - 40 or sp.y > bot.y + 120:
				continue
			var at := sp - Vector2(32, 0)
			var v := (i * 7 + j * 13)
			var v0 := t[k + w] == 0
			var v1 := t[k + 1] == 0
			if tt == 7 or tt == 8 or tt == 9:
				var u := un[k] if tt == 9 else tt
				if u == 4:
					draw_texture(_tx("grass/%d" % (v % 6)), at)
				elif u == 8:
					var bwv: int = wg.bw.get(k, 0)
					draw_texture(_tx("bridgew/%d/%d" % [bwv - 1, v % 3]) if bwv else _tx("bridge/%d" % (v % 3)), at)
				else:
					draw_texture(_tx("grass/%d" % (v % 6)), at)
					draw_texture(_tx("flag/%d" % (v % 4)), at)
				if u == 8:
					var bwv: int = wg.bw.get(k, 0)
					if bwv:
						if v0:
							draw_texture(_tx("bridgesidew/0"), at)
						if v1:
							draw_texture(_tx("bridgesidew/1"), at)
					else:
						if v0:
							draw_texture(_tx("bridgeside/%d" % (1 if i % 4 == 1 else 0)), at)
						if v1:
							draw_texture(_clv(1, i, j), at)
				else:
					if v0:
						draw_texture(_clv(0, i, j), at)
					if v1:
						draw_texture(_clv(1, i, j), at)
			elif tt == 4 or tt == 3 or tt == 5:
				draw_texture(_tx("grass/%d" % (v % 6)), at)
				if v0:
					draw_texture(_clv(0, i, j), at)
				if v1:
					draw_texture(_clv(1, i, j), at)
	# flat dressing on top of the ground
	for list in [wg.home.deco] + wg.active.keys().map(func(key): return wg.cdata[key].deco):
		for d in list:
			var sp := Iso.to_screen(Vector2(d.x, d.y))
			if sp.x < top.x - 200 or sp.x > bot.x + 200 or sp.y < top.y - 100 or sp.y > bot.y + 100:
				continue
			var key := "deco/%s/%d" % [d.k, d.v]
			if not Data.sprites.has(key):
				continue
			var tex := _tx(key)
			draw_texture(tex, sp - tex.get_size() / 2)
	# the meadow's tint over many tiles, and small patches of clover, pebbles, earth, daisies and leaves (drawDecals in 820)
	for j in range(j0, j1 + 1):
		for i in range(i0, i1 + 1):
			if not grassy(j * w + i):
				continue
			var sp := Iso.to_screen(Vector2(i, j))
			if sp.x < top.x - 40 or sp.x > bot.x + 40 or sp.y < top.y - 40 or sp.y > bot.y + 40:
				continue
			var md := meadow(i, j) + sin(i * .6 + j * .9) * .25
			var a := minf(.16, absf(md) * .07)
			if a > .02:
				var dia := PackedVector2Array([sp, sp + Vector2(32, 16), sp + Vector2(0, 32), sp + Vector2(-32, 16)])
				draw_colored_polygon(dia, Color(20 / 255.0, 70 / 255.0, 10 / 255.0, a) if md > 0 else Color(210 / 255.0, 190 / 255.0, 70 / 255.0, a * .9))
			var hh := gh(i, j, 404)
			if hh % 5 == 0:
				var tex := _tx("gdk/%d" % ((hh >> 8) % 12))
				var dp := Iso.to_screen(Vector2(i + ((hh >> 12) & 255) / 300.0 + .08, j + ((hh >> 20) & 255) / 300.0 + .08))
				draw_texture(tex, (dp - tex.get_size() / 2).round())
	# the signpost's trail of lights lies on the ground (hvGuideDraw)
	if not guide.is_empty():
		HillVillage.guide_draw(self, guide, Game.t)

## clouds drifting under the islands, moving against the camera (drawClouds in 210-render.js)
class Clouds extends Node2D:
	var L: Level
	var cl: Array = []
	var puff: GradientTexture2D

	func _init(level: Level) -> void:
		L = level
		var R := Rng.unseeded()
		for k in 9:
			cl.append({"x": R.next() * 2400 - 1200, "y": R.next() * 900 - 450, "s": .6 + R.next() * 1.1, "v": 4 + R.next() * 8, "seed": int(R.next() * 1e4)})
		var g := Gradient.new()
		g.offsets = PackedFloat32Array([0, .6, 1])
		g.colors = PackedColorArray([Color.WHITE, Color("#eef1f6"), Color(180 / 255.0, 196 / 255.0, 224 / 255.0, 0)])
		puff = GradientTexture2D.new()
		puff.gradient = g
		puff.fill = GradientTexture2D.FILL_RADIAL
		puff.fill_from = Vector2(.5, .5)
		puff.fill_to = Vector2(1, .5)
		puff.width = 128
		puff.height = 128

	func _process(dt: float) -> void:
		for c in cl:
			c.x += c.v * dt
			if c.x > 1400:
				c.x = -1400
		queue_redraw()

	func _draw() -> void:
		var vs := get_viewport_rect().size
		var cx: float = L.cam_w.x
		var cy: float = L.cam_w.y
		IslandSights.draw_islets(self, Iso.to_screen(L.cam_w), vs, Game.t)
		for c in cl:
			var px := fposmod(vs.x / 2 + c.x - (cx - cy) * 6 + 1400, 2800) - 1400
			var py := fposmod(vs.y * .4 + c.y - (cx + cy) * 3 + 700, 1400) - 700
			var R := Rng.new(c.seed)
			for k in 9:
				var ox: float = (R.next() - .5) * 150 * c.s
				var oy: float = (R.next() - .5) * 50 * c.s - absf(ox) * .2
				var r: float = (26 + R.next() * 30) * c.s
				draw_texture_rect(puff, Rect2(px + ox - r, py + oy - r, r * 2, r * 2), false)
