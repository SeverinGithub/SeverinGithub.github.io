class_name Menus
## The menu box (#menu .mbox in 440-menus.js, 790-heroes.js, pickClass in 040-classes.js): pause, settings, controls,
## the heroes with their own saves, the choice of a class, and "are you sure". Every window is a stone plate built
## fresh when it opens; `host` is tower.gd, which does what the buttons ask.

const KEYS := [["Linksklick", "Gehen, angreifen, aufheben, benutzen"], ["Shift + Klick", "Angriff auf der Stelle"], ["Rechtsklick", "Gewählte Fertigkeit wirken"],
	["1 – 6", "Fertigkeit wirken und auswählen"], ["Leertaste", "Ausweichrolle (kostet Ausdauer)"], ["F", "Heilflakon"], ["Y · X", "Heiltrank · Manatrank (auch Q)"],
	["C · I · K", "Charakter · Inventar · Fertigkeiten"], ["Esc", "Pause und Menü, schließt offene Fenster"],
	["F11 · Alt+Enter", "Vollbild (Mac: Cmd+Ctrl+F)"], ["Strg + Plus · Minus", "Pixel größer · kleiner (Strg+0 zurück)"]]
## the new controls: the hero walks with W A S D, the left button swings the sword towards the mouse
const KEYS_WASD := [["W A S D", "Gehen: hoch, links, runter, rechts"], ["Linksklick", "Schwerthieb zur Maus (halten: weiter)"],
	["Linksklick nah", "Aufheben, benutzen, ansprechen"], ["Rechtsklick", "Gewählte Fertigkeit wirken"]]
const SCHEMES := [["classic", "Oldschool Classic", "Klicken zum Gehen"], ["wasd", "Neue Steuerung", "W A S D gehen, Klick schlägt"]]

## the box: a plate 440 wide (or wider), a centred heading, then rows
static func _box(title: String, w := 440.0) -> Array:
	var pv := Ui.plate(8, Vector4(22, 14, 22, 22))
	var p: PanelContainer = pv[0]
	p.custom_minimum_size = Vector2(w, 0)
	var v: VBoxContainer = pv[1]
	var h := Ui.heading(title, 34)
	(h.get_node("row/title") as Label).horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(h)
	return [p, v]

static func _mbtn(text: String, cb: Callable, sub := "") -> Button:
	var b := Ui.button(text, cb, 17)
	b.custom_minimum_size = Vector2(0, 44)
	if sub != "":
		b.text = text + "\n" + sub
		b.custom_minimum_size = Vector2(0, 56)
	return b

static func _msg(text: String) -> Label:
	var l := Ui.label(text, 14, Ui.H3, "italic")
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.custom_minimum_size = Vector2(0, 20)
	return l

# ---------- pause ----------

static func pause(host, msg := "") -> Control:
	var bv := _box("Pause")
	var v: VBoxContainer = bv[1]
	v.add_child(_mbtn("Weiterspielen", func(): host.close_menu()))
	v.add_child(_mbtn("Spiel speichern", func():
		host.save_game()
		var h := Save.find(Save.current())
		host.show_menu("pause", "Gespeichert · " + Save.name_of(h))))
	v.add_child(_mbtn("Helden", func(): host.show_menu("heroes")))
	v.add_child(_mbtn("Einstellungen", func(): host.show_menu("settings")))
	v.add_child(_mbtn("Steuerung", func(): host.show_menu("controls")))
	v.add_child(_mbtn("Speichern und zum Hauptmenü", func(): host.to_title()))
	v.add_child(_mbtn("Neuen Helden beginnen", func():
		host.save_game()
		host.to_title()
		host.show_menu("class")))
	v.add_child(_mbtn("Speichern und beenden", func():
		host.save_game()
		host.get_tree().quit()))
	v.add_child(_msg(msg))
	return bv[0]

# ---------- settings ----------

