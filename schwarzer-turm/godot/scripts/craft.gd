class_name Craft
extends Control
## The workshop on the hill (600-workshop.js): the anvil of joining melds two of the same piece into one, the glyph table
## sells enchantments at a dear price, three on offer per piece, new ones after every purchase. One window for both, like
## Brannoc's (forge.gd): an inscription or the book speaks, on the left what you carry, on the right the scene: stumps and
## the anvil, where the two pieces fly together, or the table with its book, where gems circle and dive into the piece.
## Walking off closes it.

const RRANK := {"normal": 0, "magic": 1, "rare": 2, "unique": 3, "runeword": 4}
## stats the game caps get a ceiling per glyph (ECAP) and per piece (ETOP)
const ECAP := {"ls": 12, "res": 30, "frw": 25, "crit": 15, "block": 15, "allsk": 2, "ias": 40, "dmgred": 12}
const ETOP := {"ls": 20, "res": 45, "frw": 35, "crit": 20, "block": 20, "allsk": 3, "ias": 60, "dmgred": 20}
const SAY := {
	"merge": "In den Amboss ist eine Inschrift geschlagen: »Zwei vom selben Guss werden eins, und das eine ist mehr als beide.«",
	"mergeNone": "Der Amboss schweigt. Du trägst keine zwei Stücke vom selben Guss bei dir.",
	"ench": "Die Seiten blättern sich von selbst um. Für jedes Stück leuchten drei Glyphen. Sie sind teuer, und sobald du eine nimmst, verlöschen die anderen."}
const TEAL := Color("#7af0e0")

const W := 680.0
const H := 460.0
const TILE := 46.0

var ui: UiLayer
var host                         # tower.gd
var mode := "merge"              # merge at the anvil, ench at the glyph table
var a = null                     # the two pieces on the anvil
var b = null
var it = null                    # the piece on the book
var res = null                   # what a and b would become (mergeOf), kept so the blow gives what was shown
var _say := ""
var _shown := 0.0
var _anim := 0.0
var _hit := false
var _pick := -1                  # the glyph bought
var _parts: Array = []
var _pop = null                  # {t, txt}
var _shake := 0.0
var _at := Vector2.ZERO
var _m := Vector2.ZERO
var _hover = null
var _go: Button
var _close: Button
var _scene := Rect2()
var _list := Rect2()
var _offs: Array = []            # the three glyph buttons: Rect2 in the panel

# ---------- what the anvil and the book do ----------

static func can_craft(x) -> bool:
	return x is Dictionary and Data.loot.slotcode.has(x.get("slot", ""))

## worn first, then the bag (craftItems)
static func items() -> Array:
	var eq := Game.eq.values().filter(func(x): return can_craft(x))
	return eq + Game.inv.filter(func(x): return can_craft(x) and not has_same(eq, x))

## Dictionaries compare by content in GDScript, two equal pieces are still two pieces
static func has_same(list: Array, x) -> bool:
	return list.any(func(y): return is_same(y, x))

## the other pieces from the same cast (mates)
static func mates(x: Dictionary, list: Array) -> Array:
	return list.filter(func(y): return not is_same(y, x) and y.b == x.b and y.slot == x.slot)

static func base_name(x: Dictionary) -> String:
	return RegEx.create_from_string(" \\+\\d+$").sub(x.name, "")

## two of a kind become one: every property of both, the shared ones stronger, one step higher (mergeOf)
static func merge_of(x: Dictionary, y: Dictionary) -> Dictionary:
	var p := y if RRANK.get(y.rar, 0) > RRANK.get(x.rar, 0) else x
	var q := x if p == y else y
	var r: Dictionary = p.duplicate(true)
	r.mods = {}
	var keys := {}
	for k in p.mods:
		keys[k] = true
	for k in q.mods:
		keys[k] = true
	for k in keys:
		var u = p.mods.get(k, 0)
		var v = q.mods.get(k, 0)
		r.mods[k] = int(maxf(u, v)) + maxi(1, roundi(minf(u, v) * .25)) if u and v else (u if u else v)
	if p.has("dmg") and q.has("dmg") and q.dmg[0] + q.dmg[1] > p.dmg[0] + p.dmg[1]:
		r.dmg = q.dmg.duplicate()
	if q.get("def", 0) > p.get("def", 0):
		r.def = q.def
	if q.get("block", 0) > p.get("block", 0):
		r.block = q.block
	if q.get("soc", 0) > p.get("soc", 0):
		r.soc = q.soc
	r.ilvl = maxi(p.ilvl, q.ilvl)
	for k in ["lvl", "str", "dex"]:
		r.req[k] = maxi(p.req.get(k, 0), q.req.get(k, 0))
	# enough properties make a rare, any make a magic piece
	var n: int = r.mods.keys().filter(func(k): return not (k == "spell" and r.cls == "staff")).size()
	var nm := base_name(p)
	if RRANK.get(r.rar, 0) < 2 and n >= 3:
		r.rar = "rare"
		nm = base_name(q) if q.rar == "rare" else Items.R.pick(Data.palette.rare1) + Items.R.pick(Data.palette.rare2[r.slot])
	elif r.rar == "normal" and n:
		r.rar = "magic"
		nm = r.b
	r.name = nm
	r.up = mini(Runes.UPMAX, maxi(p.get("up", 0), q.get("up", 0)) + 1)
	Runes.up_name(r)
	r.encN = maxi(p.get("encN", 0), q.get("encN", 0))
	r.erase("ench")
	return r

