class_name Shop
extends PanelContainer
## A trader's window (pShop, buildShop in 260-ui.js, keys from 770-chests.js): Odalinde on the hill or a travelling
## trader in the sky. Six pieces of gear (stockFor, kept by the trader), potions, a charge more for the flask or a
## stronger flask, chest keys, a throw of the dice for a piece of a chosen kind, and selling: while this is open the
## bag sits beside it and a click on an item sells it.

var ui: UiLayer
var host                         # tower.gd
var o: Dictionary = {}           # the trader's object
var _v: VBoxContainer
var _sig := ""
var _hover = null                # the piece of the stock under the mouse

func _ready() -> void:
	add_theme_stylebox_override("panel", Ui.plate_box(Vector4(16, 12, 16, 14)))
	var sc := ScrollContainer.new()
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(sc)
	_v = VBoxContainer.new()
	_v.add_theme_constant_override("separation", 6)
	_v.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(_v)
	visible = false
	mouse_filter = Control.MOUSE_FILTER_STOP
	add_to_group("left_panel")
	visibility_changed.connect(func():
		if not visible and host and host.inv_panel.mode == "shop":
			host.inv_panel.mode = "")

func open(trader: Dictionary) -> void:
	for n in get_tree().get_nodes_in_group("left_panel"):
		n.visible = false
	o = trader
	var a := ui.area()
	position = Vector2(12, 12)
	size = Vector2(minf(420, a.x / 2 - 24), a.y - 12 - 140)
	visible = true
	_sig = ""
	host.inv_panel.mode = "shop"
	if not host.inv_panel.visible:
		host.inv_panel.toggle()

# ---------- prices (060-items.js, 260-ui.js, 770-chests.js) ----------

static func _disc() -> float:
	return 1 - Game.d.get("shopDisc", 0) / 100.0

static func sell_price(it: Dictionary) -> int:
	return roundi(Items.value(it) * (1 + Game.d.get("sellB", 0) / 100.0))

static func buy_price(it: Dictionary) -> int:
	return roundi(Items.value(it) * 4 * _disc())

static func sell(it: Dictionary) -> void:
	var v := sell_price(it)
	Game.glut += v
	Game.inv.erase(it)
	Game.log_msg("%s für %d Glut verkauft." % [it.name, v], Color("#ff9a3a"))

func _f() -> int:
	return maxi(1, Game.max_floor)

func _potion_cost() -> int:
	return roundi((15 + _f() * 6) * _disc())

func _flask_cost() -> int:
	return roundi(250 * pow(1.7, Game.flask_max - 3) * _disc())

func _pow_cost() -> int:
	return roundi(300 * pow(1.8, Game.flask_pow) * _disc())

func _gamble_cost() -> int:
	return roundi((90 + Game.lvl * 35) * _disc())

func _key_cost() -> int:
	return roundi((200 + Game.lvl * 80) * _disc())

## six pieces made once per trader, with a roll of their own so the world's dice are left alone (stockFor)
func stock() -> Array:
	if not o.has("stock"):
		var r0 := Items.R
		Items.R = Rng.new(randi())
		var lv := maxi(1, int(o.get("lvl", Game.lvl)))
		var st := []
		for k in 6:
			st.append(Items.make(lv, {"rarity": "rare" if randf() < .03 else ("magic" if randf() < .3 else "normal")}))
		Items.R = r0
		o.stock = st
	return o.stock

func _pay(c: int) -> bool:
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut.", Ui.BAD)
		return false
	Game.glut -= c
	return true

func _buy_stock(i: int) -> void:
	var st := stock()
	if i >= st.size():
		return
	var it: Dictionary = st[i]
	var c := buy_price(it)
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut.", Ui.BAD)
		return
	if not Items.inv_add(it):
		Game.log_msg("Das Inventar ist voll.", Ui.BAD)
		return
	st.remove_at(i)
	Game.glut -= c
	_hover = null
	Game.log_msg("Gekauft: " + it.name, Items.RCOL.get(it.rar, Ui.PAPER))

func _buy(k: String) -> void:
	match k:
		"life", "mana":
			if Game.glut < _potion_cost():
				Game.log_msg("Nicht genug Glut.", Ui.BAD)
				return
			if not Items.inv_add(Items.potion(k, _f())):
				Game.log_msg("Das Inventar ist voll.", Ui.BAD)
				return
			Game.glut -= _potion_cost()
		"flask":
			if Game.flask_max < 8 and _pay(_flask_cost()):
				Game.flask_max += 1
				Game.flasks += 1
		"pow":
			if Game.flask_pow < 6 and _pay(_pow_cost()):
				Game.flask_pow += 1
		"key":
			if _pay(_key_cost()):
				Game.keys += 1
				Game.log_msg("Gekauft: Truhenschlüssel (%d)" % Game.keys, Color("#e8b060"))