static func settings(host) -> Control:
	var bv := _box("Einstellungen")
	var v: VBoxContainer = bv[1]
	v.add_child(Ui.sub("Ton"))
	for e in [["music", "Musik"], ["sfx", "Effekte"], ["voice", "Stimmen"]]:
		v.add_child(_slider(e[0], e[1]))
	v.add_child(_check("mute", "Alles stumm"))
	v.add_child(Ui.sub("Kampf"))
	v.add_child(_check("shake", "Bildschirmwackeln"))
	v.add_child(_check("hitstop", "Trefferstopp"))
	v.add_child(_check("numbers", "Schadenszahlen"))
	v.add_child(Ui.sub("Bild"))
	var full := DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN
	var fc := CheckBox.new()
	fc.text = "Vollbild (F11)"
	fc.button_pressed = full
	fc.add_theme_font_override("font", Ui.font("sc"))
	fc.add_theme_color_override("font_color", Ui.BTN_TXT)
	fc.alignment = HORIZONTAL_ALIGNMENT_LEFT
	fc.icon_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	fc.toggled.connect(func(on): DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN if on else DisplayServer.WINDOW_MODE_WINDOWED))
	v.add_child(fc)
	var pr := HBoxContainer.new()
	pr.add_theme_constant_override("separation", 10)
	var pl := Ui.label("Pixelgröße", 15, Ui.BTN_TXT, "sc")
	pl.custom_minimum_size = Vector2(120, 0)
	pr.add_child(pl)
	var val := Ui.label("×%d" % Screen.k, 15, Ui.PAPER, "sc")
	val.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	for d in [-1, 1]:
		var b := Ui.button("−" if d < 0 else "+", func():
			Screen.step_zoom(d)
			val.text = "×%d" % Screen.k, 15)
		b.custom_minimum_size = Vector2(40, 32)
		if d < 0:
			pr.add_child(b)
			pr.add_child(val)
		else:
			pr.add_child(b)
	v.add_child(pr)
	v.add_child(_mbtn("Zurück", func(): host.menu_back()))
	return bv[0]

static func _slider(k: String, n: String) -> Control:
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 10)
	var l := Ui.label(n, 15, Ui.BTN_TXT, "sc")
	l.custom_minimum_size = Vector2(120, 0)
	h.add_child(l)
	var s := HSlider.new()
	s.min_value = 0
	s.max_value = 100
	s.step = 5
	s.value = Game.cfg[k]
	s.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	s.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	h.add_child(s)
	var o := Ui.label(str(Game.cfg[k]), 15, Ui.BTN_TXT, "sc")
	o.custom_minimum_size = Vector2(44, 0)
	o.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	h.add_child(o)
	s.value_changed.connect(func(x):
		Game.cfg[k] = int(x)
		o.text = str(int(x))
		Game.save_cfg())
	return h

static func _check(k: String, n: String) -> Control:
	var c := CheckBox.new()
	c.text = n
	c.button_pressed = bool(Game.cfg[k])
	c.add_theme_font_override("font", Ui.font("sc"))
	c.add_theme_color_override("font_color", Ui.BTN_TXT)
	c.icon_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	c.toggled.connect(func(on):
		Game.cfg[k] = on
		Game.save_cfg())
	return c

# ---------- controls ----------

static func controls(host) -> Control:
	var bv := _box("Steuerung")
	var v: VBoxContainer = bv[1]
	# the two schemes side by side, the chosen one lit
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	for e in SCHEMES:
		var id: String = e[0]
		var b := _mbtn(e[1], func():
			Game.cfg.ctl = id
			Game.save_cfg()
			host.show_menu("controls"), e[2])
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.toggle_mode = true
		b.button_pressed = Game.cfg.ctl == id
		if Game.cfg.ctl == id:
			b.add_theme_color_override("font_color", Ui.GOLD)
			b.add_theme_color_override("font_pressed_color", Ui.GOLD)
		row.add_child(b)
	v.add_child(row)
	var pc := PanelContainer.new()
	pc.add_theme_stylebox_override("panel", _keys_box())
	var g := GridContainer.new()
	g.columns = 2
	g.add_theme_constant_override("h_separation", 14)
	g.add_theme_constant_override("v_separation", 3)
	var keys: Array = KEYS
	if Game.wasd():
		keys = KEYS_WASD + KEYS.slice(3)
	for e in keys:
		g.add_child(Ui.label(e[0], 14, Ui.GOLD, "sc"))
		g.add_child(Ui.label(e[1], 14))
	pc.add_child(g)
	v.add_child(pc)
	v.add_child(_mbtn("Zurück", func(): host.menu_back()))
	return bv[0]

