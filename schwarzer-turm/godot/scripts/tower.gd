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
var ui: UiLayer                  # title, menus, dialogs and panels, sharp at the screen's resolution
var hud_layer: CanvasLayer
var char_panel: CharPanel
var shop_panel: Shop
var stash_panel: Stash
var tree_view: TalentView
var coll_panel: Collection
var map_view: MapView
var chron_view: Chronicle
var title: TitleScreen
var _menu := ""                  # the open menu, "" when none
var world_box: SubViewportContainer   # the world, drawn at the game picture's size and blown up pixel for pixel
var world_vp: SubViewport

func _ready() -> void:
	for a in OS.get_cmdline_user_args():
		var kv := a.trim_prefix("--").split("=", true, 1)
		args[kv[0]] = kv[1] if kv.size() > 1 else "1"
	if args.has("shuf"):
		# the browser's sort(()=>R()-.5) for 2 to 12 elements: compare with [...Array(n).keys()].sort(()=>R()-.5) at mulberry(777+n)
		for n in range(2, 13):
			var R := Rng.new(777 + n)
			print(n, " ", TowerTwo.v8_shuffle(range(n), R), " ", "%.6f" % R.next())
		get_tree().quit()
		return
	if args.has("maphash"):
		# compare with the browser: the same seed must give the same floors (see docs/Godot-Umstieg.md)
		var fls: Array = range(1, 5) if args.maphash == "1" else Array(args.maphash.split(",")).map(func(x): return int(x))
		for f in fls:
			var m := DungeonGen.generate(int(args.get("seed", "4242")), f)
			var hsh := 0
			for v in m.t:
				hsh = (hsh * 31 + v) % 1000000007
			print("Ebene %d: Karte %d · %d Stücke Deko · %d Requisiten · Objekte %s" % [f, hsh, m.deco.size(), m.props.size(), m.objs.map(func(o): return "%s@%.2f,%.2f" % [o.get("ct", o.type), o.x, o.y])])
			var f2 := func(v: float) -> String: return "%.2f" % v
			var fl := func(a: Array, g: Callable) -> String: return " ".join(a.map(g))
			var pool := func(L): return f2.call(L.x) + "," + f2.call(L.y) + "/" + f2.call(L.r)
			print("  Thema %s · Fluch %s · Lava %s · Wasser %s · Dampf %s · Schacht %s" % [m.fth.id if m.get("fth") else "-", m.get("curse", "-"), fl.call(m.lava, pool), fl.call(m.water, pool),
				fl.call(m.vents, func(v): return f2.call(v.x) + "," + f2.call(v.y)), f2.call(m.well.x) + "," + f2.call(m.well.y) if m.get("well") else "-"])
			var ftp: Array = m.props.filter(func(p): return String(p.k).begins_with("ft") or p.k == "twL").map(func(p): return "%s@%s,%s%s%s" % [p.k, f2.call(p.x), f2.call(p.y), p.get("face", ""), (":%d" % p.v) if p.has("v") else ""])
			var S = m.get("sroom")
			print("  Raum %s · Fässer %s · Platten %s · Risse %s · Bilder %d %d" % ["-" if S == null else "%s@%s,%s%s" % [S.k, f2.call(S.cx), f2.call(S.cy), (" " + "".join(S.order.map(func(g): return str(g)))) if S.has("order") else ""],
				fl.call(m.hz, func(z): return "%s@%s,%s" % [z.k, f2.call(z.x), f2.call(z.y)]), fl.call(m.plates, func(q): return f2.call(q.x) + "," + f2.call(q.y) + "/" + f2.call(q.len)),
				fl.call(m.cracks, func(c): return "%s,%s/%d" % [f2.call(c.x), f2.call(c.y), c.seed]), ftp.size(), _sh(" ".join(ftp))])
			if args.has("why"):
				var R2 := Rng.new(int(args.get("seed", "4242")) * 6151 + f * 92821)
				var a0 := R2.next()
				var rs: Array = m.rooms.filter(func(r): return r != m.startRoom and not (m.boss and r == m.endRoom))
				print("  Geheimräume %.4f n=%d " % [a0, rs.size()], " ".join(TowerTwo.v8_shuffle(rs, R2).map(func(q): return "%d,%d" % [q.cx, q.cy])))
				print("  Räume ", " ".join(m.rooms.map(func(r): return "%d,%d%s%s" % [r.cx, r.cy, "S" if r == m.startRoom else "", "E" if r == m.endRoom else ""])))
			# the second pass (760) without the unseeded traps: secret, boulders, what lies about
			var e := TowerTwo.populate(m, int(args.get("seed", "4242")), 1)
			if e:
				e.free()
			var sec: String = "-" if m.secret == null else "%d,%d %d,%d" % [m.secret.fi, m.secret.fj, m.secret.dir.x, m.secret.dir.y]
			var dc: Array = m.props.filter(func(p): return String(p.k).begins_with("dc")).map(func(p): return "%s@%.2f,%.2f%s" % [p.k, p.x, p.y, "f" if p.get("f") else ""])
			if args.has("kram"):
				print("  KRAM " + " ".join(dc))
			print("  Geheim %s · Felsen %s · Kram %d %d %s" % [sec, " ".join(m.boulders.map(func(b): return "%.1f,%.1f/%.2f/%.1f/%.3f" % [b.x0, b.y0, b.ang, b.len, b.cd])), dc.size(), _sh(" ".join(dc)), " ".join(dc.slice(0, 3))])
		get_tree().quit()
		return
	if args.has("hillhash"):
		var wh := WorldGen.new(int(args.get("seed", "4242")))
		HillVillage.build(wh, int(args.hillhash) if args.hillhash != "1" else 0)
		for l in HillVillage.hash_lines(wh):
			print(l)
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
		HillVillage.build(wg, HillVillage.grow())
		var I = wg.island_of(int(ab[0]), int(ab[1]))
		if I != null:
			wg.start = {"x": I.x, "y": I.y}
	_make_world_view()
	var layer := CanvasLayer.new()
	layer.layer = 10
	add_child(layer)
	hud_layer = layer
	ui = UiLayer.new()
	ui.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(ui)
	hud = Hud.new()
	hud.host = self
	ui.add_panel(hud)
	sk_panel = SkillPanel.new()
	sk_panel.ui = ui
	ui.add_panel(sk_panel)
	inv_panel = Inventory.new()
	inv_panel.ui = ui
	ui.add_panel(inv_panel)
	char_panel = CharPanel.new()
	char_panel.ui = ui
	ui.add_panel(char_panel)
	shop_panel = Shop.new()
	shop_panel.ui = ui
	shop_panel.host = self
	ui.add_panel(shop_panel)
	stash_panel = Stash.new()
	stash_panel.ui = ui
	stash_panel.host = self
	ui.add_panel(stash_panel)
	inv_panel.stash = stash_panel
	tree_view = TalentView.new()
	tree_view.ui = ui
	tree_view.host = self
	ui.add_panel(tree_view)
	map_view = MapView.new()
	map_view.ui = ui
	map_view.host = self
	ui.add_panel(map_view)
	chron_view = Chronicle.new()
	chron_view.ui = ui
	chron_view.host = self
	ui.add_panel(chron_view)
	coll_panel = Collection.new()
	coll_panel.ui = ui
	ui.add_panel(coll_panel)
	process_mode = Node.PROCESS_MODE_ALWAYS
	world_box.process_mode = Node.PROCESS_MODE_PAUSABLE
	var save_t := Timer.new()
	save_t.wait_time = 30
	save_t.autostart = true
	save_t.timeout.connect(save_game)
	add_child(save_t)
	# without test switches the game opens on the title (with --title as well)
	if args.has("title") or args.keys().all(func(k): return k in ["screen", "shot", "shot-after", "seed"]):
		show_title()
		if args.has("uiflow"):
			_ui_flow()
		elif args.has("shot"):
			_shot()
		return
	Game.in_play = true
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
	if args.has("tw"):
		_tw_test()
	if args.has("guide") and level.ow:
		# test: the trail of lights to place n of the signposts (H.hvDest), and what a signpost offers
		for n in level.obj_nodes:
			if n.p.type == "hvsign":
				print("Wegweiser: ", HillVillage.dests(wg, n.p, Vector2(level.P.x, level.P.y)).map(func(e): return e[1]))
				break
		level.ow.guide = HillVillage.guide(level, wg.home.hvDest[int(args.guide)])
	if args.has("skp"):
		sk_panel.toggle()
	if args.has("inv"):
		inv_panel.toggle()
		var it = Game.inv.filter(func(i): return i.slot != "potion" and i.slot != "junk").front()
		inv_panel.pin = it
	if args.has("tree"):
		# test: the talent tree with points to spend, n of them already learnt along the trunk
		Game.lvl = 30
		Game.recalc()
		Talents.build()
		var want := int(args.tree)
		while want > 0:
			var nxt := ""
			for id in Talents.TREE:
				if Talents.can(id) and Talents.TREE[id].k != "key":
					nxt = id
					break
			if nxt == "":
				break
			Talents.learn(nxt)
			want -= 1
		print("Talente: ", Game.tree.size(), " vergeben ", Talents.spent(), " frei ", Talents.points(), " Leben ", Game.d.life, " Reihen ", Items.IH)
		tree_view.open()
	if args.has("quests"):
		# test: the chronicle with n quests behind you (a few kills counted for the active one)
		Game.qi = int(String(args.quests).trim_suffix("hud"))
		Quests.start()
		for k in 3:
			Quests.inc("kill")
			Quests.inc("k_spider")
		Quests.tick(1, level)
		var q = Quests.cur()
		print("Quest ", Game.qi, ": ", q.t if q else "-", " ", Quests.prog(q) if q else [], " Ziel ", Quests.tgt)
		if not String(args.quests).ends_with("hud"):
			chron_view.open()
	if args.has("map"):
		# test: the big map after a walk; in the sky a few islands are counted as seen
		if level.ow:
			for k in ["40,38", "41,38", "42,39"]:
				Game.ow_seen[k] = 1
		else:
			for q in 40:
				level.P.x = level.m.start.x + randf_range(-14, 14)
				level.P.y = level.m.start.y + randf_range(-14, 14)
				level._explore()
			level.P.x = level.m.start.x
			level.P.y = level.m.start.y
		map_view.open()
	if args.has("coll"):
		# test: the collection with a few finds, one of them unique
		for k in ["weapon", "helm", "ring"]:
			Game.discover(Items.make(5, {"slot": k}))
		Game.discover(Items.make(20, {"rarity": "unique"}))
		print("Sammlung: ", Game.found.keys())
		coll_panel.toggle()
	if args.has("shop"):
		# test: Odalinde's window with glut to spend, the bag beside it
		Game.glut = 5000
		open_shop({"type": "merchant", "lvl": 5})
		if args.shop == "buy":
			var n0 := Game.inv.size()
			shop_panel._buy("life")
			shop_panel._buy("flask")
			shop_panel._buy("key")
			shop_panel._buy_stock(0)
			shop_panel._gamble("ring")
			print("gekauft: %d Teile, Glut %d, Flakon %d, Schlüssel %d, Vorrat %d" % [Game.inv.size() - n0, Game.glut, Game.flask_max, Game.keys, shop_panel.stock().size()])
			var it = Game.inv.back()
			Shop.sell(it)
			print("verkauft: ", it.name, " → Glut ", Game.glut)
	if args.has("stash"):
		# test: the bottomless chest with a heap in it
		for k in 14:
			Stash.add(Items.make(10, {"rarity": ["normal", "magic", "rare", "unique"][k % 4]}))
		open_stash()
	if args.has("bot"):
		_bot()
	if args.has("shot"):
		_shot()

