import * as THREE from './three/three.module.js';
import { GLTFLoader } from './three/GLTFLoader.js';
import { OrbitControls } from './three/OrbitControls.js';

$(document).ready(function () {
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#dashboard_tjs'),
    });

    // Set canvas size to match parent size
    const canvasParent = document.querySelector('.widget.powerGuage');
    renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);

    scene.background = new THREE.Color(0xffffff);

    let camera = new THREE.PerspectiveCamera(30, canvasParent.clientWidth / canvasParent.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Add lighting
    let ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);

    // OrbitControls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Load the GLTF model
    let loader = new GLTFLoader();
    let mixer;

    loader.load('/static/models/wind_turbine/scene.gltf', function (gltf) {
        const turbineModel = gltf.scene;
        scene.add(turbineModel);

        let box = new THREE.Box3().setFromObject(turbineModel);
        let center = box.getCenter(new THREE.Vector3());
        turbineModel.position.sub(center);

        mixer = new THREE.AnimationMixer(turbineModel);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    });

    window.addEventListener('resize', () => {
        renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
        camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
        camera.updateProjectionMatrix();
    });

    let clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        let delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
});
