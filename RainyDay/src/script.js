import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'
import { DoubleSide, Vector2 } from 'three'




const level0Notes = [60, 61, 62, 63, 64, 65, 66, 67]; // middle C - G
const level1Notes = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72];
let noteIndex = 0;
let correctNotes = 0;

//MIDI
console.log(navigator.requestMIDIAccess);
if (navigator.requestMIDIAccess) {
    console.log('WebMIDI is supported in this browser.');
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
    console.log('WebMIDI is not supported in this browser.');
}

function onMIDISuccess(midiAccess) {
    
    let inputs = midiAccess.inputs;
    let outputs = midiAccess.outputs;

    console.log('connected');
    console.log(midiAccess);

    for (const input of inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure(args) {
    console.log(args);
}

function getMIDIMessage(message) {

    let command = message.data[0];
    let note = message.data[1];
    let velocity = message.data[2];

    switch (command) {
        case 144: // noteOn
            console.log(`${note}, ${velocity}`);
            waterMaterial.uniforms.uMIDI.value = new Vector2(note, velocity);
            noteOnListener(note);
            break;
    }
}

function noteOnListener(note) {
    /* check for special notes first */
    if (note >= 41 && note <=47) { // change bg color!
         var rainbow = ["#d10000", "#ff6622", "#ffda21", "#33dd00", "#1133cc", "#220066", "#330044"];
    } else {
        if (note == level1Notes[noteIndex]) {
            // document.querySelector('.accidental').classList.add('correct');
            // document.querySelector('#whole-note').classList.add('correct');
            // correctNotes++;
        } else {
            // document.querySelector('.accidental').classList.add('wrong');
            // document.querySelector("#whole-note").classList.add('wrong');
        }
        window.setTimeout(function(){
            if (noteIndex < level1Notes.length - 1) {
                // noteIndex++;
                // document.querySelector('.accidental').classList.remove('correct', 'wrong');
                // document.querySelector('#whole-note').classList.remove('correct', 'wrong');
                // document.querySelector('.note-info').textContent = '';
                // document.querySelector('.whole-note').classList.remove('note'+level1Notes[noteIndex-1]);
                // drawNote(level1Notes[noteIndex]);
            } else {
                // document.querySelector('.note-info').textContent = 'You played ' + correctNotes + ' out of ' + level1Notes.length + ' notes correctly.';
            }
        }, 1500); 
    }
 }
 

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })
const debugObject= {}
debugObject.depthColor = '#3737cf'
debugObject.surfaceColor = '#cae0ff'


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(10, 10, 512, 512)

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    side: DoubleSide,
    uniforms: {
        uTime: { value: 0 },

        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4.0 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.25 },
        uColorMultiplier: { value: 2 },

        uMIDI: { value: new Vector2(0, 0) }
    }
})

//NOTE gui 설정
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uBigWavesSpeed')
gui.addColor(debugObject, 'depthColor').onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
}).name('depthColor')
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
}).name('surfaceColor')
gui.add(waterMaterial.uniforms.uColorOffset, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value')
    .min(0)
    .max(10)
    .step(0.001)
    .name('uColorMultiplier')
gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value')
    .min(0)
    .max(30)
    .step(0.001)
    .name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
    .min(0)
    .max(4)
    .step(0.001)
    .name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallWavesIterations, 'value')
    .min(0)
    .max(5)
    .step(1)
    .name('uSmallWavesIterations')

gui.close()

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
// water.position.z -= -1
scene.add(water)

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
camera.position.set(0, 11, 0)
camera.lookAt(water.position)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update Time
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()