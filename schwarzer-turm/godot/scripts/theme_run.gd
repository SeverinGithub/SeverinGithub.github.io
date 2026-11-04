class_name ThemeRun
extends Node2D
## The theme floors and tower rooms in play (982-floor-themes.js, 984-tower-rooms.js). Lies on the ground between the floor
## and the figures and paints what is flat: the theme's tint, water, lava, the light well, steam vents, the trial's ring,
## pressure plates and cracks; a child adds the coloured light falling from the windows. Every frame it runs what these
## floors do: lava burns, water slows, vents hiss, the air of the theme moves, braziers catch fire on a dark floor, kegs blow,
## chandeliers drop, plates shoot arrows, the floor cracks, the trial sends its waves, the altar's blessing fades.

const TINT := preload("res://shaders/soft_light.gdshader")

var L: Level
var m: Dictionary
var curse := ""
var beams: Node2D
var burn_t := 0.0
var in_water := false
var lever_reset := -1.0
static var room = null            # the floor's special room, for the pictures of its objects

func setup(level: Level) -> ThemeRun:
	L = level
	m = level.m
	curse = m.get("curse", "")
	ThemeRun.room = m.get("sroom")
	var tint = (FloorThemes.CURSE[curse].get("tint") if curse != "" else null)
	if tint == null and m.get("fth"):
		tint = m.fth.tint
	if tint != null:
		var tr := ColorRect.new()
		tr.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tr.size = Vector2(m.w + m.h, m.w + m.h) * 32 + Vector2(64, 64)
		tr.position = Vector2(-m.h * 32 - 32, -32)
		var mat := ShaderMaterial.new()
		mat.shader = TINT
		mat.set_shader_parameter("tint", Color(tint, .5))
		tr.material = mat
		tr.show_behind_parent = true
		add_child(tr)
	beams = Beams.new()
	beams.run = self
	var add := CanvasItemMaterial.new()
	add.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	beams.material = add
	add_child(beams)
	return self

# ---------- what the rest of the level asks ----------

## dungDark: the veil's colour, the curse's over the theme's
func dark_color() -> Color:
	var c = FloorThemes.CURSE.get(curse)
	var col: Color = c.get("dark", null) if c and c.get("dark") != null else (m.fth.dark if m.get("fth") else Color8(4, 3, 2))
	return Color(col, c.get("a", .95) if c else .95)

## plLight: how far the hero's own light reaches; on a dark floor it grows with every brazier lit
func pl_light() -> float:
	var c = FloorThemes.CURSE.get(curse)
	if not c or not c.has("light"):
		return 1.0
	if curse == "finster" and m.has("fires"):
		return c.light + (1 - c.light) * m.fires.lit / float(maxi(1, m.fires.n))
	return c.light

## floorSpd: frost and water slow the hero
func floor_spd() -> float:
	var s := 1.0
	var c = FloorThemes.CURSE.get(curse)
	if c and c.has("spd"):
		s *= c.spd
	if in_water:
		s *= .72
	return s

## a cursed floor's foes hit harder or move faster and give more; kegs and chandeliers stand as foes that take no blows
func on_populate() -> void:
	if curse != "":
		for e in L.enemies:
			if e.wall or e.get_meta("cursed", false):
				continue
			e.set_meta("cursed", true)
			e.xp *= 1.3
			if curse == "blut":
				e.dmg = [e.dmg[0] * 1.3, e.dmg[1] * 1.3]
				e.spd *= 1.15
			if curse == "raserei":
				e.spd *= 1.15
	for h in m.get("hz", []):
		if not h.get("gone"):
			L._add_enemy(_hazard(h))
			if OS.get_cmdline_user_args().has("--why"):
				print("Gefahr ", h.k, " ", h.x, ",", h.y)
	var S = m.get("sroom")
	if S:
		S.on = false
		S.wave = 0

func _hazard(h: Dictionary) -> Enemy:
	var e := Enemy.make("golem", Vector2(h.x, h.y), "normal", Game.mlvl, L.R)
	e.wall = true
	e.obj = h.k
	e.hz = h
	e.e_name = "Pulverfass" if h.k == "barrel" else "Kronleuchter"
	e.sub = "explodiert bei jedem Treffer" if h.k == "barrel" else "hängt an einer morschen Kette"
	e.hp = 1
	e.max_hp = 1
	e.dmg = [0.0, 0.0]
	e.spd = 0
	e.xp = 0
	e.aff = []
	e.r = .42 if h.k == "barrel" else .55
	e.cd = 1e9
	e.scale_f = 1
	e.elem = null
	return e

## a keg or chandelier takes no damage: any blow lights the fuse or snaps the chain (twTrig)
func trigger(e: Enemy, chain := false) -> void:
	if e.dead or e.fuse >= 0:
		return
	e.flash = .15
	e.fuse = (.2 if chain else .1) if e.obj == "barrel" else .45
	if e.obj == "chand":
		L.sparks(e.world, 2.4, -1.57, 8, [Color("#ffe0a0"), Color("#c8a050")], 3)

