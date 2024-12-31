// Babylon.js 초기화
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 카메라 설정
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 0.65, // Alpha: 수평 각도
    Math.PI / 1.8,  // Beta: 수직 각도
    50,             // Radius: 카메라와 타겟 사이 거리
    new BABYLON.Vector3(0, 1.8, 0), // 타겟 위치
    scene
);
camera.attachControl(canvas, true);
camera.fov = 0.8;  // 시야각 증가
camera.minZ = 1;   // 최소 클리핑 거리
camera.maxZ = 500; // 최대 클리핑 거리

// 조명 설정
const spotLight = new BABYLON.SpotLight(
    "spotLight",
    new BABYLON.Vector3(0, 50, 50),
    new BABYLON.Vector3(0, -1, -1),
    Math.PI / 3, // 스포트라이트의 조사각
    2,
    scene
);
spotLight.intensity = 5.0; // 조명 강도

const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 3, 0), scene);
light.intensity = 0.8; // 배경 조명 강도

// 애니메이션 설정
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
const radiusAnimation = new BABYLON.Animation(
    "radiusAnimation",
    "radius",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

// 애니메이션 키프레임 설정
const alphaKeys = [
    { frame: 0, value: -2 },
    { frame: 400, value: -Math.PI / 2 },
    { frame: 700, value: -Math.PI },
    { frame: 1600, value: (3 * Math.PI) / 2 },
    { frame: 2000, value: 2 * Math.PI },
];
const betaKeys = [
    { frame: 0, value: Math.PI / 3 },
    { frame: 400, value: Math.PI / 2.8 },
    { frame: 700, value: Math.PI / 3.2 },
    { frame: 1600, value: Math.PI / 2.8 },
    { frame: 2000, value: Math.PI / 3 },
];
const radiusKeys = [
    { frame: 0, value: 50 },
    { frame: 400, value: 20 },
    { frame: 700, value: 30 },
    { frame: 1600, value: 35 },
    { frame: 2000, value: 50 },
];

// 애니메이션 키프레임 설정
alphaAnimation.setKeys(alphaKeys);
betaAnimation.setKeys(betaKeys);
radiusAnimation.setKeys(radiusKeys);

// 카메라 애니메이션 추가
camera.animations.push(alphaAnimation);
camera.animations.push(betaAnimation);
camera.animations.push(radiusAnimation);

// 애니메이션 시작
scene.beginAnimation(camera, 0, 1200, true);

// 배경 하늘색 설정
scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.9, 1.0); // 하늘색

// 언덕 생성 및 텍스처 적용
const hill = BABYLON.MeshBuilder.CreateGround("hill", {
    width: 50,
    height: 50,
    subdivisions: 32
}, scene);

// 언덕 높낮이 설정
const hillPositions = hill.getVerticesData(BABYLON.VertexBuffer.PositionKind);
const updatedPositions = hillPositions.map((pos, index) => {
    if (index % 3 === 1) {
        return Math.sin(hillPositions[index - 1] * 0.3) * Math.cos(hillPositions[index + 1] * 0.3) * 1.0;
    }
    return pos;
});
hill.updateVerticesData(BABYLON.VertexBuffer.PositionKind, updatedPositions);

// 언덕 머티리얼 설정
const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
grassMaterial.diffuseTexture = new BABYLON.Texture("/static/models/grassland.jpg", scene);
grassMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // 반사광 제거
hill.material = grassMaterial;

// 발전기 위치 배열
const turbineFixedPositions = [
    new BABYLON.Vector3(0, 0, 0), 
    new BABYLON.Vector3(-7, 2, -5),
    new BABYLON.Vector3(-14, 2, -10),
    new BABYLON.Vector3(-21, 2, -15),
    new BABYLON.Vector3(7, 1, -5),
    new BABYLON.Vector3(14, 2, -10),
    new BABYLON.Vector3(21, 2, -15),
    new BABYLON.Vector3(-3, 0, 10),
    new BABYLON.Vector3(3, 0, 10)
];

