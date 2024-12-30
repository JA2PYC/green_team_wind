// Babylon.js 초기화
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 카메라 설정
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI /0.65, // Alpha: 수평 각도
    Math.PI / 1.8, // Beta: 수직 각도
    30,          // Radius: 카메라와 타겟 사이 거리
    new BABYLON.Vector3(0, 1.8, 0), // 타겟 위치
    scene

);
const spotLight = new BABYLON.SpotLight(
    "spotLight",
    new BABYLON.Vector3(0, 50, 50),  // 높게 설정하여 하부를 비추도록 설정
    new BABYLON.Vector3(0, -1, -1), // 모델 중심을 향하도록 설정
    Math.PI / 3,
    2,
    scene
);
spotLight.intensity = 5.0; // 추가 조명 강도
camera.attachControl(canvas, true);
camera.fov = 0.8; // 시야각 증가 (작으면 가깝게 크면 멀리)
camera.minZ = 1;  // 최소 클리핑 거리 (가까운 물체를 표시)
camera.maxZ = 500;  // 최대 클리핑 거리 (멀리 있는 물체를 표시)

// 카메라 초기 값 출력
console.log("카메라 초기 설정 값:");
console.log(`Alpha: ${camera.alpha}`);
console.log(`Beta: ${camera.beta}`);
console.log(`Radius: ${camera.radius}`);
console.log(`Target: ${camera.target}`);

// 조명 추가
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 3, 0), scene);
light.intensity = 0.8;


