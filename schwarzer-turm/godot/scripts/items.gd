class_name Items
## Loot: making items as makeItem does in the browser (060-items.js), with the wrappers that change it there:
## the rarity of 570-loot-economy.js, the class re-roll of 870/970/992 (gear for another class is rolled once more),
## staff elements (470) and the implicit mods of class gear (650, 970, 991, 992, baked per base into item_rules.json).
## Also potions, junk, what an item is worth, and the inventory grid it is packed into (240-pixel-art.js).
## Sockets and runes come with the smithy step.

const IW := 10                   # inventory columns
const IH := 5                    # inventory rows
const RCOL := {"normal": Color("#ece4cf"), "magic": Color("#7aa4ff"), "rare": Color("#ffd94f"), "unique": Color("#e8973a"), "junk": Color("#9a9282"), "rune": Color("#f0b25a"), "runeword": Color("#cdbf94")}
const SLOTNAME := {"weapon": "Waffe", "offhand": "Schild", "helm": "Helm", "armor": "Rüstung", "gloves": "Handschuhe", "boots": "Stiefel", "belt": "Gürtel", "ring": "Ring", "amulet": "Amulett"}
const RARTXT := {"magic": "Magisch", "rare": "Selten", "unique": "Einzigartig", "runeword": "Runenwort"}

static var R := Rng.unseeded()

## rings and amulets drop once two guardians have fallen (jewelOK in 570)
static func jewel_ok() -> bool:
	return Game.boss_dead.values().count(true) >= 2

static func roll_rarity(ilvl: int, mf: float, boost: float) -> String:
	var f := 1 + mf / 100.0
	var x := R.next()
	var u := 0.0 if ilvl < 12 else (.0005 + boost * .01) * f
	var r := u + (0.0 if ilvl < 8 else (.005 + boost * .06) * f)
	var m := r + (.015 if ilvl < 3 else .07 + boost * .2) * minf(f, 2.5)
	return "unique" if x < u else ("rare" if x < r else ("magic" if x < m else "normal"))

## o: rarity, slot, mf, boost, keep_cls
static func make(ilvl: int, o := {}) -> Dictionary:
	var it := _make(ilvl, o)
	var rules: Dictionary = Data.item_rules
	if not o.get("keep_cls", false):
		if it.slot == "weapon" and not Game.cls in rules.wok.get(it.b, [Game.cls]) and R.next() < .55:
			it = _make(ilvl, o)
		var own = rules.owner.get(it.b)
		if own and own != Game.cls and R.next() < .55:
			it = _make(ilvl, o)
	var im: Dictionary = rules.implicit.get(it.b, {})
	for k in im:
		it.mods[k] = it.mods.get(k, 0) + int(im[k])
	if Data.items[it.b].get("mage") and it.slot == "offhand":
		it.block = 0
	if it.cls == "staff":
		it.elem = R.pick(rules.elements)
	return it

static func _make(ilvl: int, o: Dictionary) -> Dictionary:
	ilvl = maxi(1, ilvl)
	var rar: String = o.get("rarity", "")
	if rar == "":
		rar = roll_rarity(ilvl, o.get("mf", 0), o.get("boost", 0))
	var slot: String = o.get("slot", "")
	var uq = null
	var b: Dictionary
	if rar == "unique":
		var c := Data.uniques.filter(func(u): var s: String = Data.items[u.b].slot; return u.lvl <= ilvl + 3 and (slot == "" or s == slot) and (slot != "" or jewel_ok() or not s in ["ring", "amulet"]))
		if c.size():
			uq = R.pick(c)
		else:
			rar = "rare"
	if uq:
		b = Data.items[uq.b]
	else:
		if slot == "":
			var sw: Array = Data.loot.slotw
			slot = R.wpick(sw if jewel_ok() else sw.filter(func(s): return not s[0] in ["ring", "amulet"]))
		var cap := ilvl * .75 + 1
		var dragon: Array = Data.item_rules.dragon
		var c := Data.items.values().filter(func(x): return x.slot == slot and x.lvl <= cap and not x.n in dragon)
		c.sort_custom(func(a, z): return a.lvl < z.lvl)
		var win := c.filter(func(x): return x.lvl >= cap - 20)
		var pool := win if win.size() >= 3 else c
		var i := int(pow(R.next(), 2.2) * pool.size())
		b = pool[i] if i < pool.size() else c[0]
	var it := {"b": b.n, "slot": b.slot, "cls": b.get("cls", ""), "rar": rar, "ilvl": ilvl, "mods": {}, "req": {"lvl": int(b.lvl), "str": int(b.get("str", 0)), "dex": int(b.get("dex", 0))}}
	if b.has("dmg"):
		it.dmg = b.dmg.duplicate()
		it.speed = b.speed
		it.twoH = b.get("twoH", false)
	if b.has("def"):
		it.def = roundi(b.def * R.rnd(.9, 1.15))
	if b.has("block"):
		it.block = b.block
	if it.cls == "staff":
		it.mods.spell = 10 + int(b.lvl) * 2
	if uq:
		it.name = uq.n
		for k in uq.m:
			it.mods[k] = it.mods.get(k, 0) + uq.m[k]
		it.req.lvl = maxi(int(b.lvl), int(uq.lvl))
	elif rar == "magic" or rar == "rare":
		var code: String = Data.loot.slotcode[it.slot]
		var maxT := 0 if ilvl < 6 else (1 if ilvl < 14 else (2 if ilvl < 24 else 3))
		var n := R.rint(1, 2) if rar == "magic" else R.rint(3, 5)
		var maxP := 1 if rar == "magic" else 3
		var pool := Data.affixes.filter(func(a): return code in a.s and a.minT <= maxT)
		var used := {}
		var pre := 0
		var suf := 0
		var cnt := 0
		var pN := ""
		var sN := ""
		var g := 0
		while cnt < n and g < 60:
			g += 1
			var a: Dictionary = R.pick(pool)
			if used.has(a.k) or (a.p and pre >= maxP) or (not a.p and suf >= maxP):
				continue
			var tier := maxi(int(a.minT), R.rint(maxi(0, maxT - 1), maxT))
			var v := R.rint(int(a.r[tier][0]), int(a.r[tier][1]))
			it.mods[a.k] = it.mods.get(a.k, 0) + v
			used[a.k] = true
			if a.p:
				pre += 1
				pN = a.n[tier]
			else:
				suf += 1
				sN = a.n[tier]
			cnt += 1
		if rar == "magic":
			it.name = (pN + " " if pN else "") + b.n + (" " + sN if sN else "")
		else:
			it.name = R.pick(Data.palette.rare1) + R.pick(Data.palette.rare2[it.slot])
		it.req.lvl = maxi(int(b.lvl), int(ilvl * .7))
	else:
		it.name = b.n
	return it