func _blast(e: Enemy) -> void:
	e.dead = true
	e.die_t = 99
	e.hz.gone = true
	var dm := L.trap_dmg()
	var pp := Vector2(L.P.x, L.P.y)
	if e.obj == "barrel":
		L.tele.append({"shape": "circle", "x": e.world.x, "y": e.world.y, "r": 1.6, "t": 0.0, "dur": .01, "dmg": 0.0, "elem": "fire", "owner": null, "quiet": true})
		L.shake = maxf(L.shake, 10)
		L.flashes.append({"x": e.world.x, "y": e.world.y, "r": 280.0, "a": 1.0, "t": 0.0, "life": .6})
		for k in 14:
			_part("gore", e.world.x, e.world.y, .4, L.R.rnd(-4, 4), L.R.rnd(-4, 4), L.R.rnd(2, 5), L.R.rnd(.6, 1.2), L.R.pick([Color("#5a3a1c"), Color("#3a2610"), Color("#7a5228")]), L.R.rnd(2, 4), 1.0)
		L.burst(e.world, Color("#ff9a30"), 24, 3)
		for f in L.enemies.duplicate():
			if f.dead or f == e:
				continue
			if f.world.distance_to(e.world) > 2.5 + f.r * .5:
				continue
			if f.obj != "":
				if f.obj == "barrel":
					trigger(f, true)
				continue
			if f.wall:
				continue
			L.hit_enemy(f, dm * 4, {"ally": true, "col": Color("#ffb070")})
			var a := atan2(f.world.y - e.world.y, f.world.x - e.world.x)
			f.kv += Vector2(cos(a), sin(a)) * 5
		if not L.P.dead and pp.distance_to(e.world) < 2.5:
			L.hurt_player(dm * 1.4, "fire", null)
	else:
		if e.hz.has("prop"):
			e.hz.prop.off = true
			_light_off(e.hz.prop)
		L.shake = maxf(L.shake, 8)
		L._smoke(e.world, 12)
		L.sparks(e.world, .3, 0, 24, [Color("#ffe0a0"), Color("#ffb050"), Color("#c8a050")], 6)
		m.deco.append({"k": "rubble", "x": e.world.x, "y": e.world.y, "v": 0})
		L.redraw_ground()
		for f in L.enemies.duplicate():
			if f.dead or f.wall or f.world.distance_to(e.world) > 1.8 + f.r * .5:
				continue
			L.hit_enemy(f, dm * 3.5, {"ally": true, "col": Color("#ffe0a0")})
			f.stun = maxf(f.stun, 1.2)
		if not L.P.dead and pp.distance_to(e.world) < 1.8:
			L.hurt_player(dm * 1.2, null, null)

func _light_off(p: Dictionary) -> void:
	if p.has("_l"):
		p._l.a = 0.0
	if p.has("_g"):
		p._g.visible = false

## killEnemy wrapper: a foe of a cursed floor sometimes leaves an extra item
func on_kill(e: Enemy) -> void:
	if curse != "" and not e.wall and randf() < .12:
		L.drop_item(Items.make(Game.mlvl, {"mf": Game.d.get("mf", 0)}), e.world.x, e.world.y)

# ---------- the objects of the tower rooms ----------

func obj_name(o: Dictionary) -> String:
	var S = m.get("sroom")
	match o.type:
		"twvault": return "Schatztruhe (leer)" if o.open else ("Schatztruhe (verschlossen)" if o.locked else "Schatztruhe")
		"twplaque": return "Inschrift"
		"twlever": return "Hebel"
		"twtrial": return "Prüfstein (bestanden)" if S and S.get("done") else "Prüfstein · berühren, um die Prüfung zu beginnen"
		"twaltar": return "Blutaltar (satt)" if o.used else "Blutaltar"
		"twcage": return "Leerer Käfig" if o.open else "Gefangener · " + o.name
		"twlift":
			var on: bool = Game.tw.lift.has(Game.floor_no)
			return ("Aufzug zum Leuchtfeuer" if o.low else "Aufzug zur Treppe") + ("" if on else (" · Riegel lösen" if o.low else " (verriegelt)"))
		"twhole": return "Loch im Boden · hinabspringen"
	return ""

func _loot(o: Dictionary, n: int, ml: int) -> void:
	for k in n:
		L.drop_item(Items.make(ml, {"rarity": "rare" if randf() < .55 else "magic", "boost": .4}), o.x, o.y)
	if randf() < .3:
		L.drop_item(Items.make(ml, {"rarity": "unique"}), o.x, o.y)
	if randf() < .5:
		L.drop_item(Items.potion("life", Game.floor_no if Game.floor_no > 0 else 4), o.x, o.y)
	var gl := roundi(30 * Game.mlvl)
	Game.glut += gl
	L.ftext(Vector2(o.x, o.y - .4), "+%d Glut" % gl, Color("#ff9a3a"))
	L.burst(Vector2(o.x, o.y), Color("#ffd88a"), 22, 2.5)

