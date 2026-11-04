class_name Level
extends Node2D
## One tower floor in play: built from DungeonGen, painted from the exported tiles, lit like the browser (darkness with lights
## cut into it), and run like update() in 200-update.js: the hero walks by path, strikes what you click, the foes see, chase,
## wind up and strike back. Combat follows 170-combat.js (hurtPlayer, hitEnemy, weaponHit, killEnemy).

const CHUNK := 16
const WH := 56.0
const PLIGHT := {
	"torch": {"r": 170, "a": .85, "col": Color8(255, 120, 40), "f": 8, "h": WH * .5},
	"brazier": {"r": 210, "a": .85, "col": Color8(255, 120, 40), "f": 8, "h": 14},
	"candles": {"r": 115, "a": .7, "col": Color8(255, 170, 80), "f": 5, "h": 10},
	"altar": {"r": 150, "a": .6, "col": Color8(255, 40, 20), "f": 6, "h": 20},
	"shaft": {"r": 150, "a": .85, "col": null, "f": 0, "h": 0},
	"mushrooms": {"r": 95, "a": .55, "col": Color8(64, 224, 208), "f": 2, "h": 8},
}
const GORE := {
	"blood": [Color("#5a0a08"), Color("#8a1410"), Color("#b81c14")],
	"bone": [Color("#d8d0bc"), Color("#b8ae98"), Color("#ece4cf")],
	"ichor": [Color("#3a5a10"), Color("#6a8a1a"), Color("#9ac030")],
	"rock": [Color("#4a4a50"), Color("#6a6a70"), Color("#8a8a90")],
	"mote": [Color("#c8e4ff"), Color("#8ab8ff"), Color("#ffffff")],
}

var m: Dictionary
var w := 0
var h := 0
var t: PackedByteArray
var R := Rng.unseeded()

var world: Node2D                # y-sorted: walls, props, objects, foes, hero
var hero: Hero
var cam: Camera2D
var cam_w := Vector2.ZERO
var enemies: Array[Enemy] = []
var obj_nodes: Array[Prop] = []
var walls := {}                  # tile index → Sprite2D
var faded := {}
var lights: Array = []           # lights cut into the darkness: {p: screen point, r, a, f (flicker), ph}
var dark_mat: ShaderMaterial
var glow_layer: CanvasLayer
var ground_fx: Fx
var top_fx: Fx
var text_fx: Fx

# effects, owned here and painted by Fx
var tele: Array = []
var proj: Array = []
var parts: Array = []
var texts: Array = []
var slashes: Array = []
var rings: Array = []
var flashes: Array = []          # short lights: {x, y, r, a, t, life}
var click_fx = null
var shake := 0.0
var kick_v := Vector2.ZERO
var hitstop := 0.0

# the hero's moment-to-moment state (resetTransient in 050-state.js)
var P := {}
var flow := PackedInt32Array()
var flow_o := Vector2i.ZERO
var flow_t := 0.0
const FW := 80
var hover_e: Enemy = null
var hover_o: Prop = null
var items: Array = []            # on the ground: {it, x, y, t}
var labels: Array = []           # their name plates this frame: {r: Rect2 in world screen space, gi}
var hover_i = null               # the ground item whose plate is under the mouse
var sk: Skills                   # the hero's skills and what they leave behind
var glutmal = null

static var _glow_tex: Texture2D
const DARKNESS := preload("res://shaders/darkness.gdshader")
const PALETTE := preload("res://shaders/palette.gdshader")

func build(map: Dictionary) -> void:
	m = map
	w = m.w
	h = m.h
	t = m.t
	_textures()
	_layers()
	for layer in ["floor", "deco"]:
		var g := Node2D.new()
		g.name = layer
		add_child(g)
		for cj in ceili(h / float(CHUNK)):
			for ci in ceili(w / float(CHUNK)):
				var c := Chunk.new()
				c.level = self
				c.ci = ci
				c.cj = cj
				c.deco = layer == "deco"
				g.add_child(c)
	ground_fx = Fx.new()
	ground_fx.mode = "ground"
	ground_fx.level = self
	add_child(ground_fx)
	world = Node2D.new()
	world.y_sort_enabled = true
	add_child(world)
	top_fx = Fx.new()
	top_fx.level = self
	add_child(top_fx)
	_walls()
	for p in m.props:
		world.add_child(Prop.new().setup(p))
		var L = PLIGHT.get(p.k)
		if L:
			var pos := Iso.to_screen(Vector2(p.x, p.y))
			var l := _light(pos, L.r, L.a)
			l.f = float(L.f)
			l.ph = float(p.ph)
			if L.col != null:
				_glow(pos - Vector2(0, L.h), L.r * .78, L.col, .17)
	for r in m.get("runes", []):
		_light(Iso.to_screen(r), 140, .38)
		_glow(Iso.to_screen(r), 110, Color(1, .12, .04), .2)
	for o in m.objs:
		var n := Prop.new().setup(o, true)
		n.lit = o.type == "shrine" and Game.lit.get(Game.floor_no, false)
		world.add_child(n)
		obj_nodes.append(n)
		if o.type == "shrine":
			n.set_meta("light", _light(Iso.to_screen(Vector2(o.x, o.y)), 280 if n.lit else 120, .9))
		elif o.type == "stairs":
			_light(Iso.to_screen(Vector2(o.x, o.y)), 140, .6)
	sk = Skills.new(self)
	add_child(sk)
	hero = Hero.new()
	hero.cls = Game.cls
	_dress()
	world.add_child(hero)
	Game.gear_changed.connect(_on_gear)
	Game.drop_item.connect(_on_drop)
	cam = Camera2D.new()
	add_child(cam)
	cam.make_current()
	reset_hero(Vector2(m.start.x, m.start.y))
	populate()

## the hero wears what is equipped; a unique keeps its own colours
func _dress() -> void:
	hero.gear.clear()
	hero.unique.clear()
	for slot in Game.eq:
		var it: Dictionary = Game.eq[slot]
		hero.gear[slot] = it.b
		hero.unique[slot] = it.name if it.rar == "unique" else ""

func _on_drop(it: Dictionary) -> void:
	drop_item(it, P.x, P.y)

func _on_gear() -> void:
	_dress()
	hero.rebuild()

func reset_hero(at: Vector2) -> void:
	P = {"x": at.x, "y": at.y, "r": .28, "face": .8, "path": [], "target": null, "interact": null, "atkT": 0.0, "atkDur": 0.0, "hitDone": true,
		"roll": 0.0, "rollA": 0.0, "iframe": 0.0, "stDelay": 0.0, "dead": false, "deathT": 0.0, "heal": 0.0, "poisonT": 0.0, "poisonD": 0.0,
		"chill": 0.0, "flaskT": 0.0, "hurt": 0.0, "repath": 0.0, "standAtk": null, "moving": false, "pick": null}
	hero.world = at
	cam_w = at

# ---------- building the picture ----------

func _textures() -> void:
	if _glow_tex:
		return
	var g2 := Gradient.new()
	g2.set_color(0, Color(1, 1, 1, 1))
	g2.set_color(1, Color(1, 1, 1, 0))
	var tx2 := GradientTexture2D.new()
	tx2.gradient = g2
	tx2.fill = GradientTexture2D.FILL_RADIAL
	tx2.fill_from = Vector2(.5, .5)
	tx2.fill_to = Vector2(1, .5)
	tx2.width = 128
	tx2.height = 128
	_glow_tex = tx2

## The browser paints in layers: the world, then the darkness with lights cut out, then the warm glows added on top,
## then everything goes through the palette; floating numbers and the HUD stay outside of it.
func _layers() -> void:
	var dl := CanvasLayer.new()
	dl.layer = 1
	add_child(dl)
	var dr := ColorRect.new()
	dr.set_anchors_preset(Control.PRESET_FULL_RECT)
	dr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	dark_mat = ShaderMaterial.new()
	dark_mat.shader = DARKNESS
	dr.material = dark_mat
	dl.add_child(dr)
	glow_layer = CanvasLayer.new()
	glow_layer.layer = 2
	glow_layer.follow_viewport_enabled = true
	add_child(glow_layer)
	var pl := CanvasLayer.new()
	pl.layer = 3
	add_child(pl)
	var pr := ColorRect.new()
	pr.set_anchors_preset(Control.PRESET_FULL_RECT)
	pr.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var pm := ShaderMaterial.new()
	pm.shader = PALETTE
	pm.set_shader_parameter("lut", load("res://assets/palette_lut.png"))
	pr.material = pm
	pl.add_child(pr)
	if OS.get_cmdline_user_args().has("--raw"):
		dl.visible = false
		pl.visible = false
	var tl := CanvasLayer.new()
	tl.layer = 4
	tl.follow_viewport_enabled = true
	add_child(tl)
	text_fx = Fx.new()
	text_fx.mode = "text"
	text_fx.level = self
	tl.add_child(text_fx)

