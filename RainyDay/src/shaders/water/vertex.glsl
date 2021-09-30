uniform float uTime;


varying float vElevation; 
varying vec2 vUv;


void main(){
    
    vec4 modelPosiotion = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosiotion;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    vUv = uv;
}