## glut, and grave slate from +6 (mergeCost)
static func merge_cost(x: Dictionary, y: Dictionary) -> Dictionary:
	var u := mini(Runes.UPMAX, maxi(x.get("up", 0), y.get("up", 0)) + 1)
	var l := maxi(x.ilvl, y.ilvl)
	return {"gl": roundi((30 + l * 6) * pow(u, 1.5) / 10) * 10, "g": u - 5 if u >= 6 else 0}

## three glyphs per piece, far beyond what drops: each costs a fortune, every purchase makes the next one dearer (enchOffers)
static func offers(x: Dictionary) -> Array:
	var code: String = Data.loot.slotcode[x.slot]
	var pool := Data.affixes.filter(func(f): return code in f.s and not (ETOP.has(f.k) and x.mods.get(f.k, 0) >= ETOP[f.k]))
	var out := []
	var n: int = x.get("encN", 0)
	var R := Items.R
	while out.size() < 3 and pool.size():
		var f: Dictionary = pool.pop_at(R.rint(0, pool.size() - 1))
		var hi := float(f.r[3][1])
		var q := R.rnd(1.8, 3.2)
		var k := q * pow(1.22, n)
		var v := maxi(1, mini(mini(ECAP.get(f.k, 1000000000), ETOP[f.k] - x.mods.get(f.k, 0) if ETOP.has(f.k) else 1000000000), roundi(hi * q)))
		out.append({"k": f.k, "v": v, "q": q, "gl": roundi((1500 + x.ilvl * 150) * k / 50) * 50, "g": roundi(3 + q * 4 + n), "e": (1 if q > 2.7 else 0) + n / 2})
	return out

# ---------- the window ----------

func _ready() -> void:
	visible = false
	clip_contents = true
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")
	_go = Ui.button("Vereinen", merge_go, 16)
	add_child(_go)
	_close = Ui.button("✕", func(): visible = false, 14)
	_close.custom_minimum_size = Vector2(34, 32)
	add_child(_close)

func open(m: String) -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	host.inv_panel.close()
	mode = m
	var ar := ui.area()
	size = Vector2(W, H)
	position = ((ar - size) / 2).floor()
	_close.reset_size()
	_close.position = Vector2(W - 20 - _close.size.x, 18)
	_list = Rect2(20, 108, 280, H - 108 - 50)
	_scene = Rect2(W - 20 - 340 + 60, 96, 220, 150)
	_go.custom_minimum_size = Vector2(220, 36)
	_go.reset_size()
	_go.position = Vector2(_scene.get_center().x - _go.size.x / 2, H - 20 - _go.size.y)
	_go.visible = mode == "merge"
	_at = Vector2(host.level.P.x, host.level.P.y)
	_anim = 0
	_parts.clear()
	_pop = null
	res = null
	var its := items()
	for k in ["a", "b", "it"]:
		if get(k) != null and not its.has(get(k)):
			set(k, null)
	if mode == "merge":
		say(SAY.merge if its.any(func(x): return mates(x, its).size() > 0) else SAY.mergeNone)
	else:
		say(SAY.ench)
	visible = true
	_info()

func say(t: String) -> void:
	_say = t
	_shown = 0

## the list: in the anvil's window pieces with a twin first, then by base
func _sorted() -> Array:
	var its := items()
	if mode == "merge":
		# decorated and stable: twins first, then by base, else as carried
		var keys := []
		for i in its.size():
			keys.append([0 if mates(its[i], its).size() else 1, str(its[i].b), i])
		keys.sort()
		var out := []
		for k in keys:
			out.append(its[k[2]])
		its = out
	return its