## interact for the room objects; true when it was one of them
func interact(n: Prop) -> bool:
	var o: Dictionary = n.p
	var S = m.get("sroom")
	match o.type:
		"twvault":
			if o.open:
				return true
			if o.locked:
				Game.log_msg("Das Schloss rührt sich nicht. Die Hebel im Raum öffnen es.", Color("#c8b898"))
				return true
			o.open = true
			_loot(o, 3, Game.mlvl + 2)
			Game.banner.emit("SCHATZKAMMER", "Der Lohn für den klugen Kopf", "")
		"twplaque":
			if not S or not S.has("order"):
				return true
			var names: Array = S.order.map(func(g): return FloorThemes.GEMS[g].n)
			var txt: String = "„Erst " + ", dann ".join(names.slice(0, names.size() - 1)) + ", zuletzt " + names[-1] + ".“"
			Game.banner.emit("DIE INSCHRIFT", txt, "")
			Game.log_msg("Inschrift: " + txt, Color("#e8d8b0"))
		"twlever":
			if not S or S.get("solved") or o.on:
				return true
			o.on = true
			if o.gem == S.order[S.step]:
				S.step += 1
				L.sparks(Vector2(o.x, o.y), .8, -1.57, 8, [FloorThemes.GEMS[o.gem].c, Color.WHITE], 3)
				if S.step >= S.order.size():
					S.solved = true
					Game.tw.done[S.id] = 1
					for v in m.objs:
						if v.type == "twvault":
							v.locked = false
					Game.banner.emit("DAS SCHLOSS SPRINGT AUF", "Die Schatzkammer ist offen", "")
			else:
				S.step = 0
				lever_reset = .45
				L.hurt_player(L.trap_dmg() * 1.3, null, null)
				for k in 8:
					var a := L.R.rnd(0, TAU)
					_part("spark", L.P.x + cos(a) * 3, L.P.y + sin(a) * 3, 1, -cos(a) * 12, -sin(a) * 12, 0, .25, Color("#d8d0bc"), 2, 0)
				Game.log_msg("Falsche Reihenfolge! Pfeile schnellen aus den Wänden, die Hebel springen zurück.", Color("#ff7a5a"))
		"twtrial":
			if not S or S.get("done") or S.get("on"):
				return true
			S.on = true
			S.wave = 0
			S.next = 0.0
			S.pack = []
			Game.banner.emit("DIE PRÜFUNG", "Drei Wellen. Kein Weg hinaus, bis alle fallen.", "boss")
			L.shake = 6
			L.rings.append({"x": S.cx, "y": S.cy, "r": .2, "v": 9.0, "max": S.rad, "col": Color8(255, 70, 50)})
		"twaltar":
			if o.used:
				Game.log_msg("Der Altar ist satt.", Color("#c8b898"))
				return true
			if not o.has("arm") or Game.t > o.arm:
				o.arm = Game.t + 5
				Game.log_msg("Der Altar verlangt Blut: ein Drittel deines Lebens für mehr Kraft. Berühre ihn noch einmal, um zu opfern.", Color("#ff7a6a"))
				return true
			o.used = true
			if S:
				Game.tw.done[S.id] = 1
			var c: float = Game.d.life / 3.0
			Game.hp = maxf(1, Game.hp - c)
			Game.bless_t = 120
			L.ftext(Vector2(L.P.x, L.P.y), "-%d" % roundi(c), Color("#ff4a3a"), true)
			L.burst(Vector2(o.x, o.y), Color("#c81a10"), 30, 3)
			L.shake = 5
			Game.banner.emit("BLUTOPFER", "+30 % Schaden für zwei Minuten", "boss")
		"twcage":
			if o.open:
				return true
			o.open = true
			o.ft = Game.t
			if S:
				Game.tw.done[S.id] = 1
			var says := ["Endlich! Ich kenne diese Ebene wie meine Zelle – hier, meine Karte.", "Ich dachte, hier kommt keiner mehr. Nimm, was ich mir gemerkt habe.", "Die Wächter haben mich vergessen. Ich vergesse dich nicht – hier, die Wege dieser Ebene."]
			Game.log_msg("%s: „%s“" % [o.name, says[randi() % 3]], Color("#e8d8b0"))
			L.drop_item(Items.potion("life", Game.floor_no), o.x, o.y)
			var gl := roundi(15 * Game.mlvl)
			Game.glut += gl
			L.ftext(Vector2(o.x, o.y - .4), "+%d Glut" % gl, Color("#ff9a3a"))
			Game.banner.emit("BEFREIT", o.name + " zeigt dir die ganze Ebene", "")
		"twlift":
			var f := Game.floor_no
			var to = null
			for x in m.objs:
				if x.type == "twlift" and x != o:
					to = x
			if to == null:
				return true
			if o.low:
				if not Game.tw.lift.has(f):
					Game.tw.lift[f] = 1
					Game.log_msg("Du löst den Riegel. Der Aufzug fährt jetzt zwischen Treppe und Leuchtfeuer.", Color("#ffd88a"))
			elif not Game.tw.lift.has(f):
				Game.log_msg("Der Aufzug ist von unten verriegelt.", Color("#c8b898"))
				return true
			var p := L.near_walk(to.x + .9, to.y + .9)
			L.P.x = p.x
			L.P.y = p.y
			L.cam_w = p
			L.P.path = []
			L.P.interact = null
			L.flow_t = 0
			L._smoke(p, 10)
			L.shake = 4
			Game.log_msg("Der Aufzug rattert durch den Schacht.", Color("#c8b898"))
		"twhole":
			_fall()
		_:
			return false
	return true