func _shot() -> void:
	await get_tree().create_timer(float(args.get("shot-after", "2.0"))).timeout
	if args.has("menu"):
		show_menu(args.menu)
		await get_tree().create_timer(.6).timeout
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(args.shot)
	get_tree().quit()

## test --uiflow=<dir>: a new hero from the title, the character panel, saved, back to the title, the heroes, continue,
## the bonfire window on floor 1; screenshots ui1…ui4.png into dir; the test hero is deleted afterwards
func _ui_flow() -> void:
	var dir: String = args.uiflow
	var snap := func(n: String) -> void:
		await RenderingServer.frame_post_draw
		get_viewport().get_texture().get_image().save_png("%s/%s.png" % [dir, n])
	await get_tree().create_timer(1.0).timeout
	start_game("jaegerin" if Data.classes.has("jaegerin") else Data.classes.keys()[1])
	var id := Save.current()
	await get_tree().create_timer(1.0).timeout
	char_panel.toggle()
	await get_tree().create_timer(.5).timeout
	await snap.call("ui1")
	char_panel.toggle()
	level.P.x += 2
	var at := Vector2(level.P.x, level.P.y)
	print("gespeichert: ", save_game(), " bei ", at)
	to_title()
	show_menu("heroes")
	await get_tree().create_timer(1.0).timeout
	await snap.call("ui2")
	continue_game()
	await get_tree().create_timer(.5).timeout
	print("fortgesetzt: Ebene ", Game.floor_no, " bei ", Vector2(level.P.x, level.P.y), " Klasse ", Game.cls)
	show_menu("pause")
	await get_tree().create_timer(.5).timeout
	await snap.call("ui3")
	close_menu()
	Game.lit[1] = true
	enter_floor(1)
	await get_tree().create_timer(.5).timeout
	for o in level.obj_nodes:
		if o.p.type == "shrine":
			open_bonfire(o)
			break
	await get_tree().create_timer(.6).timeout
	await snap.call("ui4")
	Save.delete(id)
	print("Testheld gelöscht")
	get_tree().quit()

