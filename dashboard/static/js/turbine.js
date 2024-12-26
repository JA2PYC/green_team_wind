// Babylon.js 초기화
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 카메라 설정
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI /30, // Alpha: 수평 각도
    Math.PI / 2, // Beta: 수직 각도
    8,          // Radius: 카메라와 타겟 사이 거리
    new BABYLON.Vector3(0.1, 2, 0.1), // 타겟 위치
    scene
);
camera.attachControl(canvas, true);

// 카메라 초기 값 출력
console.log("카메라 초기 설정 값:");
console.log(`Alpha: ${camera.alpha}`);
console.log(`Beta: ${camera.beta}`);
console.log(`Radius: ${camera.radius}`);
console.log(`Target: ${camera.target}`);

// 조명 추가
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 3, 0), scene);
light.intensity = 1.2;



// GLTF 모델 로드
BABYLON.SceneLoader.Append("/static/models/", "scene.gltf", scene, () => {
    console.log("3D 모델 로드 완료");

    // 모델 스케일 조정
    const rootMesh = scene.meshes.find(mesh => mesh.name === "__root__");
    if (rootMesh) {
        rootMesh.scaling = new BABYLON.Vector3(4, 4, 4); // 모델 크기 조정
        console.log(rootMesh.scaling)
        rootMesh.position = new BABYLON.Vector3(0, 0, 0); // 모델 중심 위치
    }

    // Animation Group 확인
    const animationGroup = scene.animationGroups.find(
        group => group.name === "idle_with_cross_section"
    );

    if (animationGroup) {
        console.log(`Animation Group Found: ${animationGroup.name}`);

        // Animation Group 시작 및 초기 속도 설정
        animationGroup.start(true);
        animationGroup.speedRatio = 1.0; // 기본 속도

        console.log("Initial Speed Ratio:", animationGroup.speedRatio);

        // 테스트용: 5초 후 속도 조절
        setTimeout(() => {
            animationGroup.speedRatio = 5.0; // 속도 변경
            console.log("Animation Speed Changed to:", animationGroup.speedRatio);
        }, 5000);
    } else {
        console.error("Animation Group 'idle_with_cross_section'를 찾을 수 없습니다.");
    }
}, progress => {
    console.log(`로딩 진행률: ${Math.floor((progress.loaded / progress.total) * 100)}%`);
}, error => {
    console.error("3D 모델 로드 오류:", error.message || error);
});

// 창 크기 변경 이벤트 처리
window.addEventListener("resize", () => {
    engine.resize();
});

// 렌더링 루프
engine.runRenderLoop(() => {
    scene.render();
});