static func potion(kind: String, f: int) -> Dictionary:
	return {"b": "potL" if kind == "life" else "potM", "slot": "potion", "cls": "potL" if kind == "life" else "potM", "kind": kind, "rar": "normal",
		"name": "Heiltrank" if kind == "life" else "Manatrank", "amt": 40 + maxi(0, f) * 14, "mods": {}, "req": {"lvl": 1, "str": 0, "dex": 0}}

static func junk(k: String, lv: int) -> Dictionary:
	var J: Dictionary = Data.loot.junk
	var j: Dictionary = J.get(k, J.holz)
	lv = maxi(1, lv)
	return {"b": "Junk:" + k, "jk": k, "slot": "junk", "cls": "junk", "rar": "junk", "name": j.n, "ilvl": lv, "v": maxi(1, roundi(j.v * (1 + lv * .06))), "n": 1, "mods": {}, "req": {"lvl": 1, "str": 0, "dex": 0}}

## what a foe of this kind carries: mostly its own family's junk (junkFor)
static func junk_for(e, lv: int) -> Dictionary:
	var F: Dictionary = Data.loot.jfam
	var f = F.get(e.type) if e else null
	return junk(R.pick(f if f and R.next() < .7 else F.x), lv)

static func value(it: Dictionary) -> int:
	if it.slot == "potion":
		return 4 * it.get("n", 1)
	if it.slot == "junk":
		return it.v * it.get("n", 1)
	return roundi((it.ilvl * 3 + 6) * {"normal": 1, "magic": 3, "rare": 7, "unique": 15, "runeword": 20}.get(it.rar, 1))

static func dmg(it: Dictionary) -> Array:
	var e: float = 1 + it.mods.get("ed", 0) / 100.0
	return [roundi(it.dmg[0] * e), roundi(it.dmg[1] * e)]

static func defense(it: Dictionary) -> int:
	return roundi(it.get("def", 0) * (1 + it.mods.get("edef", 0) / 100.0))

static func can_use(it: Dictionary) -> bool:
	return Game.lvl >= it.req.lvl and Game.d.s.str >= it.req.str and Game.d.s.dex >= it.req.dex

## the key of its pictures: a unique has its own, everything else its base's
static func pic_key(it: Dictionary) -> String:
	return "U:" + it.name if it.rar == "unique" else it.b

## cells it takes in the inventory (isz)
static func size(it: Dictionary) -> Vector2i:
	var s = Data.icons.get(pic_key(it), Data.icons.get(it.b, {})).get("size", [1, 1])
	return Vector2i(int(s[0]), int(s[1]))

static func icon(it: Dictionary) -> Texture2D:
	var i: Dictionary = Data.icons.get(pic_key(it), Data.icons.get(it.b, {}))
	return Data.tex("icons/" + i.file) if i.has("file") else null

static func ground_pic(it: Dictionary) -> Texture2D:
	var g: Dictionary = Data.ground.get(pic_key(it), Data.ground.get(it.b, {}))
	return Data.tex("ground/" + g.file) if g.has("file") else null

# ---------- the inventory grid ----------

static func inv_at(x: int, y: int, w: int, h: int, skip = null) -> Array:
	return Game.inv.filter(func(it): var s := size(it); return it != skip and x < it.gx + s.x and x + w > it.gx and y < it.gy + s.y and y + h > it.gy)

