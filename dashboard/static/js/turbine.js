// Babylon.js 초기화
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// 카메라 설정
const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI /0.65, // Alpha: 수평 각도
    Math.PI / 1.8, // Beta: 수직 각도
    50,          // Radius: 카메라와 타겟 사이 거리
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


/////////////////////////////////////////////////////////
// 풍력 발전기 주위를 도는 카메라 애니메이션 설정(드론샷 느낌)
// const alphaAnimation = new BABYLON.Animation( //알파애니메이션은 수평 회전 각도 조정
//     "alphaAnimation",
//     "alpha",
//     24, // FPS
//     BABYLON.Animation.ANIMATIONTYPE_FLOAT,
//     BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
// );

// const betaAnimation = new BABYLON.Animation( //베타애니메이션은 수직 각도 조정
//     "betaAnimation",
//     "beta",
//     24, // FPS
//     BABYLON.Animation.ANIMATIONTYPE_FLOAT,
//     BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT // 고정된 수직 각도
// );

// // 애니메이션 키프레임 설정
// const alphaKeys = [
//     { frame: 0, value: Math.PI / 0.65 }, // 초기 각도
//     { frame: 1200, value: Math.PI * 2 + Math.PI / 0.65 } // 360도 회전
// ];

// const betaKeys = [
//     { frame: 0, value: Math.PI / 3.0 }, // 초기 수직 각도
//     { frame: 1200, value: Math.PI / 3.0 }, // 조금 아래로 이동
//     // { frame: 1800, value: Math.PI / 3.0 }, // 원래 위치로 복귀
// ];
// alphaAnimation.setKeys(alphaKeys);
// betaAnimation.setKeys(betaKeys);

// // 카메라에 애니메이션 적용
// camera.animations.push(alphaAnimation);
// camera.animations.push(betaAnimation);

// // 애니메이션 시작 (프레임 수 증가로 더 천천히 회전)
// scene.beginAnimation(camera, 0, 1200, true);

