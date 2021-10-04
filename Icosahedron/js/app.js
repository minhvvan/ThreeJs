import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import fragmentLine from "./shader/fragmentLine.glsl";
import * as dat from 'dat.gui';
import gsap from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { PostProcessing } from './postProcessing';


let OrbitControls = require("three-orbit-controls")(THREE);

import landscape from '../1.jpg';

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x111111, 1); 
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    // var frustumSize = 10;
    // var aspect = window.innerWidth / window.innerHeight;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    this.isPlaying = true;
    
    this.mouse = 0

    this.addObjects();
    this.mouseEvent();
    this.addPost();
    this.resize();
    this.render();
    this.setupResize();
    this.settings();
  }

  mouseEvent(){
    this.lastX = 0;
    this.lastY = 0;
    this.speed = 0;
    document.addEventListener('mousemove', (e) => {
      let result = Math.pow(e.pageX - this.lastX, 2)
      this.lastX = e.pageX
      result += Math.pow(e.pageY - this.lastY, 2)
      this.lastY = e.pageY
      this.speed = Math.sqrt(result) * 0.01

    })
  }

  addPost(){
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.customPass = new ShaderPass(PostProcessing)
    console.log(this.customPass);
    this.customPass.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight)
    this.customPass.uniforms["resolution"].value.multiplyScalar(window.devicePixelRatio)
    this.composer.addPass(this.customPass)
  }

  settings() {
    let that = this;
    this.settings = {
      rgbshiftValue: 0.03,
    };
    this.gui = new dat.GUI();
    this.gui.add(this.settings, "rgbshiftValue", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    let t =  new THREE.TextureLoader().load(landscape)
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        mouse: { type: "f", value: 0 },
        uLandscape: {value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        },
      },
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment
    });

    this.materialLine = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable"
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        mouse: { type: "f", value: 0 },
        uLandscape: {value: t},
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1)
        },
      },
      // transparent: true,
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragmentLine
    });

    this.geometry = new THREE.IcosahedronGeometry(1, 1);
    //NOTE line geo
    this.geometryLine = new THREE.IcosahedronBufferGeometry(1.001, 1);
    let length = this.geometryLine.attributes.position.array.length

    let bary = []
    for (let i = 0; i < length/3; i++) {
      bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0)
    }

    let aBary = new Float32Array(bary)
    this.geometryLine.setAttribute('aBary',new THREE.BufferAttribute(aBary, 3))



    

    this.ico = new THREE.Mesh(this.geometry, this.material);
    this.icoLines = new THREE.Mesh(this.geometryLine, this.materialLine);
    this.scene.add(this.ico);
    this.scene.add(this.icoLines);
  }

  stop() {
    this.isPlaying = false;
  }

  play() {
    if(!this.isPlaying){
      this.render()
      this.isPlaying = true;
    }
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.001;
    this.mouse -= (this.mouse - this.speed) * 0.05
    this.scene.rotation.x = this.time;
    this.scene.rotation.y = this.time;
    this.customPass.uniforms.time.value = this.time;
    this.customPass.uniforms.rgbshiftValue.value = this.mouse;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.mouse.value = this.mouse;
    this.materialLine.uniforms.time.value = this.time;
    this.materialLine.uniforms.mouse.value = this.mouse;
    requestAnimationFrame(this.render.bind(this));
    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}

new Sketch({
  dom: document.getElementById("container")
});