// 풍력발전기 3D 모델 로드 및 배치
BABYLON.SceneLoader.Append("/static/models/", "scene.gltf", scene, () => {
    console.log("3D 모델 로드 완료");

    const rootMesh = scene.meshes.find(mesh => mesh.name === "__root__");
    if (rootMesh) {
        rootMesh.scaling = new BABYLON.Vector3(4, 4, 4); // 모델 크기 조정
        rootMesh.position = new BABYLON.Vector3(0, 0, 0); // 중심 위치

        // 고정된 위치에 풍력 발전기 배치
        turbineFixedPositions.forEach((position, index) => {
            const clone = rootMesh.clone(`turbine_${index}`);
            clone.position = position;

            // 3D 간판 스타일 태그 표시 추가
            const tagMesh = BABYLON.MeshBuilder.CreatePlane(`tag_${index}`, { width: 2, height: 1 }, scene);
            tagMesh.position = new BABYLON.Vector3(position.x, position.y + 4, position.z);
            const tagMaterial = new BABYLON.StandardMaterial(`tagMaterial_${index}`, scene);
            tagMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 흰색
            tagMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // 빛나는 효과
            tagMaterial.backFaceCulling = false;

            const dynamicTexture = new BABYLON.DynamicTexture(`dynamicTexture_${index}`, { width: 512, height: 256 }, scene);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(`A-${index + 1}`, null, 128, "bold 96px Arial", "white", "transparent");

            tagMaterial.diffuseTexture = dynamicTexture;
            tagMesh.material = tagMaterial;

            // 태그가 항상 카메라를 향하도록 설정
            scene.registerBeforeRender(() => {
                tagMesh.lookAt(camera.position);
                tagMesh.rotation.y += Math.PI; // Y축 180도 회전 보정
            });
        });
    } else {
        console.error("Root mesh를 찾을 수 없습니다.");
    }
});

// 풍력 터빈 배경 조명 효과
const directionalLight = new BABYLON.DirectionalLight(
    "DirectionalLight",
    new BABYLON.Vector3(0, -0.8, -1),
    scene
);
directionalLight.intensity = 20.0;

// 스카이돔 생성
const skydome = BABYLON.MeshBuilder.CreateSphere("skyDome", {
    diameter: 300.0, // 스카이돔 크기
    segments: 32
}, scene);

// 스카이돔 머티리얼 설정
const skydomeMaterial = new BABYLON.StandardMaterial("skyDomeMaterial", scene);
skydomeMaterial.backFaceCulling = false;
skydomeMaterial.diffuseTexture = new BABYLON.Texture("/static/models/sky.jpg", scene);
skydomeMaterial.emissiveColor = new BABYLON.Color3(0.5, 0.7, 0.9); // 밝기 조정
skydome.material = skydomeMaterial;

// 스카이돔 위치 설정
skydome.position = new BABYLON.Vector3(0, 0, 0);

// 구름 애니메이션
scene.registerBeforeRender(() => {
    if (skydomeMaterial.diffuseTexture) {
        skydomeMaterial.diffuseTexture.uOffset += 0.0001; // 수평 이동
        skydomeMaterial.diffuseTexture.vOffset += 0.00005; // 수직 이동
    }
});

// GUI 추가
const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

// 패널 설정
const infoPanel = new BABYLON.GUI.Rectangle();
infoPanel.width = "300px";
infoPanel.height = "120px";
infoPanel.cornerRadius = 5;
infoPanel.color = "white";
infoPanel.background = "rgba(0, 0, 0, 0.3)";
infoPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
infoPanel.top = "10px";
advancedTexture.addControl(infoPanel);

// 타이틀 정보
const title = new BABYLON.GUI.TextBlock();
title.text = "실시간 풍력발전량 정보";
title.color = "white";
title.fontSize = 16;
title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
title.top = "-35px";
infoPanel.addControl(title);

// 정보 텍스트 추가
const turbineInfo = new BABYLON.GUI.TextBlock();
turbineInfo.text = ""; // 초기 텍스트
turbineInfo.color = "white";
turbineInfo.fontSize = 12;
turbineInfo.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
turbineInfo.paddingTop = "25px";
infoPanel.addControl(turbineInfo);

// 풍력 발전기의 초기 상태 정보
const turbines = [
    { id: "A-1", speed: 120, power: 1.5, status: "작동중" },
    { id: "A-2", speed: 100, power: 1.2, status: "작동중" },
    { id: "A-3", speed: 150, power: 2.0, status: "고속" },
    { id: "A-4", speed: 180, power: 2.5, status: "고속" },
    { id: "A-5", speed: 90, power: 1.0, status: "작동중" },
    { id: "A-6", speed: 200, power: 3.0, status: "고속" },
    { id: "A-7", speed: 110, power: 1.3, status: "작동중" },
    { id: "A-8", speed: 140, power: 1.8, status: "작동중" },
    { id: "A-9", speed: 160, power: 2.2, status: "고속" }
];

// 현재 표시 중인 발전기 인덱스
let currentIndex = 0;

// 패널 업데이트 함수
function updateTurbineInfo(index) {
    const turbine = turbines[index];
    turbineInfo.text = `터빈 ID: ${turbine.id}\n터빈 회전 속도: ${turbine.speed} RPM\n발전량: ${turbine.power} MW\n운행 상태: ${turbine.status}`;
}

// 초기 정보 표시
updateTurbineInfo(currentIndex);

// 5초 간격으로 패널 변경
setInterval(() => {
    currentIndex = (currentIndex + 1) % turbines.length; // 순환하여 인덱스 변경
    updateTurbineInfo(currentIndex);
}, 5000);


// 창 크기 변경 이벤트 처리
window.addEventListener("resize", () => {
    engine.resize();
});

// 렌더링 루프
engine.runRenderLoop(() => {
    scene.render();
});