static func _keys_box() -> StyleBox:
	var b := Ui.box("tipf", 8, 10)
	b.modulate_color = Color(1, 1, 1, 1)
	return b

# ---------- confirm ----------

static func confirm(host, msg: String, yes: String, cb: Callable) -> Control:
	var bv := _box("Sicher?")
	var v: VBoxContainer = bv[1]
	var h := Ui.hint(msg)
	h.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(h)
	v.add_child(_mbtn(yes, cb))
	v.add_child(_mbtn("Abbrechen", func(): host.menu_back()))
	return bv[0]

# ---------- the class ----------

## four cards in two columns: name, what the class is, its six skills, its start values
static func classes(host) -> Control:
	var w := minf(760, host.ui.area().x * .94)
	var bv := _box("Wähle deinen Weg", w)
	var v: VBoxContainer = bv[1]
	var g := GridContainer.new()
	g.columns = 2 if host.ui.area().x > 640 else 1
	var cw := (w - 44 - 10 * (g.columns - 1)) / g.columns
	g.add_theme_constant_override("h_separation", 10)
	g.add_theme_constant_override("v_separation", 10)
	for k in Data.classes:
		var C: Dictionary = Data.classes[k]
		var card := PanelContainer.new()
		card.custom_minimum_size = Vector2(cw, 0)
		card.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		var sb_n := _card_box(false)
		var sb_h := _card_box(true)
		card.add_theme_stylebox_override("panel", sb_n)
		card.mouse_entered.connect(func(): card.add_theme_stylebox_override("panel", sb_h))
		card.mouse_exited.connect(func(): card.add_theme_stylebox_override("panel", sb_n))
		var cv := VBoxContainer.new()
		cv.add_theme_constant_override("separation", 4)
		cv.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var n := Ui.label(C.n, 24, Ui.HEAD, "display")
		n.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cv.add_child(n)
		var d := Ui.label(C.d, 13)
		d.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		d.custom_minimum_size.x = cw - 24
		d.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cv.add_child(d)
		var ic := HBoxContainer.new()
		ic.add_theme_constant_override("separation", 3)
		ic.mouse_filter = Control.MOUSE_FILTER_IGNORE
		for id in C.skills:
			var t := TextureRect.new()
			t.texture = Game.sk_icon(id)
			t.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			t.custom_minimum_size = Vector2(26, 26)
			t.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
			t.mouse_filter = Control.MOUSE_FILTER_IGNORE
			ic.add_child(t)
		cv.add_child(ic)
		var st: Dictionary = C.stats
		var sm := Ui.label("Stärke %d · Geschick %d · Vitalität %d · Energie %d" % [st.str, st.dex, st.vit, st.ene], 11, Ui.PAPER_DIM)
		sm.mouse_filter = Control.MOUSE_FILTER_IGNORE
		cv.add_child(sm)
		card.add_child(cv)
		var cls: String = k
		card.gui_input.connect(func(ev):
			if ev is InputEventMouseButton and ev.pressed and ev.button_index == MOUSE_BUTTON_LEFT:
				host.start_game(cls))
		g.add_child(card)
	v.add_child(g)
	v.add_child(_mbtn("Zurück", func(): host.menu_back()))
	return bv[0]

## a class card: dark leather in a thin gold line, warmer and brighter under the mouse (.ccard)
static func _card_box(hot: bool) -> StyleBox:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(.16, .1, .05, .92) if hot else Color(.07, .05, .04, .88)
	sb.border_color = Color("#ffd27a") if hot else Color(.55, .42, .22, .7)
	sb.set_border_width_all(1)
	sb.shadow_color = Color(1, .55, .16, .25) if hot else Color(0, 0, 0, .5)
	sb.shadow_size = 8 if hot else 3
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 8
	sb.content_margin_bottom = 10
	return sb

