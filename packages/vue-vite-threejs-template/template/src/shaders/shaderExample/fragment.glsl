varying vec2 vUv;
uniform float uAlpha;
void main() {
  gl_FragColor = vec4(vUv, 1.0, uAlpha);
}