# ---------- title, heroes, saving, menus ----------

## the title over the hill at dusk: the village of seed 4242, the hero of the last save before the tower
func show_title() -> void:
	Game.in_play = false
	get_tree().paused = false
	ui.close_modal()
	_menu = ""
	_close_panels()
	var last := Save.read(Save.current())
	Game.start_new(last.get("cls", "krieger"))
	Game.seed_value = 4242
	wg = WorldGen.new(4242)
	HillVillage.build(wg, 0)
	enter_floor(0)
	var H := Vector2(WorldGen.HOX, WorldGen.HOY)
	level.title_cam = H + Vector2(15.9, 20.3)
	var at := level.near_walk(H.x + 23.2, H.y + 26.8)
	level.reset_hero(at)
	level.P.face = atan2(H.y + 24 - at.y, H.x + 24 - at.x)
	hud_layer.visible = false
	if title:
		title.queue_free()
	title = TitleScreen.new()
	ui.root.add_child(title)
	ui.root.move_child(title, 0)
	title.pick.connect(_title_pick)

func _title_pick(w: String) -> void:
	if w == "continue":
		continue_game()
	elif w == "new":
		show_menu("class")
	else:
		show_menu(w)

func playing() -> bool:
	return Game.in_play

## a new hero of class c, with a save of their own from the first step
func start_game(c: String) -> void:
	ui.close_modal()
	_menu = ""
	get_tree().paused = false
	if title:
		title.queue_free()
		title = null
	Save.begin_new(c)
	Game.start_new(c)
	wg = null
	Game.in_play = true
	hud_layer.visible = true
	enter_floor(0)
	Game.log_msg("Klicke auf den Boden, um zu gehen. Der Eingang des Turms liegt vor dem Tor.", Color("#ece4cf"))
	save_game()