## a light cut into the darkness at a point on the floor (light() in render: ten pixels above it, see darkness.gdshader)
func _light(pos: Vector2, r: float, a: float) -> Dictionary:
	var l := {"p": pos, "r": r, "a": a, "f": 0.0, "ph": 0.0}
	lights.append(l)
	return l

## the warm colour around a flame, added on top of the light
func _glow(pos: Vector2, r: float, col: Color, a: float) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = _glow_tex
	s.scale = Vector2.ONE * (r * 2 / 128.0)
	s.position = pos
	s.modulate = Color(col, a)
	var mat := CanvasItemMaterial.new()
	mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	mat.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	s.material = mat
	glow_layer.add_child(s)
	return s

func _walls() -> void:
	var wall_tex: Array[Texture2D] = []
	for k in 4:
		wall_tex.append(Data.sprite("wall/%d" % k))
	var wov: PackedByteArray = m.get("wov", PackedByteArray())
	for j in h:
		for i in w:
			if t[j * w + i] != 2:
				continue
			# the node stands on the tile's middle, where x+y equals the browser's depth i+j+1
			var s := Sprite2D.new()
			s.texture = wall_tex[(i * 3 + j * 5) % 4]
			s.centered = false
			s.offset = Vector2(-32, -16 - WH)
			s.position = Iso.to_screen(Vector2(i + .5, j + .5))
			if wov.size() and wov[j * w + i]:
				var mo := Sprite2D.new()
				mo.texture = Data.sprite("wallmoss/%d" % (wov[j * w + i] - 1))
				mo.centered = false
				mo.offset = s.offset
				s.add_child(mo)
			world.add_child(s)
			walls[j * w + i] = s

## the floor and its flat dressing in tiles of 16×16, each its own canvas item so lights and culling stay cheap
class Chunk extends Node2D:
	var level: Level
	var ci := 0
	var cj := 0
	var deco := false
	func _draw() -> void:
		if deco:
			level.draw_deco(self, ci, cj)
		else:
			level.draw_floor(self, ci, cj)

func draw_floor(c: CanvasItem, ci: int, cj: int) -> void:
	var floor_tex: Array[Texture2D] = []
	for k in 6:
		floor_tex.append(Data.sprite("floor/%d" % k))
	var theme: PackedByteArray = m.get("theme", PackedByteArray())
	for j in range(cj * CHUNK, mini(h, (cj + 1) * CHUNK)):
		for i in range(ci * CHUNK, mini(w, (ci + 1) * CHUNK)):
			var tt := t[j * w + i]
			if tt != 1 and tt != 2 and tt != 6:
				continue
			var s := Iso.to_screen(Vector2(i, j))
			c.draw_texture(floor_tex[(i * 7 + j * 13) % 6], s - Vector2(32, 0))
			var dia := PackedVector2Array([s, s + Vector2(32, 16), s + Vector2(0, 32), s + Vector2(-32, 16)])
			# floor tint per theme, organic edges from a cheap noise (themeTint)
			var th := theme[j * w + i] if theme.size() else 0
			if th and DungeonGen.TINT[th - 1] != null:
				var n := (sin(i * .9 + j * .4) + sin(i * .37 - j * .81 + 2) + sin((i + j) * .23)) / 3
				var a := (.34 if th == 2 else (.4 if th == 5 else .24)) * (.55 + n * .45)
				if a > .02:
					c.draw_colored_polygon(dia, Color(DungeonGen.TINT[th - 1], a))
			var sh := (sin(i * .27 + j * .11) + sin(i * .09 - j * .23 + 1.7) + 2) * .1
			if sh > .04:
				c.draw_colored_polygon(dia, Color(0, 0, 6 / 255.0, sh))

func draw_deco(c: CanvasItem, ci: int, cj: int) -> void:
	for d in m.deco:
		if int(d.x) / CHUNK != ci or int(d.y) / CHUNK != cj:
			continue
		var key := "deco/%s/%d" % [d.k, d.v]
		if not Data.sprites.has(key):
			continue
		var tex := Data.sprite(key)
		c.draw_texture(tex, Iso.to_screen(Vector2(d.x, d.y)) - tex.get_size() / 2)

# ---------- the map (080-maps.js) ----------

static func walk_t(tt: int) -> bool:
	return tt == 1 or tt == 4 or tt == 7 or tt == 8

func tile_at(x: float, y: float) -> int:
	var i := int(floor(x))
	var j := int(floor(y))
	if i < 0 or j < 0 or i >= w or j >= h:
		return 0
	return t[j * w + i]

func walkable(x: float, y: float) -> bool:
	return walk_t(tile_at(x, y))

func free_at(x: float, y: float, r: float) -> bool:
	return walkable(x - r, y - r) and walkable(x + r, y - r) and walkable(x - r, y + r) and walkable(x + r, y + r)

func los(a: Vector2, b: Vector2, r := 0.0) -> bool:
	var d := a.distance_to(b)
	var n := ceili(d / .2)
	for k in range(1, n):
		var p := a.lerp(b, k / float(n))
		if (not free_at(p.x, p.y, r)) if r else (not walkable(p.x, p.y)):
			return false
	return true

## a foe's sight line to the hero is traced again about six times a second, or as soon as either side moves half a step
func e_los(e: Enemy, r: float) -> bool:
	var k = e.lc.get(r)
	var px := Vector2(P.x, P.y)
	if k and Game.t - k.t < .18 and Game.t >= k.t and k.p.distance_to(px) < .5 and k.e.distance_to(e.world) < .5:
		return k.v
	var v := los(e.world, px, r)
	e.lc[r] = {"t": Game.t - R.next() * .06, "v": v, "p": px, "e": e.world}
	return v

func move_ent(pos: Vector2, d: Vector2, r: float) -> Vector2:
	var nx := pos.x + d.x
	if free_at(nx, pos.y, r * .8):
		pos.x = nx
	var ny := pos.y + d.y
	if free_at(pos.x, ny, r * .8):
		pos.y = ny
	return pos

# ---------- pathfinding (090-pathfinding.js) ----------

func find_path(s: Vector2, g: Vector2) -> Array:
	for mg in [24, 72]:
		var p = _find_path_in(s, g, mg)
		if p != null:
			return p
	return []

## A* inside a box around start and goal, so huge maps cost no more than small ones
func _find_path_in(s: Vector2, g: Vector2, mg: int):
	var ti := int(floor(g.x))
	var tj := int(floor(g.y))
	var tx := g.x
	var ty := g.y
	if not walk_t(_T(ti, tj)):
		var best := Vector2i(-1, -1)
		var bd := 1e9
		for dj in range(-3, 4):
			for di in range(-3, 4):
				if walk_t(_T(ti + di, tj + dj)):
					var dd := di * di + dj * dj
					if dd < bd:
						bd = dd
						best = Vector2i(ti + di, tj + dj)
		if best.x < 0:
			return []
		ti = best.x
		tj = best.y
		tx = ti + .5
		ty = tj + .5
	var si := int(floor(s.x))
	var sj := int(floor(s.y))
	if si == ti and sj == tj:
		return [Vector2(tx, ty)]
	var x0 := maxi(0, mini(si, ti) - mg)
	var y0 := maxi(0, mini(sj, tj) - mg)
	var x1 := mini(w - 1, maxi(si, ti) + mg)
	var y1 := mini(h - 1, maxi(sj, tj) + mg)
	var bw := x1 - x0 + 1
	var bh := y1 - y0 + 1
	var start := (sj - y0) * bw + (si - x0)
	var goal := (tj - y0) * bw + (ti - x0)
	var gs := PackedFloat32Array()
	gs.resize(bw * bh)
	gs.fill(1e9)
	var from := PackedInt32Array()
	from.resize(bw * bh)
	from.fill(-1)
	var heap := Heap.new()
	var gx := ti - x0
	var gy := tj - y0
	var hf := func(i: int) -> float:
		var dx := absi(i % bw - gx)
		var dy := absi(i / bw - gy)
		return maxi(dx, dy) + .41 * mini(dx, dy)
	gs[start] = 0
	heap.push(hf.call(start), start)
	var n := 0
	var found := false
	while heap.size() and n < 30000:
		n += 1
		var c := heap.pop()
		if c == goal:
			found = true
			break
		var cx := c % bw
		var cy := c / bw
		for dy in range(-1, 2):
			for dx in range(-1, 2):
				if not dx and not dy:
					continue
				var nx := cx + dx
				var ny := cy + dy
				if nx < 0 or ny < 0 or nx >= bw or ny >= bh:
					continue
				if not walk_t(t[(ny + y0) * w + nx + x0]):
					continue
				if dx and dy and (not walk_t(t[(cy + y0) * w + nx + x0]) or not walk_t(t[(ny + y0) * w + cx + x0])):
					continue
				var ni := ny * bw + nx
				var ng := gs[c] + (1.414 if dx and dy else 1.0)
				if ng < gs[ni]:
					gs[ni] = ng
					from[ni] = c
					heap.push(ng + hf.call(ni), ni)
	if not found:
		return [] if mg >= 72 else null
	var path := []
	var c := goal
	while c != start and c >= 0:
		path.append(Vector2(c % bw + x0 + .5, c / bw + y0 + .5))
		c = from[c]
	path.reverse()
	path[path.size() - 1] = Vector2(tx, ty)
	return path

