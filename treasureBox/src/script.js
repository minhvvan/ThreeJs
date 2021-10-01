import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'

//NOTE Spector
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

//NOTE Debug
const debudObject = {}

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)




//Texture
const topTexture = textureLoader.load('topBake.jpg')
topTexture.flipY = false
topTexture.encoding = THREE.sRGBEncoding

const bottomTexture = textureLoader.load('bottomBake.jpg')
bottomTexture.flipY = false
bottomTexture.encoding = THREE.sRGBEncoding

const topMaterial = new THREE.MeshBasicMaterial({map: topTexture})
const bottomMaterial = new THREE.MeshBasicMaterial({map: bottomTexture})



//Model
let topMesh
let action1
let mixer
gltfLoader.load(
    'treasureBox.glb',
    (gltf) => {
        console.log(gltf.scene.children);

        topMesh = gltf.scene.children.find((child) => child.name === 'Top')
        console.log(topMesh.children);
        topMesh.traverse((chlid) => {
            chlid.material = topMaterial
        })

        const bottomMesh = gltf.scene.children.find((child) => child.name === 'Bottom')

        bottomMesh.traverse((chlid) => {
            chlid.material = bottomMaterial
        })



        mixer = new THREE.AnimationMixer(gltf.scene);
        const clip1 = gltf.animations[0];
        action1 = mixer.clipAction(clip1);
        action1.clampWhenFinished = true
        action1.setLoop(THREE.LoopOnce)
        scene.add(gltf.scene)
        console.log(scene.children);
    }
)


//NOTE Fireflies
//geo
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) *4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() -0.5) *4
    
    scaleArray[i] = Math.random()
}
firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

//Meterial
const firefliesMaterial = new THREE.ShaderMaterial({
    uniforms:{
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
        uTime: { value: 0 }
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    transparent: true
})
gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name("firefliesSize")

//Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial) 
// scene.add(fireflies)


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

    //Update fireflies
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

//NOTE raycast
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


window.addEventListener( 'mousemove', onMouseMove, false );



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

debudObject.clearColor = '#2a2a2d'
renderer.setClearColor(debudObject.clearColor)
gui.addColor(debudObject,'clearColor').onChange( () => {
    renderer.setClearColor(debudObject.clearColor)
})


let open = false
//NOTE onclick
renderer.domElement.addEventListener("click", () => {
    if(intersects.length > 0 && intersects[0].object.type === 'Mesh'){
        if(open){
            open = false
        }else{
            open = true
            action1.play();
        }
        console.log(`open: ${open}`);
    }


});


/**
 * Animate
 */
const clock = new THREE.Clock()
let intersects
const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()
    let dt = clock.getDelta()

    //Update shader
    // firefliesMaterial.uniforms.uTime.value = elapsedTime

    //raycaster
    if(topMesh){
	    raycaster.setFromCamera( mouse, camera );

        intersects = raycaster.intersectObjects(scene.children, true)

    }

    //animation
    if(mixer){
        mixer.update(dt);
    }


	renderer.render( scene, camera );

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()