// S자 커브를 위한 알파 애니메이션
const alphaAnimation = new BABYLON.Animation(
    "alphaAnimation",
    "alpha",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

// S자 커브를 위한 베타 애니메이션
const betaAnimation = new BABYLON.Animation(
    "betaAnimation",
    "beta",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

// 거리 변화(근접/멀어짐)를 위한 반경 애니메이션
const radiusAnimation = new BABYLON.Animation(
    "radiusAnimation",
    "radius",
    24, // FPS
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
);

// 알파 애니메이션 키프레임 (좌우로 이동하며 S자 형태)
const alphaKeys = [
    { frame: 0, value: -2 }, // 시작 각도
    { frame: 400, value: -Math.PI / 2 }, // S자 커브의 첫번째 방향
    { frame: 700, value: -Math.PI }, // 반대 방향으로 커브
    { frame: 1600, value: (3 * Math.PI) / 2 }, // 다시 첫 방향
    { frame: 2000, value: 2 * Math.PI }, // 초기 위치로 돌아옴
];

// 베타 애니메이션 키프레임 (상하로 약간 움직이며 흔들림 효과)
const betaKeys = [
    { frame: 0, value: Math.PI / 3 }, // 기본 각도
    { frame: 400, value: Math.PI / 2.8 }, // 약간 위로
    { frame: 700, value: Math.PI / 3.2 }, // 약간 아래로
    { frame: 1600, value: Math.PI / 2.8 }, // 다시 위로
    { frame: 2000, value: Math.PI / 3 }, // 초기 각도로 복귀
];

// 반경 애니메이션 키프레임 (근접/멀어짐 효과)
const radiusKeys = [
    { frame: 0, value: 50 }, // 멀리 있음
    { frame: 400, value: 20 }, // 타겟에 가까워짐
    { frame: 700, value: 30 }, // 다시 약간 멀어짐
    { frame: 1600, value: 35 }, // 더 멀어짐
    { frame: 2000, value: 50 }, // 초기 거리로 복귀
];

// 키프레임 설정
alphaAnimation.setKeys(alphaKeys);
betaAnimation.setKeys(betaKeys);
radiusAnimation.setKeys(radiusKeys);

// 카메라에 애니메이션 추가
camera.animations.push(alphaAnimation);
camera.animations.push(betaAnimation);
camera.animations.push(radiusAnimation);

// 애니메이션 시작
scene.beginAnimation(camera, 0, 1200, true);


// 하늘색 설정 (제주도 하늘색과 바다색의 조화)
scene.clearColor = new BABYLON.Color4(0.5, 0.8, 0.9, 1.0); // 밝은 하늘색

// 언덕 지형 생성
const hill = BABYLON.MeshBuilder.CreateGround("hill", {
    width: 200,
    height: 50,
    subdivisions: 32,
    updatable: true
}, scene);

// 언덕 높낮이 설정 (낮게 조정)
const hillPositions = hill.getVerticesData(BABYLON.VertexBuffer.PositionKind);
const updatedPositions = hillPositions.map((pos, index) => {
    if (index % 3 === 1) { // y축
        return Math.sin(hillPositions[index - 1] * 0.3) * Math.cos(hillPositions[index + 1] * 0.3) * 1.0;
    }
    return pos;
});
hill.updateVerticesData(BABYLON.VertexBuffer.PositionKind, updatedPositions);

// 바닥 언덕 머티리얼 설정 (텍스처 적용)
const grassMaterial = new BABYLON.StandardMaterial("grassMaterial", scene);
grassMaterial.diffuseTexture = new BABYLON.Texture(
    "/static/models/grassland.jpg", // 상대 경로
    scene
);
grassMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // 반사광 제거
hill.material = grassMaterial; 

// 발전기 위치 배열 (학익진 배열)
const turbineFixedPositions = [
    new BABYLON.Vector3(0, 0, 0), // 중심
    new BABYLON.Vector3(-7, 2, -5), // 좌측 날개 첫번째 줄
    new BABYLON.Vector3(-14, 2, -10), // 좌측 날개 두번째 줄
    new BABYLON.Vector3(-21, 2, -15), // 좌측 날개 끝
    
    new BABYLON.Vector3(7, 2, -5), // 우측 날개 첫번째 줄
    new BABYLON.Vector3(14, 2, -10), // 우측 날개 두번째 줄
    new BABYLON.Vector3(21, 2, -15), // 우측 날개 끝
    
    new BABYLON.Vector3(-3, 0, 10), // 좌측 뒤쪽
    new BABYLON.Vector3(3, 0, 10) // 우측 뒤쪽
];
   
// 풍력발전기 다수 배치
BABYLON.SceneLoader.Append("/static/models/", "scene.gltf", scene, () => {
    console.log("3D 모델 로드 완료");

    // 풍력발전기 복제 및 배치
    const rootMesh = scene.meshes.find(mesh => mesh.name === "__root__");
    if (rootMesh) {
        rootMesh.scaling = new BABYLON.Vector3(4, 4, 4); // 모델 크기 조정
        rootMesh.position = new BABYLON.Vector3(0, 0, 0); // 중심 위치

        // 고정된 위치에 풍력 발전기 배치
        turbineFixedPositions.forEach((position, index) => {
            const clone = rootMesh.clone(`turbine_${index}`);
            clone.position = position;
          
           // 3D 간판 스타일 태그 표시 추가
           const tagMesh = BABYLON.MeshBuilder.CreatePlane(`tag_${index}`, { width: 2, height: 1 }, scene); // 2:1 비율
           tagMesh.position = new BABYLON.Vector3(position.x, position.y + 4, position.z);

           const tagMaterial = new BABYLON.StandardMaterial(`tagMaterial_${index}`, scene);
           tagMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // 흰색
           tagMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // 빛나는 효과
           tagMaterial.backFaceCulling = false; // 양면 렌더링

           const dynamicTexture = new BABYLON.DynamicTexture(`dynamicTexture_${index}`, { width: 512, height: 256 }, scene);
           dynamicTexture.hasAlpha = true; // 배경 투명 설정
           dynamicTexture.drawText(
               `A-${index + 1}`,
               null,
               128,
               "bold 96px Arial",
               "white",
               "transparent" // 배경을 제거 (투명하게 설정)
           );

           tagMaterial.diffuseTexture = dynamicTexture;
           tagMesh.material = tagMaterial;


           // 태그가 항상 카메라를 향하도록 설정
           scene.registerBeforeRender(() => {
               tagMesh.lookAt(camera.position);
               tagMesh.rotation.y += Math.PI; // Y축 180도 회전 보정
           });
        });
    } else {
        console.eror("Root mesh를 찾을 수 없습니다.");
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
    diameter: 600.0, // 스카이돔 크기
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
skydomeMaterial.diffuseTexture.uScale = 0.5; // 가로 타일링 조정
skydomeMaterial.diffuseTexture.vScale = 0.5; // 세로 타일링 조정
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


// 드론샷 카메라 설정 (일반 모드 및 특수 모드 A-1~A-9)
const modeSelect = document.getElementById("modeSelect");
const turbineSelect = document.getElementById("turbineSelect");

modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "special") {
        turbineSelect.style.display = "inline";
    } else {
        turbineSelect.style.display = "none";
        resetCameraToNormal(); // 일반 모드 카메라 리셋
    }
});

turbineSelect.addEventListener("change", () => {
    if (modeSelect.value === "special") {
        const selectedTurbine = turbineSelect.value;
        focusOnTurbine(selectedTurbine);
    }
});

// 일반 모드 카메라 초기화 함수
function resetCameraToNormal() {
    scene.beginAnimation(camera, 0, 1200, true); // 일반 모드 애니메이션 유지
}

// 특정 터빈으로 카메라 이동
function focusOnTurbine(turbineId) {
    // 선택된 풍력발전기 좌표 가져오기
    const turbineIndex = parseInt(turbineId.split("-")[1]) - 1;
    const targetPosition = turbineFixedPositions[turbineIndex];

    // 드론샷 애니메이션 설정
    scene.stopAnimation(camera); // 기존 카메라 애니메이션 중지
    BABYLON.Animation.CreateAndStartAnimation(
        "cameraMove", camera, "position",
        24, 48, // 2초간 진행
        camera.position, new BABYLON.Vector3(targetPosition.x, targetPosition.y + 5, targetPosition.z - 15), // 타겟 근처 위치
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
        "cameraLook", camera, "target",
        24, 48, // 2초간 진행
        camera.target, targetPosition, // 타겟을 바라보도록 설정
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
}

//////////////////////////////////////////////////////////////////////////
// // GUI 추가
// const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

// // 패널 생성
// const infoPanel = new BABYLON.GUI.Rectangle();
// infoPanel.width = "300px"; // 패널 크기
// infoPanel.height = "120px"; // 패널 높이
// infoPanel.cornerRadius = 5; // 둥근 모서리
// infoPanel.color = "white"; // 테두리 색상
// infoPanel.background = "rgba(0, 0, 0, 0.3)"; // 배경색 및 투명도(red,green,blue,alpha(투명도))
// infoPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP; // 상단 정렬
// infoPanel.top = "10px"; // 상단에서 20px 띄움
// advancedTexture.addControl(infoPanel); // 화면에 추가

// // 텍스트 추가
// const title = new BABYLON.GUI.TextBlock();
// title.text = "실시간 풍력발전량 정보"; // 제목
// title.color = "white"; // 글자 색상
// title.fontSize = 16; // 글자 크기
// title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // 가운데 정렬
// title.top = "-35px"; // 위쪽 여백
// infoPanel.addControl(title); // 패널에 추가

// // 풍력발전기 세부 정보
// const turbineInfo = new BABYLON.GUI.TextBlock();
// turbineInfo.text = `터빈회전속도: 120 RPM\n 발전량: 1.5 MW\n 운행상태: 작동중`; // 표시할 정보
// turbineInfo.color = "white"; // 글자 색상
// turbineInfo.fontSize = 12; // 글자 크기
// turbineInfo.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // 가운데 정렬
// turbineInfo.paddingTop = "25px"; // 위쪽 여백
// infoPanel.addControl(turbineInfo); // 패널에 추가

// // 정보 업데이트 함수 (속도와 출력 동적 업데이트)
// function updateTurbineInfo(speed, power, status) {
//     turbineInfo.text = `터빈회전속도: ${speed} RPM\n 발전량: ${power} MW\n 작동상태: ${status}`;
// }

// // 예제: 10초마다 정보 업데이트
// setInterval(() => {
//     const randomSpeed = Math.floor(Math.random() * 200) + 50; // 랜덤 속도
//     const randomPower = (Math.random() * 2 + 0.5).toFixed(2); // 랜덤 출력
//     const status = randomSpeed > 200 ? "고속" : "정속"; // 상태
//     updateTurbineInfo(randomSpeed, randomPower, status);
// }, 10000);

//////////////////////////////////////////////////////////////////////////
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
        animationGroup.speedRatio = 0.2; // 기본 속도

        console.log("Initial Speed Ratio:", animationGroup.speedRatio);

        // 테스트용: 5초 후 속도 조절
        setTimeout(() => {
            animationGroup.speedRatio = 1.8; // 속도 변경
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