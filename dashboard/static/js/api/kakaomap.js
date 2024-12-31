export function createMap(areas, modelData) {
    // console.log('Initializing map...');
    let mapContainer = document.getElementById('kakaoMap');
    let mapOption = {
        center: new kakao.maps.LatLng(37.006041, 127.907381),
        level: 14
    };

    let map = new kakao.maps.Map(mapContainer, mapOption);

    setTimeout(() => {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(37.006041, 127.907381));
    }, 100);

    // 폴리곤 도형을 지도 위에 표시
    areas.forEach(area => {
        let polygon = new kakao.maps.Polygon({
            map: map,
            path: area.path,
            strokeWeight: 2,
            strokeColor: '#004c80',
            strokeOpacity: 0.8,
            fillColor: '#a6c8ff',
            fillOpacity: 0.7
        });

        kakao.maps.event.addListener(polygon, 'mouseover', function () {
            polygon.setOptions({ fillColor: '#09f' });
        });

        kakao.maps.event.addListener(polygon, 'mouseout', function () {
            polygon.setOptions({ fillColor: '#a6c8ff' });
        });
    });

    modelData = modelData.xgboost_ai_result;
    let overLayData = [
        { position: new kakao.maps.LatLng(38.754775, 129.813829), title: '강원도', class: 'info-big info-1', size: (modelData[0] + 'MW'), target: new kakao.maps.LatLng(37.834661, 128.135235) },
        { position: new kakao.maps.LatLng(37.580358, 125.692402), title: '서울', class: 'info-big info-2', size: (modelData[1] + 'MW'), target: new kakao.maps.LatLng(37.566535, 126.9779692) },
        { position: new kakao.maps.LatLng(36.353582, 124.991336), title: '인천', class: 'info-3', size: (modelData[2] + 'MW'), target: new kakao.maps.LatLng(37.454490, 126.708008) },
        { position: new kakao.maps.LatLng(37.455524, 123.280815), title: '경기도', class: 'info-4', size: (modelData[3] + 'MW'), target: new kakao.maps.LatLng(37.401563, 127.507730) },
        { position: new kakao.maps.LatLng(35.593523, 123.232547), title: '충청북도', class: 'info-5', size: (modelData[4] + 'MW'), target: new kakao.maps.LatLng(36.966712, 127.677124) },
        { position: new kakao.maps.LatLng(34.614833, 125.038651), title: '대전', class: 'info-6', size: (modelData[5] + 'MW'), target: new kakao.maps.LatLng(36.347516, 127.404961) },
        { position: new kakao.maps.LatLng(36.772864, 131.090708), title: '경상북도', class: 'info-big info-7', size: (modelData[6] + 'MW'), target: new kakao.maps.LatLng(36.309761, 128.860126) },
        { position: new kakao.maps.LatLng(34.815362, 131.414452), title: '대구', class: 'info-big info-8', size: (modelData[7] + 'MW'), target: new kakao.maps.LatLng(35.883407, 128.515096) },
        { position: new kakao.maps.LatLng(34.082821, 122.818679), title: '전라북도', class: 'info-9', size: (modelData[8] + 'MW'), target: new kakao.maps.LatLng(35.703461, 127.103913) },
        { position: new kakao.maps.LatLng(33.876503, 130.831503), title: '울산', class: 'info-10', size: (modelData[9] + 'MW'), target: new kakao.maps.LatLng(35.548182, 129.273068) },
        { position: new kakao.maps.LatLng(32.552432, 128.259606), title: '경상남도', class: 'info-11', size: (modelData[10] + 'MW'), target: new kakao.maps.LatLng(35.452862, 128.206977) },
        { position: new kakao.maps.LatLng(33.042380, 124.779002), title: '광주', class: 'info-12', size: (modelData[11] + 'MW'), target: new kakao.maps.LatLng(35.161186, 126.826606) },
        { position: new kakao.maps.LatLng(32.646597, 130.048865), title: '부산', class: 'info-13', size: (modelData[12] + 'MW'), target: new kakao.maps.LatLng(35.166224, 129.057385) },
        { position: new kakao.maps.LatLng(31.576437, 122.707104), title: '전라남도', class: 'info-big info-14', size: (modelData[13] + 'MW'), target: new kakao.maps.LatLng(34.863404, 126.986827) },
        { position: new kakao.maps.LatLng(35.586559, 121.271144), title: '충청남도', class: 'info-15', size: (modelData[14] + 'MW'), target: new kakao.maps.LatLng(36.721632, 126.758261) },
        { position: new kakao.maps.LatLng(30.409873, 126.035831), title: '제주도', class: 'info-big info-16', size: (modelData[15] + 'MW'), target: new kakao.maps.LatLng(33.399516, 126.573948) },
        // { position: new kakao.maps.LatLng(37.257475, 125.066569), title: '세종', class: 'info-17', size: '108MW', target: new kakao.maps.LatLng(36.557693, 127.261246) },
    ];

    // 사용자 정의 오버레이 설정
    overLayData.forEach(data => {
        setMapOverlay(map, data.position, `
              <div class="info ${data.class}">
                  <strong>${data.title}</strong>
                  <p>${data.size}</p>
              </div>
          `);
    });
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

// Set Overlay
export function setMapOverlay(map, position, content) {
    let overlay = new kakao.maps.CustomOverlay({
        map: map,
        position: position,
        content: content,
        xAnchor: 0.5,
        yAnchor: 1.5
    });

    kakao.maps.event.addListener(overlay, 'click', function () {
        map.panTo(position); // 클릭 시 지도의 중심 이동
    });
}