## twFall: down through the floor, hurt but quicker
func _fall() -> void:
	if L.P.dead:
		return
	var c: float = Game.d.life * .15
	Game.hp = maxf(1, Game.hp - c)
	Game.log_msg("Du stürzt durch den Boden – eine Ebene tiefer. (-%d Leben)" % roundi(c), Color("#ff9a6a"))
	L.get_tree().current_scene.call_deferred("enter_floor", Game.floor_no + 1)

func _wave(S: Dictionary) -> void:
	S.wave += 1
	S.next = 1.5
	var VP := L.var_pool(maxi(1, Game.floor_no))
	var mix := [L.R.wpick(VP), L.R.wpick(VP)]
	var n: int = 3 + S.wave * 2 + mini(3, Game.floor_no >> 2)
	S.pack = []
	for k in n:
		var a := k / float(n) * TAU + randf()
		var p := L.near_walk(S.cx + cos(a) * (S.rad - 1.2), S.cy + sin(a) * (S.rad - 1.2))
		var e := Enemy.make(L.R.pick(mix), p, "unique" if S.wave == 3 and k == 0 else "normal", Game.mlvl, L.R)
		e.aggro = true
		e.tw_wave = true
		S.pack.append(e)
		L._add_enemy(e)
		L._smoke(p, 8)
		L.flashes.append({"x": p.x, "y": p.y, "r": 30.0, "a": .3, "t": 0.0, "life": .6})
	Game.banner.emit("WELLE %d VON 3" % S.wave, "", "boss")

# ---------- every frame ----------

func _part(k: String, x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, col: Color, s: float, g: float) -> void:
	L.parts.append({"k": k, "x": x, "y": y, "z": z, "vx": vx, "vy": vy, "vz": vz, "t": 0.0, "life": life, "col": col, "s": s, "g": g})

