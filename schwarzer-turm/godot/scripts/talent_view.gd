class_name TalentView
extends FullView
## The talent tree on the whole screen (P, buildTree in 340-talent-tree.js): only your class, its path climbing
## upwards through four bands (each saying what a talent costs there) to the two keystones. Learnt talents glow in
## their colour, the ones you may take next wear a dashed gold ring, paths you walked are gold. Drag to move, wheel
## or pinch to zoom; a click learns. The view starts above your highest talent.

const NR := {"root": 15.0, "small": 10.0, "not": 15.0, "mile": 22.0, "key": 24.0}

var _hover := ""

func _ready() -> void:
	super._ready()
	key = KEY_P
	title = "Talentbaum"

func _vh() -> float:
	return body.size.y

func opened() -> void:
	Talents.build()
	title = "Talentbaum · " + Save.cls_name(Game.cls)
	_center()

func _smax() -> float:
	return maxf(1.2, (200 - Talents.top()) / maxf(1, _vh()))

func _center() -> void:
	var st := Talents.start()
	if st == "":
		return
	var top: Dictionary = Talents.TREE[st]
	for id in Game.tree:
		var n = Talents.TREE.get(id)
		if n and n.cls == Game.cls and n.y < top.y:
			top = n
	s_max = _smax()
	vs = clampf(1150 / minf(body.size.x, _vh() * 1.6), s_min, s_max)
	vx = 0
	vy = top.y - _vh() * .2 * vs
	clamp_view()

## never past the root or above the keystones; zoomed out fully the tree sits in the middle (tSetVB)
func clamp_view() -> void:
	s_max = _smax()
	vs = clampf(vs, s_min, s_max)
	var hh := _vh() * vs / 2
	var lo := Talents.top() - 200 + hh
	var hi := 180 - hh
	vx = clampf(vx, -420, 420)
	vy = clampf(vy, lo, hi) if lo <= hi else (lo + hi) / 2

func head() -> void:
	var p := Talents.points()
	var info := ("[color=#e3b04b][b]%d[/b][/color] Talentpunkte frei" % p if p else "Keine freien Talentpunkte") + " · %d vergeben · Meilensteine [color=#ffe08a][b]%d[/b][/color]/4" % [Talents.spent(), Talents.miles()]
	set_head(info, "Der Pfad führt nach oben · je höher, desto teurer · goldene Sechsecke öffnen die nächste Stufe",
		[["+", func(): zoom_at(1 / 1.4)], ["−", func(): zoom_at(1.4)], ["Mitte", func(): _center(); body.queue_redraw()],
		["Zurücksetzen · %d Glut" % Talents.reset_cost(), func(): Talents.reset(); head(); body.queue_redraw(), Game.tree.is_empty()],
		["Schließen (P)", close]])

func body_click(w: Vector2, _at: Vector2) -> void:
	var id := _node_at(w)
	if id != "" and Talents.can(id):
		Talents.learn(id)
		head()
		body.queue_redraw()

func body_hover(w: Vector2, _at: Vector2) -> void:
	_hover = _node_at(w)

func _node_at(w: Vector2) -> String:
	var best := ""
	var bd := 1e9
	for id in Talents.TREE:
		var n: Dictionary = Talents.TREE[id]
		if n.cls != Game.cls:
			continue
		var d := w.distance_to(Vector2(n.x, n.y))
		if d < NR[n.k] + 6 + 4 * vs and d < bd:
			bd = d
			best = id
	return best

func tick() -> void:
	if _hover != "" and Talents.TREE.has(_hover):
		ui.overlay.tip(_tip(_hover), ui.root.get_local_mouse_position())

