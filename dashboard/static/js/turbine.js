// Babylon.js 초기화 코드 수정
const canvas = document.getElementById("renderCanvas"); // 캔버스 가져오기

if (!canvas) {
    console.error("Canvas not found!");
}

const engine = new BABYLON.Engine(canvas, true); // 엔진 생성
let scene;

try {
    scene = new BABYLON.Scene(engine); // 장면 생성
} catch (error) {
    console.error("Scene creation failed:", error);
}

// 카메라 및 조명 추가
const camera = new BABYLON.ArcRotateCamera(
    "Camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    BABYLON.Vector3.Zero(),
    scene
);
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0),
    scene
);
light.intensity = 0.7;

// 애니메이션 루프
engine.runRenderLoop(() => {
    if (scene) {
        scene.render();
    }
});

// 창 크기 조정 처리
window.addEventListener("resize", () => {
    engine.resize();
});