func tick(dt: float) -> void:
	queue_redraw()
	beams.queue_redraw()
	var P := L.P
	var R := L.R
	var pp := Vector2(P.x, P.y)
	if Game.bless_t > 0:
		Game.bless_t -= dt
		if R.next() < dt * 6:
			_part("mote", P.x + R.rnd(-.4, .4), P.y + R.rnd(-.4, .4), R.rnd(.2, 1.4), 0, 0, .6, .8, R.pick([Color("#ff4a3a"), Color("#c81a10")]), 1.4, 0)
		if Game.bless_t <= 0:
			Game.log_msg("Der Segen des Blutes verblasst.", Color("#c8b898"))
	if lever_reset > 0:
		lever_reset -= dt
		if lever_reset <= 0:
			for l in m.objs:
				if l.type == "twlever":
					l.on = false
	burn_t -= dt
	var burn := burn_t <= 0
	if burn:
		burn_t = .5
	# lava burns whoever stands in it
	for Lv in m.lava:
		if absf(Lv.x - P.x) > 18 or absf(Lv.y - P.y) > 18:
			continue
		if not P.dead and pp.distance_to(Vector2(Lv.x, Lv.y)) < Lv.r - .1:
			if burn and not (P.iframe > 0):
				L.hurt_player(L.trap_dmg() * .5, "fire", null)
			if R.next() < .4:
				_part("ember", P.x + R.rnd(-.2, .2), P.y + R.rnd(-.2, .2), .2, 0, 0, R.rnd(1, 2.5), .6, R.pick([Color("#ffc070"), Color("#ff7a1a")]), 2, -.05)
		if burn:
			for e in L.enemies:
				if not e.dead and not e.wall and not e.boss and e.world.distance_to(Vector2(Lv.x, Lv.y)) < Lv.r:
					L.hit_enemy(e, L.trap_dmg() * .9, {"ally": true, "col": Color("#ff9a3a"), "dot": true})
		if R.next() < dt * Lv.r * 1.2:
			var a := R.rnd(0, 6.28)
			var q := R.rnd(0, Lv.r * .8)
			_part("ember", Lv.x + cos(a) * q, Lv.y + sin(a) * q, .05, 0, 0, R.rnd(.8, 1.8), R.rnd(.6, 1.2), R.pick([Color("#ffe080"), Color("#ff9a30")]), R.rnd(1.2, 2.2), -.03)
	# water slows the hero and the foes
	in_water = false
	for W in m.water:
		if absf(W.x - P.x) > 18 or absf(W.y - P.y) > 18:
			continue
		if pp.distance_to(Vector2(W.x, W.y)) < W.r - .05:
			in_water = true
			if P.path.size() and R.next() < dt * 8:
				_part("dot", P.x + R.rnd(-.2, .2), P.y + R.rnd(-.2, .2), .1, R.rnd(-1, 1), R.rnd(-1, 1), R.rnd(1.5, 2.5), .4, Color("#9ac8f0"), 1.4, .9)
		for e in L.enemies:
			if not e.dead and not e.wall and e.world.distance_to(Vector2(W.x, W.y)) < W.r:
				e.slow = maxf(e.slow, .12)
	# steam vents breathe on their beat
	for v in m.vents:
		if absf(v.x - P.x) > 16 or absf(v.y - P.y) > 16:
			continue
		v.t += dt
		if v.t > v.per - .7 and R.next() < dt * 14:
			L._smoke(Vector2(v.x, v.y), 1)
		if v.t >= v.per:
			v.t = 0.0
			L.tele.append({"shape": "circle", "x": v.x, "y": v.y, "r": 1.0, "t": 0.0, "dur": .05, "dmg": L.trap_dmg() * .8, "owner": null, "on_done": "trap", "quiet": true})
			for k in 14:
				_part("smoke", v.x + R.rnd(-.3, .3), v.y + R.rnd(-.3, .3), R.rnd(0, .4), R.rnd(-1, 1), R.rnd(-1, 1), R.rnd(1, 2.4), R.rnd(.8, 1.4), Color(230 / 255.0, 232 / 255.0, 240 / 255.0, .55), R.rnd(4, 9), 0)
	# the air of the theme, around the hero
	var amb: String = m.fth.amb if m.get("fth") else ""
	if amb != "" and R.next() < dt * (3 if amb == "drip" else 6):
		var x: float = P.x + R.rnd(-9, 9)
		var y: float = P.y + R.rnd(-9, 9)
		if L.walkable(x, y):
			match amb:
				"dust": _part("mote", x, y, R.rnd(.4, 2.4), R.rnd(-.08, .08), R.rnd(-.08, .08), R.rnd(-.04, .04), R.rnd(2.5, 4), R.pick([Color("#e8d0a0"), Color("#c8b088")]), 1, 0)
				"ember": _part("ember", x, y, R.rnd(0, .5), R.rnd(-.2, .2), R.rnd(-.2, .2), R.rnd(.5, 1.1), R.rnd(1.5, 3), R.pick([Color("#ffb050"), Color("#ff7a1a")]), 1.4, -.01)
				"mote": _part("mote", x, y, R.rnd(.6, 2.6), 0, 0, R.rnd(-.05, .05), R.rnd(2, 3.5), R.pick([Color("#ff8a8a"), Color("#8ab0ff"), Color("#ffe08a"), Color("#d0a0ff")]), 1.1, 0)
				_: _part("dot", x, y, 3.2, 0, 0, -.5, .7, Color("#8ab8e0"), 1.3, .9)
	# on a dark floor every brazier you reach catches fire
	if curse == "finster":
		if not m.has("fires"):
			m.fires = {"n": m.props.filter(func(p): return p.k == "ftcold").size(), "lit": 0}
		var F: Dictionary = m.fires
		for p in m.props:
			if p.k == "ftcold" and Vector2(p.x - P.x, p.y - P.y).length() < 1.8:
				p.k = "brazier"
				p.lit = 1
				F.lit += 1
				L.relight(p)
				L.burst(Vector2(p.x, p.y), Color("#ffb060"), 14, 2)
				L.flashes.append({"x": p.x, "y": p.y, "r": 260.0, "a": 1.0, "t": 0.0, "life": .8})
				if F.lit >= F.n:
					Game.banner.emit("DIE FINSTERNIS WEICHT", "Alle Feuerbecken brennen", "")
					var gl := roundi(12 * Game.mlvl)
					Game.glut += gl
					L.ftext(pp, "+%d Glut" % gl, Color("#ff9a3a"))
				else:
					Game.log_msg("Feuerbecken entzündet: %d von %d." % [F.lit, F.n], Color("#ffd88a"))
	# a draft betrays the hidden wall
	var Sc = m.get("secret")
	if Sc and not Sc.open and R.next() < dt * 3:
		for e in L.enemies:
			if e.wall and e.obj == "" and not e.dead and e.world.distance_to(pp) < 10:
				_part("mote", e.world.x + R.rnd(-.5, .5), e.world.y + R.rnd(-.5, .5), R.rnd(.2, 1.6), -Sc.dir.x * R.rnd(.3, .8) + R.rnd(-.1, .1), -Sc.dir.y * R.rnd(.3, .8) + R.rnd(-.1, .1), R.rnd(-.05, .08), R.rnd(1.6, 2.6), R.pick([Color("#d8c8a8"), Color("#b8a888"), Color("#e8dcc0")]), 1.3, 0)
				break
	# kegs and chandeliers whose fuse burns
	for e in L.enemies.duplicate():
		if e.obj != "" and not e.dead and e.fuse >= 0:
			e.fuse -= dt
			if e.fuse <= 0:
				e.fuse = 0
				_blast(e)
	_trial(dt)
	# pressure plates: arrows across the room
	for p in m.plates:
		if absf(p.x - P.x) > 14 or absf(p.y - P.y) > 14:
			continue
		p.cd -= dt
		p.dn = maxf(0, p.dn - dt)
		var on: bool = (not P.dead and pp.distance_to(Vector2(p.x, p.y)) < .45) or L.enemies.any(func(e): return not e.dead and not e.wall and e.world.distance_to(Vector2(p.x, p.y)) < .4)
		if on:
			p.dn = .4
		if on and p.cd <= 0:
			p.cd = 2.6
			L.tele.append({"shape": "line", "x": p.sx, "y": p.sy, "ang": p.ang, "len": p.len, "w": .7, "t": 0.0, "dur": .4, "dmg": L.trap_dmg() * 1.3, "owner": null, "on_done": "trap", "quiet": true})
			for k in 3:
				_part("spark", p.sx, p.sy, .8 + k * .15, cos(p.ang) * 22, sin(p.ang) * 22, 0, p.len / 22.0 + .4, Color("#d8d0bc"), 2.2, 0)
	# cracked floors give way
	for c in m.cracks:
		if absf(c.x - P.x) > 10 or absf(c.y - P.y) > 10:
			continue
		var on: bool = not P.dead and pp.distance_to(Vector2(c.x, c.y)) < .75
		if c.st == 0 and on:
			c.st = 1
			c.t = 0.0
			Game.log_msg("Der Boden knackt unter dir!", Color("#ff9a6a"))
		elif c.st == 1:
			c.t += dt
			L.shake = maxf(L.shake, 1.5)
			if R.next() < dt * 20:
				L._smoke(Vector2(c.x + R.rnd(-.4, .4), c.y + R.rnd(-.4, .4)), 1)
			if c.t >= .8:
				c.st = 2
				var tt: PackedByteArray = m.t
				tt[floori(c.y) * m.w + floori(c.x)] = 0
				m.t = tt
				L.t = tt
				L.redraw_ground()
				var p := L.near_walk(c.x + .9, c.y + .9)
				L.add_obj({"type": "twhole", "x": p.x, "y": p.y})
				L.flow_t = 0
				if on:
					_fall()
					return
				Game.log_msg("Der Boden bricht ein. Durch das Loch geht es eine Ebene tiefer.", Color("#c8b898"))

