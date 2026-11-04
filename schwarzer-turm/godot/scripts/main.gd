extends Node2D
## Test scene for the asset pipeline: a grass island from the exported tiles, the hero walks where you click,
## a few enemies stroll about and strike when the hero comes close. Keys 1–4 switch class and outfit (Hero, built from layers),
## space strikes. Nothing of the real game logic yet.

const SIZE := 18
var hero: Hero
var foes: Array[Figure] = []
var target := Vector2.ZERO
var cam: Camera2D
var grass: Array[Texture2D] = []

func _ready() -> void:
	y_sort_enabled = true
	for i in 6:
		grass.append(Data.sprite("grass/%d" % i))
	hero = Hero.new()
	hero.world = Vector2(9, 9)
	add_child(hero)
	_outfit(0)
	target = hero.world
	var kinds := ["enemy_skel", "enemy_ghoul", "enemy_spider", "enemy_archer", "enemy_cult", "enemy_golem"]
	for i in kinds.size():
		var f := _figure(kinds[i], Vector2(3 + i * 2.2, 4 + (i % 2) * 8))
		f.set_meta("home", f.world)
		foes.append(f)
	cam = Camera2D.new()
	cam.position_smoothing_enabled = true  # by time, not by frame: the lesson from the browser version
	cam.position_smoothing_speed = 9.0
	add_child(cam)
	cam.make_current()

const OUTFITS := [
	["krieger", {"armor": "Mondsilber-Plattenharnisch", "helm": "Hornhelm", "weapon": "Blutstahl-Langschwert", "offhand": "Wappenschild", "gloves": "Panzerhandschuhe", "boots": "Plattenstiefel", "belt": "Kriegsgürtel"}],
	["jaegerin", {"armor": "Schattenmantel", "helm": "Rabenkapuze", "weapon": "Giftzahn", "gloves": "Krallenhandschuhe", "boots": "Nebelläufer"}],
	["magier", {"armor": "Runenrobe", "helm": "Spitzhut", "weapon": "Knotenstab", "gloves": "Runenhandschuhe", "boots": "Sandalen", "belt": "Kordel"}],
	["alchemist", {"armor": "Pestmantel", "helm": "Pestmaske", "weapon": "Kurzbogen", "gloves": "Glutgreifer", "belt": "Trankgurt"}],
]

func _outfit(i: int) -> void:
	hero.cls = OUTFITS[i][0]
	hero.gear = OUTFITS[i][1].duplicate()
	hero.unique = {}
	if hero.is_inside_tree():
		hero.rebuild()

func _figure(key: String, at: Vector2) -> Figure:
	var f := Figure.new()
	f.key = key
	f.world = at
	add_child(f)
	return f

func _draw() -> void:
	# the floor, back to front like the browser (index (i·7 + j·13) mod 6 picks the same tile variants)
	for j in SIZE:
		for i in SIZE:
			var p := Iso.to_screen(Vector2(i, j))
			draw_texture(grass[(i * 7 + j * 13) % 6], p - Vector2(32, 0))

func _unhandled_input(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and not ev.echo:
		if ev.keycode >= KEY_1 and ev.keycode <= KEY_4:
			_outfit(ev.keycode - KEY_1)
		elif ev.keycode == KEY_SPACE:
			hero.play("attack")
	if ev.is_action_pressed("move_click"):
		var w := Iso.to_world(get_global_mouse_position())
		target = w.clamp(Vector2(.5, .5), Vector2(SIZE - .5, SIZE - .5))

func _process(dt: float) -> void:
	var d := target - hero.world
	if d.length() > .08 and hero.anim != "attack":
		hero.face = d.angle()
		hero.world += d.normalized() * min(d.length(), 4.2 * dt)
		hero.play("walk")
	elif hero.anim == "walk":
		hero.play("idle")
	cam.position = Iso.to_screen(hero.world)
	for f in foes:
		var to_hero := hero.world - f.world
		if to_hero.length() < 1.3:
			f.face = to_hero.angle()
			if f.anim != "attack":
				f.play("attack")
		else:
			var home: Vector2 = f.get_meta("home")
			var t := home + Vector2(cos(Time.get_ticks_msec() / 1500.0 + f.get_index()), sin(Time.get_ticks_msec() / 1900.0 + f.get_index())) * 1.5
			var m := t - f.world
			if m.length() > .05:
				f.face = m.angle()
				f.world += m.normalized() * min(m.length(), 1.6 * dt)
				if f.anim != "attack":
					f.play("walk")
