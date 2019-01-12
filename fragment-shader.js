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

struct Box {
	vec3 bounds[2];
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

bool intersectSphere(Sphere sphere, Ray ray, out vec2 hitPoints) {
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

	hitPoints = vec2(t0, t1);

	return true;
}

void swap(inout float tmin, inout float tmax) {
	float temp = tmin;
	tmin = tmax;
	tmax = temp;
}

bool intersectBox(Box box, Ray r, out vec2 result) {
	vec3 min = box.bounds[0];
	vec3 max = box.bounds[1];

	float tmin = (min.x - r.origin.x) / r.direction.x;
	float tmax = (max.x - r.origin.x) / r.direction.x;

	if (tmin > tmax)
		swap(tmin, tmax);

	float tymin = (min.y - r.origin.y) / r.direction.y;
	float tymax = (max.y - r.origin.y) / r.direction.y;

	if (tymin > tymax)
		swap(tymin, tymax);

	if ((tmin > tymax) || (tymin > tmax))
		return false;

	if (tymin > tmin)
		tmin = tymin;
	if (tymax < tmax)
		tmax = tymax;

	float tzmin = (min.z - r.origin.z) / r.direction.z;
	float tzmax = (max.z - r.origin.z) / r.direction.z;

	if (tzmin > tzmax)
		swap(tzmin, tzmax);

	if ((tmin > tzmax) || (tzmin > tmax))
		return false;
	if (tzmin > tmin)
		tmin = tzmin;
	if (tzmax < tmax)
		tmax = tzmax;

	result = vec2(tmin, tmax);

	return true;
}

vec4 colorSphere(Sphere sphere, Ray ray, Light light, float t) {
	vec4 color;
	bool sampled = true;

	if (sampled) {
		vec3 hitPoint = ray.origin + ray.direction * t;
		vec3 n = normalize(hitPoint - sphere.center);
		vec3 L = -normalize(light.direction);
		color = vec4(0.2, 0.2, 0.2, 1.0) + sphere.color * light.color * max(0.0, dot(n, L));
		color.a = 1.0;
	}
	else {
		color = sphere.color;
	}

	return color;
}

vec4 colorBox(Box box, Ray ray, Light light, float t) {
	vec4 color;
	bool sampled = true;

	if (sampled) {
		vec3 p = ray.origin + ray.direction * t;
		vec3 n = normalize(p / 0.5);
		vec3 L = -normalize(light.direction);
		color = vec4(0.2, 0.2, 0.2, 1.0) + box.color * light.color * max(0.0, dot(n, L));
		color.a = 1.0;
	}
	else {
		color = box.color;
	}

	return color;
}

void main() {
	#define SUBTRACT 1


	// colors
	vec4 white = vec4(1, 1, 1, 1);
	vec4 black = vec4(0, 0, 0, 1);
	vec4 red   = vec4(1, 0, 0, 1);
	vec4 green = vec4(0, 1, 0, 1);
	vec4 blue  = vec4(0, 0, 1, 1);

	vec4 color = black;

	Sphere sphere;
	sphere.center = vec3(0.0, 0.0, 0.0);
	sphere.radius = 1.32;
	sphere.color = green;

	Box box;
	box.bounds[0] = vec3(-1);	// min
	box.bounds[1] = vec3(1);	// max
	box.color = red;

	Ray ray;
	ray.origin = u_matrix[3].xyz;
	ray.direction = (u_matrix * vec4(normalize(vec3(v_position.x, v_position.y, -1.0)).xyz, 0.0)).xyz;

	Light light;
	light.direction = vec3(-0.45, -1.0, 0.0);
	light.color = vec4(0.75, 0.75, 0.75, 1.0);

	{
		vec2 hitPoints;
		if (intersectSphere(sphere, ray, hitPoints)) {
			color = colorSphere(sphere, ray, light, hitPoints.x);
		}
	}

	{
		vec2 hitPoints;
		if (intersectBox(box, ray, hitPoints)) {
			color = colorBox(box, ray, light, hitPoints.x);
		}
	}

	outColor = color;
}
`;