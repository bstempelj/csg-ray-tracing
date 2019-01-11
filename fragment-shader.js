const fragmentShaderSrc = `#version 300 es

#define M_PI 3.1415926535897932384626433832795

precision mediump float;

in vec4 v_position;

uniform vec2 u_translation;
uniform vec2 u_rotation;

uniform vec4 u_matrix;

out vec4 outColor;

struct Sphere {
	vec3 center;
	float radius;
	vec4 color;
};

struct Box {
	vec3 bounds[2];
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

float intersect(Sphere sphere, Ray ray) {
	float t0, t1;

	vec3 L = sphere.center - ray.origin;

	float tca = dot(L, ray.direction);
	if (tca < 0.0) return 0.0;

	float d2 = dot(L, L) - tca * tca;
	float r2 = sphere.radius * sphere.radius;
	if (d2 > r2) return 0.0;

	float thc = sqrt(r2 - d2);

	t0 = tca - thc;
	t1 = tca + thc;

	return t0;
}

bool intersectBox(Box box, Ray r, out vec2 result) {
	vec3 min = box.bounds[0];
	vec3 max = box.bounds[1];

	float tmin = (min.x - r.origin.x) / r.direction.x;
	float tmax = (max.x - r.origin.x) / r.direction.x;

	if (tmin > tmax) {
		float temp = tmin;
		tmin = tmax;
		tmax = temp;
	}

	float tymin = (min.y - r.origin.y) / r.direction.y;
	float tymax = (max.y - r.origin.y) / r.direction.y;

	if (tymin > tymax) {
		float temp = tymin;
		tymin = tymax;
		tymax = temp;
	}

	if ((tmin > tymax) || (tymin > tmax))
		return false;

	if (tymin > tmin)
		tmin = tymin;

	if (tymax < tmax)
		tmax = tymax;

	float tzmin = (min.z - r.origin.z) / r.direction.z;
	float tzmax = (max.z - r.origin.z) / r.direction.z;

	if (tzmin > tzmax) {
		float temp = tzmin;
		tzmin = tzmax;
		tzmax = tzmin;
	}

	if ((tmin > tzmax) || (tzmin > tmax))
		return false;

	if (tzmin > tmin)
		tmin = tzmin;

	if (tzmax < tmax)
		tmax = tzmax;

	result = vec2(tmin, tmax);

	return true;
}

void main() {
	float x = v_position.x;
	float y = v_position.y;

	Sphere sphere1;
	sphere1.center = vec3(0.0, 0.0, -5.0);
	sphere1.radius = 1.0;
	sphere1.color = vec4(0.0, 1.0, 0.0, 1.0);

	Sphere sphere2;
	sphere2.center = vec3(-1.0, 0.0, -5.0);
	sphere2.radius = 1.0;
	sphere2.color = vec4(0.0, 0.0, 1.0, 1.0);

	Box box;
	box.bounds[0] = vec3(-0.2);	// min
	box.bounds[1] = vec3(0.2);	// max

	Ray ray;
	ray.origin = vec3(0.0, 0.0, 1.0);
	ray.direction = normalize(vec3(x - 0.5, y - 0.5, -1.0));

	// Ray ray;
	// ray.origin = vec3(u_rotation.x, y, u_rotation.y);
	// ray.direction = normalize(vec3(x - 0.5 + u_rotation.x, y - 0.5, -1.0));	

	Light light;
	light.direction = vec3(-1.0 + u_rotation.x, -1.0, -1.0);
	light.color = vec4(0.9, 0.9, 0.9, 1.0);


	vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

	// BOX
	vec2 hitPoints;
	if (intersectBox(box, ray, hitPoints)) {
		float t = hitPoints.x;
		vec3 p = ray.origin + ray.direction * t;
		vec3 n = normalize(p / 0.5);
		vec3 L = -normalize(light.direction);
		color = vec4(0.2, 0.2, 0.2, 1.0) + vec4(1, 0, 0, 1) * light.color * max(0.0, dot(n, L));
		color.a = 1.0;
	}
	// /BOX

	float s1_t0 = intersect(sphere1, ray);
	float s2_t0 = intersect(sphere2, ray);


	#define NORMAL 1
	#define INTERSECT 0
	#define UNION 0
	#define SUBTRACT 0

	#if NORMAL
	if (s1_t0 != 0.0) {
		vec3 s1_p = ray.origin + s1_t0 * ray.direction;
		vec3 s1_n = normalize(s1_p - sphere1.center);
		vec3 L = -normalize(light.direction);
		color = vec4(0.2, 0.2, 0.2, 1.0) + sphere1.color * light.color * max(0.0, dot(s1_n, L));
		color.a = 1.0;
		// color = vec4(s1_n * 0.5 + 0.5, 1.0);
		//color = vec4(, 1.0);
		//color = vec4(0.3, 0.6, 0.9, 1.0);
		//color = sphere1.color;
	}

	if (s2_t0 != 0.0) {
		// color = sphere2.color;

		vec3 s2_p = ray.origin + s2_t0 * ray.direction;
		vec3 s2_n = normalize(s2_p - sphere2.center);
		vec3 L = -normalize(light.direction);
		color = vec4(0.2, 0.2, 0.2, 1.0) + sphere2.color * light.color * max(0.0, dot(s2_n, L));
		color.a = 1.0;
	}
	#endif

	#if INTERSECT
	if (floor(s1_t0) == floor(s2_t0) && s1_t0 != 0.0 && s2_t0 != 0.0) {
		color = sphere1.color;
	}
	#endif

	#if UNION
	if (s1_t0 != 0.0) {
		color = sphere1.color;
	}

	if (s2_t0 != 0.0) {
		color = sphere1.color;
	}
	#endif

	#if SUBTRACT
	if (s1_t0 != 0.0) {
		color = sphere1.color;
	}

	if (s2_t0 != 0.0) {
		color = vec4(0, 0, 0, 1);
	}
	#endif

	outColor = color;
}
`;