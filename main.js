// get webgl context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
	console.error('Sorry no WebGL2 for you!');
}

// compile program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
const program = createProgram(gl, vertexShader, fragmentShader);

// get locations
const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
const translationUniformLocation = gl.getUniformLocation(program, 'u_translation');
const rotationUniformLocation = gl.getUniformLocation(program, 'u_rotation');
const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

const buffers = initBuffers();

function initBuffers() {
	const vertices = [
		1.0, 1.0,	
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	];

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	return {
		position: positionBuffer
	};
}

var then = 0;

function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  drawScene(deltaTime);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);



let angle = 0.0;

function drawScene(deltaTime) {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// clear the scene
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

	gl.useProgram(program);

	// // move camera
	// gl.uniform2fv(translationUniformLocation, [cameraX, cameraY]);

	// // rotate camera
	gl.uniform2fv(rotationUniformLocation, [Math.cos(angle), Math.sin(angle)]);

	const vertices = 4;
	const offset = 0;
	gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertices);

	angle += deltaTime;
}