func _trial(dt: float) -> void:
	var S = m.get("sroom")
	if not S or not S.get("on"):
		return
	var P := L.P
	if P.dead:
		S.on = false
		S.wave = 0
		for e in L.enemies:
			if e.tw_wave and not e.dead:
				e.dead = true
				e.visible = false
		return
	var c := Vector2(S.cx, S.cy)
	var d := Vector2(P.x, P.y).distance_to(c)
	if d > S.rad - .3:
		var k: float = (S.rad - .3) / d
		P.x = S.cx + (P.x - S.cx) * k
		P.y = S.cy + (P.y - S.cy) * k
		P.path = []
	if not S.pack.any(func(e): return not e.dead):
		S.next -= dt
		if S.next <= 0:
			if S.wave >= 3:
				S.on = false
				S.done = true
				Game.tw.done[S.id] = 1
				var p := L.near_walk(S.cx + 1, S.cy + 1)
				L.add_obj({"type": "twvault", "x": p.x, "y": p.y, "open": false, "locked": false})
				Game.gain_xp(Game.lvl * 40)
				Game.banner.emit("PRÜFUNG BESTANDEN", "Eine Truhe erscheint", "")
			else:
				_wave(S)

# ---------- the flat things on the ground ----------

func _draw() -> void:
	var P := L.P
	var t := Game.t
	var near := func(x: float, y: float, r: float) -> bool: return absf(x - P.x) < 22 + r and absf(y - P.y) < 22 + r
	for W in m.water:
		if near.call(W.x, W.y, W.r):
			_water(W, t)
	for Lv in m.lava:
		if near.call(Lv.x, Lv.y, Lv.r):
			_lava(Lv, t)
	if m.get("well") and near.call(m.well.x, m.well.y, 4):
		_well(m.well, t)
	for v in m.vents:
		if not near.call(v.x, v.y, 1):
			continue
		var s := Iso.to_screen(Vector2(v.x, v.y))
		var warn: bool = v.t > v.per - .7
		ThemeDraw.ell(self, s, 15, 7.5, Color("#14110c"))
		var gc := Color(1, 240 / 255.0, 220 / 255.0, .5 + sin(t * 30) * .3) if warn else Color("#4a4236")
		for k in range(-2, 3):
			draw_line(s + Vector2(k * 5 - 3, -3 + absi(k)), s + Vector2(k * 5 + 3, 3 - absi(k)), gc, 1.4)
		ThemeDraw.ell_line(self, s, 15, 7.5, Color("#6a5a3a"), 1)
	var S = m.get("sroom")
	if S and S.k == "pruefung" and not S.get("done"):
		var s := Iso.to_screen(Vector2(S.cx, S.cy))
		var on: bool = S.get("on", false)
		var col := Color(1, 70 / 255.0, 50 / 255.0, .6 + sin(t * 6) * .25 if on else .18)
		var n := 48
		for k in n:
			if not on and k % 2:
				continue
			var a0 := k / float(n) * TAU
			var a1 := (k + 1) / float(n) * TAU
			draw_line(s + Vector2(cos(a0) * S.rad * 45.25, sin(a0) * S.rad * 22.6), s + Vector2(cos(a1) * S.rad * 45.25, sin(a1) * S.rad * 22.6), col, 3 if on else 1.5)
		if on:
			for k in 16:
				var q := k / 16.0 * TAU + t * .3
				var p := Iso.to_screen(Vector2(S.cx + cos(q) * S.rad, S.cy + sin(q) * S.rad))
				draw_rect(Rect2(p.x - 1.5, p.y - 6, 3, 6), Color(1, 120 / 255.0, 80 / 255.0, .5 + sin(t * 5 + k) * .3))
	for p in m.plates:
		if not near.call(p.x, p.y, 1):
			continue
		var s := Iso.to_screen(Vector2(p.x, p.y))
		var d := 2.0 if p.dn > 0 else 0.0
		draw_colored_polygon(PackedVector2Array([s + Vector2(0, -10), s + Vector2(20, 0), s + Vector2(0, 10), s + Vector2(-20, 0)]), Color("#2a2620"))
		draw_colored_polygon(PackedVector2Array([s + Vector2(0, -8 + d), s + Vector2(16, d), s + Vector2(0, 8 + d), s + Vector2(-16, d)]), Color("#3e3a34") if d else Color("#5a564c"))
		draw_rect(Rect2(s.x - 1, s.y - 2 + d, 2, 4), Color(0, 0, 0, .35))
	for c in m.cracks:
		if not near.call(c.x, c.y, 1):
			continue
		var s := Iso.to_screen(Vector2(c.x, c.y))
		var Rr := Rng.new(c.seed)
		var sh := randf_range(-1.2, 1.2) if c.st == 1 else 0.0
		if c.st == 2:
			var pts := PackedVector2Array()
			for k in 12:
				var a := k / 12.0 * TAU
				var r := .8 + Rr.next() * .35
				pts.append(s + Vector2(cos(a) * 32 * r, sin(a) * 16 * r))
			draw_colored_polygon(pts, Color.BLACK)
			pts.append(pts[0])
			draw_polyline(pts, Color("#3a342c"), 2)
			continue
		var n := 9 if c.st == 1 else 6
		var grow: float = 1 + c.t if c.st == 1 else 1.0
		for k in n:
			var a := Rr.next() * 6.28
			var x := s.x + sh
			var y := s.y
			var pts := PackedVector2Array([Vector2(x, y)])
			for st in 3:
				x += cos(a + (Rr.next() - .5)) * 9 * grow
				y += sin(a + (Rr.next() - .5)) * 4.5 * grow
				pts.append(Vector2(x, y))
			draw_polyline(pts, Color("#0a0806"), 1.6)
		ThemeDraw.ell(self, s + Vector2(sh, 0), 10, 5, Color(30 / 255.0, 26 / 255.0, 20 / 255.0, .5))