func _tip(id: String) -> Array:
	var n: Dictionary = Talents.TREE[id]
	var cn: String = Talents.TREE[Talents.start()].n
	var tier: String = Talents.TRING[n.t] if n.t >= 0 and n.t < 4 else ""
	var col := Color("#ffb347") if n.k == "key" else (Color("#ffe08a") if n.k == "mile" else (Ui.GOLD if n.k == "not" else Color(n.col)))
	var L := [[n.get("n", n.get("th", cn)), col]]
	match n.k:
		"key": L.append(["Schlussstein · " + cn, Ui.PAPER_DIM])
		"mile": L.append(["Meilenstein · %s · Tor zur Stufe %s" % [tier, ("„%s“" % Talents.TRING[n.ring + 1]) if n.ring < 3 else "der Schlusssteine"], Ui.PAPER_DIM])
		"not": L.append(["Großes Talent · %s · %s" % [n.th, tier], Ui.PAPER_DIM])
		"root": L.append(["Wurzel · hier beginnt dein Weg", Ui.PAPER_DIM])
		_: L.append(["%s · %s" % [n.get("th", cn), tier], Ui.PAPER_DIM])
	for k in n.m:
		L.append([Talents.mod_text(k, n.m[k]), Color("#ff7a5a") if n.m[k] < 0 else Color("#9ab8ff")])
	if n.m.has("potStack"):
		L.append(["Gleiche Tränke stapeln sich im Inventar.", Ui.PAPER_DIM])
	if n.m.has("invRows"):
		L.append(["Das Inventar wächst um eine Reihe.", Ui.PAPER_DIM])
	var c: int = n.c
	var act := ""
	if Talents.has(id):
		act = "Hier beginnt jeder Weg" if n.k == "root" else "Erlernt"
	elif Talents.can(id):
		act = "Klick: erlernen · %d %s" % [c, "Punkte" if c > 1 else "Punkt"]
	elif not n.adj.any(func(a): return Talents.has(a)):
		act = "Nur neben erlernten Talenten · kostet %d" % c
	else:
		act = "Kostet %d Talentpunkte, frei: %d" % [c, Talents.points()]
	L.append([act, Ui.PAPER_DIM, "small"])
	return L

# ---------- drawing ----------

