shader_type canvas_item;
// A tuft of standing grass in the wind (drawTuft in 820-meadow.js): sheared at its foot by the wind's swell, leaning away
// from whoever walks through and trodden flat for a moment. The node stands on the tuft's foot in iso screen space.

uniform float t = 0.0;            // game time
uniform float stiff = 1.0;        // how far this kind bends (GTK[].k)
uniform float wind = 0.5;         // the weather's strength (s in windAt)
uniform int n = 0;                // walkers: world x, y and reach
uniform vec3 walkers[16];

void vertex() {
	vec2 sp = (MODEL_MATRIX * vec4(0.0, 0.0, 0.0, 1.0)).xy;
	float a = sp.x / 32.0, b = sp.y / 16.0;
	float x = (a + b) * 0.5, y = (b - a) * 0.5;
	float ph = fract(sin(dot(floor(sp), vec2(12.9898, 78.233))) * 43758.5453) * 6.28;
	float w = (sin(t * 1.05 + x * 0.29 + y * 0.17) * 0.55 + sin(t * 2.2 - x * 0.21 + y * 0.38) * 0.22
		+ sin(t * 0.33 + (x + y) * 0.045) * 0.4 + max(0.0, sin(t * 0.21 + x * 0.02)) * 0.35) * wind;
	float k = w * 0.32 * stiff + sin(t * 3.1 + ph) * 0.04;
	float sq = 1.0;
	for (int i = 0; i < n; i++) {
		vec2 dv = vec2(x, y) - walkers[i].xy;
		float d = length(dv);
		if (d < walkers[i].z) {
			float f = 1.0 - d / walkers[i].z;
			k += (dv.x - dv.y >= 0.0 ? 1.0 : -1.0) * f * 0.85;
			sq = min(sq, 1.0 - f * 0.45);
		}
	}
	VERTEX = vec2(VERTEX.x - k * VERTEX.y, VERTEX.y * sq);
}