## concentric rings for a radial gradient inside an ellipse: stops as [offset, colour]
func _radial(c: Vector2, rx: float, ry: float, stops: Array, steps := 14) -> void:
	for k in steps:
		var f := 1 - k / float(steps)
		var col: Color = stops[0][1]
		for s in range(stops.size() - 1):
			if f >= stops[s][0] and f <= stops[s + 1][0]:
				col = Color(stops[s][1]).lerp(stops[s + 1][1], (f - stops[s][0]) / maxf(.0001, stops[s + 1][0] - stops[s][0]))
		if f > stops[-1][0]:
			col = stops[-1][1]
		ThemeDraw.ell(self, c, rx * f, ry * f, col, 0, 28)

func _lava(Lv: Dictionary, t: float) -> void:
	var s := Iso.to_screen(Vector2(Lv.x, Lv.y))
	var rx: float = Lv.r * 45.25
	var ry: float = Lv.r * 22.6
	ThemeDraw.ell(self, s + Vector2(0, 1), rx + 6, ry + 4, Color("#160804"), 0, 32)
	ThemeDraw.ell(self, s, rx + 3, ry + 2, Color("#3a1608"), 0, 32)
	_radial(s, rx, ry, [[0.0, Color("#ffe890")], [.4, Color("#ff9a28")], [1.0, Color("#b0300a")]])
	for k in 11:
		var a: float = Lv.ph + k * 2.3 + t * .06 * (1 if k % 2 else -1)
		var d := .25 + fmod(k * .37, 1) * .55
		var o := Vector2(cos(a) * rx * d, sin(a * 1.3) * ry * d)
		var z := .07 + (k % 3) * .035
		ThemeDraw.ell(self, s + o, rx * z, ry * z * .8, Color(70 / 255.0, 18 / 255.0, 4 / 255.0, .5) if k % 3 else Color(40 / 255.0, 10 / 255.0, 2 / 255.0, .65), a, 12)
	for k in 4:
		var p := fmod(t * .5 + k * .29 + Lv.ph, 1)
		var a: float = Lv.ph * 3 + k * 2.3
		ThemeDraw.ell_line(self, s + Vector2(cos(a) * rx * .45, sin(a) * ry * .45), 1 + p * 6, .5 + p * 3, Color(1, 240 / 255.0, 170 / 255.0, 1 - p), 1.2, 16)

