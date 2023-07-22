uniform float uTime;
uniform vec4 resolution;
varying vec2 vUv;
varying float vOpacity;


void main() {
	vec2 uv = vec2(gl_PointCoord.x,1.0 - gl_PointCoord.y);\
	vec2 cUv = 2.0 * uv - 1.0;
	vec3 originalColor = vec3(80.0/255.0, 10.0/255.0, 20.0/255.0);
	vec4 color = vec4(0.08/length(cUv));

	color.rgb = min(vec3(10.0),color.rgb);

	color.rgb *= originalColor*120.0; 
	color *= vOpacity;
	color.a = min(1.0,color.a)*10.0;

	float disc = length(cUv); 
	
	/////////////////////////////////////////////////////////
	gl_FragColor = vec4(1.0 - disc,0.0, 0.0, 1.0) * vOpacity;
	gl_FragColor = vec4(color.rgb, color.a);
}