## a piece of the chosen kind at your level: mostly magic, sometimes rare, very seldom unique
func _gamble(slot: String) -> void:
	var c := _gamble_cost()
	if Game.glut < c:
		Game.log_msg("Nicht genug Glut.", Ui.BAD)
		return
	var r := randf()
	var it := Items.make(Game.lvl + randi_range(0, 3), {"slot": slot, "rarity": "unique" if r < .008 else ("rare" if r < .07 else "magic")})
	if not Items.inv_add(it):
		Game.log_msg("Kein Platz im Inventar für diesen Gegenstand.", Ui.BAD)
		return
	Game.glut -= c
	Game.log_msg("Erwürfelt: " + it.name, Items.RCOL.get(it.rar, Ui.PAPER))

# ---------- the window ----------

func _process(_dt: float) -> void:
	if not visible:
		return
	var sig := "%d|%d|%d|%d|%d|%d" % [Game.glut, Game.flask_max, Game.flask_pow, Game.keys, stock().size(), Game.lvl]
	if sig != _sig:
		_sig = sig
		_build()
	if _hover and Game.hand == null:
		var lines := Items.tip(_hover, "")
		lines.append(["Preis: %d Glut" % buy_price(_hover), Ui.EMBER, "small"])
		ui.overlay.tip(lines, ui.root.get_local_mouse_position())

func _build() -> void:
	Ui.clear(_v)
	_hover = null
	var h := Ui.heading(o.get("name", "Odalinde"), 30)
	var close := Ui.button("Schließen", func(): visible = false, 13)
	close.custom_minimum_size = Vector2(0, 30)
	h.get_node("row").add_child(close)
	_v.add_child(h)
	_v.add_child(Ui.hint(o.get("quote", "„Glut kauft alles hier oben, Wanderer. Selbst das Glück.“")))
	var st := stock()
	if st.size():
		_v.add_child(Ui.sub("Ausrüstung"))
		for i in st.size():
			var it: Dictionary = st[i]
			var r := _row(it.name, Items.RCOL.get(it.rar, Ui.PAPER), str(buy_price(it)), _buy_stock.bind(i))
			r.mouse_entered.connect(func(): _hover = it)
			r.mouse_exited.connect(func():
				if _hover == it:
					_hover = null)
			_v.add_child(r)
	var sub := Ui.sub("Waren · Du hast %d Glut" % Game.glut)
	_v.add_child(sub)
	var f := _f()
	var pc := _potion_cost()
	_v.add_child(_row("Heiltrank (+%d Leben)" % (40 + f * 14), Ui.PAPER, str(pc), _buy.bind("life")))
	_v.add_child(_row("Manatrank (+%d Mana)" % (40 + f * 14), Ui.PAPER, str(pc), _buy.bind("mana")))
	_v.add_child(_row("Flakon-Ladung (%d → %d)" % [Game.flask_max, Game.flask_max + 1], Ui.PAPER, "–" if Game.flask_max >= 8 else str(_flask_cost()), _buy.bind("flask"), Game.flask_max >= 8))
	_v.add_child(_row("Flakon verstärken (+8% Heilung)", Ui.PAPER, "–" if Game.flask_pow >= 6 else str(_pow_cost()), _buy.bind("pow"), Game.flask_pow >= 6))
	_v.add_child(_row("Truhenschlüssel · du hast %d" % Game.keys, Ui.PAPER, str(_key_cost()), _buy.bind("key")))
	_v.add_child(Ui.hint("Öffnet eine verschlossene Truhe. Darin liegt immer etwas Einzigartiges."))
	_v.add_child(Ui.sub("Glücksspiel · %d Glut pro Wurf" % _gamble_cost()))
	_v.add_child(Ui.hint("Ein unbekannter Gegenstand deiner Stufe. Meist magisch, manchmal selten, ganz selten einzigartig."))
	var g := GridContainer.new()
	g.columns = 3
	g.add_theme_constant_override("h_separation", 4)
	g.add_theme_constant_override("v_separation", 4)
	for k in Items.SLOTNAME:
		var b := Ui.button(Items.SLOTNAME[k], _gamble.bind(k), 14)
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.custom_minimum_size = Vector2(0, 34)
		g.add_child(b)
	_v.add_child(g)
	_v.add_child(Ui.sub("Verkaufen"))
	_v.add_child(Ui.hint("Klicke im Inventar auf einen Gegenstand, um ihn zu verkaufen."))

## a line of the shop (.shoprow): what, the price in glut, Kaufen
func _row(text: String, col: Color, price: String, cb: Callable, off := false) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	row.mouse_filter = Control.MOUSE_FILTER_PASS
	var n := Ui.label(text, 15, col)
	n.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	n.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	n.mouse_filter = Control.MOUSE_FILTER_PASS
	row.add_child(n)
	var p := Ui.label(price, 15, Ui.EMBER, "sc")
	p.mouse_filter = Control.MOUSE_FILTER_PASS
	row.add_child(p)
	var b := Ui.button("Kaufen", cb, 14)
	b.custom_minimum_size = Vector2(76, 32)
	b.disabled = off
	row.add_child(b)
	return row
