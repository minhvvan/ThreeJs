import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect'
import * as dat from 'dat.gui'


//NOTE Fonts


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()



/**
 * Object
*/

const gltfLoader = new GLTFLoader()
gltfLoader.load('model/scene.gltf',(gltf) => {
    scene.add(gltf.scene)
})



//Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 3
// camera.position.y = 2
camera.position.z = 2.5
scene.add(camera)



/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//NOTE effect

const effect = new AsciiEffect( renderer, ' .sku|', { invert: true } );
effect.setSize( window.innerWidth, window.innerHeight );
effect.domElement.style.color = 'white';
effect.domElement.style.backgroundColor = 'black';

// Special case: append effect.domElement, instead of renderer.domElement.
// AsciiEffect creates a custom domElement (a div container) where the ASCII elements are placed.

document.body.appendChild( effect.domElement )

// Controls
const controls = new TrackballControls( camera, effect.domElement )


/**
 * Animate
 */
const clock = new THREE.Clock()


const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Animate
    // group.rotation.y = elapsedTime * .5


    // Update controls
    controls.update()

    // Render
    effect.render( scene, camera );
    
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()