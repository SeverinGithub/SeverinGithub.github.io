class_name Rng
extends RefCounted
## The browser game's seeded random (mulberry32 in 020-utils.js) with its helpers rnd, rint, pick and wpick.
## The same seed gives the same numbers as in the browser, so a floor is built from the same rolls.

var _a := 0

func _init(seed_value: int = 0) -> void:
	_a = seed_value & 0xFFFFFFFF

static func _imul(a: int, b: int) -> int:
	return (a * b) & 0xFFFFFFFF

func next() -> float:
	_a = (_a + 0x6D2B79F5) & 0xFFFFFFFF
	var t := _imul(_a ^ (_a >> 15), 1 | _a)
	t = ((t + _imul(t ^ (t >> 7), 61 | t)) & 0xFFFFFFFF) ^ t
	return float((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0

func rnd(a: float, b: float) -> float:
	return a + next() * (b - a)

func rint(a: int, b: int) -> int:
	return int(floor(a + next() * (b - a + 1)))

func pick(arr: Array):
	return arr[int(floor(next() * arr.size()))]

## weighted pick from [[value, weight], …]
func wpick(l: Array):
	var s := 0.0
	for x in l:
		s += float(x[1])
	var r := next() * s
	for x in l:
		r -= float(x[1])
		if r <= 0.0:
			return x[0]
	return l[0][0]

## a generator for unseeded rolls (Math.random in the browser)
static func unseeded() -> Rng:
	return Rng.new(randi())
