// 동적 스크립트 로드 함수
export function loadKakaoMapScript(apiKey) {
    return new Promise((resolve, reject) => {
        if (typeof kakao !== 'undefined' && kakao.maps) {
            // Kakao 지도 객체가 이미 로드된 경우
            console.log('Kakao Map object already loaded.');
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}`;
        script.async = true;
        script.onload = () => {
            if (typeof kakao !== 'undefined' && kakao.maps) {
                console.log('Kakao Map object loaded.');
                resolve();
            } else {
                reject(new Error('Kakao Map object not found after script load.'));
            }
        };
        script.onerror = () => {
            reject(new Error('Failed to load Kakao Map script.'));
        };
        document.head.appendChild(script);
    });

}

export function createMap(areas, modelData) {
    console.log('Initializing map...');
    let mapContainer = document.getElementById('kakaoMap');
    let mapOption = {
        center: new kakao.maps.LatLng(35.478764, 127.205678),
        level: 14
    };
    
    let map = new kakao.maps.Map(mapContainer, mapOption);
    
    setTimeout(() => {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(35.478764, 127.205678));
    }, 100);
    console.log("modelData.xgboost_ai_result:",modelData.xgboost_ai_result);
    modelData = modelData.xgboost_ai_result;

    // modelData에서 임의의 값을 추가
    const insertIndex = 16; // 원하는 위치 (예: 5번째 위치)
    const insertValue = '#e6d00e'; // 삽입할 값
    
    let fillcolor = [];
    modelData.forEach(data => {
        if (data > 100) {
            fillcolor.push('#bd7b00');
        }else{
            fillcolor.push('#e6d00e');
        }
    });
    fillcolor.splice(insertIndex, 0, insertValue); // 16번째 위치에 #e6d00e 추가
    console.log("fillcolor:",fillcolor);
    console.log("areas:",areas);

    // 폴리곤 도형을 지도 위에 표시
    areas.forEach((area, index) => {
        let polygon = new kakao.maps.Polygon({
            map: map,
            path: area.path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
            fillColor: fillcolor[index],
            fillOpacity: 0.7
        });

        // kakao.maps.event.addListener(polygon, 'mouseover', function () {
        //     polygon.setOptions({ fillColor: '#09f' });
        // });

        // kakao.maps.event.addListener(polygon, 'mouseout', function () {
        //     polygon.setOptions({ fillColor: '#a6c8ff' });
        // });
    });

    let infoclass = [];

    modelData.forEach((data, index) => {
        if (data > 100) {
            infoclass.push('info-big info-' + (index + 1));
        }else{
            infoclass.push('info-' + (index + 1));
        }
    });
    console.log("infoclass:",infoclass);

    let overLayData = [
        { position: new kakao.maps.LatLng(39.503721, 130.573150), title: '강원도', class: infoclass[0], size: (modelData[0] + 'MW'), target: new kakao.maps.LatLng(37.834661, 128.135235) },
        { position: new kakao.maps.LatLng(40.216966, 124.598909), title: '서울', class: infoclass[1], size: (modelData[1] + 'MW'), target: new kakao.maps.LatLng(37.566535, 126.9779692) },
        { position: new kakao.maps.LatLng(38.053582, 124.291336), title: '인천', class: infoclass[2], size: (modelData[2] + 'MW'), target: new kakao.maps.LatLng(37.454490, 126.708008) },
        { position: new kakao.maps.LatLng(38.064592, 121.177682), title: '경기도', class: infoclass[3], size: (modelData[3] + 'MW'), target: new kakao.maps.LatLng(37.401563, 127.507730) },
        { position: new kakao.maps.LatLng(36.093523, 123.532547), title: '충청북도', class: infoclass[4], size: (modelData[4] + 'MW'), target: new kakao.maps.LatLng(36.966712, 127.677124) },
        { position: new kakao.maps.LatLng(34.314833, 124.038651), title: '대전', class: infoclass[5], size: (modelData[5] + 'MW'), target: new kakao.maps.LatLng(36.347516, 127.404961) },
        { position: new kakao.maps.LatLng(38.253987, 134.117479), title: '경상북도', class: infoclass[6], size: (modelData[6] + 'MW'), target: new kakao.maps.LatLng(36.309761, 128.860126) },
        { position: new kakao.maps.LatLng(36.054037, 133.183828), title: '대구', class: infoclass[7], size: (modelData[7] + 'MW'), target: new kakao.maps.LatLng(35.883407, 128.515096) },
        { position: new kakao.maps.LatLng(33.082821, 120.818679), title: '전라북도', class: infoclass[8], size: (modelData[8] + 'MW'), target: new kakao.maps.LatLng(35.703461, 127.103913) },
        { position: new kakao.maps.LatLng(34.085199, 132.891106), title: '울산', class: infoclass[9], size: (modelData[9] + 'MW'), target: new kakao.maps.LatLng(35.548182, 129.273068) },
        { position: new kakao.maps.LatLng(32.052432, 128.059606), title: '경상남도', class: infoclass[10], size: (modelData[10] + 'MW'), target: new kakao.maps.LatLng(35.452862, 128.206977) },
        { position: new kakao.maps.LatLng(32.242380, 123.779002), title: '광주', class: infoclass[11], size: (modelData[11] + 'MW'), target: new kakao.maps.LatLng(35.161186, 126.826606) },
        { position: new kakao.maps.LatLng(32.649937, 130.708887), title: '부산', class: infoclass[12], size: (modelData[12] + 'MW'), target: new kakao.maps.LatLng(35.166224, 129.057385) },
        { position: new kakao.maps.LatLng(30.276437, 121.707104), title: '전라남도', class: infoclass[13], size: (modelData[13] + 'MW'), target: new kakao.maps.LatLng(34.863404, 126.986827) },
        { position: new kakao.maps.LatLng(35.586559, 120.571144), title: '충청남도', class: infoclass[14], size: (modelData[14] + 'MW'), target: new kakao.maps.LatLng(36.721632, 126.758261) },
        { position: new kakao.maps.LatLng(30.409873, 126.035831), title: '제주도', class: infoclass[15], size: (modelData[15] + 'MW'), target: new kakao.maps.LatLng(33.399516, 126.573948) },
        // { position: new kakao.maps.LatLng(37.257475, 125.066569), title: '세종', class: infoclass[16], size: '108MW', target: new kakao.maps.LatLng(36.557693, 127.261246) },
    ];

    // 사용자 정의 오버레이 설정
    overLayData.forEach(data => {
        setMapOverlay(map, data.position, `
              <div class="info ${data.class}" data-title="${data.title}">
                  <strong class="clickevent">${data.title}</strong>
                  <p class="clickevent">${data.size}</p>
              </div>
          `);
    });
    eventHandler();
}

// City Polygon Data
export function getCityData() {
    return new Promise((resolve, reject) => {
        let areas = [];

        $.ajax({
            url: '/api/kakao_city',
            type: 'POST',
            contentType: 'application/json',
            success: function (response) {
                // console.log('Data fetched:', response);
                let units = response.kakao_city_result.features;

                areas = units.map(unit => ({
                    name: unit.properties.SIG_KOR_NM,
                    path: unit.geometry.coordinates[0].map(coordinate =>
                        new kakao.maps.LatLng(coordinate[1], coordinate[0])
                    )
                }));

                resolve(areas);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching data:', error);
                reject(error);
            }
        });
    });
}
const polyline = {};
// Set Overlay
export function setMapOverlay(map, position, content) {
    let overlay = new kakao.maps.CustomOverlay({
        map: map,
        position: position,
        content: content,
        // xAnchor: 0.5,
        yAnchor: 0.5,
    });
}


function eventHandler() {
    // 문서 전체에 클릭 이벤트 감지
    $(document).on("click", function (e) {
        // 클릭된 요소가 .info 또는 .clickevent 중 하나인지 확인
        const clickedElement = $(e.target).closest(".info");

        if (clickedElement.length) {
            // 부모 .info를 찾음
            const infoElement = clickedElement.closest(".info");

            // .info의 data-title 속성 가져오기
            const title = infoElement.data("title");

            console.log("클릭이벤트");
            console.log(title);
            console.log(e.target);
        }
    });
}