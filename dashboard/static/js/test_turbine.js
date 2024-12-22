import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/loaders/MTLLoader.js';

// Three.js 기본 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 조명 추가
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7).normalize();
scene.add(light);

// 카메라 위치 설정
camera.position.z = 5;

// OrbitControls 추가
const controls = new OrbitControls(camera, renderer.domElement);

// 풍속 변수
let windSpeed = 1; // 기본 풍속 (초당 1 m)

// 풍속 표시 업데이트
const updateWindSpeedDisplay = () => {
    const windSpeedElement = document.createElement('div');
    windSpeedElement.style.position = 'absolute';
    windSpeedElement.style.top = '10px';
    windSpeedElement.style.left = '10px';
    windSpeedElement.style.color = '#333';
    windSpeedElement.innerHTML = `풍속: ${windSpeed} m/s`;
    document.body.appendChild(windSpeedElement);
};
updateWindSpeedDisplay();

// OBJ 및 MTL 파일 로드
const mtlLoader = new MTLLoader();
mtlLoader.load('/static/assets/windturbine.mtl', (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('/static/assets/windturbine.obj', (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        object.position.y = -1;
        scene.add(object);

        const animate = () => {
            requestAnimationFrame(animate);
            object.rotation.y += windSpeed * 0.01; // 풍속에 따라 회전
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    });

    let windSpeed = 1; // 기본값

// 풍속 데이터 업데이트
const fetchWindSpeed = async () => {
    try {
        const response = await fetch('/api/wind_speed');
        const data = await response.json();
        windSpeed = data.windSpeed;
        console.log(`Updated wind speed: ${windSpeed}`);
    } catch (error) {
        console.error("Error fetching wind speed:", error);
    }
};

// 초기화 시 풍속 데이터를 가져옵니다.
fetchWindSpeed();

const animate = () => {
    console.log("Animating..."); // 애니메이션 확인용 로그
    requestAnimationFrame(animate);
    object.rotation.y += windSpeed * 0.01; // 풍속에 따라 회전
    controls.update();
    renderer.render(scene, camera);
};
animate();

});
