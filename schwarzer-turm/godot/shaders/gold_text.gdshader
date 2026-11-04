shader_type canvas_item;
// The title's gold letters (#title h1 .tname): a vertical gradient over the whole word, not over each glyph.
uniform float top = 0.0;
uniform float height = 100.0;
varying float ly;

void vertex() { ly = (VERTEX.y - top) / height; }

void fragment() {
	float a = texture(TEXTURE, UV).a * COLOR.a;
	float y = clamp(ly, 0.0, 1.0);
	vec3 c;
	if (y < .34) c = mix(vec3(1., .965, .863), vec3(.949, .843, .573), y / .34);
	else if (y < .5) c = mix(vec3(.949, .843, .573), vec3(.753, .541, .196), (y - .34) / .16);
	else if (y < .64) c = mix(vec3(.753, .541, .196), vec3(.925, .776, .486), (y - .5) / .14);
	else c = mix(vec3(.925, .776, .486), vec3(.541, .353, .118), (y - .64) / .36);
	COLOR = vec4(c, a);
}
