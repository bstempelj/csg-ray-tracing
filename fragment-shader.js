const fragmentShaderSrc = `#version 300 es

#define M_PI 3.1415926535897932384626433832795

precision mediump float;

in vec4 v_position;

uniform vec2 u_translation;
uniform vec2 u_rotation;

uniform mat4 u_projection;
uniform mat4 u_matrix;

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

struct Light {
	vec3 position;
	vec3 direction;
	vec4 color;
	float intensity;
};

bool intersectSphere(Sphere sphere, Ray ray, out float hitPoint) {
	float t0, t1;

	vec3 L = sphere.center - ray.origin;

	float tca = dot(L, ray.direction);
	if (tca < 0.0) return false;

	float d2 = dot(L, L) - tca * tca;
	float r2 = sphere.radius * sphere.radius;
	if (d2 > r2) return false;

	float thc = sqrt(r2 - d2);

	t0 = tca - thc;
	t1 = tca + thc;

	hitPoint = t0;

	return true;
}

void main() {
	// colors
	vec4 white = vec4(1, 1, 1, 1);
	vec4 black = vec4(0, 0, 0, 1);
	vec4 red   = vec4(1, 0, 0, 1);
	vec4 green = vec4(0, 1, 0, 1);
	vec4 blue  = vec4(0, 0, 1, 1);

	vec4 color = black;

	Sphere sphere;
	sphere.center = vec3(0.0, 0.0, 0.0);
	sphere.radius = 1.0;
	sphere.color = green;

	Ray ray;
	ray.origin = u_matrix[3].xyz;
	ray.direction = (u_matrix * vec4(normalize(vec3(v_position.x, v_position.y, -1.0)).xyz, 0.0)).xyz;

	Light light;
	light.direction = vec3(-0.45, -1.0, 0.0);
	light.color = vec4(0.75, 0.75, 0.75, 1.0);


	float t;
	if (intersectSphere(sphere, ray, t)) {
		vec3 hitPoint = ray.origin + ray.direction * t;
		vec3 n = normalize(hitPoint - sphere.center);
		vec3 L = -normalize(light.direction);		
		color = vec4(0.2, 0.2, 0.2, 1.0) + sphere.color * light.color * max(0.0, dot(n, L));
		color.a = 1.0;
	}

	outColor = color;
}
`;