func body_draw(c: Control) -> void:
	var st := Talents.start()
	if st == "":
		return
	var k := 1.0 / vs
	var sc := Ui.font("sc")
	var cc := Color(Talents.TREE[st].col)
	# the tiers as bands, each saying what a talent costs there
	for t in 5:
		var y1: float = Talents.ty(t, 0) + Talents.D * .55 if t < 4 else Talents.ty(3, Talents.STEPS) - Talents.D * .55
		var y0: float = Talents.ty(t, Talents.STEPS) - Talents.D * .55 if t < 4 else Talents.top() - Talents.D * .8
		var a := to_screen(Vector2(-560, y0))
		var b := to_screen(Vector2(560, y1))
		c.draw_rect(Rect2(a, b - a), Color(Ui.GOLD, .07 if t % 2 else .035))
		var cost: int = Talents.TCOST[t] if t < 4 else Talents.TKEYC
		var name: String = ("%d. %s" % [t + 1, Talents.TRING[t]]) if t < 4 else "Schlusssteine"
		c.draw_string(sc, to_screen(Vector2(-540, y1 - 38)), name, HORIZONTAL_ALIGNMENT_LEFT, -1, maxi(8, roundi(26 * k)), Color("#c8a868", .8))
		c.draw_string(sc, to_screen(Vector2(-540, y1 - 14)), "%d %s je Talent" % [cost, "Punkte" if cost > 1 else "Punkt"], HORIZONTAL_ALIGNMENT_LEFT, -1, maxi(7, roundi(17 * k)), Color("#a89878"))
	# the paths
	for e in Talents.EDGE:
		if e[2] != Game.cls:
			continue
		var A: Dictionary = Talents.TREE[e[0]]
		var B: Dictionary = Talents.TREE[e[1]]
		var on: bool = Talents.has(e[0]) and Talents.has(e[1])
		var av: bool = (Talents.has(e[0]) and Talents.can(e[1])) or (Talents.has(e[1]) and Talents.can(e[0]))
		var pa := to_screen(Vector2(A.x, A.y))
		var pb := to_screen(Vector2(B.x, B.y))
		if on:
			c.draw_line(pa, pb, Color(Ui.GOLD, .25), 11 * k, true)
		c.draw_line(pa, pb, Ui.GOLD if on else (Color("#7a6440") if av else Color("#3a2c1a")), (5 if on else 4) * k, true)
	# the talents, then their names over everything
	var labels := []
	var t_now := Time.get_ticks_msec() / 1000.0
	for id in Talents.TREE:
		var n: Dictionary = Talents.TREE[id]
		if n.cls != Game.cls:
			continue
		var r: float = NR[n.k] * k
		var has := Talents.has(id)
		var can := Talents.can(id)
		var p := to_screen(Vector2(n.x, n.y))
		if p.x < -60 or p.y < -60 or p.x > c.size.x + 60 or p.y > c.size.y + 60:
			continue
		var col := cc if n.k in ["mile", "key"] else Color(n.col)
		var fill := col if has else Color("#1a140e")
		if has and n.k != "small":
			for q in 4:
				c.draw_circle(p, r * (1.9 - q * .2), Color(col, .07))
		# the ring: dark, gold and dashed when it can be taken (gently breathing), light when held, white under the mouse
		var ring_r := r + 3 * k
		if id == _hover:
			c.draw_arc(p, ring_r, 0, TAU, 40, Color.WHITE, 3 * k, true)
		elif can:
			var a0 := t_now * .6
			for q in 12:
				c.draw_arc(p, ring_r, a0 + q * TAU / 12, a0 + q * TAU / 12 + TAU / 22, 4, Color("#ffd88a", .7 + .3 * sin(t_now * 3)), 2 * k, true)
		elif has:
			c.draw_arc(p, ring_r, 0, TAU, 40, Color("#ffe8b0"), 2 * k, true)
		else:
			c.draw_arc(p, ring_r, 0, TAU, 40, Color.BLACK, 3 * k, true)
		match n.k:
			"key":
				var q := r * .62 * sqrt(2)
				var pts := PackedVector2Array([p + Vector2(0, -q), p + Vector2(q, 0), p + Vector2(0, q), p + Vector2(-q, 0)])
				c.draw_colored_polygon(pts, fill)
				pts.append(pts[0])
				c.draw_polyline(pts, col, 3 * k, true)
			"mile":
				var hx := _hex(p, r)
				c.draw_colored_polygon(hx, Ui.GOLD if has else Color("#1a140e"))
				var hc := hx.duplicate()
				hc.append(hx[0])
				c.draw_polyline(hc, Color("#fff2c0") if has else Ui.GOLD, 3.5 * k, true)
				c.draw_colored_polygon(_hex(p, r * .55), Color("#fff2c0") if has else Color(col, .7))
			_:
				c.draw_circle(p, r, fill)
				c.draw_arc(p, r, 0, TAU, 32, col if has or can else Color("#4a3a24"), (2.5 if n.k == "small" else 4.0) * k, true)
		if n.has("n"):
			labels.append([n, p, r, has])
	for l in labels:
		var n: Dictionary = l[0]
		if vs > 2.2 or (vs > 1.4 and n.k == "not"):
			continue
		var fs: float = {"mile": 21.0, "key": 21.0, "root": 18.0}.get(n.k, 15.0) * k
		var col: Color = Color("#ffb347") if n.k == "key" else (Ui.GOLD if n.k == "mile" else (Color("#f0dca8") if l[3] else Color("#a89878")))
		var at: Vector2 = l[1] + Vector2(-200, l[2] + (19 if n.k == "not" else 26) * k)
		c.draw_string_outline(sc, at, n.n, HORIZONTAL_ALIGNMENT_CENTER, 400, maxi(6, roundi(fs)), maxi(2, roundi(4 * k)), Color.BLACK)
		c.draw_string(sc, at, n.n, HORIZONTAL_ALIGNMENT_CENTER, 400, maxi(6, roundi(fs)), col)

func _hex(p: Vector2, r: float) -> PackedVector2Array:
	var out := PackedVector2Array()
	for q in 6:
		var a := PI / 6 + q * PI / 3
		out.append(p + Vector2(cos(a), sin(a)) * r)
	return out

func _process(dt: float) -> void:
	super._process(dt)
	if visible:
		body.queue_redraw()
