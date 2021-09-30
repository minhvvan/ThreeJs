uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uTime;
uniform vec2 uMIDI; 


varying float vElevation;
varying vec2 vUv;


vec3 hash3( vec2 p )
{
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
				   dot(p,vec2(269.5,183.3)), 
				   dot(p,vec2(419.2,371.9)) );
	return fract(sin(q)*43758.5453);
}

float noise(vec2 a)
{
    vec2 p = floor(a);
    vec2 f = fract(a);
		
	float va = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
		vec3 o = hash3( p + g );
		vec2 r = g - f + o.xy;
		float d = sqrt(dot(r,r));
        float ripple = max(
                            mix(
                                smoothstep(
                                    0.99,
                                    0.999,
                                    max(cos(d - uTime * 2. + (o.x + o.y) * 5.0), 0.)
                                )
                                , 0.
                                , d
                            ),
                             0.
                        );
        va += ripple;
    }
	
    return va;
}

void main(){

    vec3 strength = uDepthColor;

    float f = noise(vec2(uMIDI.y / 10.)*vUv); 
	vec3 normal = vec3(-dFdx(f), -dFdy(f), 0.5) + .5;
    vec3 color = mix(uDepthColor, uSurfaceColor, normal.y);
    strength += color;
	gl_FragColor = vec4( strength, 1.0 );
}