## back where you left off: in the sky the world grows around the spot, in the tower the floor is built from its seed
func continue_game() -> void:
	var d := Save.read(Save.current())
	if d.is_empty():
		show_menu("class")
		return
	ui.close_modal()
	_menu = ""
	get_tree().paused = false
	if title:
		title.queue_free()
		title = null
	var pos := Save.apply(d)
	wg = null
	Game.in_play = true
	hud_layer.visible = true
	var f: int = Game.respawn_floor
	if pos.has("f") and int(pos.f) >= 0 and int(pos.f) <= Game.max_floor:
		f = int(pos.f)
	if f == 0 and pos.has("x"):
		Game.ow_at = Vector2(pos.x, pos.y)
	enter_floor(f)
	if f > 0 and pos.has("x") and level.walkable(pos.x, pos.y):
		level.reset_hero(Vector2(pos.x, pos.y))
	Game.log_msg("Willkommen zurück, Wanderer.", Color("#ffd88a"))

func play_hero(id: String) -> void:
	if playing():
		save_game()
	Save.set_current(id)
	continue_game()

func save_game() -> bool:
	if not playing() or level == null:
		return false
	return Save.write({"f": Game.floor_no, "x": level.P.x, "y": level.P.y})

func to_title() -> void:
	save_game()
	show_title()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		save_game()