# ---------- heroes ----------

static var _arm := ""
static var _arm_t := 0

## every hero with their own save: the name can be changed, play, delete with a second click
static func heroes(host, msg := "") -> Control:
	var bv := _box("Helden", minf(760, host.ui.area().x * .94))
	var v: VBoxContainer = bv[1]
	var hint := Ui.hint("Jeder Held hat seinen eigenen Spielstand und speichert sich selbst, auch mit seinem Standort. Klicke auf den Namen, um ihn zu ändern.")
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	v.add_child(hint)
	var list := VBoxContainer.new()
	list.add_theme_constant_override("separation", 5)
	var cur := Save.current()
	var ingame: bool = host.playing()
	var a := Save.all()
	if a.is_empty():
		var e := Ui.hint("Noch kein Held.")
		e.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		list.add_child(e)
	for i in a.size():
		var h: Dictionary = a[i]
		var on: bool = h.id == cur
		var row := PanelContainer.new()
		var rb := StyleBoxFlat.new()
		rb.bg_color = Color(60 / 255.0, 40 / 255.0, 10 / 255.0, .45) if on else Color(0, 0, 0, .35)
		rb.border_color = Color("#c8a050") if on else Color("#3a2e1e")
		rb.set_border_width_all(1)
		rb.set_content_margin_all(6)
		rb.content_margin_left = 8
		rb.content_margin_right = 8
		row.add_theme_stylebox_override("panel", rb)
		var hb := HBoxContainer.new()
		hb.add_theme_constant_override("separation", 10)
		var no := Ui.label("●" if on else str(i + 1), 20, Color("#ffe08a") if on else Color("#c8a050"), "sc")
		no.custom_minimum_size = Vector2(30, 0)
		no.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		hb.add_child(no)
		var mid := VBoxContainer.new()
		mid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var le := LineEdit.new()
		le.text = h.get("n", "")
		le.placeholder_text = Save.cls_name(h.get("cls", ""))
		le.max_length = 24
		var id: String = h.id
		le.text_submitted.connect(func(t):
			Save.rename(id, t)
			le.release_focus())
		le.focus_exited.connect(func(): Save.rename(id, le.text))
		mid.add_child(le)
		mid.add_child(Ui.label((("spielt gerade · " if ingame else "zuletzt gespielt · ") if on else "") + Save.desc(h), 13, Ui.PAPER_DIM))
		hb.add_child(mid)
		if not (on and ingame):
			var pb := Ui.button("Fortsetzen" if on else "Spielen", func(): host.play_hero(id))
			hb.add_child(pb)
			var armed: bool = _arm == id and Time.get_ticks_msec() < _arm_t
			var db := Ui.button("Wirklich löschen?" if armed else "✕", func():
				if _arm == id and Time.get_ticks_msec() < _arm_t:
					_arm = ""
					Save.delete(id)
					host.show_menu("heroes", "%s ist gelöscht." % Save.name_of(h))
				else:
					_arm = id
					_arm_t = Time.get_ticks_msec() + 4000
					host.show_menu("heroes", "%s wird mit allem gelöscht. Zum Bestätigen noch einmal klicken." % Save.name_of(h)))
			db.tooltip_text = "Held löschen"
			if armed:
				db.add_theme_color_override("font_color", Ui.BAD)
			hb.add_child(db)
		row.add_child(hb)
		list.add_child(row)
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	sc.custom_minimum_size = Vector2(0, minf(list.get_combined_minimum_size().y + 4, host.ui.area().y * .5))
	sc.add_child(list)
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	v.add_child(sc)
	list.resized.connect(func(): sc.custom_minimum_size.y = minf(list.size.y + 4, host.ui.area().y * .5))
	v.add_child(_msg(msg))
	v.add_child(_mbtn("Neuer Held", func():
		if ingame:
			host.save_game()
			host.to_title()
		host.show_menu("class")))
	v.add_child(_mbtn("Zurück", func(): host.menu_back()))
	return bv[0]
