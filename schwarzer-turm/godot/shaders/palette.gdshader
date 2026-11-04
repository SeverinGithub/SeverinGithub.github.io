shader_type canvas_item;
// The browser's last step (present() in 000-core-canvas-gl.js): every pixel is nudged by a 4×4 Bayer matrix,
// cut to 15 bits and replaced by its nearest colour from the game's limited palette (assets/palette_lut.png, tools/godot-palette.mjs).

uniform sampler2D screen_tex : hint_screen_texture, filter_nearest;
uniform sampler2D lut : filter_nearest;
const float BAY[16] = float[](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);

void fragment() {
	vec3 c = texture(screen_tex, SCREEN_UV).rgb * 255.;
	ivec2 px = ivec2(floor(FRAGCOORD.xy));
	float t = (BAY[(px.y % 4) * 4 + px.x % 4] - 7.5) * 1.6;
	vec3 q = floor(clamp(c + t, 0., 255.) / 8.);
	COLOR = vec4(texture(lut, vec2((q.g * 32. + q.b + .5) / 1024., (q.r + .5) / 32.)).rgb, 1.);
}