func _T(i: int, j: int) -> int:
	return 0 if i < 0 or j < 0 or i >= w or j >= h else t[j * w + i]

class Heap:
	var f := PackedFloat32Array()
	var v := PackedInt32Array()
	func size() -> int:
		return v.size()
	func push(pf: float, pv: int) -> void:
		f.append(pf)
		v.append(pv)
		var k := v.size() - 1
		while k > 0:
			var p := (k - 1) >> 1
			if f[p] <= f[k]:
				break
			_swap(p, k)
			k = p
	func pop() -> int:
		var top := v[0]
		var last := v.size() - 1
		f[0] = f[last]
		v[0] = v[last]
		f.resize(last)
		v.resize(last)
		var k := 0
		while true:
			var l := 2 * k + 1
			var r := l + 1
			var s := k
			if l < v.size() and f[l] < f[s]:
				s = l
			if r < v.size() and f[r] < f[s]:
				s = r
			if s == k:
				break
			_swap(s, k)
			k = s
		return top
	func _swap(a: int, b: int) -> void:
		var tf := f[a]
		f[a] = f[b]
		f[b] = tf
		var tv := v[a]
		v[a] = v[b]
		v[b] = tv

## foes follow a breadth-first field in an 80×80 window around the hero
func compute_flow() -> void:
	flow_o = Vector2i(int(floor(P.x)) - FW / 2, int(floor(P.y)) - FW / 2)
	if flow.size() != FW * FW:
		flow.resize(FW * FW)
	flow.fill(-1)
	var q := PackedInt32Array()
	q.resize(FW * FW)
	var s := (FW / 2) * FW + FW / 2
	var a := 0
	var b := 0
	flow[s] = 0
	q[b] = s
	b += 1
	while a < b:
		var c := q[a]
		a += 1
		var cx := c % FW
		var cy := c / FW
		var d := flow[c]
		if d > 30:
			continue
		for o in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var nx: int = cx + o.x
			var ny: int = cy + o.y
			if nx < 0 or ny < 0 or nx >= FW or ny >= FW:
				continue
			var ni := ny * FW + nx
			if flow[ni] < 0 and walk_t(_T(nx + flow_o.x, ny + flow_o.y)):
				flow[ni] = d + 1
				q[b] = ni
				b += 1

func flow_at(i: int, j: int) -> int:
	i -= flow_o.x
	j -= flow_o.y
	return -1 if i < 0 or j < 0 or i >= FW or j >= FW or flow.is_empty() else flow[j * FW + i]

func flow_dir(e: Enemy):
	var i := int(floor(e.world.x))
	var j := int(floor(e.world.y))
	var c := flow_at(i, j)
	if c < 0:
		return null
	var best = null
	var bd := c
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			if not dx and not dy:
				continue
			var v := flow_at(i + dx, j + dy)
			if v < 0 or v >= bd:
				continue
			if dx and dy and (flow_at(i + dx, j) < 0 or flow_at(i, j + dy) < 0):
				continue
			bd = v
			best = Vector2(i + dx + .5, j + dy + .5)
	return best

# ---------- foes on the floor (populate) ----------

func var_pool(f: int) -> Array:
	var L := []
	for v in Data.variants.values():
		if v.minF <= f:
			L.append([v.id, v.w * (1.6 if f - v.minF < 4 else 1.0)])
	return L

func populate() -> void:
	for e in enemies:
		e.queue_free()
	enemies.clear()
	var f: int = m.floor
	var VP := var_pool(f)
	var ml := Game.mlvl
	for r in m.rooms:
		if r == m.startRoom:
			continue
		if m.boss and r == m.endRoom:
			if not Game.boss_dead.get(f, false):
				_add_enemy(Enemy.make_boss(f, Vector2(r.cx + .5, r.cy + .5), ml))
			continue
		var spot := func() -> Vector2:
			for k in 20:
				var x: float = r.x + R.rnd(1, r.w - 1)
				var y: float = r.y + R.rnd(1, r.h - 1)
				if free_at(x, y, .35):
					return Vector2(x, y)
			return Vector2(r.cx + .5, r.cy + .5)
		var roll := R.next()
		var n := roundi((R.rint(3, 5) + mini(5, f >> 1)) * clampf(r.w * r.h / 120.0, 1, 2.4))
		var pack: Array = []
		if roll < .13:
			var ty = R.wpick(VP)
			for k in R.rint(3, 4):
				pack.append(Enemy.make(ty, spot.call(), "champ", ml, R))
		elif roll < .24 and f >= 2:
			var ty = R.wpick(VP)
			pack.append(Enemy.make(ty, spot.call(), "unique", ml, R))
			for k in R.rint(3, 4):
				pack.append(Enemy.make(ty, spot.call(), "minion", ml, R))
		else:
			var mix := [R.wpick(VP), R.wpick(VP), R.wpick(VP)]
			for k in n:
				pack.append(Enemy.make(R.pick(mix), spot.call(), "normal", ml, R))
		for e in pack:
			e.pack = pack
			_add_enemy(e)

func _add_enemy(e: Enemy) -> void:
	world.add_child(e)
	enemies.append(e)

# ---------- one frame (update in 200-update.js) ----------

func _process(dt: float) -> void:
	dt = minf(dt, .05)
	if hitstop > 0:
		hitstop -= dt
		_camera(dt)
		return
	Game.t += dt
	for gi in items:
		gi.t += dt
	_labels()
	shake = maxf(0, shake - dt * 30)
	kick_v *= pow(.0005, dt)
	_hover()
	if P.dead:
		P.deathT -= dt
		if P.deathT <= 0:
			respawn()
	else:
		_update_hero(dt)
	flow_t -= dt
	if flow_t <= 0:
		flow_t = .3
		compute_flow()
	for e in enemies:
		if not e.dead:
			_upd_enemy(e, dt)
	_sep_enemies()
	if not P.dead and not P.roll:
		var pp := Vector2(P.x, P.y)
		for a in enemies:
			if a.dead:
				continue
			var dv := a.world - pp
			var dd := dv.length()
			var mn: float = a.r + P.r
			if dd < mn and dd > .001:
				a.world = move_ent(a.world, dv / dd * (mn - dd), a.r)
	_update_tele(dt)
	_update_proj(dt)
	_update_fx(dt)
	_update_glutmal()
	for e in enemies:
		if e.boss and not e.dead and not Game.boss_seen.get(Game.floor_no, false) and e.world.distance_to(Vector2(P.x, P.y)) < 11:
			Game.boss_seen[Game.floor_no] = true
			Game.banner.emit(e.e_name.to_upper(), "Hüter der Tiefe", "boss")
			e.aggro = true
	if enemies.size() > 140:
		_drop_dead()
	_camera(dt)
	_lights()
	_fade_walls()

func _camera(dt: float) -> void:
	# the camera follows by time, not by frame: with uneven frame times a fixed share per frame made the hero jump
	var ck := 1 - pow(.85, dt * 60)
	cam_w += (Vector2(P.x, P.y) - cam_w) * ck
	var sh := Vector2(R.rnd(-shake, shake), R.rnd(-shake, shake)) if shake > 0 else Vector2.ZERO
	cam.position = (Iso.to_screen(cam_w) + Vector2(0, 40) + sh + kick_v).round()
	hero.world = Vector2(P.x, P.y)
	hero.face = P.face

func _mouse_w() -> Vector2:
	return Iso.to_world(get_global_mouse_position())

func _hover() -> void:
	var ms := get_global_mouse_position()
	hover_e = null
	var bd := 1e9
	for e in enemies:
		if e.dead:
			continue
		var s := Iso.to_screen(e.world)
		var k := e.scale_f * (2.3 if e.boss else 1.0) * (1.5 if e.type == "golem" else 1.0)
		var dx := ms.x - s.x
		var dy := ms.y - (s.y - 18 * k)
		if absf(dx) < 16 * k + 4 and absf(dy) < 22 * k + 4:
			var d := dx * dx + dy * dy
			if d < bd:
				bd = d
				hover_e = e
	hover_i = null
	for l in labels:
		if l.r.has_point(ms):
			hover_i = l.gi
	if hover_i:
		hover_e = null
	hover_o = null
	for o in obj_nodes:
		var s := Iso.to_screen(Vector2(o.p.x, o.p.y))
		if absf(ms.x - s.x) < 26 and absf(ms.y - (s.y - 16)) < 26:
			hover_o = o
			break

