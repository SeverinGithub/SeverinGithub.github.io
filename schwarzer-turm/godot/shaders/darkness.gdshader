shader_type canvas_item;
// The darkness of the tower (render() in 210-render.js): a dark veil over everything, and every light cuts a soft ellipse out of it,
// twice r wide and 1.2·r high (full at the middle, 70% at 0.6, gone at the rim), as destination-out does in the browser.

uniform vec4 dark_col = vec4(.0157, .0118, .0078, .95);
uniform vec2 vp = vec2(760., 430.);
uniform int n = 0;
uniform vec4 L[128];   // screen x, screen y, r, strength

void fragment() {
	vec2 p = SCREEN_UV * vp;
	float a = dark_col.a;
	for (int i = 0; i < n; i++) {
		vec2 d = (p - L[i].xy) / vec2(L[i].z, L[i].z * .6);
		float r = length(d);
		if (r >= 1.) continue;
		float g = r < .6 ? mix(1., .7, r / .6) : mix(.7, 0., (r - .6) / .4);
		a *= 1. - min(1., L[i].w) * g;
	}
	COLOR = vec4(dark_col.rgb, a);
}
