extends Node
## Sound (autoload): the ears of the game, as 120-audio.js, 150-music.js, 630-sounds-2.js, 680-sounds-3.js,
## 690-sounds-4.js, 800-voices.js and 830-boss-falls.js have them in the browser.
## Recordings are the browser's own mp3s (assets/audio/sfx/<name><n>.mp3, a random variant with a slight change of
## pitch each time); what the browser synthesised with WebAudio is rendered once by tools/godot-sounds.mjs
## (assets/audio/syn/s_<sfx>_<v>.wav and y_<syn>_<v>.wav, with the gain each was lifted by in data/sounds.json).
## Music draws from a playlist per area and hands over to another track at the end; a fight with a boss brings the boss
## list, a fallen boss a moment of silence. The web build leaves the music out of its package and fetches it from
## /schwarzer-turm/music/, where the browser version keeps the same files.

const MUSL := {"town": ["overworld1.mp3", "overworld2.mp3", "overworld3.mp3", "overworld4.mp3"],
	"dungeon": ["tower1.mp3", "tower2.mp3", "tower3.mp3"], "boss": ["boss1.mp3", "boss2.mp3"]}
const POOL := 40

var info := {}
var _streams := {}               # "sfx/sword3" → AudioStream
var _pool: Array[AudioStreamPlayer] = []
var _rr := 0
var clock := 0.0                 # seconds since start, running through pauses (G.t for the sound's own timers)

# music
var mus_key := ""                # "town", "dungeon", "boss", "still" (after a boss fell) or "" (title)
var _mus: AudioStreamPlayer = null
var _duck := 1.0                 # the music steps back while someone talks
var _fetching := {}

# voices
var _vo: AudioStreamPlayer
var _vo_k := ""
var _vo_last := {}

