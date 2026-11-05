class_name Bonfire
## The bonfire's window (openShrine in 260-ui.js): its name, what resting does, Rasten, and "Reisen zu": the hill,
## every bonfire lit in the sky and every floor of the tower whose fire burns. Built for the fire the hero stands at.

static func dialog(host, o: Prop) -> Control:
	var L: Level = host.level
	var here: String = o.p.get("key", "") if o.p.get("ow") else ("home" if Game.floor_no == 0 else "")
	var pv := Ui.plate(12, Vector4(22, 14, 22, 20))
	var p: PanelContainer = pv[0]
	p.custom_minimum_size = Vector2(minf(440, host.ui.area().x - 32), 0)
	var v: VBoxContainer = pv[1]
	v.add_child(Ui.heading(o.p.get("name", "Leuchtfeuer") if o.p.get("name", "") != "" else "Leuchtfeuer", 34))
	v.add_child(Ui.hint("Rasten heilt dich, füllt den Flakon und setzt hier deinen Wiedereinstieg. Alle Feinde %s erheben sich erneut." % ("der Himmelsinseln" if L.ow else "dieser Ebene"), 13))
	v.add_child(Ui.button("Rasten", func():
		host.close_menu()
		L.rest_at(o)))
	# in the sky the fire also lets you choose the hour (740-rest-until-hour.js)
	if L.ow:
		var hb := HBoxContainer.new()
		hb.add_theme_constant_override("separation", 6)
		for k in ["day", "night"]:
			var b := Ui.button("Rasten bis zum Morgen" if k == "day" else "Rasten bis zur Nacht", func():
				host.close_menu()
				DayNight.rest_until(L, o, k), 14)
			b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			hb.add_child(b)
		v.add_child(hb)
	var list := []
	if here != "home":
		list.append(["Der Hügel", func(): host.travel_home()])
	var fires: Array = Game.ow_fires.keys().filter(func(k): return k != here)
	fires.sort_custom(func(a, b): return String(Game.ow_fires[a].name) < String(Game.ow_fires[b].name))
	for k in fires:
		var f: Dictionary = Game.ow_fires[k]
		var n: String = String(f.name).trim_prefix("Leuchtfeuer am ").trim_prefix("Leuchtfeuer an der ")
		list.append([n, func(): host.travel_sky(Vector2(f.x, f.y))])
	var lit: Array = Game.lit.keys().filter(func(fl): return int(fl) > 0 and int(fl) != Game.floor_no and Game.lit[fl])
	lit.sort_custom(func(a, b): return int(a) < int(b))
	for fl in lit:
		var ff := int(fl)
		list.append(["Ebene %d" % ff, func(): host.travel_floor(ff)])
	if list.size():
		v.add_child(Ui.label("Reisen zu", 15, Ui.PAPER_DIM, "sc"))
		var g := GridContainer.new()
		var w: float = p.custom_minimum_size.x - 44
		g.columns = maxi(1, int(w / 94))
		g.add_theme_constant_override("h_separation", 6)
		g.add_theme_constant_override("v_separation", 6)
		for e in list:
			var b := Ui.button(e[0], e[1], 14)
			b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			b.clip_text = true
			b.tooltip_text = e[0]
			g.add_child(b)
		var sc := ScrollContainer.new()
		sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		sc.add_child(g)
		g.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		sc.custom_minimum_size = Vector2(0, minf(ceilf(list.size() / float(g.columns)) * 40, host.ui.area().y * .4))
		v.add_child(sc)
	v.add_child(Ui.button("Weitergehen", func(): host.close_menu()))
	return p