func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		if P.dead:
			return
		_hover()
		if ev.shift_pressed:
			var mw := _mouse_w()
			P.standAtk = atan2(mw.y - P.y, mw.x - P.x)
			P.path = []
			P.target = null
			return
		if Game.hand:
			# an item held on the mouse falls to the ground beside the hero
			drop_item(Game.hand, P.x, P.y)
			Game.hand = null
			return
		if hover_i:
			P.pick = hover_i
			P.target = null
			P.interact = null
			P.path = find_path(Vector2(P.x, P.y), Vector2(hover_i.x, hover_i.y))
			return
		if hover_e:
			P.pick = null
			P.target = hover_e
			P.interact = null
			P.repath = 0
			return
		P.pick = null
		if hover_o:
			P.interact = hover_o
			P.target = null
			P.path = find_path(Vector2(P.x, P.y), Vector2(hover_o.p.x, hover_o.p.y))
			return
		P.target = null
		P.interact = null
		_set_move()
	elif ev is InputEventMouseButton and not ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
		P.standAtk = null
	elif ev is InputEventKey and ev.pressed and not ev.echo:
		match ev.keycode:
			KEY_SPACE: _do_roll()
			KEY_F: _drink_flask()
			KEY_Q, KEY_Y: _quick_potion("life")
			KEY_X: _quick_potion("mana")
			KEY_1, KEY_2, KEY_3, KEY_4, KEY_5, KEY_6:
				_cast_at_mouse(ev.keycode - KEY_1)
	elif ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_RIGHT:
		_cast_at_mouse(Game.sel)

func _set_move() -> void:
	var mw := _mouse_w()
	var pp := Vector2(P.x, P.y)
	if mw.distance_to(pp) < .3:
		P.path = []
		return
	if los(pp, mw, P.r) and walkable(mw.x, mw.y):
		P.path = [mw]
	else:
		P.path = find_path(pp, mw)
	click_fx = {"x": mw.x, "y": mw.y, "t": .4}

func _update_hero(dt: float) -> void:
	var d := Game.d
	for k in ["iframe", "hurt", "flaskT", "chill"]:
		P[k] = maxf(0, P[k] - dt)
	if P.heal > 0:
		var hh := minf(P.heal, dt * d.life * 1.6)
		P.heal -= hh
		Game.hp = minf(d.life, Game.hp + hh)
	Game.hp = minf(d.life, Game.hp + d.regen * dt)
	Game.mp = minf(d.mana, Game.mp + (1 + d.mana * .02 + d.mregen) * dt)
	if P.poisonT > 0:
		P.poisonT -= dt
		Game.hp -= P.poisonD * dt
		if Game.hp <= 0:
			_die()
			return
	P.stDelay -= dt
	if P.stDelay <= 0:
		Game.st = minf(d.stam, Game.st + d.stam * .45 * dt)
	var spd: float = 4.2 * (1 + d.frw / 100.0) * (.65 if P.chill > 0 else 1.0) * (.4 if P.flaskT > 0 else 1.0)
	var moving := false
	var mouse_down := Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT)
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT) and not _over_ui() and P.get("cast", 0) <= 0 and not Game.hand:
		_cast_at_mouse(Game.sel)
	var pp := Vector2(P.x, P.y)
	if P.roll > 0:
		P.roll -= dt
		pp = move_ent(pp, Vector2(cos(P.rollA), sin(P.rollA)) * 8.5 * dt, P.r)
		moving = true
		if R.next() < .4:
			_smoke(pp, 1)
	elif sk.hero_motion(dt):
		pp = Vector2(P.x, P.y)
		moving = true
	elif P.get("cast", 0) > 0:
		pass
	elif P.atkT > 0:
		P.atkT -= dt
		if not P.hitDone and P.atkT < P.atkDur * .55:
			P.hitDone = true
			_resolve_swing()
	elif P.standAtk != null and mouse_down:
		var mw := _mouse_w()
		_start_attack(atan2(mw.y - P.y, mw.x - P.x))
	else:
		if P.target:
			var e: Enemy = P.target
			if e.dead:
				P.target = null
			else:
				var dd := e.world.distance_to(pp)
				if dd <= d.reach + e.r:
					P.path = []
					if _start_attack(atan2(e.world.y - P.y, e.world.x - P.x)) and not mouse_down:
						P.target = null
				else:
					P.repath -= dt
					if P.repath <= 0:
						P.repath = .25
						P.path = [e.world] if los(pp, e.world, P.r) else find_path(pp, e.world)
		elif mouse_down and not P.interact and not P.pick and not _over_ui():
			P.repath -= dt
			if P.repath <= 0:
				P.repath = .12
				_set_move()
		if P.get("pick") and pp.distance_to(Vector2(P.pick.x, P.pick.y)) < 1.0:
			var gi: Dictionary = P.pick
			P.pick = null
			P.path = []
			pickup(gi)
		if P.interact and pp.distance_to(Vector2(P.interact.p.x, P.interact.p.y)) < 1.4:
			var o: Prop = P.interact
			P.interact = null
			P.path = []
			_interact(o)
			return
		if P.path.size():
			var tp: Vector2 = P.path[0]
			var dv := tp - pp
			var dd := dv.length()
			var stp := spd * dt
			if P.target and P.target.world.distance_to(pp) <= d.reach + P.target.r:
				P.path = []
			elif dd <= stp:
				pp = tp
				P.path.pop_front()
			else:
				P.face = atan2(dv.y, dv.x)
				var op := pp
				pp = move_ent(pp, dv / dd * stp, P.r)
				moving = true
				if op.distance_to(pp) < stp * .1:
					P.path.pop_front()
	P.x = pp.x
	P.y = pp.y
	P.moving = moving
	if hero.anim != "attack":
		hero.play("walk" if moving else "idle")

func _start_attack(ang: float) -> bool:
	if Game.st <= 0:
		return false
	P.face = ang
	P.atkDur = 1.0 / Game.d.aspd
	P.atkT = P.atkDur
	P.hitDone = false
	Game.st -= 8
	P.stDelay = .7
	hero.face = ang
	hero.play("attack", hero.attack_time() / P.atkDur)
	return true

func _resolve_swing() -> void:
	var reach: float = Game.d.reach + .35
	var pp := Vector2(P.x, P.y)
	var any := false
	slash_fx(pp, P.face, 1.9, reach * .9, Color8(235, 225, 205), .5)
	for e in enemies:
		if e.dead:
			continue
		var d := e.world.distance_to(pp)
		if d > reach + e.r:
			continue
		if absf(angle_difference(P.face, atan2(e.world.y - P.y, e.world.x - P.x))) > 1.05 and d > e.r + .2:
			continue
		weapon_hit(e)
		any = true
	if any:
		shake = maxf(shake, 2)

func _do_roll() -> void:
	if P.dead or P.roll > 0 or Game.st < 12:
		return
	var mw := _mouse_w()
	var a := atan2(mw.y - P.y, mw.x - P.x)
	if mw.distance_to(Vector2(P.x, P.y)) < .2:
		a = P.face
	P.roll = .38
	P.iframe = .3
	P.rollA = a
	P.face = a
	Game.st -= 22
	P.stDelay = .8
	P.atkT = 0
	P.path = []
	_smoke(Vector2(P.x, P.y), 4)

## the mouse is over an open panel: holding the button there does not walk
func _over_ui() -> bool:
	var c := get_viewport().gui_get_hovered_control()
	return c != null and c.mouse_filter == Control.MOUSE_FILTER_STOP

## a skill towards the foe under the mouse, or the ground under it
func _cast_at_mouse(i: int) -> void:
	if P.dead:
		return
	_hover()
	var t := hover_e.world if hover_e else _mouse_w()
	sk.cast(i, t.x, t.y)

## the first potion of its kind in the bag (quickPotion)
func _quick_potion(kind: String) -> void:
	if P.dead:
		return
	for it in Game.inv:
		if it.slot == "potion" and it.kind == kind:
			drink(it)
			return
	Game.log_msg("Kein %s im Inventar." % ("Heiltrank" if kind == "life" else "Manatrank"), Color("#a39b88"))

func drink(it: Dictionary) -> void:
	if it.kind == "life":
		P.poisonT = 0.0
	P.heal += Game.use_potion(it)

func _drink_flask() -> void:
	if P.dead or Game.flasks <= 0 or P.flaskT > 0:
		if Game.flasks <= 0:
			Game.log_msg("Der Flakon ist leer. Raste an einem Leuchtfeuer.", Color("#a39b88"))
		return
	Game.flasks -= 1
	P.flaskT = .5
	P.poisonT = 0
	P.heal = Game.d.life * (.45 + Game.flask_pow * .08 + Game.d.flaskH / 100.0)
	burst(Vector2(P.x, P.y), Color("#ffcf6a"), 14, 1.5)