func pick(x: Dictionary) -> void:
	if _anim > 0:
		return
	var its := items()
	if not has_same(its, x):
		return
	if mode == "ench":
		it = x
		if not x.has("ench"):
			x.ench = offers(x)
		say("%s liegt auf dem Buch. Drei Glyphen leuchten auf. Wähle eine." % base_name(x))
	else:
		if is_same(x, a):
			a = b
			b = null
		elif is_same(x, b):
			b = null
		elif a and has_same(mates(a, its), x):
			b = x
		elif mates(x, its).is_empty():
			say("Zu %s fehlt dir ein Zwilling. Nur Gleiches lässt sich vereinen." % base_name(x))
			return
		else:
			a = x
			b = null
		if a and b:
			say("%s und %s. Schlag zu, und sie werden eins." % [base_name(a), base_name(b)])
		elif a:
			say("%s liegt auf dem Amboss. Leg den Zwilling daneben." % base_name(a))
		else:
			say(SAY.merge)
	_info()

func _info() -> void:
	res = merge_of(a, b) if mode == "merge" and a and b else null
	_go.disabled = res == null or _anim > 0
	if mode == "ench" and it and not it.has("ench"):
		it.ench = offers(it)

func merge_go() -> void:
	if not (a and b) or _anim > 0:
		return
	var c := merge_cost(a, b)
	if Game.glut < c.gl:
		say("Der Amboss will Glut sehen. Dir fehlen noch %s." % _num(c.gl - Game.glut))
		return
	if Game.slate_g < c.g:
		say("Ab +6 trinkt der Amboss Grabschiefer. Dir fehlen noch %d." % (c.g - Game.slate_g))
		return
	_anim = .001
	_hit = false
	_go.disabled = true

func buy(i: int) -> void:
	if it == null or not it.has("ench") or i >= it.ench.size() or _anim > 0:
		return
	var o: Dictionary = it.ench[i]
	if Game.glut < o.gl:
		say("Die Glyphe verlangt %s Glut. Dir fehlen noch %s." % [_num(o.gl), _num(o.gl - Game.glut)])
		return
	if Game.slate_g < o.g:
		say("Die Glyphe verlangt Grabschiefer. Dir fehlen noch %d." % (o.g - Game.slate_g))
		return
	if Game.slate_e < o.e:
		say("Die Glyphe verlangt Glutschiefer. Dir fehlen noch %d." % (o.e - Game.slate_e))
		return
	_anim = .001
	_hit = false
	_pick = i

func _burst(cols: Array, n: int) -> void:
	for k in n:
		var an := randf_range(0, TAU)
		var v := randf_range(40, 150)
		_parts.append({"x": 110.0, "y": 50.0 if mode == "merge" else 36.0, "vx": cos(an) * v, "vy": sin(an) * v - 40, "l": randf_range(.4, .9), "t": 0.0, "c": Color(cols.pick_random())})

## the moment the pieces touch: pay, the better one takes in the other, the other is gone (mergeImpact)
func _merge_impact() -> void:
	var c := merge_cost(a, b)
	var r: Dictionary = res if res else merge_of(a, b)
	var eqv := Game.eq.values()
	var keep_b := has_same(eqv, b) and not has_same(eqv, a)
	var keep: Dictionary = b if keep_b else a
	var gone: Dictionary = a if keep_b else b
	Game.glut -= c.gl
	Game.slate_g -= c.g
	var gx = keep.get("gx")
	var gy = keep.get("gy")
	keep.clear()
	keep.merge(r)
	if gx != null:
		keep.gx = gx
		keep.gy = gy
	for i in Game.inv.size():
		if is_same(Game.inv[i], gone):
			Game.inv.remove_at(i)
			break
	for k in Game.eq.keys():
		if is_same(Game.eq[k], gone):
			Game.eq.erase(k)
	a = keep
	b = null
	res = null
	_burst(["#ffffff", "#c8fff4", "#7af0e0", "#b48aff"], 50)
	_pop = {"t": 0.0, "txt": "+%d" % keep.up}
	_shake = .35
	_world("anvil")
	Game._gear()
	host.save_game()
	say("Vereint: %s. %s" % [keep.name, "Und ein weiterer Zwilling wartet schon." if mates(keep, items()).size() else "Was einmal zwei war, ist jetzt eins."])

## the glyph burns in, the others go out, three new ones light (enchImpact)
func _ench_impact() -> void:
	var o: Dictionary = it.ench[_pick]
	Game.glut -= o.gl
	Game.slate_g -= o.g
	Game.slate_e -= o.e
	it.mods[o.k] = it.mods.get(o.k, 0) + o.v
	it.encN = it.get("encN", 0) + 1
	it.ench = offers(it)
	_burst(["#ffffff", "#c8fff4", "#7af0e0", "#2ac8b0"], 40)
	_pop = {"t": 0.0, "txt": Data.mod_line(o.k, o.v)}
	_world("enchant")
	Game._gear()
	host.save_game()
	say("Die Glyphe brennt sich ein: %s. Die anderen verlöschen, drei neue leuchten auf." % Data.mod_line(o.k, o.v))