## a menu in the box over a dark wash; in play the world stands still while it is open
func show_menu(v: String, msg := "") -> void:
	var c: Control
	match v:
		"pause": c = Menus.pause(self, msg)
		"settings": c = Menus.settings(self)
		"controls": c = Menus.controls(self)
		"heroes": c = Menus.heroes(self, msg)
		"class": c = Menus.classes(self)
		_: return
	_menu = v
	if playing():
		get_tree().paused = true
	ui.open_modal(c, menu_back)

## Zurück: in play back to the pause menu, on the title the box closes
func menu_back() -> void:
	if playing() and _menu != "pause":
		show_menu("pause")
	else:
		close_menu()

func close_menu() -> void:
	ui.close_modal()
	_menu = ""
	get_tree().paused = false

func _close_panels() -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	inv_panel.close()

func open_shop(o: Dictionary) -> void:
	shop_panel.open(o)

func open_stash() -> void:
	stash_panel.open()

## the small buttons on the belt
func panel_button(k: String) -> void:
	match k:
		"char": char_panel.toggle()
		"inv": inv_panel.toggle()
		"skills": sk_panel.toggle()
		"tree": tree_view.toggle()
		"coll": coll_panel.toggle()
		"map": map_view.toggle()
		"quests": chron_view.toggle()
		"menu":
			save_game()
			show_menu("pause")

func open_bonfire(o: Prop) -> void:
	_menu = "bonfire"
	ui.open_modal(Bonfire.dialog(self, o), close_menu)

func travel_home() -> void:
	close_menu()
	if Game.floor_no == 0:
		level.reset_hero(level.near_walk(wg.start.x, wg.start.y))
		level.ow.tick(true)
		Game.banner.emit("Der Hügel", "", "")
	else:
		enter_floor(0)

func travel_sky(at: Vector2) -> void:
	close_menu()
	if Game.floor_no == 0:
		level.reset_hero(level.near_walk(at.x + 1, at.y + 1))
		level.ow.tick(true)
	else:
		Game.ow_at = at + Vector2(1, 1)
		enter_floor(0)

func travel_floor(f: int) -> void:
	close_menu()
	enter_floor(f, true)

func _unhandled_input(ev: InputEvent) -> void:
	if not (ev is InputEventKey and ev.pressed and not ev.echo):
		return
	if ev.keycode == KEY_ESCAPE:
		get_viewport().set_input_as_handled()
		if _menu != "":
			if ui.on_close.is_valid():
				ui.on_close.call()
			return
		if not playing():
			return
		if inv_panel.visible or get_tree().get_nodes_in_group("left_panel").any(func(n): return n.visible):
			_close_panels()
			return
		save_game()
		show_menu("pause")
	elif ev.keycode == KEY_C and playing() and _menu == "":
		get_viewport().set_input_as_handled()
		char_panel.toggle()

## the world's own picture: a SubViewport as big as the game picture (Screen), shown k times bigger with hard pixels,
## so the world looks as before while text and panels above it are drawn sharp at the screen's own resolution
func _make_world_view() -> void:
	world_box = SubViewportContainer.new()
	world_box.stretch = true
	world_box.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	world_box.mouse_filter = Control.MOUSE_FILTER_PASS
	add_child(world_box)
	move_child(world_box, 0)
	world_vp = SubViewport.new()
	world_vp.handle_input_locally = true
	world_vp.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
	world_vp.snap_2d_transforms_to_pixel = true
	world_box.add_child(world_vp)
	var fit := func() -> void:
		world_box.size = get_viewport().get_visible_rect().size
	Screen.resized.connect(fit)
	fit.call()

