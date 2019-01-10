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

// let vao = gl.createVertexArray();
// gl.bindVertexArray(vao);
gl.enableVertexAttribArray(posAttribLocation);

gl.vertexAttribPointer(posAttribLocation, 2, gl.FLOAT, false, 0, 0);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);