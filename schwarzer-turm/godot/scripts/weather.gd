class_name Weather
## The weather over the islands (370-living-world.js, the climate of 986-island-sights.js, the thunder of 630-sounds-2.js):
## clear skies most of the time, now and then rain, ash rain or fog, and more fog at night. It comes and goes slowly
## (Game.wx.i rises over eight seconds and fades over six). Some reaches of the sky have their own climate: rain moors,
## snowfields and ash plains, five chunks wide, choose the weather there. Rain darkens the world and falls in streaks,
## ash drifts down with a few embers, fog rolls by in soft banks, snow whirls; in heavy rain lightning flashes now and then.
## The wind follows the weather (LivingIsles), the grass leans harder in rain and ash, puddles fill in the rain.
## Rain and thunder sound through Sound (the rain loop follows Game.wx there).

const WXN := {"clear": "", "rain": "Regen", "ash": "Ascheregen", "fog": "Nebel", "snow": "Schneetreiben"}
const CLIM := {
	"regen": {"n": "Regenmoor", "k": ["rain", "rain", "fog", "clear"]},
	"schnee": {"n": "Schneefelder", "k": ["snow", "snow", "fog", "clear"]},
	"asche": {"n": "Aschenebene", "k": ["ash", "ash", "clear"]},
}

static var R := Rng.unseeded()
static var flash := 0.0          # the lightning's white, 1 at the strike (SND.flash)
static var th_t := 120.0         # the next thunder in heavy rain

## the climate of the reach the hero stands in (climAt): none on and around the hill
static func clim_at(wg: WorldGen, x: float, y: float):
	var cx := int(floor(x / WorldGen.CH))
	var cy := int(floor(y / WorldGen.CH))
	if absi(cx - 40) <= 2 and absf(cy - 39.5) <= 2:
		return null
	var h := wg.hsh(int(floor(cx / 5.0)), int(floor(cy / 5.0)), 140)
	return "regen" if h < .18 else ("schnee" if h < .32 else ("asche" if h < .42 else null))

## the weather's kind once it is really there, else "clear"
static func now() -> String:
	var w: Dictionary = Game.wx
	return w.k if Game.floor_no == 0 and w.i > .3 else "clear"

## how strong a kind is right now, 0–1
static func of(k: String) -> float:
	var w: Dictionary = Game.wx
	return w.i if Game.floor_no == 0 and w.k == k else 0.0

## one step of the weather (updWorld, with the climate wrapper of 986)
static func tick(L: Level, dt: float) -> void:
	var w: Dictionary = Game.wx
	var t0: float = w.t
	w.t -= dt
	if w.t <= 0:
		var ks := ["clear", "clear", "clear", "rain", "rain", "ash", "fog", "fog"]
		if Game.night:
			ks.append("fog")
		w.k = R.pick(ks.filter(func(k): return k != w.k or k == "clear"))
		w.t = R.rnd(90, 210)
		if w.k != "clear":
			Game.log_msg(WXN[w.k] + " zieht auf.", Color("#8a9ab0"))
	w.i = clampf(w.i + (dt / 8 if w.t > 6 and w.k != "clear" else -dt / 6), 0, 1)
	# the climate of the reach: entering it says so and brings its weather soon; when the weather turns, it decides
	var c = clim_at(L.ow.wg, L.P.x, L.P.y)
	if c != Game.clim:
		Game.clim = c
		if c != null:
			Game.log_msg("Du betrittst " + ("das " if c == "regen" else "die ") + CLIM[c].n + ".", Color("#a8b8c8"))
			if not w.k in CLIM[c].k:
				w.t = minf(w.t, 3)
	if c != null and w.t > t0 + 1:
		var was: String = w.k
		w.k = R.pick(CLIM[c].k)
		if w.k != was and w.k != "clear":
			Game.log_msg(WXN[w.k] + " zieht auf.", Color("#8a9ab0"))
	# lightning in heavy rain, and the thunder with it (rainTick in 630)
	if w.k == "rain" and w.i > .5:
		th_t -= dt
		if th_t <= 0:
			th_t = R.rnd(60, 240)
			Sound.thunder()
			flash = 1.0
			L.shake = maxf(L.shake, 2)
	flash = maxf(0, flash - dt * 2.2)

## the HUD's words for it, when it is strong enough to see
static func label() -> String:
	var w: Dictionary = Game.wx
	return WXN[w.k] if w.i > .3 and w.k != "clear" else ""

