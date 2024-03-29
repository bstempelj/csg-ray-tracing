// get webgl context
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
	console.error('Sorry no WebGL2 for you!');
}

// init ui
const xPosSlider = document.getElementById('xPos');
xPosSlider.min = -3.0;
xPosSlider.max = 3.0;
xPosSlider.step = 0.1;
xPosSlider.defaultValue = 0.0;

const yPosSlider = document.getElementById('yPos');
yPosSlider.min = -3.0;
yPosSlider.max = 3.0;
yPosSlider.step = 0.1;
yPosSlider.defaultValue = 0.0;

const zPosSlider = document.getElementById('zPos');
zPosSlider.min = -3.0;
zPosSlider.max = 3.0;
zPosSlider.step = 0.1;
zPosSlider.defaultValue = 0.0;

const radiusSlider = document.getElementById('radius');
radiusSlider.min = 0.5;
radiusSlider.max = 2.0;
radiusSlider.step = 0.1;
radiusSlider.defaultValue = 1.25;

const xRotationSlider = document.getElementById('xRotation');
xRotationSlider.min = -180;
xRotationSlider.max = 180;
xRotationSlider.step = 1;
xRotationSlider.defaultValue = -30;

const zRotationSlider = document.getElementById('zRotation');
zRotationSlider.min = -180;
zRotationSlider.max = 180;
zRotationSlider.step = 1;
zRotationSlider.defaultValue = 0;


let csgOperation = 0;

const unionBtn = document.getElementById('unionBtn');
unionBtn.addEventListener('click', function() { console.log('switching to union'); csgOperation = 0; }, false);

const interBtn = document.getElementById('interBtn');
interBtn.addEventListener('click', function() { console.log('switching to intersection'); csgOperation = 1; }, false);

const subtrBtn = document.getElementById('subtrBtn');
subtrBtn.addEventListener('click', function() { console.log('switching to subtraction'); csgOperation = 2; }, false);

// compile program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
const program = createProgram(gl, vertexShader, fragmentShader);

// get locations
const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
const translationUniformLocation = gl.getUniformLocation(program, 'u_translation');
const rotationUniformLocation = gl.getUniformLocation(program, 'u_rotation');
const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
const projectionLocation = gl.getUniformLocation(program, 'u_projection');


// sphere locations
const sphereMatrixLocation = gl.getUniformLocation(program, 'u_sphereMatrix');
const sphereRadiusLocation = gl.getUniformLocation(program, 'u_sphereRadius');

// light
const lightAngleLocation = gl.getUniformLocation(program, 'u_lightAngle');

// oth
const csgOperationLocation = gl.getUniformLocation(program, 'u_csgOperation');

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

function toRad(angle) {
	return angle * Math.PI / 180.0;
}

let angle = 0.0;


var fieldOfViewInRadians = toRad(45);
var aspect = canvas.width / canvas.height;
var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
var projection = [
  f / aspect, 0, 0, 0,
  0, f, 0, 0,
  0, 0, 1, -1,
  0, 0, 0, 0,
];


function drawScene(deltaTime) {
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// ui
	// console.log('xPosition: ' + xPosSlider.value);

	// clear the scene
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

	gl.useProgram(program);

	// // move camera
	// gl.uniform2fv(translationUniformLocation, [cameraX, cameraY]);

	// // rotate camera
	// gl.uniform2fv(rotationUniformLocation, [Math.cos(angle), Math.sin(angle)]);

	// projection matrix
	gl.uniformMatrix4fv(projectionLocation, false, projection);


	// set csg operation
	gl.uniform1i(csgOperationLocation, csgOperation);

	// set sphere radius
	gl.uniform1f(sphereRadiusLocation, radiusSlider.value);
	
	{
		// set sphere transforms
		let sphereMatrix = [
			1,  0,  0,  0,
			0,  1,  0,  0,
			0,  0,  1,  0,
			0,  0,  0,  1,
		];

		let x = xPosSlider.value;
		const y = yPosSlider.value;
		const z = zPosSlider.value;
		sphereMatrix = m4.multiply(sphereMatrix, m4.translation(x, y, z));
		gl.uniformMatrix4fv(sphereMatrixLocation, false, sphereMatrix);
	}


	// transformation matrix
	let matrix = [
	   1,  0,  0,  0,
	   0,  1,  0,  0,
	   0,  0,  1,  0,
	   0, 0, 5, 1,
	];
	var rotationMatrix = m4.yRotation(toRad(angle));
	rotationMatrix = m4.multiply(rotationMatrix, m4.xRotation(toRad(xRotationSlider.value)));
	rotationMatrix = m4.multiply(rotationMatrix, m4.zRotation(toRad(zRotationSlider.value)));
	matrix = m4.multiply(rotationMatrix, matrix);
	gl.uniformMatrix4fv(matrixLocation, false, matrix);

	const vertices = 4;
	const offset = 0;
	gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertices);

	angle += deltaTime * 100;
}