#define PI 3.1415926535897932384626433832795

precision highp float;
precision highp int;
 
attribute vec3 position;
attribute vec2 uv;
 
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 uPos;
uniform vec2 uPlaneSizes;
uniform vec2 uStrength;
uniform vec2 uViewportSizes;
 
varying vec2 vUv;
 

void main() {
  vUv = uv;

  vec4 newPosition = modelViewMatrix * vec4(position, 1.0);
  newPosition.y += sin(uv.x * PI) * -uStrength.y;
  newPosition.x += sin(uv.y * PI) * -uStrength.x;

  newPosition.y += sin(uv.y * PI) * -uStrength.y;
  newPosition.x += sin(uv.x * PI) * -uStrength.x;
  // newPosition.x += (uv.y - 0.5) * -uStrength.x;
 
  gl_Position = projectionMatrix * newPosition;
}