## painted over the world in screen space, after the glows and before the palette (drawWeather with 986's snow and 630's flash)
class Veil extends Control:
	var drops: Array = []
	var flakes: Array = []
	var R := Rng.unseeded()

	func _init() -> void:
		set_anchors_preset(Control.PRESET_FULL_RECT)
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func _process(_dt: float) -> void:
		queue_redraw()

	func _draw() -> void:
		var dt := minf(.05, get_process_delta_time())
		var vs := get_viewport_rect().size
		var W := vs.x
		var H := vs.y
		var w: Dictionary = Game.wx
		if Game.floor_no != 0 or w.i <= 0:
			drops.clear()
			flakes.clear()
		else:
			var I: float = w.i
			var t := Game.t
			match w.k:
				"rain":
					flakes.clear()
					draw_rect(Rect2(0, 0, W, H), Color(18 / 255.0, 26 / 255.0, 40 / 255.0, .2 * I))
					var want := roundi(170 * I)
					while drops.size() < want:
						drops.append({"x": R.rnd(-40, W + 40), "y": R.rnd(-H, H), "s": R.rnd(380, 520), "l": R.rnd(7, 13)})
					drops.resize(mini(drops.size(), want))
					var lines := PackedVector2Array()
					for d in drops:
						d.y += d.s * dt
						d.x -= d.s * dt * .22
						if d.y > H + 10:
							if R.next() < .3:
								draw_rect(Rect2(d.x, H * R.rnd(.2, 1), 2, 1), Color(190 / 255.0, 210 / 255.0, 240 / 255.0, .35))
							d.y = R.rnd(-60, -5)
							d.x = R.rnd(-20, W + 80)
						lines.append(Vector2(d.x, d.y))
						lines.append(Vector2(d.x + d.l * .22, d.y - d.l))
					if lines.size():
						draw_multiline(lines, Color(170 / 255.0, 195 / 255.0, 230 / 255.0, .38), 1)
					# little rings where drops strike
					for k in int(6 * I):
						var c := Vector2(R.rnd(0, W), R.rnd(H * .15, H))
						draw_set_transform(c, 0, Vector2(1, .4))
						draw_arc(Vector2.ZERO, 2.5, 0, TAU, 10, Color(190 / 255.0, 210 / 255.0, 240 / 255.0, .3), 1)
						draw_set_transform(Vector2.ZERO)
				"ash":
					flakes.clear()
					draw_rect(Rect2(0, 0, W, H), Color(50 / 255.0, 22 / 255.0, 12 / 255.0, .16 * I))
					var want := roundi(120 * I)
					while drops.size() < want:
						drops.append({"x": R.rnd(0, W), "y": R.rnd(-H, H), "s": R.rnd(14, 34), "ph": R.rnd(0, 7), "e": R.next() < .25})
					drops.resize(mini(drops.size(), want))
					for d in drops:
						d.y += d.s * dt
						d.x += sin(t * 1.3 + d.ph) * 12 * dt - 6 * dt
						if d.y > H + 4:
							d.y = -4.0
							d.x = R.rnd(0, W)
						if d.get("e"):
							draw_rect(Rect2(d.x, d.y, 1.4, 1.4), Color(1, (130 + sin(t * 6 + d.ph) * 60) / 255.0, 40 / 255.0, .8))
						else:
							draw_rect(Rect2(d.x, d.y, 2, 1.4), Color(150 / 255.0, 140 / 255.0, 130 / 255.0, .55))
				"fog":
					drops.clear()
					flakes.clear()
					draw_rect(Rect2(0, 0, W, H), Color(150 / 255.0, 158 / 255.0, 170 / 255.0, .12 * I))
					for k in 7:
						var x := fposmod(t * (8 + k * 2) + k * 233, W + 500) - 250
						var y := H * (.12 + k * .13)
						var r := 150.0 + k * 20
						# a soft bank, three times as wide as it is high (the radial gradient scaled 1.8 × .6)
						draw_set_transform(Vector2(x, y), 0, Vector2(1.8, .6))
						for q in 6:
							var f := 1.0 - q / 6.0
							draw_circle(Vector2.ZERO, r * f, Color(205 / 255.0, 210 / 255.0, 220 / 255.0, .16 * I * .2))
						draw_set_transform(Vector2.ZERO)
				"snow":
					drops.clear()
					draw_rect(Rect2(0, 0, W, H), Color(200 / 255.0, 215 / 255.0, 235 / 255.0, .1 * I))
					var want := roundi(130 * I)
					while flakes.size() < want:
						flakes.append({"x": R.rnd(0, W), "y": R.rnd(-H, H), "s": R.rnd(26, 60), "ph": R.rnd(0, 7), "z": R.rnd(1.6, 3.2)})
					flakes.resize(mini(flakes.size(), want))
					for d in flakes:
						d.y += d.s * dt
						d.x += sin(t * 1.1 + d.ph) * 16 * dt - 10 * dt
						if d.y > H + 4:
							d.y = -4.0
							d.x = R.rnd(0, W + 60)
						if d.x < -8:
							d.x += W + 16
						draw_rect(Rect2(d.x, d.y, d.z, d.z), Color(240 / 255.0, 246 / 255.0, 1, .85))
				_:
					drops.clear()
					flakes.clear()
		# the lightning: a hard white, a dark gap, a second flash, then it fades
		var f := Weather.flash
		if f > 0 and Game.floor_no == 0:
			var a := .55 if f > .8 else (.08 if f > .6 else (.4 if f > .45 else f * .2))
			draw_rect(Rect2(0, 0, W, H), Color(225 / 255.0, 235 / 255.0, 1, a))
