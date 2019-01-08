// --- SHADERS ---
const vertexShaderSrc = `#version 300 es

in vec4 a_position;

out vec4 v_position;

void main() {
	gl_Position = a_position;
	v_position = a_position;
}
`;

const fragmentShaderSrc = `#version 300 es

precision mediump float;

in vec4 v_position;

out vec4 outColor;

struct Sphere {
	vec3 center;
	float radius;
	vec4 color;
};

struct Ray {
	vec3 origin;
	vec3 direction;
};

vec4 intersect(Sphere sphere, Ray ray) {
	float t0, t1;
	
	vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

	vec3 L = sphere.center - ray.origin;

	float tca = dot(L, ray.direction);
	if (tca < 0.0) return color;

	float d2 = dot(L, L) - tca * tca;
	float r2 = sphere.radius * sphere.radius;
	if (d2 > r2) return color;

	float thc = sqrt(r2 - d2);

	t0 = tca - thc;
	t1 = tca + thc;

	color = sphere.color;
	return color;
}

void main() {
	float x = v_position.x;
	float y = v_position.y;

	Sphere sphere;
	sphere.center = vec3(0.0, 0.0, -5.0);
	sphere.radius = 1.0;
	sphere.color = vec4(0.0, 1.0, 0.0, 1.0);

	Ray ray;
	ray.origin = vec3(0.0, 0.0, 0.0);
	ray.direction = normalize(vec3(x - 0.5, 0.5 - y, -1.0));

	vec4 color = intersect(sphere, ray);

	outColor = color;
}
`;

// --- FUNCTIONS ---
function createShader(gl, type, src) {
	let shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		const name = (type == gl.VERTEX_SHADER) ? 'vertex' : 'fragment';
		console.log('Something went wrong while compiling the ' + name + ' shader...');
		console.log(gl.getShaderInfoLog(shader));

		gl.deleteShader(shader);
	}

	return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
	let program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		console.log('Something went wrong while linking the shaders into a program...');
		console.log(gl.getProgramInfoLog(program));

		gl.deleteProgram(program);
	}

	return program;
}

// --- MAIN PROGRAM ---
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
	console.error('Sorry no WebGL2 for you!');
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

const program = createProgram(gl, vertexShader, fragmentShader);

const posAttribLocation = gl.getAttribLocation(program, 'a_position');

let posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

const vertices = [
	1.0, 1.0,
	-1.0, 1.0,
	1.0, -1.0,
	-1.0, -1.0
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(posAttribLocation);

gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);