func _interact(o: Prop) -> void:
	match o.p.type:
		"shrine":
			if not Game.lit.get(Game.floor_no, false):
				Game.lit[Game.floor_no] = true
				Game.banner.emit("LEUCHTFEUER ENTZÜNDET", "", "boss")
				o.lit = true
				o.get_meta("light").r = 280.0
			# resting: heals, fills the flask, sets your return here, and the floor's foes rise again
			Game.respawn_floor = Game.floor_no
			Game.hp = Game.d.life
			Game.mp = Game.d.mana
			Game.flasks = Game.flask_max
			populate()
			Game.log_msg("Du rastest am Leuchtfeuer. Die Feinde dieser Ebene erheben sich erneut.", Color("#ffd88a"))
		"stairs":
			get_parent().call_deferred("enter_floor", Game.floor_no + 1)
		"chest":
			if not o.p.open:
				o.p.open = true
				var cl := Game.mlvl
				for k in R.rint(1, 3):
					drop_item(Items.junk_for(null, cl), o.p.x, o.p.y)
				if R.next() < .18:
					drop_item(Items.make(cl, {"mf": Game.d.mf}), o.p.x, o.p.y)
				if R.next() < .25:
					drop_item(Items.potion("life", Game.floor_no), o.p.x, o.p.y)
				var gl := R.rint(3, 8) * cl
				Game.glut += gl
				ftext(Vector2(o.p.x, o.p.y), "+%d Glut" % gl, Color("#ff9a3a"))
				burst(Vector2(o.p.x, o.p.y), Color("#c8a050"), 10, 1.5)

# ---------- combat (170-combat.js) ----------

func hurt_player(dmg: float, elem, src) -> bool:
	if P.dead or P.iframe > 0 or P.get("dash"):
		return false
	var d := Game.d
	if elem == null and d.block > 0 and R.next() * 100 < d.block:
		ftext(Vector2(P.x, P.y), "Geblockt", Color("#c8c2b0"))
		hitstop = .05
		return false
	if elem != null:
		dmg *= 1 - d.res / 100.0
	else:
		dmg *= 1 - d.def / (d.def + 45.0 + Game.mlvl * 14)
	dmg = maxf(1, dmg - d.dmgred)
	if P.get("oathT", 0) > 0:
		dmg *= .85
	if P.get("ward", 0) > 0:
		# the bone ward or blade wall takes what it can
		var a0: float = minf(P.ward, dmg)
		P.ward -= a0
		dmg -= a0
		if dmg <= 0:
			ftext(Vector2(P.x, P.y), "absorbiert", Color("#e8e2d0"))
			return false
	if elem == null and src is Enemy and not src.dead and d.thorns:
		hit_enemy(src, d.thorns, {"col": Color("#a6e08a")})
	Game.hp -= dmg
	P.hurt = .2
	shake = maxf(shake, minf(10, 3 + dmg / d.life * 30))
	ftext(Vector2(P.x, P.y), str(roundi(dmg)), Color("#ff5040"))
	var a := R.rnd(0, TAU)
	if src != null:
		var sp: Vector2 = src.world if src is Enemy else Vector2(src.x, src.y)
		a = atan2(P.y - sp.y, P.x - sp.x)
	gore(Vector2(P.x, P.y), a, 9, "blood", .8)
	kick(a, 3.5)
	if dmg > d.life * .08:
		hitstop = .07
	if elem == "frost":
		P.chill = 1.5
	if elem == "poison":
		P.poisonT = 3.5
		P.poisonD = maxf(P.poisonD, dmg * .3)
		ftext(Vector2(P.x, P.y - .3), "Vergiftet", Color("#9ae050"))
	if Game.hp <= 0:
		_die()
	return true

func _die() -> void:
	P.dead = true
	Game.hp = 0
	P.deathT = 3.6
	P.path = []
	P.target = null
	Game.banner.emit("DU BIST GEFALLEN", "%d Glut bleibt hier zurück" % Game.glut if Game.glut > 0 else "", "death")
	if Game.glut > 0:
		glutmal = {"x": P.x, "y": P.y, "amt": Game.glut}
		Game.glut = 0
	hero.visible = false

func respawn() -> void:
	populate()
	var s := Vector2(m.start.x, m.start.y)
	for o in m.objs:
		if o.type == "shrine":
			s = Vector2(o.x + 1, o.y + 1) if walkable(o.x + 1, o.y + 1) else Vector2(m.start.x, m.start.y)
	reset_hero(s)
	hero.visible = true
	Game.recalc()
	Game.hp = Game.d.life
	Game.mp = Game.d.mana
	Game.st = Game.d.stam
	Game.flasks = Game.flask_max
	tele.clear()
	proj.clear()
	Game.log_msg("Du erwachst am Leuchtfeuer.", Color("#ffd88a"))

func _update_glutmal() -> void:
	if glutmal and glutmal.x != null and Vector2(glutmal.x, glutmal.y).distance_to(Vector2(P.x, P.y)) < .9 and not P.dead:
		Game.glut += glutmal.amt
		ftext(Vector2(P.x, P.y), "+%d Glut zurückgewonnen" % glutmal.amt, Color("#ff9a3a"), true)
		glutmal = null

func hit_enemy(e: Enemy, dmg: float, o := {}) -> void:
	if e.dead:
		return
	if P.get("oathT", 0) > 0 and dmg > 0 and e.type in Data.skill_info.undead:
		dmg *= 1 + P.oathB / 100.0
		Game.hp = minf(Game.d.life, Game.hp + Game.d.life * .01)
	dmg *= e.dmg_taken
	if dmg <= 0:
		# a push only
		var a0: float = o.get("from", atan2(e.world.y - P.y, e.world.x - P.x))
		if o.get("kb", 0) and not e.boss:
			e.kv += Vector2(cos(a0), sin(a0)) * o.kb * 16 / e.scale_f
		e.aggro = true
		return
	e.hp -= dmg
	e.flash = .1
	e.hit_t = .22
	e.aggro = true
	for p in e.pack:
		p.aggro = true
	var crit: bool = o.get("crit", false)
	ftext(e.world, str(roundi(dmg)) + ("!" if crit else ""), Color("#ffd94f") if crit else o.get("col", Color("#f2ecd8")), crit)
	if o.get("slow", 0):
		e.slow = maxf(e.slow, o.slow)
	var a: float = o.get("from", atan2(e.world.y - P.y, e.world.x - P.x))
	if o.get("kb", 0) and not e.boss:
		var k: float = o.kb * 16 / e.scale_f
		e.kv += Vector2(cos(a), sin(a)) * k
	gore(e.world, a, 11 if crit else 5, _gore_of(e), .8 * e.scale_f)
	if e.hp <= 0:
		kill_enemy(e, a)

func weapon_hit(e: Enemy, mult := 1.0) -> void:
	var d := Game.d
	var dmg: float = R.rnd(d.dmin, d.dmax) * mult + d.ele
	if P.get("cryT", 0) > 0:
		dmg *= 1 + P.cryB / 100.0
	var crit: bool = R.next() * 100 < d.crit + (P.shadowB if P.get("shadowT", 0) > 0 else 0)
	if crit:
		dmg *= 1.9
	var a := atan2(e.world.y - P.y, e.world.x - P.x)
	var hp := e.world - Vector2(cos(a), sin(a)) * e.r * .6
	sparks(hp, .8 * e.scale_f, a, 16 if crit else 8, [Color.WHITE, Color("#fff0c0"), Color("#ffc070")], 8 if crit else 6)
	_flash(hp, 1.2 if crit else .7)
	hitstop = .1 if crit else .05
	kick(a, 4.5 if crit else 2.2)
	if crit:
		shake = maxf(shake, 4)
	if P.get("venomT", 0) > 0:
		e.dot_t = 3.0
		e.dot_d = maxf(e.dot_d, dmg * P.venomB / 300.0)
	hit_enemy(e, dmg, {"crit": crit, "kb": .28, "from": a})
	if d.ls > 0:
		Game.hp = minf(d.life, Game.hp + dmg * d.ls / 100.0)

