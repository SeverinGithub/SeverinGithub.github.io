extends Node
## The game scene: one Level at a time (a tower floor) under the HUD. Starts a new hero for now; the title screen,
## hero list and saving come later (see docs/Godot-Umstieg.md).
## Command line for testing (after --): --class=jaegerin  --floor=4  --seed=123  --shot=/pfad/bild.png [--shot-after=2.5]
## --bot (or --bot=near, --bot=boss, --bot=stairs) plays by itself, --raw leaves out darkness and palette, --maphash prints floors 1–4.

var level: Level
var hud: Hud
var args := {}

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	if args.has("maphash"):
		# compare with the browser: the same seed must give the same floors (see docs/Godot-Umstieg.md)
		for f in range(1, 5):
			var m := DungeonGen.generate(int(args.get("seed", "4242")), f)
			var hsh := 0
			for v in m.t:
				hsh = (hsh * 31 + v) % 1000000007
			print("Ebene %d: Karte %d · %d Stücke Deko · %d Requisiten · Objekte %s" % [f, hsh, m.deco.size(), m.props.size(), m.objs.map(func(o): return "%s@%.1f,%.1f" % [o.type, o.x, o.y])])
		get_tree().quit()
		return
	Game.start_new(args.get("class", "krieger"))
	if args.has("seed"):
		Game.seed_value = int(args.seed)
	var layer := CanvasLayer.new()
	layer.layer = 10
	add_child(layer)
	hud = Hud.new()
	layer.add_child(hud)
	enter_floor(int(args.get("floor", "1")))
	Game.log_msg("Klicke auf den Boden, um zu gehen, auf Feinde, um zuzuschlagen. Leertaste rollt, F trinkt aus dem Flakon.")
	if args.has("bot"):
		_bot()
	if args.has("shot"):
		await get_tree().create_timer(float(args.get("shot-after", "2.0"))).timeout
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(args.shot)
		get_tree().quit()

func enter_floor(f: int) -> void:
	if level:
		level.queue_free()
	Game.floor_no = f
	Game.max_floor = maxi(Game.max_floor, f)
	Game.mlvl = Game.mlvl_of(f)
	level = Level.new()
	add_child(level)
	move_child(level, 0)
	level.build(DungeonGen.generate(Game.seed_value, f))
	hud.level = level
	Game.floor_changed.emit(f)
	Game.log_msg("Ebene %d · Monsterstufe %d" % [f, Game.mlvl], Color("#a39b88"))

## --bot: for testing without hands. The hero goes for the nearest foe, again and again, and prints how it goes.
func _bot() -> void:
	var near := func() -> Enemy:
		var best: Enemy = null
		for e in level.enemies:
			if not e.dead and (best == null or e.world.distance_to(level.hero.world) < best.world.distance_to(level.hero.world)):
				best = e
		return best
	var first: Enemy = near.call()
	if args.get("bot") == "stairs":
		for o in level.obj_nodes:
			if o.p.type == "stairs":
				level.reset_hero(level.find_path(Vector2(o.p.x, o.p.y), Vector2(o.p.x + 3, o.p.y)).back())
				level.P.interact = o
				level.P.path = level.find_path(level.hero.world, Vector2(o.p.x, o.p.y))
		return
	if args.get("bot") == "boss":
		for e in level.enemies:
			if e.boss:
				first = e
		args.bot = "near"
	if first and args.get("bot") == "near":
		var at := first.world
		for k in 40:
			var p := at + Vector2(randf_range(-4, 4), randf_range(-4, 4))
			if level.free_at(p.x, p.y, .3) and level.los(p, at):
				level.reset_hero(p)
				break
	while is_inside_tree():
		await get_tree().create_timer(.3).timeout
		if level.P.dead:
			continue
		if level.P.target == null:
			level.P.target = near.call()
		var kills := level.enemies.filter(func(e): return e.dead).size()
		print("Bot: Leben %d/%d · Stufe %d · Erfahrung %d · Glut %d · erledigt %d von %d" % [Game.hp, Game.d.life, Game.lvl, Game.xp, Game.glut, kills, level.enemies.size()])
