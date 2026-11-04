extends Node
## The game scene: one Level at a time (the sky on floor 0, or a tower floor) under the HUD. Starts a new hero on the hill
## for now; the title screen, hero list and saving come later (see docs/Godot-Umstieg.md).
## Command line for testing (after --): --class=jaegerin  --floor=4  --seed=123  --shot=/pfad/bild.png [--shot-after=2.5]
## --bot (or --bot=near, --bot=boss, --bot=stairs, --bot=walk, --bot=tour; --why prints its target) plays by itself,
## --at=38,37 starts on that chunk's island, --raw leaves out darkness and palette, --maphash prints floors 1–4,
## --worldhash prints the sky's check numbers (tools/godot-worldhash.js prints the same in the browser).

var level: Level
var hud: Hud
var inv_panel: Inventory
var sk_panel: SkillPanel
var args := {}
var wg: WorldGen                 # the sky stays as it was while you are in the tower (G.maps[0])

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	if args.has("shuf"):
		var R := Rng.new(4242 * 6151 + 4 * 92821)
		R.next()
		var a := [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
		TowerTwo.v8_shuffle(a, R)
		print(a, " ", R.next())
		get_tree().quit()
		return
	if args.has("maphash"):
		# compare with the browser: the same seed must give the same floors (see docs/Godot-Umstieg.md)
		for f in range(1, 5):
			var m := DungeonGen.generate(int(args.get("seed", "4242")), f)
			var hsh := 0
			for v in m.t:
				hsh = (hsh * 31 + v) % 1000000007
			print("Ebene %d: Karte %d · %d Stücke Deko · %d Requisiten · Objekte %s" % [f, hsh, m.deco.size(), m.props.size(), m.objs.map(func(o): return "%s@%.2f,%.2f" % [o.get("ct", o.type), o.x, o.y])])
			if args.has("why"):
				print("  Räume ", " ".join(m.rooms.map(func(r): return "%d,%d%s%s" % [r.cx, r.cy, "S" if r == m.startRoom else "", "E" if r == m.endRoom else ""])))
			# the second pass (760) without the unseeded traps: secret, boulders, what lies about
			var e := TowerTwo.populate(m, int(args.get("seed", "4242")), 1)
			if e:
				e.free()
			var sec: String = "-" if m.secret == null else "%d,%d %d,%d" % [m.secret.fi, m.secret.fj, m.secret.dir.x, m.secret.dir.y]
			var dc: Array = m.props.filter(func(p): return String(p.k).begins_with("dc")).map(func(p): return "%s@%.2f,%.2f%s" % [p.k, p.x, p.y, "f" if p.get("f") else ""])
			print("  Geheim %s · Felsen %s · Kram %d %d %s" % [sec, " ".join(m.boulders.map(func(b): return "%.1f,%.1f/%.2f/%.1f/%.3f" % [b.x0, b.y0, b.ang, b.len, b.cd])), dc.size(), _sh(" ".join(dc)), " ".join(dc.slice(0, 3))])
		get_tree().quit()
		return
	if args.has("worldhash"):
		print(world_hash(int(args.get("seed", "4242"))))
		get_tree().quit()
		return
	Game.start_new(args.get("class", "krieger"))
	if args.has("seed"):
		Game.seed_value = int(args.seed)
	if args.has("at"):
		# test: start somewhere else in the sky, at a chunk "cx,cy"
		var ab: PackedStringArray = args.at.split(",")
		wg = WorldGen.new(Game.seed_value)
		var I = wg.island_of(int(ab[0]), int(ab[1]))
		if I != null:
			wg.start = {"x": I.x, "y": I.y}
	var layer := CanvasLayer.new()
	layer.layer = 10
	add_child(layer)
	hud = Hud.new()
	layer.add_child(hud)
	inv_panel = Inventory.new()
	layer.add_child(inv_panel)
	sk_panel = SkillPanel.new()
	layer.add_child(sk_panel)
	enter_floor(int(args.get("floor", "0")))
	Game.log_msg("Klicke auf den Boden, um zu gehen, auf Feinde, um zuzuschlagen. Leertaste rollt, F trinkt aus dem Flakon, Q und X Tränke, 1–6 Fertigkeiten, I Inventar, K Fertigkeiten.")
	if args.has("lvl"):
		# test: a hero of this level with all six slots learned
		Game.lvl = int(args.lvl)
		for i in 6:
			Game.slv[i] = maxi(1, Game.lvl / 3)
		Game.recalc()
		Game.hp = Game.d.life
		Game.mp = Game.d.mana
	if args.has("weapon"):
		var w := Game.item_of(args.weapon)
		if w.cls == "staff":
			w.elem = args.get("elem", "fire")
		Game.eq.weapon = w
		Game._gear()
		Game.mp = Game.d.mana
	if args.has("loot"):
		# test: a heap of items around the hero, the bag filled, the panel open
		var ilvl := int(args.get("ilvl", "20"))
		for k in int(args.loot):
			var rar: String = ["normal", "magic", "rare", "unique"][k % 4]
			level.drop_item(Items.make(ilvl, {"rarity": rar}), level.P.x + 1.5, level.P.y + 1.5)
		for k in 6:
			Items.inv_add(Items.make(ilvl, {"rarity": ["magic", "rare", "unique"][k % 3]}))
		for k in 3:
			Items.inv_add(Items.junk_for(null, 3))
		for gi in level.items:
			gi.t = 1.0
	if args.has("pos"):
		# test: stand somewhere else on the floor, "x,y" in tiles
		var xy: PackedStringArray = args.pos.split(",")
		level.P.x = float(xy[0])
		level.P.y = float(xy[1])
		if args.has("why"):
			for o in level.obj_nodes:
				if Vector2(o.p.x, o.p.y).distance_to(Vector2(level.P.x, level.P.y)) < 8:
					print(o.p.get("ct", o.p.type), " ", o.p.x, ",", o.p.y, " ", o.visible, " ", o.position, " ", o.get_parent().name)
	if args.has("open"):
		# test: open every chest within six steps, with keys at hand and the trial's seal broken
		Game.keys = 3
		for o in level.obj_nodes:
			if o.p.type == "chest" and Vector2(o.p.x, o.p.y).distance_to(Vector2(level.P.x, level.P.y)) < 6:
				o.p.sealed = false
				level._open_chest(o)
	if args.has("skp"):
		sk_panel.visible = true
	if args.has("inv"):
		inv_panel.visible = true
		var it = Game.inv.filter(func(i): return i.slot != "potion" and i.slot != "junk").front()
		inv_panel._hover_it = it
	if args.has("bot"):
		_bot()
	if args.has("shot"):
		await get_tree().create_timer(float(args.get("shot-after", "2.0"))).timeout
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png(args.shot)
		get_tree().quit()

## floor 0 is the sky with the hill; through the door you come to the deepest floor whose bonfire burns, beside it
func enter_floor(f: int, by_door := false) -> void:
	if level:
		level.queue_free()
	Game.floor_no = f
	Game.max_floor = maxi(Game.max_floor, f)
	Game.mlvl = Game.mlvl_of(f) if f > 0 else 1
	level = Level.new()
	add_child(level)
	move_child(level, 0)
	if f == 0:
		if wg == null:
			wg = WorldGen.new(Game.seed_value)
		level.build({"world": true, "wg": wg, "floor": 0, "w": wg.w, "h": wg.h, "t": wg.t, "under": wg.under, "start": wg.start, "objs": [], "props": [], "deco": []})
	else:
		if not Game.maps.has(f):
			Game.maps[f] = DungeonGen.generate(Game.seed_value, f)
		level.build(Game.maps[f])
		if by_door and f > 1:
			for o in level.m.objs:
				if o.type == "shrine":
					level.reset_hero(level.near_walk(o.x + 1, o.y + 1))
	hud.level = level
	inv_panel.level = level
	Game.floor_changed.emit(f)
	if f > 0:
		Game.log_msg("Ebene %d · Monsterstufe %d" % [f, Game.mlvl], Color("#a39b88"))
	else:
		Game.banner.emit("Der Hügel", "Ein Turm, schwarz gegen den Himmel", "")

## --bot: for testing without hands. The hero goes for the nearest foe, again and again, and prints how it goes.
func _bot() -> void:
	var near := func() -> Enemy:
		var best: Enemy = null
		for e in level.enemies:
			if not e.dead and (best == null or e.world.distance_to(level.hero.world) < best.world.distance_to(level.hero.world)):
				best = e
		return best
	var first: Enemy = near.call()
	if args.get("bot") == "walk":
		# stream the sky: the hero is set down chunk by chunk across it, each step timed
		for k in 24:
			var at := Vector2(level.ow.wg.start.x + k * 16, level.ow.wg.start.y + k * 9)
			var t0 := Time.get_ticks_usec()
			level.reset_hero(at)
			level.ow.tick()
			await get_tree().process_frame
			print("Lauf %d: %s · %.1f ms · Gegner %d · Objekte %d · Chunks %d" % [k, Game.place, (Time.get_ticks_usec() - t0) / 1000.0, level.enemies.size(), level.obj_nodes.size(), level.ow.wg.cdata.size()])
		get_tree().quit()
		return
	if args.get("bot") == "tour":
		# the way into the tower and home again: door, light the floor's bonfire, H
		for o in level.obj_nodes:
			if o.p.type == "door":
				level.P.interact = o
				level.P.path = level.find_path(level.hero.world, Vector2(o.p.x, o.p.y))
		await get_tree().create_timer(4).timeout
		print("Tour: Ebene %d · Gegner %d" % [Game.floor_no, level.enemies.size()])
		for o in level.obj_nodes:
			if o.p.type == "shrine":
				level.reset_hero(level.near_walk(o.p.x + 1, o.p.y + 1))
				level._interact(o)
		await get_tree().create_timer(.5).timeout
		level._home()
		await get_tree().create_timer(1).timeout
		print("Tour: Ebene %d · %s · Held bei %.1f,%.1f · Gegner %d · Tür führt zu Ebene %d" % [Game.floor_no, Game.place, level.P.x, level.P.y, level.enemies.size(), Game.top_floor()])
		get_tree().quit()
		return
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
		if level.P.target == null and level.P.pick == null and level.items.size():
			# loot first: the nearest thing on the ground
			var gi = level.items[0]
			for g in level.items:
				if level.hero.world.distance_to(Vector2(g.x, g.y)) < level.hero.world.distance_to(Vector2(gi.x, gi.y)):
					gi = g
			level.P.pick = gi
			level.P.path = level.find_path(level.hero.world, Vector2(gi.x, gi.y))
			if level.P.path.is_empty():
				level.items.erase(gi)
				level.P.pick = null
		if level.P.target == null and level.P.pick == null:
			level.P.target = near.call()
		if args.has("cast") and level.P.target:
			# cycle through the six skills at the nearest foe
			Game.mp = Game.d.mana
			var i := int(Game.t * 2) % 6
			level.sk.cast(i, level.P.target.world.x, level.P.target.world.y)
			print("Zauber: ", Game.sk_name(Game.sk_ids()[i]), " · Zonen %d · Geschosse %d · Ringe %d" % [level.sk.zones.size(), level.proj.size(), level.rings.size()])
		var kills := level.enemies.filter(func(e): return e.dead).size()
		if args.has("why") and level.P.target:
			var tg: Enemy = level.P.target
			print("Ziel: %s (%.0f/%.0f) bei %.1f,%.1f · Abstand %.1f · Weg %d · Held %.1f,%.1f · Felder %d %d · Sicht %s · Reichweite %.2f · Ausdauer %.0f · atk %.2f cast %s roll %.2f stop %.2f dash %s" % [tg.e_name, tg.hp, tg.max_hp, tg.world.x, tg.world.y, tg.world.distance_to(level.hero.world), level.P.path.size(), level.P.x, level.P.y, level.tile_at(level.P.x, level.P.y), level.tile_at(tg.world.x, tg.world.y), level.los(level.hero.world, tg.world, level.P.r), Game.d.reach, Game.st, level.P.atkT, level.P.get("cast"), level.P.roll, level.hitstop, level.P.get("dash")])
		print("Bot: Leben %d/%d · Stufe %d · Erfahrung %d · Glut %d · erledigt %d von %d · Boden %d · Tasche %s" % [Game.hp, Game.d.life, Game.lvl, Game.xp, Game.glut, kills, level.enemies.size(), level.items.size(), ", ".join(Game.inv.map(func(i): return i.name + ("×%d" % i.n if i.get("n", 1) > 1 else "")))])

## --worldhash: the sky around the home island in numbers, to hold against the browser (tools/godot-worldhash.js)
static func world_hash(s: int) -> String:
	var wg := WorldGen.new(s)
	var out := []
	var kinds := ""
	for cy in range(30, 50):
		for cx in range(30, 50):
			var I = wg.island_of(cx, cy)
			kinds += "." if I == null else String(I.kind).left(2)
	out.append("Inseln %d" % _sh(kinds))
	var bad := []
	for cy in range(30, 50):
		for cx in range(30, 50):
			var I = wg.island_of(cx, cy)
			if I != null:
				bad.append("%d,%d:%s@%.2f,%.2f r%.3f" % [cx, cy, I.kind, I.x, I.y, I.r])
	out.append("Inselliste %d" % _sh(" ".join(bad)))
	wg.tick(wg.start.x, wg.start.y)
	var hh := 0
	for j in range(35 * 32, 44 * 32):
		for i in range(35 * 32, 44 * 32):
			var k := j * wg.w + i
			hh = (hh * 31 + wg.t[k] * 7 + wg.under[k]) % 1000000007
	out.append("Kacheln %d" % hh)
	for key in wg.active:
		var c: Dictionary = wg.cdata[key]
		var dh := 0
		for d in c.deco:
			dh = (dh * 31 + int(round(d.x * 1000)) + int(round(d.y * 1000)) * 7 + d.v) % 1000000007
		var bh := 0
		for b in c.blocks:
			bh = (bh * 31 + b.i * 3 + b.j * 5 + b.v) % 1000000007
		var sp := 0
		for q in c.spawn:
			sp = (sp * 31 + int(round(q.x * 10)) + int(round(q.y * 10)) * 3) % 1000000007
		out.append("%s: Deko %d/%d Blöcke %d/%d Requisiten %d Objekte %s Gegner %d/%d" % [key, c.deco.size(), dh, c.blocks.size(), bh, c.props.size(), ",".join(c.objs.map(func(o): return "%s@%.1f,%.1f%s" % [o.type, o.x, o.y, (" " + o.name) if o.has("name") else ""])), c.spawn.size(), sp])
	var bb := 0
	for key in wg.bblocks:
		for b in wg.bblocks[key]:
			bb = (bb * 31 + b.i * 3 + b.j * 5 + b.v) % 1000000007
	out.append("Geländer %d" % bb)
	for key in ["37,37", "37,38", "37,39"]:
		if wg.cdata.has(key):
			var c: Dictionary = wg.cdata[key]
			out.append("%s Kram %s Truhen %s" % [key, " ".join(c.props.filter(func(p): return p.has("k") and String(p.k).begins_with("dc")).map(func(p): return "%s@%.2f,%.2f%s" % [p.k, p.x, p.y, "f" if p.f else ""])),
				" ".join(c.objs.filter(func(o): return o.type == "chest").map(func(o): return "%s@%.2f,%.2f" % [o.ct, o.x, o.y]))])
	out.append("Heimat: Deko %d Blöcke %d Objekte %d" % [wg.home.deco.size(), wg.home.blocks.size(), wg.home.objs.size()])
	out.append("Inselherren " + " ".join(wg.wb_at.map(func(v): return "%d,%d" % [v.x, v.y])))
	# the whole sky, and the ground around four far places
	var all := []
	for cy in 80:
		for cx in 80:
			var I = wg.island_of(cx, cy)
			if I != null:
				all.append("%d,%d:%s@%.2f,%.2f r%.3f" % [cx, cy, I.kind, I.x, I.y, I.r])
	var far := []
	for at in [Vector2i(50, 45), Vector2i(30, 30), Vector2i(60, 60), Vector2i(20, 50)]:
		for dy in range(-3, 4):
			for dx in range(-3, 4):
				wg.ow_island(at.x + dx, at.y + dy)
		for dy in range(-2, 3):
			for dx in range(-2, 3):
				var a: int = at.x + dx
				var b: int = at.y + dy
				wg.ow_bridge(a, b, a + 1, b)
				wg.ow_bridge(a, b, a, b + 1)
				wg.ow_bridge(a - 1, b, a, b)
				wg.ow_bridge(a, b - 1, a, b)
		var fh := 0
		for j in range((at.y - 3) * 32, (at.y + 4) * 32):
			for i in range((at.x - 3) * 32, (at.x + 4) * 32):
				var k := j * wg.w + i
				fh = (fh * 31 + wg.t[k] * 7 + wg.under[k]) % 1000000007
		far.append(str(fh))
	out.append("Alle %d %d Felder %s" % [all.size(), _sh(" ".join(all)), " ".join(far)])
	out.append("Wiese %d %d %d %.6f" % [Overworld.gh(1234, 1250, 77), Overworld.gh(1240, 1290, 36), Overworld.gh(7, 9, 404), Overworld.meadow(1234, 1250)])
	return "\n".join(out)

static func _sh(s: String) -> int:
	var hh := 0
	for c in s.to_utf8_buffer():
		hh = (hh * 31 + c) % 1000000007
	return hh