func kill_enemy(e: Enemy, a := INF) -> void:
	e.dead = true
	e.die_t = 0
	e.fall_a = a if a != INF else atan2(e.world.y - P.y, e.world.x - P.x)
	e.kv = Vector2.ZERO
	e.play("idle")
	var g := _gore_of(e)
	gore(e.world, e.fall_a, 40 if e.boss else 16, g, .9 * e.scale_f)
	hitstop = .45 if e.boss else .06
	var d := Game.d
	if d.lok:
		Game.hp = minf(d.life, Game.hp + d.lok)
	if d.mok:
		Game.mp = minf(d.mana, Game.mp + d.mok)
	Game.gain_xp(e.xp)
	_loot(e)
	var rm: float = {"boss": 25.0, "unique": 6.0, "champ": 2.5}.get(e.rank, 1.0)
	var gl := roundi((3 + Game.mlvl * 1.6) * R.rnd(.8, 1.25) * rm * (1 + d.glutf / 100.0))
	Game.glut += gl
	ftext(e.world - Vector2(0, .3), "+%d Glut" % gl, Color("#ff9a3a"))
	if "feuer" in e.aff:
		tele.append({"shape": "circle", "x": e.world.x, "y": e.world.y, "r": 1.8, "t": 0.0, "dur": .6, "dmg": e.dmg[1] * 1.2, "elem": "fire", "owner": null})
	if e.boss:
		if not Game.boss_dead.get(Game.floor_no, false):
			Game.log_msg("+2 Talentpunkte (P)", Color("#e8c878"))
		Game.boss_dead[Game.floor_no] = true
		var r: Dictionary = m.endRoom
		var st := {"type": "stairs", "x": r.cx + .5, "y": r.cy + .5}
		m.objs.append(st)
		var n := Prop.new().setup(st, true)
		world.add_child(n)
		obj_nodes.append(n)
		_light(Iso.to_screen(Vector2(st.x, st.y)), 140, .6)
		Game.banner.emit("FEIND BEZWUNGEN", e.e_name, "boss")
		shake = 14

## lay an item near a point, somewhere one can stand (dropItem in 170-combat.js)
func drop_item(it: Dictionary, x: float, y: float) -> void:
	for k in 12:
		var a := R.next() * 7
		var r := R.next() * 1.1
		var nx := x + cos(a) * r
		var ny := y + sin(a) * r
		if walkable(nx, ny):
			x = nx
			y = ny
			break
	items.append({"it": it, "x": x, "y": y, "t": 0.0})
	if it.rar == "unique":
		Game.log_msg("Einzigartig: " + it.name, Items.RCOL.unique)

## what a slain foe leaves (killEnemy in 170-combat.js): gear now and then, junk often, potions sometimes
func _loot(e: Enemy) -> void:
	var ilvl: int = Game.mlvl + {"boss": 3, "unique": 2, "champ": 1}.get(e.rank, 0)
	var mf: float = Game.d.mf
	var n := 0
	var boost := 0.0
	var nj := 0
	match e.rank:
		"boss":
			n = 2
			boost = .6
			nj = R.rint(3, 5)
		"unique":
			n = R.rint(1, 2)
			boost = .3
			nj = R.rint(2, 3)
		"champ":
			n = 1 if R.next() < .3 else 0
			boost = .12
			nj = R.rint(1, 2)
		_:
			n = 1 if R.next() < .045 else 0
			nj = 1 if R.next() < .42 else 0
	if e.summoned:
		n = 0
		nj = 0
	for k in n:
		var o := {"mf": mf, "boost": boost}
		if e.boss and k < 1:
			o.rarity = "unique" if R.next() < .06 else ("rare" if R.next() < .4 else "magic")
		drop_item(Items.make(ilvl, o), e.world.x, e.world.y)
	for k in nj:
		drop_item(Items.junk_for(e, Game.mlvl), e.world.x, e.world.y)
	if R.next() < 1e-4:
		drop_item(Items.make(ilvl + 22, {"rarity": "unique", "mf": mf}), e.world.x, e.world.y)
		Game.banner.emit("EIN WUNDER", "Das Schicksal lächelt dir zu", "boss")
	if R.next() < (.06 if e.rank == "normal" else .35):
		drop_item(Items.potion("life" if R.next() < .65 else "mana", Game.floor_no), e.world.x, e.world.y)

func pickup(gi: Dictionary) -> void:
	if not items.has(gi):
		return
	if not Items.inv_add(gi.it):
		Game.log_msg("Das Inventar ist voll.", Color("#ff5a4a"))
		return
	items.erase(gi)

## the name plates of everything on the ground, stacked so none covers another (drawLabels in 230-environment.js)
func _labels() -> void:
	labels.clear()
	var font := ThemeDB.fallback_font
	var sorted := items.duplicate()
	sorted.sort_custom(func(a, b): return a.x + a.y < b.x + b.y)
	for gi in sorted:
		var s := Iso.to_screen(Vector2(gi.x, gi.y))
		var tw := font.get_string_size(gi.it.name, HORIZONTAL_ALIGNMENT_LEFT, -1, 11).x + 10
		var r := Rect2(s.x - tw / 2, s.y - 42, tw, 15)
		for g in 12:
			var hit = null
			for l in labels:
				if l.r.intersects(r):
					hit = l
					break
			if hit == null:
				break
			r.position.y = hit.r.position.y - r.size.y - 1
		labels.append({"r": r, "gi": gi})

func _gore_of(e: Enemy) -> String:
	match e.type:
		"skel", "archer": return "bone"
		"spider", "scorp": return "ichor"
		"golem": return "rock"
		"wraith": return "mote"
	return "blood"

func _drop_dead() -> void:
	var keep: Array[Enemy] = []
	for e in enemies:
		if e.dead:
			e.queue_free()
		else:
			keep.append(e)
	enemies = keep

# ---------- foes (updEnemy, chase, fireProj, bossUpdate) ----------

func _upd_enemy(e: Enemy, dt: float) -> void:
	e.flash = maxf(0, e.flash - dt)
	e.slow = maxf(0, e.slow - dt)
	e.hit_t = maxf(0, e.hit_t - dt)
	e.lunge_t = maxf(0, e.lunge_t - dt)
	if e.kv != Vector2.ZERO:
		e.world = move_ent(e.world, e.kv * dt, e.r)
		e.kv *= pow(.002, dt)
		if absf(e.kv.x) + absf(e.kv.y) < .05:
			e.kv = Vector2.ZERO
	var pp := Vector2(P.x, P.y)
	var dv := pp - e.world
	var d := dv.length()
	var sp := e.spd * (.5 if e.slow > 0 else 1.0)
	if P.dead:
		e.aggro = false
	if P.get("veilT", 0) > 0 and not e.boss and d > 1.4:
		# in the shadow step's veil they lose the hero
		if e.aggro:
			e.aggro = false
			ftext(e.world - Vector2(0, .3), "?", Color("#b8b0d8"))
		if e.anim == "walk":
			e.play("idle")
		return
	if not e.aggro and not P.dead and d < (9.0 if e.boss else 7.5) and e_los(e, 0):
		e.aggro = true
		for p in e.pack:
			p.aggro = true
	if not e.aggro:
		if e.anim == "walk":
			e.play("idle")
		return
	if d > 26:
		e.aggro = false
		return
	e.cd -= dt
	var busy := false
	for tl in tele:
		if tl.owner == e and not tl.get("done", false):
			busy = true
			if tl.t >= tl.dur - .3 and e.anim != "attack":
				e.play("attack")
	if e.boss:
		_boss_update(e, dt, d, busy, sp)
		return
	if busy:
		return
	if e.charge > 0:
		e.charge -= dt
		if e.charge <= 0:
			_fire_proj(e)
		return
	var k: String = e.mon.kind
	if k == "melee":
		if d <= e.mon.range + e.r + P.r * .5 and e.cd <= 0:
			e.face = atan2(dv.y, dv.x)
			var dmg := R.rnd(e.dmg[0], e.dmg[1])
			var el = e.elem
			if el == null:
				el = "frost" if "kalt" in e.aff else ("fire" if "feuer" in e.aff else null)
			if e.type == "golem":
				tele.append({"shape": "circle", "x": e.world.x, "y": e.world.y, "r": 1.9 * sqrt(e.scale_f), "t": 0.0, "dur": e.mon.wind, "dmg": dmg, "owner": e, "follow": true, "elem": e.elem})
			else:
				tele.append({"shape": "cone", "x": e.world.x, "y": e.world.y, "ang": e.face, "arc": 1.8, "r": e.mon.range + e.r + .45, "t": 0.0,
					"dur": e.mon.wind * (.75 if "schnell" in e.aff else 1.0), "dmg": dmg, "owner": e, "follow": true, "elem": el})
			e.cd = e.mon.cd + e.mon.wind
			e.play("idle")
			return
		if d > e.mon.range + e.r:
			_chase(e, sp, dt, d)
		elif e.anim == "walk":
			e.play("idle")
	else:
		var can: bool = d <= e.mon.range and e_los(e, .1)
		if can and e.cd <= 0:
			e.face = atan2(dv.y, dv.x)
			e.charge = e.mon.wind
			e.cd = e.mon.cd + e.mon.wind
			e.play("attack")
			return
		if not can:
			_chase(e, sp, dt, d)
		elif d < 3:
			var a := atan2(-dv.y, -dv.x)
			e.world = move_ent(e.world, Vector2(cos(a), sin(a)) * sp * .7 * dt, e.r)
			e.face = atan2(dv.y, dv.x)
			if e.anim != "attack":
				e.play("walk")
		else:
			e.face = atan2(dv.y, dv.x)
			if e.anim == "walk":
				e.play("idle")