func _water(W: Dictionary, t: float) -> void:
	var s := Iso.to_screen(Vector2(W.x, W.y))
	var rx: float = W.r * 45.25
	var ry: float = W.r * 22.6
	ThemeDraw.ell(self, s + Vector2(0, 1), rx + 4, ry + 3, Color("#2a3238"), 0, 32)
	_radial(s, rx, ry, [[0.0, Color("#1e3a52")], [1.0, Color("#08141e")]], 10)
	for k in 3:
		var p := fmod(t * .25 + k / 3.0 + W.ph, 1)
		var a: float = W.ph + k * 2.1
		ThemeDraw.ell_line(self, s + Vector2(cos(a) * rx * .35, sin(a) * ry * .35), p * rx * .6, p * ry * .6, Color(150 / 255.0, 200 / 255.0, 240 / 255.0, (1 - p) * .35), 1, 24)
	ThemeDraw.ell(self, s + Vector2(-rx * .3, -ry * .35), rx * .35, ry * .12, Color(200 / 255.0, 230 / 255.0, 1, .08), -.2)

func _well(w: Dictionary, t: float) -> void:
	var s := Iso.to_screen(Vector2(w.x, w.y))
	var rx: float = (w.r - .2) * 45.25
	var ry: float = (w.r - .2) * 22.6
	_radial(s, rx, ry, [[0.0, Color("#1a2440")], [.6, Color("#0a0e1c")], [1.0, Color("#020204")]], 12)
	# the floors below: far torches turning slowly in the deep
	for k in 9:
		var d := .25 + (k % 3) * .25
		var a := k * 2.4 + t * .05 * (1 if k % 2 else -1)
		var b := .4 + sin(t * 3 + k) * .2
		draw_rect(Rect2(s.x + cos(a) * rx * d * .8, s.y + sin(a) * ry * d * .8 + ry * .2, 1.5, 1.5), Color(1, (150 + k * 8) / 255.0, 70 / 255.0, b * (1 - d * .6)))
	for k in 3:
		ThemeDraw.ell_line(self, s + Vector2(0, ry * (.15 + k * .12)), rx * (.85 - k * .22), ry * (.85 - k * .22), Color(120 / 255.0, 140 / 255.0, 190 / 255.0, .08 + k * .03), 1)
	ThemeDraw.ell_line(self, s, rx + 2, ry + 1, Color("#2a2620"), 3)

## the coloured light falling in through the windows, and the glow over lava, added to the floor
class Beams extends Node2D:
	var run: ThemeRun

	func _draw() -> void:
		var P := run.L.P
		var t := Game.t
		for p in run.m.props:
			if p.k != "ftglass" and p.k != "ftwin":
				continue
			if absf(p.x - P.x) > 20 or absf(p.y - P.y) > 20:
				continue
			var col: Color = FloorThemes.GLASS[p.v % 4] if p.k == "ftglass" else Color8(150, 180, 240)
			var d := Vector2(0, 1) if p.face == "y" else Vector2(1, 0)
			var q: Array = [[-.45, 0], [.45, 0], [.9, 3.2], [-.9, 3.2]].map(func(v): return Iso.to_screen(Vector2(p.x + (v[0] if d.y else 0.0) + d.x * v[1], p.y + (v[0] if d.x else 0.0) + d.y * v[1])))
			var fl := .8 + sin(t * .6 + p.ph) * .2
			draw_polygon(PackedVector2Array(q), PackedColorArray([Color(col, .2 * fl), Color(col, .2 * fl), Color(col, 0), Color(col, 0)]))
		for Lv in run.m.lava:
			if absf(Lv.x - P.x) > 22 or absf(Lv.y - P.y) > 22:
				continue
			var s := Iso.to_screen(Vector2(Lv.x, Lv.y))
			ThemeDraw.glow(self, s, Lv.r * 45.25 * 1.4, Lv.r * 22.6 * 1.4, Color(1, 120 / 255.0, 30 / 255.0, .22 + sin(t * 2 + Lv.ph) * .05))
