class_name Chronicle
extends FullView
## The chronicle on the whole screen (L, buildQuests in 320-quest-chronicle.js): a gold line down the middle, the acts
## as plaques across it, each quest a card left or right of the line with a numbered dot on it: done ones green and
## faded, the active one gold and glowing with a bar and its goal, bosses in red. The wheel or a drag scrolls; it
## opens on the active quest.
## Beyond the browser: the line is drawn only as far as you came in gold, the rest dims; cards fade in by distance.

const CW := 440.0                 # a card's width
const GAP := 28.0                 # from the line to a card
var _cards: Array = []            # [quest, y, h, lines]
var _len := 0.0
var _hover := -1

func _ready() -> void:
	super._ready()
	key = KEY_L
	title = "Chronik"
	s_min = 1.0
	s_max = 1.0

func opened() -> void:
	_layout()
	vx = 0
	var cur := Game.qi
	vy = body.size.y / 2
	for c in _cards:
		if c[0].get("i", -1) == cur:
			vy = c[1] + c[2] / 2
	clamp_view()

func head() -> void:
	var n := mini(Game.qi, Quests.all().size())
	set_head("[color=#e3b04b][b]%d[/b][/color] von %d Quests erfüllt" % [n, Quests.all().size()], "Immer eine Quest ist aktiv. Oben links siehst du, wohin es geht.",
		[["Zur aktuellen", func(): opened(); body.queue_redraw()], ["Schließen (L)", close]])

func clamp_view() -> void:
	vs = 1
	vx = 0
	vy = clampf(vy, body.size.y / 2, maxf(body.size.y / 2, _len - body.size.y / 2 + 40))

## wheel scrolls instead of zooming
func zoom_at(f: float, _at = null) -> void:
	vy += (f - 1) / .15 * 90
	clamp_view()
	body.queue_redraw()

# ---------- layout: every card's text measured once ----------

func _card_lines(q: Dictionary, st: String) -> Array:
	var body_f := Ui.font("body")
	var L := []
	L.append(["sc", ("☠ " if q.get("boss") else "") + q.t, 18, Color("#ff8a6a") if q.get("boss") else Ui.HEAD])
	for l in Ui.wrap_text(body_f, q.d, CW - 28, 14):
		L.append(["body", l, 14, Ui.PAPER])
	if Quests.LATER.has(q.ty) and st != "done":
		L.append(["italic", Quests.LATER[q.ty] + " · wird bis dahin übersprungen", 13, Color("#a89878")])
	if st == "cur":
		L.append(["bar", "", 20, Ui.GOLD])
		var t = Quests.tgt
		if t and host.level:
			for l in Ui.wrap_text(Ui.font("italic"), "Ziel: %s · %d Schritte · auf der Karte (M) markiert" % [t.l, roundi(Vector2(t.x - host.level.P.x, t.y - host.level.P.y).length())], CW - 28, 13):
				L.append(["italic", l, 13, Color("#ffd88a")])
	L.append(["sc", ("Erfüllt · " if st == "done" else "Belohnung: ") + "%d Glut%s" % [q.glut, " · +1 Talentpunkt" if q.tp else ""], 13, Color("#c8a868")])
	return L

func _layout() -> void:
	_cards.clear()
	var y := 40.0
	var act := -1
	for q in Quests.all():
		if q.a != act:
			act = q.a
			_cards.append([{"act": act}, y, 56.0, []])
			y += 72
		var st := "done" if q.i < Game.qi else ("cur" if q.i == Game.qi else "fut")
		var L := _card_lines(q, st)
		var h := 16.0
		for l in L:
			h += l[2] + 6
		_cards.append([q, y, h, L, st])
		y += h + 14
	if Game.qi >= Quests.all().size():
		_cards.append([{"act": -1}, y, 56.0, []])
		y += 72
	_len = y

# ---------- input ----------

func body_hover(w: Vector2, _at: Vector2) -> void:
	_hover = -1
	for i in _cards.size():
		var c: Array = _cards[i]
		if c[0].has("act"):
			continue
		if _card_rect(c).has_point(w):
			_hover = i

func _card_rect(c: Array) -> Rect2:
	var left: bool = c[0].i % 2 == 0
	return Rect2(-GAP - CW if left else GAP, c[1], CW, c[2])

func tick() -> void:
	body.queue_redraw()

# ---------- drawing ----------