# the running sounds of 200, 630 and 680
var _step = null
var _heart = null
var _rain = null
var _th_t := 0.0
var _blitz_t := -9.0
var _reg_t := -9.0
var _seen := -1
var _rgs := -1
var _mf := -1
var _crit_t := -9.0
var _mov_t := -9.0
var _tl := 0
var _boss_off := 0.0
var _prev := ""
var _hold := 0.0
var _growl_t := 0.0
var _dT := {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	var f := FileAccess.open("res://data/sounds.json", FileAccess.READ)
	if f:
		info = JSON.parse_string(f.get_as_text())
	for b in ["Music", "Sfx", "Voice"]:
		if AudioServer.get_bus_index(b) < 0:
			AudioServer.add_bus()
			var i := AudioServer.bus_count - 1
			AudioServer.set_bus_name(i, b)
			AudioServer.set_bus_send(i, "Master")
	for i in POOL:
		var p := AudioStreamPlayer.new()
		p.bus = "Sfx"
		add_child(p)
		_pool.append(p)
	_vo = AudioStreamPlayer.new()
	_vo.bus = "Voice"
	add_child(_vo)
	apply_cfg()
	Game.banner.connect(_on_banner)
	Game.floor_changed.connect(_on_floor)

## the three sliders and "Alles stumm" (applyCfg)
func apply_cfg() -> void:
	var c: Dictionary = Game.cfg
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Music"), linear_to_db(maxf(.0001, c.music / 100.0 * .65)))
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Sfx"), linear_to_db(maxf(.0001, c.sfx / 100.0)))
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Voice"), linear_to_db(maxf(.0001, c.voice / 100.0)))
	AudioServer.set_bus_mute(0, bool(c.mute))

var log_snd := "--snd" in OS.get_cmdline_user_args()   # test: every sound into the console
var _hand = null
var _eq_t := -9.0

func _process(dt: float) -> void:
	clock += dt
	# whatever is taken into the hand or laid down clicks; putting something on buckles instead (690)
	if not is_same(Game.hand, _hand):
		_hand = Game.hand
		if clock - _eq_t > .05:
			sfx("pick")

## let go of every stream before the end, so nothing is left in use at exit
func _exit_tree() -> void:
	for p in get_children():
		if p is AudioStreamPlayer:
			p.stop()
			p.stream = null
	_mus = null
	_streams.clear()
	_step = null
	_heart = null
	_rain = null

func equipped() -> void:
	_eq_t = clock
	syn("equip")

# ---------- playing ----------

func _stream(k: String) -> AudioStream:
	if _streams.has(k):
		return _streams[k]
	var p := "res://assets/audio/%s.%s" % [k, "wav" if k.begins_with("syn/") else "mp3"]
	var s: AudioStream = load(p) if ResourceLoader.exists(p) else null
	_streams[k] = s
	return s

func _player() -> AudioStreamPlayer:
	for i in POOL:
		var p := _pool[(_rr + i) % POOL]
		if not p.playing:
			_rr = (_rr + i + 1) % POOL
			return p
	# all busy: the oldest gives way
	var p := _pool[_rr]
	_rr = (_rr + 1) % POOL
	return p

func _play(s: AudioStream, vol: float, rate: float, loop := false) -> AudioStreamPlayer:
	if s == null:
		return null
	if log_snd:
		print("♪ %.2f %s %.2f%s" % [clock, s.resource_path.get_file(), vol, " loop" if loop else ""])
	if loop:
		s = s.duplicate()
		if s is AudioStreamMP3:
			s.loop = true
	var p := _player()
	for c in p.get_meta("tw", []):
		if c and c.is_valid():
			c.kill()
	p.set_meta("tw", [])
	p.stream = s
	p.pitch_scale = clampf(rate, .1, 4)
	p.volume_db = linear_to_db(maxf(.0001, vol))
	p.set_meta("lin", vol)
	p.play()
	return p

## a recording: sample('sword', .55, {rate, loop, cut}); null when there is none (the caller falls back to sfx)
func sample(k: String, vol := .7, o := {}) -> AudioStreamPlayer:
	var n: int = info.get("sfx", {}).get(k, 0)
	if n <= 0:
		return null
	if k == "potion":                # every drink sounds louder (690)
		vol = minf(2, vol * 2.2)
	var p := _play(_stream("sfx/%s%d" % [k, randi_range(1, n)]), vol, o.get("rate", randf_range(.93, 1.07)), o.get("loop", false))
	if p and o.has("cut"):
		var cut: float = o.cut
		var tw := create_tween()
		tw.tween_interval(maxf(0, cut - .35))
		tw.tween_method(func(v): p.volume_db = linear_to_db(maxf(.0001, v)), vol, 0.0, minf(.35, cut))
		tw.tween_callback(p.stop)
		p.set_meta("tw", [tw])
	return p

func stop_loop(h, ms := 250.0):
	if h == null or not is_instance_valid(h):
		return null
	var p: AudioStreamPlayer = h
	var tw := create_tween()
	tw.tween_method(func(v): p.volume_db = linear_to_db(maxf(.0001, v)), float(p.get_meta("lin", .5)), 0.0, ms / 1000.0)
	tw.tween_callback(p.stop)
	p.set_meta("tw", [tw])
	return null

func _set_vol(p: AudioStreamPlayer, v: float) -> void:
	p.set_meta("lin", v)
	p.volume_db = linear_to_db(maxf(.0001, v))

func _syn_play(k: String, vol := 1.0, rate := 1.0) -> bool:
	var d: Dictionary = info.get("syn", {}).get(k, {})
	if d.is_empty():
		return false
	return _play(_stream("syn/%s_%d" % [k, randi() % int(d.n)]), float(d.g) * vol, rate) != null

## the old synthesised sounds of 120 (hit, swing, hurt, cast, boom, pick, gold, lvl, roll, unique, zap, draw, twang, bolt, death),
## with what 630 put in front: lightning sounds as lightning, a roll as the dash
func sfx(type: String) -> void:
	if type == "roll" and sample("dash", .6):
		return
	_syn_play("s_" + type)

## the voices of 690 (thud, quake, whoosh, spin, twang, volley, bones, clang, bubble, snap, equip, ghoul, cult, wraith, golem, dragon)
func syn(k: String, del := 0.0) -> void:
	if del > 0:
		get_tree().create_timer(del, true, false, true).timeout.connect(func(): _syn_play("y_" + k))
	else:
		_syn_play("y_" + k)

## a rendered voice at a share of its loudness (the forge in the world, heard from afar)
func syn_v(k: String, v: float) -> void:
	_syn_play("y_" + k, v)

## sword blows in a row, each from the sword recordings at its own pitch
func blades(n: int, gap := 110.0, vol := .5) -> void:
	for k in n:
		if k == 0:
			sample("sword", vol, {"rate": randf_range(.88, 1.14)})
		else:
			get_tree().create_timer(k * gap / 1000.0, false).timeout.connect(func(): sample("sword", vol, {"rate": randf_range(.88, 1.14)}))

func blitz() -> bool:
	if clock - _blitz_t < .35:
		return false
	var h := sample("blitz", .55)
	if h:
		_blitz_t = clock
	return h != null

func anvil() -> void:
	if not sample("anvil", .9, {"rate": randf_range(.97, 1.03)}):
		sfx("hit")

## a pick-up by its rarity (680)
func pick(it: Dictionary) -> void:
	var r: String = it.get("rar", "normal")
	sample("picku" if r in ["unique", "runeword", "set"] else "pickr" if r == "rare" else "pickn", .7, {"rate": 1.0})

## monsters growl when they notice you, never more than one voice at a time (voice(e) in 120)
func growl(e, ch := 1.0) -> void:
	if randf() > ch or clock < _growl_t:
		return
	var h = null
	if e.type == "skel" or e.type == "archer":
		h = sample("skel", .5, {"rate": randf_range(.85, 1.1) * (.85 if e.scale_f > 1.1 else 1.0)})
	elif e.type == "ghoul":
		h = sample("zombie", .45, {"cut": 2.2, "rate": randf_range(.9, 1.1)})
	if h:
		_growl_t = clock + .6

## every kind of foe dies with its own voice; many at once are thinned out (deathSnd in 690)
func death(e) -> void:
	if e == null or e.boss or e.wall or e.obj != "":
		return
	var ty: String = e.type
	var big: bool = ty == "spider" and (e.elem == "poison" or e.scale_f >= 1.5 or e.rank == "champ" or e.rank == "unique")
	var k := ""
	if ty == "spider":
		k = "spiderbig" if big else "spiderdie"
	elif ty == "scorp":
		k = "scorpdie"
	elif ty == "skel" or ty == "archer":
		k = "skeldie"
	elif info.get("syn", {}).has("y_" + ty):
		k = ty
	if k == "" or clock - float(_dT.get(k, -9.0)) < .12:
		return
	_dT[k] = clock
	var v := .55 if e.rank == "normal" else .7
	if info.sfx.has(k):
		var o := {"rate": randf_range(.92, 1.08) * (.88 if e.scale_f > 1.4 else 1.0)}
		if k != "skeldie":
			o.cut = 2.4
		sample(k, v, o)
	else:
		syn(k)

## a person speaks: the same one does not start over, someone else cuts in; the music steps back meanwhile (800)
func voice(k: String) -> void:
	var n: int = info.get("sfx", {}).get(k, 0)
	if n <= 0:
		return
	if _vo.playing and _vo_k == k:
		return
	var i := randi() % n
	if n > 1 and i == _vo_last.get(k, -1):
		i = (i + 1 + randi() % (n - 1)) % n
	_vo_last[k] = i
	_vo_k = k
	_vo.stream = _stream("sfx/%s%d" % [k, i + 1])
	_vo.play()
	_duck_to(.35, .3)
	if not _vo.finished.is_connected(_vo_done):
		_vo.finished.connect(_vo_done)

func _vo_done() -> void:
	_duck_to(1.0, .9)

func _duck_to(v: float, sec: float) -> void:
	_duck = v
	if _mus:
		_fade(_mus, v, sec)

# ---------- music ----------

func _fade(p: AudioStreamPlayer, to: float, sec: float, done := Callable()) -> void:
	for c in p.get_meta("tw", []):
		if c and c.is_valid():
			c.kill()
	var tw := create_tween()
	tw.tween_method(func(v): _set_vol(p, v), float(p.get_meta("lin", 0.0)), to, sec)
	if done.is_valid():
		tw.tween_callback(done)
	p.set_meta("tw", [tw])

## one track per area from its list, cross-faded (playMusic in 630); "" is silence
func music(key: String) -> void:
	if key == mus_key:
		return
	mus_key = key
	if _mus:
		var old := _mus
		_mus = null
		_fade(old, 0, 1.5, func(): old.stop(); old.queue_free())
	if MUSL.has(key):
		_track(key, "")

func _track(key: String, prev: String) -> void:
	if mus_key != key:
		return
	var L: Array = MUSL[key]
	var o := L.filter(func(s): return s != prev)
	var f: String = (o if o.size() else L).pick_random()
	var s := _music_stream(f, func(): _track(key, prev))
	if s == null:
		return
	if log_snd:
		print("♪ Musik ", key, " ", f)
	var p := AudioStreamPlayer.new()
	p.bus = "Music"
	p.stream = s
	p.set_meta("lin", 0.0)
	p.volume_db = -80
	add_child(p)
	_mus = p
	p.finished.connect(func():
		if _mus == p:
			_mus = null
			p.queue_free()
			_track(key, f))
	p.play()
	_fade(p, _duck, 2.0)

## the track from the package, or on the web from the browser version's music folder (fetched once, then kept)
func _music_stream(f: String, then: Callable) -> AudioStream:
	var k := "music/" + f.get_basename()
	var s := _stream(k)
	if s:
		return s
	if not OS.has_feature("web") or _fetching.has(f):
		return null
	_fetching[f] = true
	var rq := HTTPRequest.new()
	add_child(rq)
	rq.request_completed.connect(func(res, code, _h, body):
		rq.queue_free()
		if res == HTTPRequest.RESULT_SUCCESS and code == 200:
			var m := AudioStreamMP3.new()
			m.data = body
			_streams[k] = m
			then.call())
	var url := str(JavaScriptBridge.eval("new URL('../music/%s', location.href).href" % f))
	rq.request(url)
	return null

func _on_floor(f: int) -> void:
	if not Game.in_play:
		return
	_hold = 0
	_prev = ""
	music("town" if f == 0 else "dungeon")
	sample("portal", .6, {"rate": 1.0})

func _on_banner(big: String, small: String, _k: String) -> void:
	if big == "QUEST ERFÜLLT":
		sample("quest", .75, {"rate": 1.0})
	elif big == "FEIND BEZWUNGEN":
		boss_fell()
	elif small == "erhebt sich in Raserei":
		sample("bossscr", .8, {"rate": .92})

## a guardian falls: the music stops dead, the fall rings out, then a moment of silence (830)
func boss_fell() -> void:
	if _mus:
		_mus.stop()
		_mus.queue_free()
		_mus = null
	mus_key = "still"
	var n: int = info.sfx.get("bossdown", 0)
	var dur := 3.0
	if n > 0:
		var s := _stream("sfx/bossdown1")
		if s:
			dur = s.get_length()
	_hold = clock + .15 + dur + 2.5
	get_tree().create_timer(.15).timeout.connect(func(): sample("bossdown", .85, {"rate": 1.0}))

# ---------- every frame, while a hero plays ----------

func tick(L, dt: float) -> void:
	if not Game.in_play or L.title_cam != null:
		music("")
		_step = stop_loop(_step, 120)
		_heart = stop_loop(_heart, 300)
		_rain = stop_loop(_rain, 600)
		_seen = -1
		return
	var P: Dictionary = L.P
	# steps while walking, the heart below 30 % life (200)
	var walk: bool = P.moving and not P.roll and not P.dead
	if walk and _step == null:
		_step = sample("step", .32, {"loop": true, "rate": 1.0})
	elif not walk and _step:
		_step = stop_loop(_step, 120)
	var low: bool = not P.dead and Game.hp < Game.d.life * .3
	if low and _heart == null:
		_heart = sample("heart", .65, {"loop": true, "rate": 1.0})
	elif not low and _heart:
		_heart = stop_loop(_heart, 600)
	# a new place: an island, a part of the dead lands, a floor never reached (630)
	var s: int = Game.ow_seen.size()
	var r: int = Game.rg.get("seen", {}).size()
	if _seen >= 0 and (s > _seen or r > _rgs or Game.max_floor > _mf) and clock - _reg_t > 6:
		_reg_t = clock
		sample("region", .7, {"rate": 1.0})
	_seen = s
	_rgs = r
	_mf = Game.max_floor
	_rain_tick(L, dt)
	_boss_tick(L, dt)

## rain: a recorded loop that swells and fades with the weather; thunder (the quake voice, the browser had no recording)
## every one to four minutes in heavy rain, with the flash Weather draws
func _rain_tick(L, dt: float) -> void:
	var w: Dictionary = Game.wx
	var on: bool = L.ow != null and w.k == "rain" and w.i > 0 and not Game.cfg.mute
	if on and _rain == null:
		_rain = sample("rain", .0001, {"loop": true, "rate": 1.0})
		_th_t = randf_range(60, 240)
	if _rain:
		if not on:
			_rain = stop_loop(_rain, 1200)
			return
		_set_vol(_rain, lerpf(float(_rain.get_meta("lin", 0.0)), .55 * w.i, minf(1, dt * 2.5)))

## thunder now (Weather calls it with its own flash)
func thunder() -> void:
	syn("quake")

func _boss_tick(L, dt: float) -> void:
	var P: Dictionary = L.P
	var pp := Vector2(P.x, P.y)
	var fight := false
	for e in L.enemies:
		if not e.boss or e.dead:
			continue
		var d: float = e.world.distance_to(pp)
		if e.aggro and d < 16:
			fight = true
		if not e.has_meta("scr") and e.aggro and d < 14:
			e.set_meta("scr", 1)
			sample("bossscr", .85, {"rate": 1.0})
	# a boss winding up a big move roars now and then
	var n: int = L.tele.size()
	if n > _tl and clock - _mov_t > 6:
		for i in range(_tl, n):
			var o = L.tele[i].get("owner")
			if o is Enemy and o.boss and not o.dead:
				_mov_t = clock
				sample("bossscr2", .5, {"rate": randf_range(.95, 1.05)})
				break
	_tl = n
	if clock < _hold:
		return
	var home := "town" if Game.floor_no == 0 else "dungeon"
	if mus_key == "still" or mus_key == "":
		_prev = ""
		music(home)
	if fight and not P.dead:
		_boss_off = 0
		if mus_key != "boss":
			_prev = mus_key
			music("boss")
	elif mus_key == "boss":
		_boss_off += dt
		if _boss_off > 3:
			music(_prev if _prev != "" and _prev != "boss" and _prev != "still" else home)

## a critical hit on a boss (680)
func boss_crit(e, dmg: float, crit: bool) -> void:
	if e.boss and not e.dead and crit and dmg > 0 and clock - _crit_t > .3:
		_crit_t = clock
		sample("bosscrit", .6)

# ---------- skills (castSkill with the wrappers of 630, 690 and the sounds inside 040, 470, 640, 900) ----------

## blade and weapon skills: their own sound instead of the spell chime (SKSND in 690)
func _sk_own(id: String) -> bool:
	match id:
		"whirl": blades(4, 95)
		"venom": blades(1); syn("bubble", .08)
		"leap": blades(2, 260)
		"charge": syn("whoosh")
		"d_flurry": blades(1)
		"d_dash": syn("whoosh"); blades(2, 130)
		"d_cross": blades(1, 0, .4)
		"d_fan": blades(3, 70)
		"d_dance": blades(3, 190, .45)
		"d_exec": blades(3, 150, .55)
		"g_cleave": blades(1, 0, .35)
		"g_lunge": syn("whoosh"); blades(1)
		"g_spin": syn("spin"); blades(1)
		"g_judg": blades(2, 240); syn("quake", .35)
		"g_parry": blades(1); syn("clang", .05)
		"h_smash": syn("thud", .08)
		"h_titan": syn("quake", .12)
		"h_leap": syn("whoosh"); syn("quake", .45)
		"h_throw": syn("spin")
		"h_quake": syn("thud")
		"h_storm": syn("thud", .05)
		"sp_throw", "sp_vault": syn("whoosh")
		"sp_wall": syn("clang")
		"sp_rain", "rain": syn("volley")
		"sp_sweep": syn("spin")
		"pierce": syn("twang")
		"ward": syn("bones")
		"trap": syn("snap")
		_: return false
	return true

## what a skill sounds like once it has really fired: the sound inside it, the spell chime unless it has its own,
## lightning as lightning, else slots 2, 3 and 6 with their own voice
func cast(id: String, slot: int, el) -> void:
	var rate: float = {"fire": 1.0, "frost": 1.5, "light": 2.0}.get(el, .8)
	match id:
		"slam", "cry", "schwur", "m_fuse", "g_quake": sfx("boom")
		"atem": sfx("lvl")
		"m_bolt": sample("fire", .4, {"rate": rate})
		"m_ring": sample("fire", .5, {"rate": {"fire": .7, "frost": 1.3, "light": 1.8}.get(el, .6)}); sfx("zap" if el == "light" else "cast")
		"m_jump": sfx("zap")
		"dash": sfx("roll")
		"multi": sample("fire", .25, {"rate": 1.6})
		"a_fire", "a_frost", "a_plague": sfx("swing")
		"a_heal": sample("potion", .7)
	var own := _sk_own(id)
	if not own:
		sfx("cast")
	if id.begins_with("m_") and el == "light":
		blitz()
	elif id != "charge":
		var s = {1: ["sktwo", .6], 2: ["skthree", .6], 5: ["sksix", .55]}.get(slot)
		if s:
			sample(s[0], s[1], {"rate": 1.0})
