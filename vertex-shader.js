const vertexShaderSrc = `#version 300 es

in vec4 a_position;

out vec4 v_position;

void main() {
	gl_Position = a_position;

	// convert from clipspace [-1, 1] to
	// color space [0, 1]
	v_position = gl_Position * 0.5 + 0.5;
}
`;