func body_draw(c: Control) -> void:
	if _cards.is_empty():
		return
	var top := to_screen(Vector2(0, 0))
	var bot := to_screen(Vector2(0, _len))
	# the line: gold as far as you came, dim beyond
	var cur_y := _len
	for cd in _cards:
		if not cd[0].has("act") and cd[0].i == Game.qi:
			cur_y = cd[1] + 24
	var cy := to_screen(Vector2(0, cur_y)).y
	c.draw_rect(Rect2(top.x - 2, top.y, 4, cy - top.y), Color("#e3b04b"))
	c.draw_rect(Rect2(top.x - 5, top.y, 10, cy - top.y), Color(1, .7, .3, .08))
	c.draw_rect(Rect2(top.x - 2, cy, 4, bot.y - cy), Color("#3a2a14"))
	var sc := Ui.font("sc")
	var disp := Ui.font("display")
	var now := Time.get_ticks_msec() / 1000.0
	for i in _cards.size():
		var cd: Array = _cards[i]
		var p := to_screen(Vector2(0, cd[1]))
		if p.y > c.size.y + 40 or p.y + cd[2] < -40:
			continue
		var q: Dictionary = cd[0]
		if q.has("act"):
			var s: String = Quests.QACT[q.act] if q.act >= 0 else "Die Chronik ist vollendet. Der Turm aber reicht tiefer."
			var f := disp if q.act >= 0 else Ui.font("italic")
			var fs := 26 if q.act >= 0 else 18
			var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x + 40
			var r := Rect2(p.x - w / 2, p.y + 6, w, 44)
			c.draw_rect(r, Color("#120c06"))
			c.draw_rect(r, Color("#5a4020"), false, 2)
			c.draw_string(f, Vector2(r.position.x, r.position.y + 32) + Vector2(0, 2), s, HORIZONTAL_ALIGNMENT_CENTER, w, fs, Color.BLACK)
			c.draw_string(f, Vector2(r.position.x, r.position.y + 32), s, HORIZONTAL_ALIGNMENT_CENTER, w, fs, Color("#e8c878"))
			continue
		var st: String = cd[4]
		var rr := _card_rect(cd)
		var r := Rect2(to_screen(rr.position), rr.size)
		var alpha := .55 if st == "done" else (.78 if st == "fut" else 1.0)
		var boss: bool = q.get("boss", false)
		var edge := Color("#3a2a14")
		if st == "cur":
			edge = Color("#ff6a4a") if boss else Ui.GOLD
			var g := .25 + .1 * sin(now * 2.4)
			for k in 4:
				c.draw_rect(r.grow(3 + k * 3), Color(edge, g * (1 - k / 4.0) * .4), false, 3)
		elif boss:
			edge = Color("#6a2a1a")
		if i == _hover:
			edge = edge.lightened(.3)
		c.draw_rect(Rect2(r.position + Vector2(0, 3), r.size), Color(0, 0, 0, .5 * alpha))
		c.draw_rect(r, Color(20 / 255.0, 14 / 255.0, 8 / 255.0, .9 * alpha))
		c.draw_rect(r, Color(edge, alpha), false, 2)
		# a short stub from the line to the card
		var left := rr.position.x < 0
		var sy := r.position.y + 24
		c.draw_line(Vector2(p.x + (-14 if left else 14), sy), Vector2(r.end.x if left else r.position.x, sy), Color(edge, alpha * .8), 2)
		var y := r.position.y + 8
		for l in cd[3]:
			y += l[2] + 6
			if l[0] == "bar":
				var pr := Quests.prog(q)
				var br := Rect2(r.position.x + 14, y - l[2], CW - 28, 16)
				c.draw_rect(br, Color("#0a0806"))
				var f2 := clampf(float(pr[0]) / maxf(1, pr[1]), 0, 1)
				for k in 14:
					c.draw_rect(Rect2(br.position.x + 1, br.position.y + 1 + k, (br.size.x - 2) * f2, 1), Color("#e3b04b").lerp(Color("#8a5a1a"), k / 13.0))
				c.draw_rect(br, Color("#5a4020"), false, 1)
				c.draw_string(sc, Vector2(br.position.x, br.position.y + 12), "%d / %d" % [mini(pr[0], pr[1]), pr[1]], HORIZONTAL_ALIGNMENT_CENTER, br.size.x, 12, Ui.PAPER)
				continue
			c.draw_string(Ui.font(l[0]), Vector2(r.position.x + 14, y), l[1], HORIZONTAL_ALIGNMENT_LEFT, CW - 28, l[2], Color(l[3], l[3].a * alpha))
		# the dot on the line
		var dp := Vector2(p.x, sy)
		var fill := Color("#1a140e")
		var ring := Color("#4a3a24")
		var txt := str(q.i + 1)
		var tc := Ui.PAPER_DIM
		if st == "done":
			fill = Color("#3a5a24")
			ring = Color("#7ab04a")
			txt = "✓"
			tc = Color("#e8f0d0")
		elif st == "cur":
			fill = Ui.GOLD
			ring = Color("#ffe8b0")
			txt = "◆"
			tc = Color("#1a120a")
			c.draw_circle(dp, 22, Color(1, .75, .3, .15 + .08 * sin(now * 3)))
		c.draw_circle(dp, 14, fill)
		c.draw_arc(dp, 14, 0, TAU, 28, ring, 2, true)
		c.draw_string(sc, dp + Vector2(-14, 5), txt, HORIZONTAL_ALIGNMENT_CENTER, 28, 13, tc)
