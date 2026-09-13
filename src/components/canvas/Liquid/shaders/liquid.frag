#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uRandomSeed;

const int TRAIL_LENGTH = 8;
const int UNIFORM_COUNT = 30;
uniform float uPointerTrail[UNIFORM_COUNT];

const float METABALL_SMOOTHING = 0.65;

out vec4 fragColor;

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float smoothMin(float d1, float d2, float k) {
    float h = max(k - abs(d1 - d2), 0.0) / k;
    return min(d1, d2) - h * h * k * 0.25;
}

float hash1D(float n) {
    return fract(sin(n + uRandomSeed * 13.17) * 43758.5453123);
}

float rnd3D(vec3 p) {
    return fract(sin(dot(p + vec3(uRandomSeed), vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float a = rnd3D(i);
    float b = rnd3D(i + vec3(1.0, 0.0, 0.0));
    float c = rnd3D(i + vec3(0.0, 1.0, 0.0));
    float d = rnd3D(i + vec3(1.0, 1.0, 0.0));
    float e = rnd3D(i + vec3(0.0, 0.0, 1.0));
    float f_ = rnd3D(i + vec3(1.0, 0.0, 1.0));
    float g = rnd3D(i + vec3(0.0, 1.0, 1.0));
    float h = rnd3D(i + vec3(1.0, 1.0, 1.0));

    return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, f_, u.x), mix(g, h, u.x), u.y), u.z);
}

vec3 dropletColor(vec3 normal, vec3 rayDir) {
    vec3 reflectDir = reflect(rayDir, normal);

    vec3 timeShift1 = vec3(sin(uTime * 0.4) * 0.8, cos(uTime * 0.3) * 0.8, uTime * 0.25);
    vec3 timeShift2 = vec3(cos(uTime * 0.3) * 0.6, sin(uTime * 0.5) * 0.6, -uTime * 0.20);

    float n1 = noise3D(reflectDir * 0.9 + timeShift1);
    float n2 = noise3D(reflectDir * 1.6 + timeShift2);

    vec3 deepNavyBase     = vec3(0.01, 0.03, 0.10);
    vec3 sapphireGlow     = vec3(0.05, 0.22, 0.65) * n1;
    vec3 silverReflection = vec3(0.65, 0.68, 0.72) * n2;

    return deepNavyBase + sapphireGlow + silverReflection;
}

float map(vec3 p) {
    float d = 1e5;
    float aspect = uResolution.x / uResolution.y;

    for (int col = 0; col < 3; col++) {
        for (int row = 0; row < 2; row++) {
            float fc = float(col);
            float fr = float(row);

            float indexID = fc * 2.0 + fr;
            float cellSeed = hash1D(indexID * 57.29);

            float cellX = (-0.75 + (fc * 0.75)) * aspect;
            float cellY = -0.45 + (fr * 0.9);

            float driftTimeX = uTime * (0.28 + hash1D(indexID * 14.23) * 0.18) + cellSeed * 40.0;
            float driftTimeY = uTime * (0.24 + hash1D(indexID * 73.11) * 0.18) + cellSeed * 80.0;

            float offsetX = sin(driftTimeX) * 0.55 * aspect;
            float offsetY = cos(driftTimeY) * 0.48;

            vec3 fluidPos = vec3(cellX + offsetX, cellY + offsetY, 0.0);

            float radius = 0.38 + hash1D(indexID * 81.37) * 0.12 + sin(uTime * 1.5 + indexID) * 0.015;

            d = smoothMin(d, sdSphere(p - fluidPos, radius), METABALL_SMOOTHING);
        }
    }

    for (int i = 0; i < TRAIL_LENGTH; i++) {
        float fi = float(i);
        vec3 sphereCenter = vec3(uPointerTrail[i * 2], uPointerTrail[i * 2 + 1], 0.0);

        float progressiveRadius = 0.12 * (1.0 - (fi / float(TRAIL_LENGTH)) * 0.75);
        d = smoothMin(d, sdSphere(p - sphereCenter, progressiveRadius), METABALL_SMOOTHING);
    }

    return d;
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

    vec3 rayOrigin = vec3(uv, 2.2);
    vec3 rayDir = vec3(0.0, 0.0, -1.0);

    float totalDist = 0.0;
    bool hit = false;
    vec3 rayPos = vec3(0.0);

    for (int i = 0; i < 14; i++) {
        rayPos = rayOrigin + rayDir * totalDist;
        float d = map(rayPos);
        totalDist += d;
        if (d < 0.0025) { hit = true; break; }
        if (totalDist > 3.6) { break; }
    }

    vec3 color = vec3(0.0);
    float opacity = 0.0;

    if (hit) {
        float d = map(rayPos);
        vec2 eps = vec2(0.005, 0.0);
        vec3 normal = normalize(vec3(
            map(rayPos + eps.xyy) - d,
            map(rayPos + eps.yxy) - d,
            map(rayPos + eps.yyx) - d
        ));

        vec3 rawColor = dropletColor(normal, rayDir);
        vec3 viewDir = normalize(rayOrigin - rayPos);
        float rimLight = 1.0 - max(dot(normal, viewDir), 0.0);

        color = pow(rawColor, vec3(3.2));
        opacity = clamp(length(color) * 1.6 + pow(rimLight, 2.0) * 0.5, 0.0, 0.95);
    }

    fragColor = vec4(color, opacity);
}
