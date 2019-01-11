const vertexShaderSrc = `#version 300 es

in vec4 a_position;

out vec4 v_position;

void main() {
	gl_Position = a_position;

	// color space [0, 1]
	// v_position = a_position * 0.5 + 0.5;

	// screen space [-1, 1]
	v_position = a_position;
}
`;