## floor 0 is the sky with the hill; through the door you come to the deepest floor whose bonfire burns, beside it
func enter_floor(f: int, by_door := false) -> void:
	if level:
		level.queue_free()
	Game.floor_no = f
	Game.max_floor = maxi(Game.max_floor, f)
	Game.mlvl = Game.mlvl_of(f) if f > 0 else 1
	level = Level.new()
	world_vp.add_child(level)
	if f == 0:
		if wg == null:
			wg = WorldGen.new(Game.seed_value)
			HillVillage.build(wg, HillVillage.grow())
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
	if f == 0 and Game.ow_at != null:
		level.reset_hero(level.near_walk(Game.ow_at.x, Game.ow_at.y))
		Game.ow_at = null
		level.ow.tick(true)
	if playing():
		save_game.call_deferred()
	Game.floor_changed.emit(f)
	if f > 0:
		Game.log_msg("Ebene %d · Monsterstufe %d" % [f, Game.mlvl], Color("#a39b88"))
		# the theme and the curse greet you (the enterFloor wrapper of 982)
		var m: Dictionary = level.m
		var c = FloorThemes.CURSE.get(m.get("curse", ""))
		if m.get("fth") and (not m.boss or Game.boss_dead.get(f, false)):
			Game.banner.emit(FloorThemes.title(f), ("Fluch: " + c.n + " · " if c else "") + m.fth.d, "boss" if c else "")
		if c:
			Game.log_msg("Fluch der Ebene: %s. %s. Dafür gibt es mehr Erfahrung und Beute." % [c.n, c.d], c.col)
		if m.get("curse") == "finster":
			var n: int = m.props.filter(func(p): return p.k == "ftcold").size()
			var lit: int = m.get("fires", {"lit": 0}).lit
			if lit < n:
				Game.log_msg("Es ist finster. %d Feuerbecken warten darauf, entzündet zu werden." % (n - lit), c.col)
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

## test (--tw): use every tower-room object of this floor as a player would – plaque, levers in the right order
## (one wrong first), vault, trial, altar twice, cage, lift from below and back – and print what each did
func _tw_test() -> void:
	var S = level.m.get("sroom")
	print("TW Raum ", S.get("kind", "-") if S else "-")
	var by := {}
	for n in level.obj_nodes:
		if str(n.p.type).begins_with("tw"):
			by[n.p.type] = by.get(n.p.type, []) + [n]
	print("TW Objekte ", by.keys().map(func(k): return "%s×%d" % [k, by[k].size()]))
	var use := func(n: Prop) -> void:
		level.P.x = n.p.x + .8
		level.P.y = n.p.y + .8
		var ok: bool = level.theme.interact(n)
		print("TW ", n.p.type, " ", ok, " ", n.p.get("open", ""), n.p.get("on", ""), n.p.get("used", ""), " hp ", roundi(Game.hp))
	for n in by.get("twplaque", []):
		use.call(n)
	if S and S.has("order"):
		var lv: Array = by.get("twlever", [])
		var wrong = lv.filter(func(n): return n.p.gem != S.order[0]).front()
		if wrong:
			use.call(wrong)
			await get_tree().create_timer(.8).timeout
		for g in S.order:
			for n in lv:
				if n.p.gem == g:
					use.call(n)
		print("TW gelöst ", S.get("solved"))
	for k in ["twvault", "twaltar", "twaltar", "twcage", "twlift"]:
		for n in by.get(k, []):
			if k != "twlift" or n.p.get("low"):
				use.call(n)
	for n in by.get("twlift", []):
		if not n.p.get("low"):
			use.call(n)
	for n in by.get("twtrial", []):
		use.call(n)
		for t in 14:
			level.P.iframe = 99
			await get_tree().create_timer(.5).timeout
			print("TW Welle ", S.get("wave"), " lebend ", S.pack.filter(func(e): return not e.dead).size(), " hp ", roundi(Game.hp), " tot ", level.P.dead, " next ", S.next)
			for e in S.pack.duplicate():
				if not e.dead:
					level.kill_enemy(e)
	print("TW Segen ", Game.bless_t, " fertig ", Game.tw.done)
