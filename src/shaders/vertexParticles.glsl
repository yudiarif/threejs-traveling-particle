uniform float uTime;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
varying float vOpacity;
attribute float opacity;


void main() {
    vPosition = position;
    vUv = uv;
    vOpacity = opacity;
    vec4 mvPosition = modelViewMatrix * vec4(vPosition,1.0);
    gl_PointSize = 30000.0 * (1.0/-mvPosition.z);
	gl_Position = projectionMatrix * mvPosition;
}