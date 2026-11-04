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

func _init(level: Level, gen: WorldGen) -> void:
	L = level
	wg = gen

func _tx(key: String) -> Texture2D:
	if not _tex.has(key):
		_tex[key] = Data.sprite(key)
	return _tex[key]

func _process(_dt: float) -> void:
	queue_redraw()

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
	var I = wg.island_of(int(floor(L.P.x / WorldGen.CH)), int(floor(L.P.y / WorldGen.CH)))
	Game.place = wg.place_name(L.P.x, L.P.y)
	Game.mlvl = 1 if I == null or I.kind == "home" else WorldGen.lvl_at(I.x, I.y)
	if I != null and I.kind == "boss" and not Game.ow_boss.has(WorldGen.WB[I.wb].id):
		Game.log_msg("Du betrittst das Revier von %s." % WorldGen.WB[I.wb].n, Color("#ff8a6a"))

func _build_home() -> void:
	_tower = Sprite2D.new()
	_tower.texture = _tx("tower")
	_tower.centered = false
	# the browser sorts the tower at x+y+1.2 and draws it 150 left, 550 up from its foot
	_tower.position = Iso.to_screen(Vector2(wg.tower.x, wg.tower.y)) + Vector2(0, 1.2 * 16)
	_tower.offset = Vector2(-150, 30 - 580 - 1.2 * 16)
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