/////////////////////////////////////////////
// 풍력 발전기 주위를 도는 카메라 애니메이션 설정
const alphaAnimation = new BABYLON.Animation(
    "alphaAnimation",
    "alpha",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

const betaAnimation = new BABYLON.Animation(
    "betaAnimation",
    "beta",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

// 애니메이션 키프레임 설정
const alphaKeys = [
    { frame: 0, value: Math.PI / 0.65 }, // 초기 각도
    { frame: 600, value: Math.PI * 1.8 }, // 360도 한 바퀴 회전
];

const betaKeys = [
    { frame: 0, value: Math.PI / 3.0 }, // 초기 수직 각도
    { frame: 300, value: Math.PI / 3.0 }, // 조금 아래로 이동
    { frame: 600, value: Math.PI / 2.0 }, // 원래 위치로 복귀
];

alphaAnimation.setKeys(alphaKeys);
betaAnimation.setKeys(betaKeys);

// 카메라에 애니메이션 적용
camera.animations.push(alphaAnimation);
camera.animations.push(betaAnimation);

// 애니메이션 시작
scene.beginAnimation(camera, 0, 600, true);

// 하늘색 설정 (제주도 하늘색과 바다색의 조화)
scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.9, 1.0); // 밝은 하늘색

// 언덕 지형 생성
const hill = BABYLON.MeshBuilder.CreateGround("hill", {
    width: 50,
    height: 50,
    subdivisions: 32,
    updatable: true
}, scene);

// 언덕 높낮이 설정 (낮게 조정)
const hillPositions = hill.getVerticesData(BABYLON.VertexBuffer.PositionKind);
for (let i = 0; i < hillPositions.length; i += 3) {
    const x = hillPositions[i];
    const z = hillPositions[i + 2];
    hillPositions[i + 1] = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.0; // 언덕 모양 낮춤
}
hill.updateVerticesData(BABYLON.VertexBuffer.PositionKind, hillPositions);

// 언덕 머티리얼 설정 (텍스처 적용)
const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
grassMaterial.diffuseTexture = new BABYLON.Texture(
    "/static/models/grassland.jpg", // 상대 경로
    scene
);
grassMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // 반사광 제거
hill.material = grassMaterial;

// 풍력발전기 다수 배치
BABYLON.SceneLoader.Append("/static/models/", "scene.gltf", scene, () => {
    console.log("3D 모델 로드 완료");

    // 풍력발전기 복제 및 배치
    const rootMesh = scene.meshes.find(mesh => mesh.name === "__root__");
    if (rootMesh) {
        rootMesh.scaling = new BABYLON.Vector3(4, 4, 4); // 모델 크기 조정
        rootMesh.position = new BABYLON.Vector3(0, 0, 0); // 중심 위치

        const turbinePositions = []; // 이미 사용된 위치 추적

        // 랜덤 위치 생성 함수 (중복 방지)
        function generateUniquePosition() {
            let x, z, y;
            let isUnique = false;

            while (!isUnique) {
                x = (Math.random() - 0.5) * 40; // 랜덤한 X 위치
                z = (Math.random() - 0.5) * 40; // 랜덤한 Z 위치
                y = Math.sin(x * 0.3) * Math.cos(z * 0.3) * 1.0; // 언덕 높이에 맞춤

              // 기존 좌표와 최소 거리 5m 초과 유지 및 앞뒤 위치 확인
              isUnique = turbinePositions.every(pos => {
                const distance = Math.sqrt((pos.x - x) ** 2 + (pos.z - z) ** 2);
                const direction = Math.abs(Math.atan2(pos.z - z, pos.x - x)); // 방향 계산
                return distance > 5 && (direction < Math.PI / 4 || direction > (3 * Math.PI) / 4);
            });
        }
            turbinePositions.push({ x, z }); // 위치 저장
            return new BABYLON.Vector3(x, y, z);
        }
        // 9개의 고유 위치에 복사본 생성
        for (let i = 0; i < 8; i++) {
            const clone = rootMesh.clone(`turbine_${i}`);
            clone.position = generateUniquePosition(); // 고유한 위치 할당
        }
    }
});

// 풍력 터빈 배경 조명 효과
const directionalLight = new BABYLON.DirectionalLight(
    "DirectionalLight",
    new BABYLON.Vector3(0, -0.8, -1),
    scene
);
directionalLight.intensity = 20.0;


//////////////////////////////////////////////////////////////////////////
// 스카이돔 생성
const skydome = BABYLON.MeshBuilder.CreateSphere("skyDome", {
    diameter: 300.0, // 스카이돔 크기
    segments: 32      // 세그먼트 수 (더 부드러운 구 모양)
}, scene);

// 스카이돔 머티리얼 설정
const skydomeMaterial = new BABYLON.StandardMaterial("skyDomeMaterial", scene);
skydomeMaterial.backFaceCulling = false; // 내부에서 보이도록 설정
skydomeMaterial.diffuseTexture = new BABYLON.Texture(
    "/static/models/sky.jpg", // 스카이돔 텍스처
    scene
);
skydomeMaterial.diffuseTexture.hasAlpha = true; // 투명도 활성화 (필요시)
skydomeMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // 반사광 제거
skydomeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.7, 0.9); // 밝기 조정 (하늘색과 통일)
skydome.material = skydomeMaterial;

// 스카이돔 위치 조정
skydome.position = new BABYLON.Vector3(0, 0, 0);

// 장면의 기본 하늘색 설정 (스카이돔과 동일한 색상)
scene.clearColor = new BABYLON.Color4(0.5, 0.7, 0.9, 1.0); // 스카이돔과 동일한 하늘색

// 구름 움직임 애니메이션
scene.registerBeforeRender(() => {
    if (skydomeMaterial.diffuseTexture) {
        skydomeMaterial.diffuseTexture.uOffset += 0.0001; // 수평 이동
        skydomeMaterial.diffuseTexture.vOffset += 0.00005; // 수직 이동
    }
});
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
        group => group.name === "idle"
    );

    if (animationGroup) {
        console.log(`Animation Group Found: ${animationGroup.name}`);

        // Animation Group 시작 및 초기 속도 설정
        animationGroup.start(true);
        animationGroup.speedRatio = 0.9; // 기본 속도

        console.log("Initial Speed Ratio:", animationGroup.speedRatio);

        // 테스트용: 5초 후 속도 조절
        setTimeout(() => {
            animationGroup.speedRatio = 3; // 속도 변경
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
