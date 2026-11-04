shader_type canvas_item;
// The theme's tint over the floor (ftGround in 982-floor-themes.js): a colour laid on with 'soft-light' at half strength,
// as the browser's canvas does it (the W3C soft-light formula).

uniform vec4 tint = vec4(1.0, 1.0, 1.0, 0.5);
uniform sampler2D screen : hint_screen_texture, filter_nearest;

float soft(float cb, float cs) {
	if (cs <= .5) return cb - (1. - 2. * cs) * cb * (1. - cb);
	float d = cb <= .25 ? ((16. * cb - 12.) * cb + 4.) * cb : sqrt(cb);
	return cb + (2. * cs - 1.) * (d - cb);
}

void fragment() {
	vec3 cb = texture(screen, SCREEN_UV).rgb;
	vec3 b = vec3(soft(cb.r, tint.r), soft(cb.g, tint.g), soft(cb.b, tint.b));
	COLOR = vec4(mix(cb, b, tint.a), 1.0);
}
