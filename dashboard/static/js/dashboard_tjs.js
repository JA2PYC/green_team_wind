import { GLTFLoader } from 'https://unpkg.com/three@0.141.0/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'https://unpkg.com/three@0.141.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.141.0/examples/jsm/controls/OrbitControls.js';

let scene = new THREE.Scene();
let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#dashboard_tjs')
});

// Set the background color to white
scene.background = new THREE.Color(0xffffff);

// Set canvas size to match window size
renderer.setSize(window.innerWidth, window.innerHeight);

// Create camera
let camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

// Lighting setup
let ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

// Add OrbitControls
let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Load the GLTF model
let loader = new GLTFLoader();
let mixer;

loader.load('/static/models/wind_turbine/scene.gltf', function (gltf) {
    const turbineModel = gltf.scene;
    scene.add(turbineModel);

    // Center the model
    let box = new THREE.Box3().setFromObject(turbineModel);
    let center = box.getCenter(new THREE.Vector3());
    turbineModel.position.sub(center);

    // Animation mixer
    mixer = new THREE.AnimationMixer(turbineModel);
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
    });
});

// Window resize handling
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(0.03);
    controls.update();
    renderer.render(scene, camera);
}

animate();
