shader_type canvas_item;
// The liquid in a life or mana orb (paintOrb in 010-palette.js): a 52×52 pixel picture, dark glass behind, the
// liquid up to its level with a wave on top and a glow from the lower left, a few bubbles rising, a highlight,
// then dithered with a 4×4 Bayer matrix and stepped down like the browser's palette.

uniform float frac = 1.0;
uniform float t = 0.0;
uniform vec4 c0 : source_color = vec4(0.125, 0.0, 0.0, 1.0);
uniform vec4 c1 : source_color = vec4(0.478, 0.039, 0.024, 1.0);
uniform vec4 c2 : source_color = vec4(0.769, 0.165, 0.110, 1.0);
uniform vec4 c3 : source_color = vec4(1.0, 0.541, 0.416, 1.0);

float bayer(vec2 p) {
	int x = int(mod(p.x, 4.0));
	int y = int(mod(p.y, 4.0));
	int m[16] = int[](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
	return float(m[y * 4 + x]) / 16.0 - 0.5;
}

float wave(float x, float lv) {
	return lv + sin(x * 0.24 + t * 2.6) * 1.1 + sin(x * 0.5 - t * 1.7) * 0.5;
}

void fragment() {
	vec2 p = floor(UV * 52.0) + 0.5;
	if (distance(p, vec2(26.0)) > 26.0) {
		COLOR = vec4(0.0);
	} else {
		// dark glass
		float g = clamp((distance(p, vec2(20.0, 18.0)) - 2.0) / 28.0, 0.0, 1.0);
		vec3 col = mix(vec3(0.110, 0.086, 0.063), vec3(0.008, 0.004, 0.004), g);
		float f = clamp(frac, 0.0, 1.0);
		float lv = 52.0 - f * 52.0;
		if (f > 0.0) {
			float w = wave(p.x, lv);
			if (p.y >= w) {
				vec2 o = vec2(17.0, max(14.0, lv + 6.0));
				float q = clamp(distance(p, o) / 36.0, 0.0, 1.0);
				vec3 l = q < 0.28 ? mix(c3.rgb, c2.rgb, q / 0.28) : q < 0.7 ? mix(c2.rgb, c1.rgb, (q - 0.28) / 0.42) : mix(c1.rgb, c0.rgb, (q - 0.7) / 0.3);
				col = l;
				if (p.y < w + 1.0) col = mix(col, c3.rgb, 0.55);
				// bubbles
				float h = 52.0 - lv;
				if (h >= 4.0) {
					for (int k = 0; k < 5; k++) {
						float fk = float(k);
						float bx = floor(mod(fk * 11.0 + 7.0 + sin(t + fk) * 3.0, 48.0) + 2.0);
						float by = floor(52.0 - mod(t * 9.0 + fk * 13.0, h));
						if (floor(p.x) == bx && floor(p.y) == by) col = mix(col, c3.rgb, 0.7);
					}
				}
			}
		}
		float hl = clamp(1.0 - distance(p, vec2(17.0, 14.0)) / 12.0, 0.0, 1.0);
		col = mix(col, vec3(1.0), 0.38 * hl);
		col += bayer(p) * (1.0 / 14.0);
		col = floor(col * 14.0 + 0.5) / 14.0;
		COLOR = vec4(col, 1.0);
	}
}
