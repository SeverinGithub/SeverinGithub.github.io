#!/usr/bin/env python3
"""Packt die Higher-Place-One-Shots in komprimierte Sprites (eine m4a pro Gruppe) plus manifest.json.
Aufruf: build_sprites.py <library-ordner> <ausgabe-ordner>"""
import sys, os, re, json, subprocess, wave, array, tempfile

LIB, OUT = sys.argv[1], sys.argv[2]
SR = 32000
GAP = 0.2
os.makedirs(OUT, exist_ok=True)
tmp = tempfile.mkdtemp()

KEYRE = re.compile(r"^[A-G][#b]?(m|m7|m9|7|9|maj7)?$")
TAGS = {"ds", "ps", "mnrk"}

def song_of(stem):
    toks = stem.split()[1:]
    key = None
    if toks and KEYRE.match(toks[0]):
        key = toks.pop(0)
    toks = [t for t in toks if not t.isdigit() and t.lower() not in TAGS]
    song = toks[0] if toks else ""
    return re.sub(r"[^a-z0-9]", "", song.lower()), (toks[0] if toks else ""), key

# Gruppe -> (Liste von Dateien, Maximallänge in s)
groups = {}
def add(group, path, maxlen):
    groups.setdefault(group, {"files": [], "max": maxlen})["files"].append(path)

D = os.path.join(LIB, "Drums")
for f in sorted(os.listdir(os.path.join(D, "Kick"))): add("kick", os.path.join(D, "Kick", f), 0.9)
for f in sorted(os.listdir(os.path.join(D, "Snare"))):
    add("perc" if f.startswith("Rimshot") else "snare", os.path.join(D, "Snare", f), 0.8)
for f in sorted(os.listdir(os.path.join(D, "Clap"))): add("clap", os.path.join(D, "Clap", f), 0.8)
for f in sorted(os.listdir(os.path.join(D, "HiHat"))):
    add("open" if f.startswith("OpenHH") else "hat", os.path.join(D, "HiHat", f), 1.0 if f.startswith("OpenHH") else 0.45)
for f in sorted(os.listdir(os.path.join(D, "Percussion"))): add("perc", os.path.join(D, "Percussion", f), 0.8)
for f in sorted(os.listdir(os.path.join(D, "Tom"))): add("perc", os.path.join(D, "Tom", f), 0.8)
for f in sorted(os.listdir(os.path.join(D, "Cymbal"))): add("cymbal", os.path.join(D, "Cymbal", f), 2.5)

O = os.path.join(LIB, "One Shots")
OS_GROUPS = {"Synth Misc": "chords", "Synth Pad": "pads", "Bass": "bass", "Vocal": "vocals", "Sound Effects": "fx",
             "Organ": "keys", "Mallet": "keys", "Guitar": "keys", "Synth Lead": "keys", "Brass": "brass", "Bowed Strings": "strings"}
for folder, g in OS_GROUPS.items():
    for f in sorted(os.listdir(os.path.join(O, folder))):
        add(g, os.path.join(O, folder, f), 1.6 if g == "bass" else 3.0)

manifest = {"sampleRate": SR, "groups": {}}
total = 0
for g, info in groups.items():
    pcm = array.array("h")
    entries = []
    for path in info["files"]:
        if not path.lower().endswith(".wav"):
            continue
        t = os.path.join(tmp, "x.wav")
        subprocess.run(["afconvert", "-f", "WAVE", "-d", f"LEI16@{SR}", "-c", "1", "--mix", path, t], check=True)
        with wave.open(t) as w:
            a = array.array("h", w.readframes(w.getnframes()))
        if not a:
            continue
        peak = max(abs(x) for x in a) or 1
        thr = peak * 0.02
        s = next((i for i, x in enumerate(a) if abs(x) > thr), 0)
        s = max(0, s - int(SR * 0.001))
        n = min(len(a) - s, int(SR * info["max"]))
        seg = a[s:s + n]
        # Ausblenden am Ende, wenn gekürzt
        fade = min(n, int(SR * (0.03 if info["max"] < 1 else 0.25)))
        gain = 0.89 * 32767 / peak
        out = array.array("h", (int(max(-32767, min(32767, x * gain * (1 if i < n - fade else (n - i) / fade)))) for i, x in enumerate(seg)))
        stem = os.path.splitext(os.path.basename(path))[0]
        song, songname, key = song_of(stem)
        entries.append({"name": stem, "song": song, "songName": songname, "key": key,
                         "start": round(len(pcm) / SR, 5), "dur": round(n / SR, 5)})
        pcm.extend(out)
        pcm.extend(array.array("h", bytes(2 * int(SR * GAP))))
    wpath = os.path.join(tmp, g + ".wav")
    with wave.open(wpath, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    mpath = os.path.join(OUT, g + ".m4a")
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", wpath, mpath], check=True)
    size = os.path.getsize(mpath); total += size
    manifest["groups"][g] = {"file": g + ".m4a", "entries": entries}
    print(f"{g:8s} {len(entries):4d} Samples  {len(pcm)/SR:7.1f} s  {size/1e6:5.2f} MB")

with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
print(f"gesamt {total/1e6:.2f} MB")
