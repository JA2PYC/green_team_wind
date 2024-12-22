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
let windSpeed = 0;

// 풍속 데이터 가져오기
const fetchWindSpeed = async () => {
    try {
        const response = await fetch('/get_wind_speed');
        const data = await response.json();
        if (data.wind_speed) {
            windSpeed = data.wind_speed;
            document.getElementById('windSpeed').textContent = windSpeed;
        } else {
            console.error('Error fetching wind speed:', data.error);
        }
    } catch (error) {
        console.error('Error fetching wind speed:', error);
    }
};

// 풍속에 따라 블레이드 애니메이션 속도 조정
const animateBlade = (blade) => {
    blade.rotation.y += windSpeed * 0.01; // 풍속에 따라 회전 속도 조정
};

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

        const blade = object; // 회전 애니메이션 적용 대상
        const animate = () => {
            requestAnimationFrame(animate);
            animateBlade(blade); // 블레이드 회전
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
    });
});

// 데이터 갱신 주기적으로 호출
setInterval(fetchWindSpeed, 10000); // 10초마다 풍속 데이터 업데이트