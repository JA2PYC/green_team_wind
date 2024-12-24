// Babylon.js 초기화
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 카메라 설정
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10, new BABYLON.Vector3(0, 2, 0), scene);
camera.attachControl(canvas, true);

// 조명 추가
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 1.2;

// GLTF 모델 로드
BABYLON.SceneLoader.Append("/static/models/", "scene.gltf", scene, function () {
    console.log("3D 모델 로드 완료");

    // 블레이드 애니메이션 추가
    const blades = scene.meshes.filter(mesh => mesh.name.toLowerCase().includes("blade"));
    scene.registerBeforeRender(() => {
        blades.forEach(blade => {
            blade.rotation.y += 0.05; // Y축 회전
        });
    });
}, function (progress) {
    console.log(`로딩 진행률: ${Math.floor((progress.loaded / progress.total) * 100)}%`);
}, function (error) {
    console.error("3D 모델 로드 오류:", error.message || error);
});

// 창 크기 변경 처리
window.addEventListener("resize", () => {
    engine.resize();
});

// 렌더링 루프
engine.runRenderLoop(() => {
    scene.render();
});