## sparks over the anvil or the table out in the world too (cWorld)
func _world(type: String) -> void:
	if type == "anvil":
		Sound.anvil()
		Sound.sfx("boom")
	else:
		if not Sound.sample("chest", .4):
			Sound.sfx("lvl")
		Sound.sfx("lvl")
	if host.level:
		host.level.craft_spark(type)

static func _num(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "." + s.right(3) + out
		s = s.left(s.length() - 3)
	return ("-" if n < 0 else "") + s + out

# ---------- input ----------

func _tile_rect(i: int) -> Rect2:
	var c := int(_list.size.x / (TILE + 4))
	return Rect2(_list.position + Vector2((i % c) * (TILE + 4), (i / c) * (TILE + 4)), Vector2(TILE, TILE))

func _tile_at(p: Vector2):
	var its := _sorted()
	for i in its.size():
		if _tile_rect(i).has_point(p):
			return its[i]
	return null

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseMotion:
		_hover = _tile_at(ev.position)
		return
	if ev is InputEventMouseButton and ev.button_index == MOUSE_BUTTON_LEFT and ev.pressed:
		accept_event()
		var t = _tile_at(ev.position)
		if t:
			pick(t)
			return
		for i in _offs.size():
			if _offs[i].has_point(ev.position):
				buy(i)
				return
		if mode == "merge" and _scene.has_point(ev.position) and a and b:
			merge_go()

func _has_point(p: Vector2) -> bool:
	return visible and Rect2(Vector2.ZERO, size).has_point(p)

# ---------- every frame ----------

func _process(dt: float) -> void:
	if not visible:
		return
	dt = minf(dt, .05)
	var L = host.level
	if not Game.in_play or L == null or Vector2(L.P.x, L.P.y).distance_to(_at) > .6:
		visible = false
		return
	_m = get_local_mouse_position()
	if _shown < _say.length():
		_shown = minf(_say.length(), _shown + dt * 80)
	if _anim > 0:
		_anim += dt
		if _anim >= .55 and not _hit:
			_hit = true
			if mode == "merge":
				_merge_impact()
			else:
				_ench_impact()
		if _anim >= 1.2:
			_anim = 0
			_info()
	for p in _parts:
		p.t += dt
		p.x += p.vx * dt
		p.y += p.vy * dt
		p.vy += 160 * dt
	_parts = _parts.filter(func(p): return p.t < p.l)
	if _pop:
		_pop.t += dt
		if _pop.t > 1.6:
			_pop = null
	_shake = maxf(0, _shake - dt)
	var s := _shake * 12
	position = ((ui.area() - size) / 2).floor() + (Vector2(randf_range(-s, s), randf_range(-s, s)) if s > 0 else Vector2.ZERO)
	queue_redraw()
	if _hover:
		ui.overlay.tip(Items.tip(_hover, "Klick: auswählen"), _m + position)

# ---------- drawing ----------

func _draw() -> void:
	draw_style_box(Ui.plate_box(Vector4(8, 6, 8, 6)), Rect2(Vector2.ZERO, size))
	_portrait(Vector2(20, 20), 2)
	var M := mode == "merge"
	Ui.shadow_text(self, Ui.font("display"), Vector2(80, 40), "Amboss der Vereinung" if M else "Glyphentisch", 24, TEAL)
	var it_f := Ui.font("italic")
	var y := 58.0
	for l in Ui.wrap_text(it_f, _say.substr(0, int(_shown)), W - 80 - 70, 15):
		Ui.shadow_text(self, it_f, Vector2(80, y), l, 15, Ui.PAPER)
		y += 18
	# the list
	Ui.shadow_text(self, Ui.font("sc"), Vector2(_list.position.x, _list.position.y - 8), "Zwei gleiche Stücke" if M else "Deine Ausrüstung", 14, Ui.HEAD)
	var its := _sorted()
	var all := items()
	var worn := Game.eq.values()
	var tw := a != null and b == null
	for i in its.size():
		var x: Dictionary = its[i]
		var r := _tile_rect(i)
		if not _list.grow(2).encloses(r):
			break
		var sel: bool = (is_same(x, a) or is_same(x, b)) if M else is_same(x, it)
		var lone: bool = M and mates(x, all).is_empty()
		var mate: bool = M and tw and not sel and has_same(mates(a, all), x)
		var fade := Color(1, 1, 1, .38) if lone else Color.WHITE
		draw_rect(r.grow(-3), Color("#0a0806"))
		if Inventory.R_TINT.has(x.rar):
			draw_rect(r.grow(-3), Color(Inventory.R_TINT[x.rar], Inventory.R_TINT[x.rar].a * fade.a))
		var tex := Items.ground_pic(x)
		if tex:
			draw_texture_rect(tex, Rect2(r.get_center() - tex.get_size() / 2, tex.get_size()).abs(), false, fade)
		if has_same(worn, x):
			draw_circle(r.position + Vector2(8, 8), 3, Ui.HEAD)
		if x.get("up"):
			Ui.shadow_text(self, Ui.font("sc"), Vector2(r.position.x, r.end.y - 5), "+%d" % x.up, 12, Color("#ffd88a"), HORIZONTAL_ALIGNMENT_RIGHT, r.size.x - 5)
		if mate:
			Prop.glow(self, r.get_center(), 30, Color(TEAL, .35 + sin(Game.t * 5.2) * .25))
		draw_style_box(Ui.box("sockg" if sel or mate or x == _hover else "sock", 4, 0, false), r)
	if its.is_empty():
		Ui.shadow_text(self, it_f, _list.position + Vector2(0, 16), "Nichts, was sich vereinen ließe." if M else "Nichts, was eine Glyphe trüge.", 14, Ui.PAPER_DIM)
	# what you have to pay with
	var cy := H - 30.0
	var sc := Ui.font("sc")
	Ui.shadow_text(self, sc, Vector2(20, cy), "%s Glut" % _num(Game.glut), 15, Ui.EMBER)
	var sx := 20 + sc.get_string_size("%s Glut" % _num(Game.glut), HORIZONTAL_ALIGNMENT_LEFT, -1, 15).x + 16
	for k in ["g", "e"]:
		var t := Runes.icon("Slate:" + k)
		if t:
			draw_texture_rect(t, Rect2(sx, cy - 17, 22, 22), false)
		Ui.shadow_text(self, sc, Vector2(sx + 25, cy), str(Game.slate_g if k == "g" else Game.slate_e), 15, Runes.SLATE[k].col)
		sx += 64
	_scene_draw()
	if M:
		_merge_text()
	else:
		_ench_text()

func _price(parts: Array, cx: float, y: float, sz := 14) -> void:
	var sc := Ui.font("sc")
	var tw := 0.0
	for p in parts:
		tw += sc.get_string_size(p[0], HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x + (20 if p[2] else 0) + 12
	var x := cx - (tw - 12) / 2
	for p in parts:
		if p[2]:
			var t := Runes.icon("Slate:" + p[2])
			if t:
				draw_texture_rect(t, Rect2(x, y - 15, 18, 18), false)
			x += 20
		Ui.shadow_text(self, sc, Vector2(x, y), p[0], sz, Ui.PAPER if p[1] else Ui.BAD)
		x += sc.get_string_size(p[0], HORIZONTAL_ALIGNMENT_LEFT, -1, sz).x + 12

func _merge_text() -> void:
	var L := _scene.position.x - 60
	var Wd := 340.0
	var y := _scene.end.y + 22
	var sm := Ui.font("italic")
	if res == null:
		var h := "Wähle den Zwilling. Gleiche Stücke leuchten in der Liste." if a else "Wähle zwei gleiche Stücke, etwa zwei Obsidianhelme."
		for l in Ui.wrap_text(sm, h, Wd, 14):
			Ui.shadow_text(self, sm, Vector2(L, y), l, 14, Ui.PAPER_DIM, HORIZONTAL_ALIGNMENT_CENTER, Wd)
			y += 17
		return
	var r: Dictionary = res
	Ui.shadow_text(self, Ui.font("body"), Vector2(L, y), r.name, 16, Items.RCOL.get(r.rar, Ui.PAPER), HORIZONTAL_ALIGNMENT_CENTER, Wd)
	y += 17
	var st := ""
	if r.has("dmg"):
		st = "%d–%d Schaden" % Items.dmg(r)
	elif r.get("def"):
		st = "%d Verteidigung" % Items.defense(r)
	if st:
		Ui.shadow_text(self, sm, Vector2(L, y), st, 13, Ui.PAPER_DIM, HORIZONTAL_ALIGNMENT_CENTER, Wd)
		y += 16
	# the properties, the ones that grew in green; two columns when there are many
	var lines := []
	for k in Data.mod_order:
		if r.mods.get(k):
			lines.append([Data.mod_line(k, r.mods[k]), Color("#a6e08a") if r.mods[k] > maxf(a.mods.get(k, 0), b.mods.get(k, 0)) else Items.RCOL.magic])
	var cols := 2 if lines.size() > 4 else 1
	var per := ceili(lines.size() / float(cols))
	for i in lines.size():
		var c := i / per
		Ui.shadow_text(self, Ui.font("body"), Vector2(L + c * Wd / cols, y + (i % per) * 15), lines[i][0], 12, lines[i][1], HORIZONTAL_ALIGNMENT_CENTER, Wd / cols)
	y += per * 15 + 4
	var c := merge_cost(a, b)
	var parts := [["%s Glut" % _num(c.gl), Game.glut >= c.gl, null]]
	if c.g:
		parts.append([str(c.g), Game.slate_g >= c.g, "g"])
	_price(parts, L + Wd / 2, minf(y + 4, _go.position.y - 8))

func _ench_text() -> void:
	_offs.clear()
	var L := _scene.position.x - 60
	var Wd := 340.0
	var y := _scene.end.y + 22
	var sm := Ui.font("italic")
	if it == null:
		Ui.shadow_text(self, sm, Vector2(L, y), "Wähle einen Gegenstand. Jedes Stück hat seine eigenen drei Glyphen.", 14, Ui.PAPER_DIM, HORIZONTAL_ALIGNMENT_CENTER, Wd)
		return
	Ui.shadow_text(self, Ui.font("body"), Vector2(L, y), it.name, 16, Items.RCOL.get(it.rar, Ui.PAPER), HORIZONTAL_ALIGNMENT_CENTER, Wd)
	y += 16
	if it.get("encN"):
		Ui.shadow_text(self, sm, Vector2(L, y), "Bereits %d× verzaubert" % it.encN, 13, TEAL, HORIZONTAL_ALIGNMENT_CENTER, Wd)
		y += 14
	y += 6
	var bw := (Wd - 16) / 3
	var bh := H - 24 - y
	var body := Ui.font("body")
	for i in it.ench.size():
		var o: Dictionary = it.ench[i]
		var r := Rect2(L + i * (bw + 8), y, bw, bh)
		_offs.append(r)
		var hov := r.has_point(_m) and _anim == 0
		draw_style_box(Ui.box("sockg" if hov or (_anim > 0 and _pick == i) else "sock", 4, 0, false), r)
		if _anim > 0:
			draw_rect(r.grow(-4), Color(0, 0, 0, .35))
		var ty := r.position.y + 22
		for l in Ui.wrap_text(body, Data.mod_line(o.k, o.v), bw - 12, 14):
			Ui.shadow_text(self, body, Vector2(r.position.x, ty), l, 14, Color("#ffd88a") if o.q > 2.7 else TEAL, HORIZONTAL_ALIGNMENT_CENTER, bw)
			ty += 16
		var py := r.end.y - 30
		Ui.shadow_text(self, Ui.font("sc"), Vector2(r.position.x, py), "%s Glut" % _num(o.gl), 13, Ui.PAPER if Game.glut >= o.gl else Ui.BAD, HORIZONTAL_ALIGNMENT_CENTER, bw)
		var parts := [[str(o.g), Game.slate_g >= o.g, "g"]]
		if o.e:
			parts.append([str(o.e), Game.slate_e >= o.e, "e"])
		_price(parts, r.get_center().x, py + 18, 13)

# ---------- the two scenes (craftFrame, sceneAnvil, sceneTable), 220 × 150 ----------

func _R(x: float, y: float, w: float, h: float, c: Color) -> void:
	draw_rect(Rect2(roundf(x), roundf(y), w, h), c)

func _E(x: float, y: float, rx: float, ry: float, c: Color) -> void:
	Prop.ellipse(self, x, y, rx, ry, c)

func _piece(x: Dictionary, at: Vector2, s: float, glow: float) -> void:
	var tex := Items.ground_pic(x)
	if tex == null:
		return
	if glow > 0:
		Prop.glow(self, at, 22 * s, Color(TEAL, .95 * glow))
	var sz := tex.get_size() * s
	draw_texture_rect(tex, Rect2((at - sz / 2).round(), sz), false)

func _slot(at: Vector2) -> void:
	var c := Color(TEAL, .35 + sin(Game.t * 3) * .15)
	var r := Rect2(at - Vector2(16, 16), Vector2(32, 32))
	var pts := [r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y), r.position]
	for i in 4:
		draw_dashed_line(pts[i], pts[i + 1], c, 1, 3)

func _scene_draw() -> void:
	var t := Game.t
	var M := mode == "merge"
	draw_set_transform(_scene.position)
	# the light from below: violet at the anvil, teal at the table
	var bg := Color(90 / 255.0, 60 / 255.0, 150 / 255.0) if M else Color(30 / 255.0, 150 / 255.0, 140 / 255.0)
	for k in 6:
		var q := 1 - k / 6.0
		Prop.ellipse(self, 110, 100, 150 * q, 80 * q, Color(bg, (.5 + sin(t * 3) * .06) * .16))
	var k := _anim
	var glow: float = maxf(0, 1 - _pop.t * 1.4) if _pop else 0.0
	if M:
		_scene_anvil(t, k, glow)
	else:
		_scene_table(t, k, glow)
	for p in _parts:
		_R(p.x, p.y, 2, 2, Color(p.c, maxf(0, 1 - p.t / p.l)))
	if _pop:
		var q: float = _pop.t
		var al := maxf(0, 1 - maxf(0, q - .9) / .5)
		var f := Ui.font("body")
		var fs := 22 if M else 13
		draw_string(f, Vector2(1, 19 - q * 12 + 1), _pop.txt, HORIZONTAL_ALIGNMENT_CENTER, 220, fs, Color(0, 0, 0, al))
		draw_string(f, Vector2(0, 19 - q * 12), _pop.txt, HORIZONTAL_ALIGNMENT_CENTER, 220, fs, Color(Color("#c8fff4"), al))
	draw_set_transform(Vector2.ZERO)

func _scene_anvil(t: float, k: float, glow: float) -> void:
	# the big stump, rings on its cut face
	_E(110, 140, 40, 9, Color("#3a2412")); _R(70, 104, 80, 36, Color("#5a3a1e")); _R(70, 104, 4, 36, Color("#7a5230"))
	for i in range(1, 6):
		_R(70 + i * 13, 106, 2, 34, Color("#4a2e16"))
	_E(110, 104, 40, 9, Color("#a8784a"))
	for r in [30, 19, 8]:
		var pts := PackedVector2Array()
		for j in 33:
			pts.append(Vector2(110 + cos(j / 32.0 * TAU) * r, 104 + sin(j / 32.0 * TAU) * r * .22))
		draw_polyline(pts, Color("#7a5230"), 1)
	# the small stump with the hammer leaning on it
	_E(183, 140, 15, 4, Color("#3a2412")); _R(168, 120, 30, 20, Color("#5a3a1e")); _R(168, 120, 3, 20, Color("#7a5230")); _E(183, 120, 15, 4, Color("#a8784a"))
	draw_set_transform(_scene.position + Vector2(180, 118), .32)
	_R(-2, -44, 4, 44, Color("#7a5430")); _R(-2, -44, 1, 44, Color("#9a7040")); _R(-10, -54, 20, 12, Color("#3a3c44")); _R(-10, -54, 20, 2, Color("#9aa0aa")); _R(-10, -54, 2, 12, Color("#6b7076"))
	draw_set_transform(_scene.position)
	# the anvil and the rune of joining on its face
	_R(98, 88, 24, 14, Color("#24262c")); _R(90, 98, 40, 5, Color("#2c2e34")); _R(74, 72, 72, 16, Color("#2c2e34")); _R(74, 72, 72, 2, Color("#8a8f9a")); _R(74, 74, 72, 2, Color("#4b4f59")); _R(74, 86, 72, 2, Color("#141518"))
	draw_colored_polygon(PackedVector2Array([Vector2(146, 72), Vector2(176, 77), Vector2(146, 86)]), Color("#2c2e34"))
	_R(146, 72, 16, 2, Color("#8a8f9a")); _R(60, 72, 14, 8, Color("#2c2e34")); _R(60, 72, 14, 2, Color("#6b7076"))
	var ra := .6 + sin(t * 5) * .3 if a and b else .22
	for i in 9:
		_R(80 + i * 7, 79 + i % 2, 4, 1, Color(TEAL, ra))
	if glow > 0:
		_R(74, 70, 72, 4, Color(200 / 255.0, 1, 244 / 255.0, glow))
	# the two pieces float above it and fly together when struck
	var bob := sin(t * 2) * 1.5
	if _anim > 0 and not _hit and a and b:
		var e := minf(1, k / .55)
		var ee := e * e
		var lift := sin(e * PI) * 12
		_piece(a, Vector2(80 + 30 * ee, 50 - lift), 1 + ee * .1, glow)
		_piece(b, Vector2(140 - 30 * ee, 50 - lift), 1 + ee * .1, glow)
	elif _hit and _anim > 0 and a:
		_piece(a, Vector2(110, 50), 1 + glow * .3, glow)
	else:
		if a:
			_piece(a, Vector2(80, 50 + bob), 1, glow)
		else:
			_slot(Vector2(80, 50))
		if b:
			_piece(b, Vector2(140, 50 - bob), 1, glow)
		else:
			_slot(Vector2(140, 50))
		draw_string(Ui.font("body"), Vector2(100, 56), "+", HORIZONTAL_ALIGNMENT_CENTER, 20, 16, Color(TEAL, .9 if a and b else .4))

func _scene_table(t: float, k: float, glow: float) -> void:
	var Lp := Vector2(46, 94)
	var T := Vector2(110, 66)
	var Rt := Vector2(174, 94)
	var B := Vector2(110, 122)
	# legs, the thick edge and the planked top
	_R(48, 96, 6, 40, Color("#4a2e16")); _R(166, 96, 6, 40, Color("#3a2412")); _R(107, 124, 6, 26, Color("#5a3a1e")); _R(107, 124, 2, 26, Color("#7a5230"))
	draw_colored_polygon(PackedVector2Array([Lp, B, B + Vector2(0, 7), Lp + Vector2(0, 7)]), Color("#6a4424"))
	draw_colored_polygon(PackedVector2Array([B, Rt, Rt + Vector2(0, 7), B + Vector2(0, 7)]), Color("#4a2e16"))
	draw_colored_polygon(PackedVector2Array([Lp, T, Rt, B]), Color("#9a6a3a"))
	for i in range(1, 6):
		draw_line(Lp.lerp(T, i / 6.0), B.lerp(Rt, i / 6.0), Color("#6a4424"), 1)
	draw_polyline(PackedVector2Array([Lp, T, Rt]), Color("#c08a50"), 1)
	# the open book, glyphs glowing on its pages
	draw_colored_polygon(PackedVector2Array([Vector2(82, 96), Vector2(118, 80), Vector2(140, 92), Vector2(104, 108)]), Color("#2a4a48"))
	draw_colored_polygon(PackedVector2Array([Vector2(86, 94), Vector2(112, 82), Vector2(100, 76), Vector2(74, 88)]), Color("#e8dcc0"))
	draw_colored_polygon(PackedVector2Array([Vector2(86, 94), Vector2(112, 82), Vector2(134, 92), Vector2(108, 104)]), Color("#d8ccb0"))
	draw_line(Vector2(86, 94), Vector2(112, 82), Color("#7a5230"), 1)
	var ga := .5 + sin(t * 3) * .3
	for i in 4:
		_R(82 + i * 6, 88 - i * 2.6, 4, 1, Color(26 / 255.0, 154 / 255.0, 138 / 255.0, ga))
		_R(98 + i * 7, 96 - i * 3, 4, 1, Color(26 / 255.0, 154 / 255.0, 138 / 255.0, ga))
	# the light rising from the pages to the piece above
	var ba := .25 + glow * .5
	for i in 12:
		_R(96, 30 + i * 62 / 12.0, 28, 62 / 12.0 + 1, Color(TEAL, ba * i / 11.0))
	# the gems circle above and dive into the piece when a glyph is bought
	var e := minf(1, k / .55) if _anim > 0 and not _hit else 0.0
	var rr := 1 - e * e
	for i in 5:
		var an := t * .8 + i * 1.2566
		var x := 110 + cos(an) * 44 * rr
		var y := 40 + sin(an) * 12 * rr + sin(t * 2 + i) * 2
		draw_colored_polygon(PackedVector2Array([Vector2(x, y - 5), Vector2(x + 3, y), Vector2(x, y + 5), Vector2(x - 3, y)]), Color("#5ef0d8") if sin(an) > 0 else Color("#1a9a8a"))
		_R(x - 1, y - 3, 1, 2, Color.WHITE)
	if it:
		_piece(it, Vector2(110, 36 + sin(t * 2) * 1.5), 1 + glow * .3, glow)
	else:
		_slot(Vector2(110, 36))

## the anvil or the book, 24 × 24 pixels (paintCraftPort)
func _portrait(at: Vector2, k: float) -> void:
	var R := func(x: float, y: float, w: float, h: float, c: String) -> void: draw_rect(Rect2(at + Vector2(x, y) * k, Vector2(w, h) * k), Color(c))
	R.call(0, 0, 24, 24, "#081012")
	if mode == "merge":
		R.call(4, 17, 16, 7, "#5a3a1e"); R.call(4, 16, 16, 2, "#a8784a"); R.call(9, 12, 6, 4, "#24262c"); R.call(3, 8, 16, 4, "#2c2e34"); R.call(3, 8, 16, 1, "#8a8f9a"); R.call(19, 8, 3, 2, "#2c2e34"); R.call(5, 10, 12, 1, "#7af0e0")
	else:
		R.call(2, 15, 20, 3, "#9a6a3a"); R.call(3, 18, 2, 6, "#5a3a1e"); R.call(19, 18, 2, 6, "#5a3a1e"); R.call(4, 11, 8, 4, "#e8dcc0"); R.call(12, 11, 8, 4, "#d8ccb0"); R.call(11, 11, 2, 4, "#7a5230"); R.call(5, 12, 5, 1, "#7af0e0"); R.call(14, 13, 4, 1, "#7af0e0")
		for p in [[4, 4], [11, 2], [18, 5]]:
			R.call(p[0], p[1], 2, 3, "#5ef0d8")
			R.call(p[0], p[1], 1, 1, "#ffffff")
	draw_rect(Rect2(at, Vector2(24, 24) * k), Color("#2ac8b0"), false, 1)
