class_name SkillPanel
extends Control
## The skills window (pSkill, buildSkills in 260-ui.js): the six skills of the slots with level, description and mana,
## a + to spend a skill point. K or T opens it. The weapon in hand decides which six skills fill the slots;
## the points stay with the slots.

const PW := 330
const ROW := 50

func _ready() -> void:
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	position = Vector2(8, 22)
	size = Vector2(PW, 40 + ROW * 6)

func _process(_dt: float) -> void:
	if visible:
		queue_redraw()

func _unhandled_key_input(ev: InputEvent) -> void:
	if ev is InputEventKey and ev.pressed and not ev.echo and ev.keycode in [KEY_K, KEY_T]:
		visible = not visible
		get_viewport().set_input_as_handled()

func _plus(i: int) -> Rect2:
	return Rect2(PW - 30, 36 + i * ROW + 12, 20, 20)

func _gui_input(ev: InputEvent) -> void:
	if ev is InputEventMouseButton and ev.pressed:
		accept_event()
		if ev.button_index != MOUSE_BUTTON_LEFT:
			return
		for i in 6:
			if _plus(i).has_point(ev.position):
				Game.learn(i)
			elif Rect2(10, 36 + i * ROW, 32, 32).has_point(ev.position) and Game.slv[i] > 0:
				Game.sel = i

func _draw() -> void:
	var font := ThemeDB.fallback_font
	draw_rect(Rect2(Vector2.ZERO, size), Color(6 / 255.0, 5 / 255.0, 4 / 255.0, .94))
	draw_rect(Rect2(Vector2.ZERO, size), Color("#5a4a30"), false, 2)
	_text(Vector2(10, 16), "Fertigkeiten", 14, Color("#e8c878"))
	var k := Game.wset_key()
	var sub: String = ("%d Punkte frei" % Game.spts if Game.spts else "Keine freien Punkte") + (" · " + Data.skill_info.sets[k].n if k != "" else "")
	_text(Vector2(10, 29), sub + " · Taste 1–6 wirkt, Rechtsklick wiederholt", 9, Color("#e8c878") if Game.spts else Color("#a39b88"))
	var ids: Array = Game.sk_ids()
	for i in ids.size():
		var id: String = ids[i]
		var y := 36.0 + i * ROW
		var lv: int = Game.slv[i]
		var eff := Game.sk_lvl(i)
		var tex := Game.sk_icon(id)
		if tex:
			draw_texture_rect(tex, Rect2(10, y, 32, 32), false, Color.WHITE if lv else Color(.35, .35, .35))
		draw_rect(Rect2(10, y, 32, 32), Color("#e8c878") if i == Game.sel else Color("#3a3226"), false, 1)
		_text(Vector2(12, y + 9), str(i + 1), 9, Color("#ece4cf"))
		_text(Vector2(50, y + 10), Game.sk_name(id), 12, Color("#ece4cf") if lv else Color("#8a8272"))
		var req := Game.sk_req(i)
		var d := (Game.sk_desc(id, eff) + " Mana: %d." % Game.sk_mana(id, eff)) if lv else ("Erlernbar ab Stufe %d. " % req + Game.sk_desc(id, 1))
		var lines := _wrap(d, PW - 124, 9)
		for j in mini(3, lines.size()):
			draw_string(font, Vector2(50, y + 22 + j * 10), lines[j], HORIZONTAL_ALIGNMENT_LEFT, -1, 9, Color("#a39b88"))
		_text(Vector2(PW - 56, y + 26), str(lv) + ("+%d" % (eff - lv) if eff > lv else ""), 12, Color("#ece4cf"))
		var can: bool = Game.spts > 0 and Game.lvl >= req and lv < 20
		var pr := _plus(i)
		draw_rect(pr, Color(.5, .4, .2, .5) if can else Color(1, 1, 1, .05))
		draw_rect(pr, Color("#e8c878") if can else Color("#3a3226"), false, 1)
		_text(pr.position + Vector2(6, 15), "+", 13, Color("#ffe08a") if can else Color("#5a5244"))

func _wrap(t: String, w: float, fs: int) -> Array:
	var font := ThemeDB.fallback_font
	var out := []
	var cur := ""
	for word in t.split(" "):
		var nxt := word if cur == "" else cur + " " + word
		if font.get_string_size(nxt, HORIZONTAL_ALIGNMENT_LEFT, -1, fs).x > w and cur != "":
			out.append(cur)
			cur = word
		else:
			cur = nxt
	if cur != "":
		out.append(cur)
	return out

func _text(at: Vector2, s: String, sz: int, col: Color) -> void:
	var font := ThemeDB.fallback_font
	draw_string_outline(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, 3, Color(0, 0, 0, .85))
	draw_string(font, at, s, HORIZONTAL_ALIGNMENT_LEFT, -1, sz, col)
