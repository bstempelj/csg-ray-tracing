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