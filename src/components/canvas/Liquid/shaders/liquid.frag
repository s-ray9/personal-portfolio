#version 300 es
precision highp float;

#ifndef SPHERE_COUNT
#error SPHERE_COUNT must be defined by the host
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uNoiseSeed;
uniform vec3 uSpheres[SPHERE_COUNT];

out vec4 fragColor;

const vec3 RAY_DIR = vec3(0.0, 0.0, -1.0);
const float CAMERA_Z = 2.2;
const int MAX_STEPS = 14;
const float MAX_DISTANCE = 3.6;
const float HIT_DISTANCE = 0.0025;
const float NORMAL_EPSILON = 0.005;
const float NO_SURFACE = 1e5;
const float SMOOTHING = 0.65;

const vec3 DEEP_NAVY = vec3(0.01, 0.03, 0.10);
const vec3 SAPPHIRE = vec3(0.05, 0.22, 0.65);
const vec3 SILVER = vec3(0.65, 0.68, 0.72);
const float GAMMA = 3.2;

const float BRIGHTNESS_OPACITY = 1.6;
const float RIM_OPACITY = 0.5;
const float MAX_OPACITY = 0.95;

float smoothMin(float a, float b, float k) {
    float blend = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - blend * blend * k * 0.25;
}

float map(vec3 p) {
    float d = NO_SURFACE;
    for (int i = 0; i < SPHERE_COUNT; i++) {
        vec2 center = uSpheres[i].xy;
        float radius = uSpheres[i].z;
        float dist = length(vec3(p.xy - center, p.z)) - radius;
        d = smoothMin(d, dist, SMOOTHING);
    }
    return d;
}

// Hash without sine by Dave Hoskins
float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
}

float lattice(vec3 cell) {
    return hash(cell + uNoiseSeed);
}

float valueNoise(vec3 p) {
    vec3 cell = floor(p);
    vec3 local = fract(p);
    vec3 blend = local * local * (3.0 - 2.0 * local);

    float x00 = mix(lattice(cell), lattice(cell + vec3(1.0, 0.0, 0.0)), blend.x);
    float x10 = mix(lattice(cell + vec3(0.0, 1.0, 0.0)), lattice(cell + vec3(1.0, 1.0, 0.0)), blend.x);
    float x01 = mix(lattice(cell + vec3(0.0, 0.0, 1.0)), lattice(cell + vec3(1.0, 0.0, 1.0)), blend.x);
    float x11 = mix(lattice(cell + vec3(0.0, 1.0, 1.0)), lattice(cell + vec3(1.0, 1.0, 1.0)), blend.x);

    return mix(mix(x00, x10, blend.y), mix(x01, x11, blend.y), blend.z);
}

vec3 dropletColor(vec3 normal) {
    vec3 reflected = reflect(RAY_DIR, normal);

    float broad = valueNoise(reflected * 0.9 + vec3(sin(uTime * 0.4) * 0.8, cos(uTime * 0.3) * 0.8, uTime * 0.25));
    float fine = valueNoise(reflected * 1.6 + vec3(cos(uTime * 0.3) * 0.6, sin(uTime * 0.5) * 0.6, -uTime * 0.2));

    return DEEP_NAVY + SAPPHIRE * broad + SILVER * fine;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
    vec3 origin = vec3(uv, CAMERA_Z);

    float travelled = 0.0;
    float dist = 0.0;
    bool hit = false;
    for (int i = 0; i < MAX_STEPS; i++) {
        dist = map(origin + RAY_DIR * travelled);
        if (dist < HIT_DISTANCE) {
            hit = true;
            break;
        }
        travelled += dist;
        if (travelled > MAX_DISTANCE) {
            break;
        }
    }

    if (!hit) {
        fragColor = vec4(0.0);
        return;
    }

    vec3 surface = origin + RAY_DIR * travelled;
    vec3 normal = normalize(vec3(
        map(surface + vec3(NORMAL_EPSILON, 0.0, 0.0)) - dist,
        map(surface + vec3(0.0, NORMAL_EPSILON, 0.0)) - dist,
        map(surface + vec3(0.0, 0.0, NORMAL_EPSILON)) - dist
    ));

    vec3 color = pow(dropletColor(normal), vec3(GAMMA));
    float rim = 1.0 - max(normal.z, 0.0);
    float opacity = clamp(length(color) * BRIGHTNESS_OPACITY + rim * rim * RIM_OPACITY, 0.0, MAX_OPACITY);

    fragColor = vec4(color * opacity, opacity);
}
