shader_type canvas_item;
// The title's dusk over the hill (#title .tsky, .tglow, .tfog, .tshade in src/style.css): a sky gradient multiplied in,
// a warm glow round the tower screened in, drifting fog, and the dark vignette with the left side deep for the menu.
uniform sampler2D screen_tex : hint_screen_texture, filter_nearest;
uniform float t = 0.0;
uniform float narrow = 0.0;

vec3 screen_b(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - b); }
float rad(vec2 uv, vec2 c, vec2 r) { return length((uv - c) / r); }

void fragment() {
	vec2 uv = SCREEN_UV;
	vec3 c = texture(screen_tex, uv).rgb;
	float ar = SCREEN_PIXEL_SIZE.y / SCREEN_PIXEL_SIZE.x;
	// sky: #262c66 → #5e5690 at 52 % → #b8785c, multiplied at .66
	vec3 sky = uv.y < .52 ? mix(vec3(.149, .173, .4), vec3(.369, .337, .565), uv.y / .52) : mix(vec3(.369, .337, .565), vec3(.722, .471, .361), (uv.y - .52) / .48);
	c = mix(c, c * sky, .66);
	// glow at 70 % 46 %, breathing over five seconds, and a low warm light from below
	float gb = .875 + .125 * cos(t * 6.2832 / 5.0);
	float d = length(vec2((uv.x - .7) * ar, uv.y - .46)) / max(ar, 1.0) * 1.4;
	vec4 g1 = d < .2 ? mix(vec4(1, .588, .235, .3), vec4(1, .431, .157, .07), d / .2) : mix(vec4(1, .431, .157, .07), vec4(0), clamp((d - .2) / .16, 0, 1));
	float d2 = rad(uv, vec2(.7, 1.15), vec2(1.2, .6));
	vec4 g2 = mix(vec4(1, .431, .157, .14), vec4(0), clamp(d2 / .6, 0, 1));
	c = screen_b(c, g1.rgb * g1.a * gb);
	c = screen_b(c, g2.rgb * g2.a * gb);
	// fog: three soft clouds that drift sideways over 38 seconds
	float fx = sin(t / 38.0 * 3.1416) * .12;
	vec2 fu = uv + vec2(fx, 0);
	float f = .13 * (1.0 - smoothstep(0., .7, rad(fu, vec2(.3, .78), vec2(.4, .18)))) + .12 * (1.0 - smoothstep(0., .7, rad(fu, vec2(.75, .88), vec2(.35, .14)))) + .08 * (1.0 - smoothstep(0., .7, rad(fu, vec2(.55, .7), vec2(.3, .12))));
	c = mix(c, vec3(.75, .71, .87), f);
	// shade: vignette round the tower, darker top and bottom, and the left side deep for the menu
	vec3 ink = vec3(.012, .008, .024);
	float v = smoothstep(.45, 1.0, rad(uv, vec2(.72, .45), vec2(1.3, 1.0)));
	c = mix(c, ink, v * .78);
	float tb = uv.y < .22 ? (1.0 - uv.y / .22) * .45 : (uv.y > .8 ? (uv.y - .8) / .2 * .5 : 0.0);
	c = mix(c, vec3(.024, .016, .055), tb);
	float lx = uv.x;
	float side = lx < .26 ? mix(.95, .86, lx / .26) : (lx < .48 ? mix(.86, .42, (lx - .26) / .22) : (lx < .66 ? mix(.42, 0., (lx - .48) / .18) : 0.0));
	side = mix(side, max(0, .7 - uv.y) * .9, narrow);
	c = mix(c, vec3(.024, .016, .04), side);
	COLOR = vec4(c, 1.0);
}