func _chase(e: Enemy, sp: float, dt: float, d: float) -> void:
	var tp := Vector2(P.x, P.y)
	if d > 1.5 and not e_los(e, e.r * .8):
		var f = flow_dir(e)
		if f == null:
			return
		tp = f
	var a := atan2(tp.y - e.world.y, tp.x - e.world.x)
	e.face = a
	e.world = move_ent(e.world, Vector2(cos(a), sin(a)) * sp * dt, e.r)
	if e.anim != "attack":
		e.play("walk")

func _fire_proj(e: Enemy) -> void:
	var k = e.proj if e.proj != null else e.mon.get("proj", "arrow")
	var a := atan2(P.y - e.world.y, P.x - e.world.x)
	var sp := 11.0 if k == "arrow" else (6.5 if k == "frost" else 7.5)
	var dmg := R.rnd(e.dmg[0], e.dmg[1])
	var shots := 3 if e.rank == "unique" or e.rank == "champ" else 1
	for s in shots:
		var aa := a + (s - (shots - 1) / 2.0) * .22
		proj.append({"x": e.world.x + cos(aa) * .4, "y": e.world.y + sin(aa) * .4, "vx": cos(aa) * sp, "vy": sin(aa) * sp, "owner": "e", "dmg": dmg, "kind": k, "r": .25, "life": 2.0})

func _boss_update(e: Enemy, dt: float, d: float, busy: bool, sp: float) -> void:
	var p2 := e.hp < e.max_hp * .5
	var f := .72 if p2 else 1.0
	if p2 and not e.p2:
		e.p2 = true
		Game.banner.emit(e.e_name.to_upper(), "erhebt sich in Raserei", "boss")
		shake = 10
	if busy:
		return
	if e.cd > 0 or d > 9:
		if d > 2.2:
			_chase(e, sp * (1.25 if p2 else 1.0), dt, d)
		return
	var a := atan2(P.y - e.world.y, P.x - e.world.x)
	e.face = a
	var alive_summons := enemies.filter(func(x): return not x.dead and x.summoned).size()
	var opts := e.moves.filter(func(mv): return (mv != "slam" or d < 3.6) and (mv != "sweep" or d < 4.6) and (mv != "summon" or alive_summons < 6))
	if opts.is_empty():
		_chase(e, sp, dt, d)
		return
	var mv: String = R.pick(opts)
	var dmg := func() -> float: return R.rnd(e.dmg[0], e.dmg[1])
	var dur := .9
	var ex := e.world.x
	var ey := e.world.y
	match mv:
		"slam":
			dur = .95 * f
			tele.append({"shape": "circle", "x": ex, "y": ey, "r": 2.9, "t": 0.0, "dur": dur, "dmg": dmg.call() * 1.6, "owner": e})
			if p2:
				tele.append({"shape": "circle", "x": ex, "y": ey, "r": 4.8, "t": -.45, "dur": dur + .9, "dmg": dmg.call() * 1.1, "owner": e})
		"sweep":
			dur = .75 * f
			tele.append({"shape": "cone", "x": ex, "y": ey, "ang": a, "arc": 2.7, "r": 3.8, "t": 0.0, "dur": dur, "dmg": dmg.call() * 1.3, "owner": e, "follow": true})
		"charge":
			dur = .85 * f
			tele.append({"shape": "line", "x": ex, "y": ey, "ang": a, "len": 9.0, "w": 1.7, "t": 0.0, "dur": dur, "dmg": dmg.call() * 1.4, "owner": e, "on_done": "charge"})
		"nova":
			dur = .8 * f
			tele.append({"shape": "circle", "x": ex, "y": ey, "r": 1.4, "t": 0.0, "dur": dur, "dmg": dmg.call(), "elem": "fire", "owner": e, "on_done": "nova", "n": 22 if p2 else 14})
		"meteor":
			dur = 1.3 * f
			for k in (6 if p2 else 3):
				var o := Vector2(R.rnd(-2.5, 2.5), R.rnd(-2.5, 2.5)) if k else Vector2.ZERO
				tele.append({"shape": "circle", "x": P.x + o.x, "y": P.y + o.y, "r": 1.6, "t": -k * .12, "dur": dur, "dmg": dmg.call() * 1.3, "elem": "fire", "owner": e, "meteor": true})
		"summon":
			dur = .6
			for k in 3:
				var aa := R.next() * 7
				var at := e.world + Vector2(cos(aa), sin(aa)) * 1.6
				if free_at(at.x, at.y, .3):
					var s := Enemy.make(R.pick(["spider", "skel"]), at, "normal", Game.mlvl, R)
					s.aggro = true
					s.summoned = true
					s.xp *= .3
					_add_enemy(s)
					burst(at, Color("#ff7a2a"), 10, 2)
	e.cd = dur + R.rnd(.6, 1.3) * f

## foes push each other apart
func _sep_enemies() -> void:
	var A: Array[Enemy] = []
	for e in enemies:
		if not e.dead:
			A.append(e)
	var cells := {}
	var cs := .8
	for e in A:
		cs = maxf(cs, e.r * 2)
	for i in A.size():
		var k := Vector2i(floori(A[i].world.x / cs), floori(A[i].world.y / cs))
		if not cells.has(k):
			cells[k] = []
		cells[k].append(i)
	for i in A.size():
		var a := A[i]
		var c := Vector2i(floori(a.world.x / cs), floori(a.world.y / cs))
		for oy in range(-1, 2):
			for ox in range(-1, 2):
				for j in cells.get(c + Vector2i(ox, oy), []):
					if j <= i:
						continue
					var b := A[j]
					var dv := b.world - a.world
					var dd := dv.length()
					var mn := a.r + b.r
					if dd < mn and dd > .001:
						var p := (mn - dd) / 2
						a.world = move_ent(a.world, -dv / dd * p, a.r)
						b.world = move_ent(b.world, dv / dd * p, b.r)

# ---------- telegraphs and projectiles ----------

func in_shape(tl: Dictionary, p: Vector2, r: float) -> bool:
	var dv := p - Vector2(tl.x, tl.y)
	var d := dv.length()
	if tl.shape == "circle":
		return d < tl.r + r * .5
	if tl.shape == "cone":
		return d < tl.r + r * .5 and (d < .4 or absf(angle_difference(tl.ang, atan2(dv.y, dv.x))) < tl.arc / 2)
	if tl.shape == "line":
		var c := cos(tl.ang)
		var s := sin(tl.ang)
		var along := dv.x * c + dv.y * s
		var perp := -dv.x * s + dv.y * c
		return along > -.3 and along < tl.len and absf(perp) < tl.w / 2 + r * .5
	return false

func _update_tele(dt: float) -> void:
	for tl in tele:
		tl.t += dt
		var ow = tl.owner
		if tl.get("follow") and ow:
			tl.x = ow.world.x
			tl.y = ow.world.y
		if tl.t >= tl.dur:
			tl.done = true
			if ow and ow.dead:
				continue
			if not P.dead and in_shape(tl, Vector2(P.x, P.y), P.r):
				hurt_player(tl.dmg, tl.get("elem"), ow)
			if ow:
				ow.lunge_t = .22
			var c := Vector2(tl.x, tl.y)
			match tl.get("on_done", ""):
				"charge":
					for k in 45:
						var np: Vector2 = ow.world + Vector2(cos(tl.ang), sin(tl.ang)) * .2
						if not free_at(np.x, np.y, ow.r * .7):
							break
						ow.world = np
					shake = 8
				"nova":
					for k in tl.n:
						var aa: float = k / float(tl.n) * TAU
						proj.append({"x": ow.world.x, "y": ow.world.y, "vx": cos(aa) * 5, "vy": sin(aa) * 5, "owner": "e", "dmg": R.rnd(ow.dmg[0], ow.dmg[1]) * .8, "kind": "fire", "r": .3, "life": 2.4})
			if tl.get("elem") == "fire" or tl.get("meteor"):
				burst(c, Color("#ff9a30"), 14, 2.4)
				_flash(c, 1.4)
			elif tl.shape == "circle":
				_smoke(c, 6)
				if tl.r > 1.5:
					shake = maxf(shake, 5)
			elif tl.shape == "cone":
				slash_fx(c, tl.ang, tl.arc, tl.r * .85, Color8(255, 140, 60) if tl.get("elem") == "fire" else (Color8(160, 215, 255) if tl.get("elem") == "frost" else Color8(255, 232, 210)), .7 * (ow.scale_f if ow else 1.0))
	tele = tele.filter(func(tl): return not tl.get("done", false) and not (tl.owner and tl.owner.dead))

