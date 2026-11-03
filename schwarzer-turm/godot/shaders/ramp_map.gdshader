// Colours a grey gear layer with the ramp of its material (tools/godot-export-layers.js bakes the greys):
// grey 0, 1/3, 2/3, 1 are the four stops of a material ramp (PXM); gems have three stops at 0, 1/2, 1 (PXG).
shader_type canvas_item;

uniform vec4 c0 : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform vec4 c1 : source_color = vec4(0.33, 0.33, 0.33, 1.0);
uniform vec4 c2 : source_color = vec4(0.67, 0.67, 0.67, 1.0);
uniform vec4 c3 : source_color = vec4(1.0, 1.0, 1.0, 1.0);
uniform bool gem = false;

void fragment() {
	vec4 t = texture(TEXTURE, UV);
	float v = t.r;
	vec3 c;
	if (gem) {
		c = v < 0.5 ? mix(c0.rgb, c1.rgb, v * 2.0) : mix(c1.rgb, c2.rgb, v * 2.0 - 1.0);
	} else {
		float x = v * 3.0;
		c = x < 1.0 ? mix(c0.rgb, c1.rgb, x) : x < 2.0 ? mix(c1.rgb, c2.rgb, x - 1.0) : mix(c2.rgb, c3.rgb, x - 2.0);
	}
	COLOR = vec4(c, t.a);
}