static func inv_fits(x: int, y: int, w: int, h: int) -> bool:
	return x >= 0 and y >= 0 and x + w <= IW and y + h <= IH and inv_at(x, y, w, h).is_empty()

## put it in the first free place, column by column; junk fills up stacks of its kind first (invAdd, 240 and 570)
static func inv_add(it: Dictionary) -> bool:
	if it.slot == "junk":
		var left: int = it.get("n", 1)
		var jmax: int = Data.loot.jmax
		for s in Game.inv:
			if left > 0 and s.slot == "junk" and s.jk == it.jk and s.n < jmax:
				var t := mini(jmax - s.n, left)
				s.v = roundi((s.v * s.n + it.v * t) / float(s.n + t))
				s.n += t
				left -= t
		if left == 0:
			return true
		it.n = left
	var sz := size(it)
	for x in IW - sz.x + 1:
		for y in IH - sz.y + 1:
			if inv_fits(x, y, sz.x, sz.y):
				it.gx = x
				it.gy = y
				Game.inv.append(it)
				return true
	return false

# ---------- the tooltip, as lines: [text, colour] (itemTipHTML in 260-ui.js) ----------

static func tip(it: Dictionary, act := "") -> Array:
	var L := []
	var grey := Color("#a39b88")
	var mod := Color("#7aa4ff")
	if it.slot == "potion":
		L.append([it.name, RCOL.normal])
		L.append(["Stellt %d %s wieder her" % [roundi(it.amt * (1 + Game.d.potPow / 100.0)), "Leben" if it.kind == "life" else "Mana"], grey])
		L.append([act if act else "Rechtsklick: trinken", grey])
		return L
	if it.slot == "junk":
		L.append([it.name, RCOL.junk])
		L.append(["Ramsch" + (" · Stapel: %d / %d" % [it.n, Data.loot.jmax] if it.n > 1 else ""), grey])
		L.append([Data.loot.junk[it.jk].d, grey])
		L.append(["Wert: %d Glut pro Stück" % it.v, grey])
		return L
	L.append([it.name, RCOL.get(it.rar, RCOL.normal)])
	if it.rar in ["rare", "unique", "runeword"]:
		L.append([it.b, RCOL[it.rar]])
	L.append([SLOTNAME.get(it.slot, it.slot) + (" · " + RARTXT[it.rar] if RARTXT.has(it.rar) else "") + (" · Zweihändig" if it.get("twoH") else ""), grey])
	if it.has("dmg"):
		var dd := dmg(it)
		L.append(["Schaden: %d–%d" % dd, mod if it.mods.has("ed") else RCOL.normal])
		L.append(["%.2f Angriffe/s" % it.speed, grey])
	if it.get("def"):
		L.append(["Verteidigung: %d" % defense(it), mod if it.mods.has("edef") else RCOL.normal])
	if it.get("block"):
		L.append(["Blockchance: %d%%" % it.block, RCOL.normal])
	var bad := Color("#ff5a4a")
	if it.req.lvl > 1:
		L.append(["Benötigt Stufe %d" % it.req.lvl, RCOL.normal if Game.lvl >= it.req.lvl else bad])
	if it.req.str:
		L.append(["Benötigt Stärke %d" % it.req.str, RCOL.normal if Game.d.s.str >= it.req.str else bad])
	if it.req.dex:
		L.append(["Benötigt Geschick %d" % it.req.dex, RCOL.normal if Game.d.s.dex >= it.req.dex else bad])
	for k in Data.mod_order:
		if it.mods.get(k) and k != "ed" and k != "edef":
			L.append([Data.mod_line(k, it.mods[k]), mod])
	for k in ["ed", "edef"]:
		if it.mods.get(k):
			L.append([Data.mod_line(k, it.mods[k]), mod])
	if it.has("elem"):
		L.append(["Element: " + {"fire": "Feuer", "frost": "Frost", "light": "Blitz", "poison": "Gift"}.get(it.elem, it.elem), mod])
	var own = Data.item_rules.owner.get(it.b)
	if own and it.slot != "weapon" and Data.classes.has(own):
		L.append(["Ausrüstung: " + Data.classes[own].n, grey])
	var cur = Game.eq.get("ring1" if it.slot == "ring" else it.slot)
	if act != "equipped" and cur and cur != it:
		var c := ""
		if it.has("dmg") and cur.has("dmg"):
			var a := dmg(it)
			var z := dmg(cur)
			var dps: float = (a[0] + a[1]) / 2.0 * it.speed - (z[0] + z[1]) / 2.0 * cur.speed
			c = "Schaden pro Sekunde %s%.1f gegenüber angelegt" % ["+" if dps >= 0 else "", dps]
		elif it.has("def") and cur.has("def"):
			var dd := defense(it) - defense(cur)
			c = "Verteidigung %s%d gegenüber angelegt" % ["+" if dd >= 0 else "", dd]
		if c:
			L.append([c, Color("#8fe36a") if "+" in c else bad])
	L.append(["Wert: %d Glut" % value(it), grey])
	if act and act != "equipped":
		L.append([act, grey])
	return L