func _update_proj(dt: float) -> void:
	for p in proj:
		p.x += p.vx * dt
		p.y += p.vy * dt
		p.life -= dt
		if p.owner == "p" and p.kind == "flask" and p.life <= 0:
			sk.explode(p)
			continue
		if not walkable(p.x, p.y):
			p.life = 0
			if p.get("aoe") and p.owner == "p":
				sk.explode(p)
			elif p.kind == "arrow":
				sparks(Vector2(p.x, p.y), .5, atan2(-p.vy, -p.vx), 5, [Color.WHITE, Color("#d8d0bc")], 3)
			else:
				burst(Vector2(p.x, p.y), Color("#ff9a30") if p.kind in ["fire", "glut"] else Color("#c8e4ff"), 8, 1.5)
		elif p.owner == "p":
			for e in enemies:
				if not e.dead and e.world.distance_to(Vector2(p.x, p.y)) < e.r + p.r and sk.proj_hit(p, e):
					p.life = 0
					break
		elif p.owner == "e" and not P.dead and not P.get("dash") and Vector2(P.x, P.y).distance_to(Vector2(p.x, p.y)) < P.r + p.r and not P.iframe:
			p.life = 0
			hurt_player(p.dmg, null if p.kind == "arrow" else p.kind, {"x": p.x - p.vx, "y": p.y - p.vy})
		elif p.kind in ["fire", "glut"] and R.next() < .5:
			parts.append({"k": "ember", "x": p.x, "y": p.y, "z": .55, "vx": R.rnd(-.6, .6), "vy": R.rnd(-.6, .6), "vz": R.rnd(.3, 1.2), "t": 0.0, "life": R.rnd(.25, .5), "col": R.pick([Color("#ffc070"), Color("#ff9a30"), Color("#e0661a")]), "s": R.rnd(1, 2), "g": -1.0})
	proj = proj.filter(func(p): return p.life > 0)

# ---------- small effects (160-combat-fx.js, simplified) ----------

func _update_fx(dt: float) -> void:
	for p in parts:
		p.t += dt
		p.x += p.vx * dt
		p.y += p.vy * dt
		p.z += p.vz * dt
		p.vz -= p.g * 9.8 * dt
		if p.z < 0 and p.g > 0:
			p.z = 0
			p.vz = 0
			p.vx *= .5
			p.vy *= .5
	parts = parts.filter(func(p): return p.t < p.life)
	for x in texts:
		x.t += dt
		x.z += dt * 1.2
	texts = texts.filter(func(x): return x.t < 1)
	for s in slashes:
		s.t += dt
	slashes = slashes.filter(func(s): return s.t < s.life)
	for r in rings:
		r.r += r.v * dt
		if r.get("dmg", 0) > 0:
			# a ring that does harm strikes each foe once as it passes
			for e in enemies:
				if e.dead or r.hit.has(e):
					continue
				if absf(e.world.distance_to(Vector2(r.x, r.y)) - r.r) < .5 + e.r:
					r.hit[e] = true
					hit_enemy(e, r.dmg * R.rnd(.85, 1.15), {"col": r.get("hcol", Color("#cfe8ff")), "slow": r.get("slow", 0)})
					if r.get("on_hit"):
						r.on_hit.call(e)
	rings = rings.filter(func(r): return r.r < r.max)
	for f in flashes:
		f.t += dt
	flashes = flashes.filter(func(f): return f.t < f.life)
	if click_fx:
		click_fx.t -= dt
		if click_fx.t <= 0:
			click_fx = null
	if parts.size() > 1500:
		parts = parts.slice(parts.size() - 1500)

func ftext(at: Vector2, txt: String, col: Color, big := false) -> void:
	texts.append({"x": at.x, "y": at.y, "z": .8, "txt": txt, "col": col, "t": 0.0, "big": big})

func sparks(at: Vector2, z: float, a: float, n: int, cols: Array, sp: float) -> void:
	for k in n:
		var aa := a + R.rnd(-.7, .7)
		var v := R.rnd(.4, 1) * sp
		parts.append({"k": "spark", "x": at.x, "y": at.y, "z": z, "vx": cos(aa) * v, "vy": sin(aa) * v, "vz": R.rnd(-1, 3), "t": 0.0, "life": R.rnd(.15, .35), "col": R.pick(cols), "s": R.rnd(1, 2), "g": .3})

func gore(at: Vector2, a: float, n: int, kind: String, z: float) -> void:
	var cols: Array = GORE[kind]
	for k in n:
		var aa := a + R.rnd(-.9, .9)
		var v := R.rnd(.5, 3)
		parts.append({"k": "gore", "x": at.x, "y": at.y, "z": z * R.rnd(.6, 1.2), "vx": cos(aa) * v, "vy": sin(aa) * v, "vz": R.rnd(.5, 3), "t": 0.0, "life": R.rnd(.6, 1.4), "col": R.pick(cols), "s": R.rnd(1.2, 2.6), "g": 1.0})

func burst(at: Vector2, col: Color, n: int, sp: float) -> void:
	for k in n:
		var aa := R.rnd(0, TAU)
		var v := R.rnd(.3, 1) * sp
		parts.append({"k": "spark", "x": at.x, "y": at.y, "z": R.rnd(.2, 1), "vx": cos(aa) * v, "vy": sin(aa) * v, "vz": R.rnd(0, 2), "t": 0.0, "life": R.rnd(.3, .7), "col": col, "s": R.rnd(1, 2.2), "g": .2})

func _smoke(at: Vector2, n: int) -> void:
	for k in n:
		parts.append({"k": "smoke", "x": at.x + R.rnd(-.2, .2), "y": at.y + R.rnd(-.2, .2), "z": R.rnd(0, .3), "vx": R.rnd(-.4, .4), "vy": R.rnd(-.4, .4), "vz": R.rnd(.2, .6), "t": 0.0, "life": R.rnd(.4, .8), "col": Color(90 / 255.0, 78 / 255.0, 62 / 255.0, .6), "s": R.rnd(3, 6), "g": 0.0})

func slash_fx(at: Vector2, ang: float, arc: float, r: float, col: Color, z: float) -> void:
	slashes.append({"x": at.x, "y": at.y, "ang": ang, "arc": arc, "r": r, "col": col, "z": z, "t": 0.0, "life": .2, "wdt": 3.0})

func _flash(at: Vector2, k: float) -> void:
	flashes.append({"x": at.x, "y": at.y, "r": 60 * k, "a": .6, "t": 0.0, "life": .12})

func kick(a: float, k: float) -> void:
	kick_v += Enemy._scr_dir(a) * k

# ---------- light every frame ----------

func _lights() -> void:
	var want := []
	if not P.dead:
		want.append([Iso.to_screen(Vector2(P.x, P.y)), 330 + sin(Game.t * 7) * 5, 1.0])
	for L in lights:
		want.append([L.p, L.r + sin(Game.t * 9 + L.ph) * L.f, L.a])
	# moving lights: fire in flight, burning telegraphs, short flashes, the glut you left behind
	for p in proj:
		if p.kind != "arrow":
			want.append([Iso.to_screen(Vector2(p.x, p.y)), 90.0, .8])
	for tl in tele:
		if tl.t > 0 and tl.get("elem") == "fire":
			want.append([Iso.to_screen(Vector2(tl.x, tl.y)), 80.0, .5])
	for f in flashes:
		want.append([Iso.to_screen(Vector2(f.x, f.y)), f.r, f.a * (1 - f.t / f.life)])
	if glutmal:
		want.append([Iso.to_screen(Vector2(glutmal.x, glutmal.y)), 110.0, .7])
	var ct := get_viewport().get_canvas_transform()
	var vp := get_viewport_rect().size
	var arr := PackedVector4Array()
	for x in want:
		var sp: Vector2 = ct * x[0] - Vector2(0, 10)
		var r: float = x[1]
		if sp.x + r < 0 or sp.x - r > vp.x or sp.y + r * .6 < 0 or sp.y - r * .6 > vp.y or r <= 0 or x[2] <= 0:
			continue
		arr.append(Vector4(sp.x, sp.y, r, x[2]))
		if arr.size() >= 128:
			break
	dark_mat.set_shader_parameter("vp", vp)
	dark_mat.set_shader_parameter("n", arr.size())
	dark_mat.set_shader_parameter("L", arr)

## walls in front of the hero turn see-through, as in the browser
func _fade_walls() -> void:
	var ps := Iso.to_screen(Vector2(P.x, P.y))
	var pd: float = P.x + P.y
	var now := {}
	var pi := int(P.x)
	var pj := int(P.y)
	for j in range(pj - 1, pj + 7):
		for i in range(pi - 1, pi + 7):
			var s = walls.get(j * w + i)
			if s == null:
				continue
			var sp := Iso.to_screen(Vector2(i, j))
			if i + j + 1 > pd + .5 and absf(sp.x - ps.x) < 70 and sp.y - ps.y < 90 and sp.y - ps.y > -10:
				now[j * w + i] = s
				s.modulate.a = .32
	for k in faded:
		if not now.has(k):
			faded[k].modulate.a = 1
	faded = now
