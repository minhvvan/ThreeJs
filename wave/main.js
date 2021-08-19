import * as THREE from 'https://cdn.skypack.dev/three@0.131.3';
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap';

const gui = new dat.GUI()
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegment: 50,
        heightSegment: 50,
    },
    light: {
        r: 0,
        g: 0,
        b: 0

    }
}
gui.add(world.plane, 'width',1,500,1).onChange(generatePlane)
gui.add(world.plane, 'height',1,500,1).onChange(generatePlane)
gui.add(world.plane, 'widthSegment',1,100,1).onChange(generatePlane)
gui.add(world.plane, 'heightSegment',1,100,1).onChange(generatePlane)

function generatePlane() {
    plane.geometry.dispose()
    plane.geometry = new THREE.PlaneGeometry(
        world.plane.width, 
        world.plane.height, 
        world.plane.widthSegment, 
        world.plane.heightSegment)

    const {array} = plane.geometry.attributes.position


    //z값 랜덤하게 --> 올록볼록
    for (let index = 0; index < array.length; index+= 3) {
        const x = array[index]
        const y = array[index+1]
        const z = array[index+2]

        array[index+2] = z + Math.random()
    }

    plane.geometry.attributes.position.randomValues = randomValues
    plane.geometry.attributes.position.originalPosition = plane.geometry.attributes.position.array


    //생상 설정
    const colors = []
    for (let i = 0; i < plane.geometry.attributes.position.count; i++) {
        colors.push(0, 0.19, 0.4)
    }

    plane.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(colors),3))
}

//기본 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
const raycaster = new THREE.Raycaster()


renderer.setSize(innerWidth,innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)
const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegment,world.plane.heightSegment)
const planeMaterial =  new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true,
})
const plane = new THREE.Mesh(planeGeometry,planeMaterial)

const {array} = plane.geometry.attributes.position
const randomValues = []
for (let index = 0; index < array.length; index++) {
    if(index % 3 === 0){
        const x = array[index]
        const y = array[index+1]
        const z = array[index+2]
    
        array[index] = x + (Math.random() -0.5) * 11
        array[index + 1] = y + (Math.random() -0.5) * 30
        array[index+2] = z + (Math.random() -0.5) * 30
    }
    randomValues.push(Math.random())
}


console.log(plane.geometry.attributes.position);

generatePlane()


const light = new THREE.DirectionalLight(0xffffff, 1)
const lightBack = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 1, 1)
lightBack.position.set(0, -1,-1)

scene.add(light)
scene.add(lightBack)
scene.add(plane)

camera.position.z = 50;

renderer.render(scene, camera)

const mouse = {
    x: undefined,
    y: undefined
}

let frame = 0
function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
    frame += 0.01

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(plane)
    if( intersects.length > 0){
        // console.log(intersects);
        const {color} = intersects[0].object.geometry.attributes

        //red
        color.setX(intersects[0].face.a, 0.1)
        color.setX(intersects[0].face.b, 0.1)
        color.setX(intersects[0].face.c, 0.1)

        //green
        color.setY(intersects[0].face.a, 0.5)
        color.setY(intersects[0].face.b, 0.5)
        color.setY(intersects[0].face.c, 0.5)

        //blue
        color.setZ(intersects[0].face.a, 1)
        color.setZ(intersects[0].face.b, 1)
        color.setZ(intersects[0].face.c, 1)
        intersects[0].object.geometry.attributes.color.needsUpdate= true

        const initalColor = {
            r: 0,
            g: .19,
            b: .4,
        }
        const hoverColor = {
            r: 0.1,
            g: .5,
            b: 1,
        }
        gsap.to(hoverColor, {
            r: initalColor.r,
            g: initalColor.g,
            b: initalColor.b,
            onUpdate: () => {
                //red
                color.setX(intersects[0].face.a, hoverColor.r)
                color.setX(intersects[0].face.b, hoverColor.r)
                color.setX(intersects[0].face.c, hoverColor.r)

                //green
                color.setY(intersects[0].face.a, hoverColor.g)
                color.setY(intersects[0].face.b, hoverColor.g)
                color.setY(intersects[0].face.c, hoverColor.g)

                //blue
                color.setZ(intersects[0].face.a, hoverColor.b)
                color.setZ(intersects[0].face.b, hoverColor.b)
                color.setZ(intersects[0].face.c, hoverColor.b)
                color.needsUpdate = true
            }
        })
    }
    const {array, originalPosition,randomValues} = plane.geometry.attributes.position
    for (let i = 0; i < array.length; i+= 3) {
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.03
        array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.03

    }
    plane.geometry.attributes.position.needsUpdate = true
}

animate();

addEventListener('mousemove',(event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1

    // console.log(mouse);
})
