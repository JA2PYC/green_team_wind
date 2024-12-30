$(document).ready(function () {
    function initialize() {
        getCityData()
            .then(areas => initializeMap(areas))
            .catch(error => console.error("Failed to initialize:", error));
    }

    let overLayData = [
        { position: new kakao.maps.LatLng(39.180358, 124.492402), title: '서울', size: '108MW', target: new kakao.maps.LatLng(37.566535, 126.9779692) },
        { position: new kakao.maps.LatLng(38.353582, 122.991336), title: '인천', size: '108MW', target: new kakao.maps.LatLng(37.454490, 126.708008) },
        { position: new kakao.maps.LatLng(37.455524, 123.280815), title: '경기도', size: '108MW', target: new kakao.maps.LatLng(37.401563, 127.507730) },
        { position: new kakao.maps.LatLng(39.354775, 129.813829), title: '강원도', size: '108MW', target: new kakao.maps.LatLng(37.834661, 128.135235) },
        { position: new kakao.maps.LatLng(36.586559, 123.271144), title: '충청남도', size: '108MW', target: new kakao.maps.LatLng(36.721632, 126.758261) },
        { position: new kakao.maps.LatLng(37.257475, 125.066569), title: '세종', size: '108MW', target: new kakao.maps.LatLng(36.557693, 127.261246) },
        { position: new kakao.maps.LatLng(36.614833, 125.038651), title: '대전', size: '108MW', target: new kakao.maps.LatLng(36.347516, 127.404961) },
        { position: new kakao.maps.LatLng(36.593523, 126.232547), title: '충청북도', size: '108MW', target: new kakao.maps.LatLng(36.966712, 127.677124) },
        { position: new kakao.maps.LatLng(38.672864, 129.990708), title: '경상북도', size: '108MW', target: new kakao.maps.LatLng(36.309761, 128.860126) },
        { position: new kakao.maps.LatLng(37.415362, 130.414452), title: '대구', size: '150MW', target: new kakao.maps.LatLng(35.883407, 128.515096) },
        { position: new kakao.maps.LatLng(35.582821, 124.818679), title: '전라북도', size: '108MW', target: new kakao.maps.LatLng(35.703461, 127.103913) },
        { position: new kakao.maps.LatLng(35.342380, 125.479002), title: '광주', size: '108MW', target: new kakao.maps.LatLng(35.161186, 126.826606) },
        { position: new kakao.maps.LatLng(34.776437, 125.207104), title: '전라남도', size: '108MW', target: new kakao.maps.LatLng(34.863404, 126.986827) },
        { position: new kakao.maps.LatLng(36.412432, 130.559606), title: '경상남도', size: '108MW', target: new kakao.maps.LatLng(35.452862, 128.206977) },
        { position: new kakao.maps.LatLng(35.576503, 130.831503), title: '울산', size: '108MW', target: new kakao.maps.LatLng(35.548182, 129.273068) },
        { position: new kakao.maps.LatLng(34.846597, 130.248865), title: '부산', size: '200MW', target: new kakao.maps.LatLng(35.166224, 129.057385) },
        { position: new kakao.maps.LatLng(33.509873, 128.135831), title: '제주도', size: '108MW', target: new kakao.maps.LatLng(33.399516, 126.573948) },
    ];

    function getCityData() {
        return new Promise((resolve, reject) => {
            let areas = [];

            $.ajax({
                url: '/api/kakao_city',
                type: 'POST',
                contentType: 'application/json',
                success: function (response) {
                    console.log('Data fetched:', response);
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

    function initializeMap(areas) {
        console.log('Initializing map...');
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
                console.log('Mouse over:', area.name);
                polygon.setOptions({ fillColor: '#09f' });
            });

            kakao.maps.event.addListener(polygon, 'mouseout', function () {
                console.log('Mouse out:', area.name);
                polygon.setOptions({ fillColor: '#a6c8ff' });
            });
        });

        // 사용자 정의 오버레이 설정
        overLayData.forEach(data => {
            setCustomOverlay(map, data.position, `
                <div class="info">
                    <strong>${data.title}</strong>
                    <p>${data.size}</p>
                </div>
            `);
        });
    }

    function setCustomOverlay(map, position, content) {
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


    initialize();
});


// $(document).ready(function () {
//     function initialize() {
//         getCityData();
//     }

//     function getCityData() {
//         // 지도에 폴리곤으로 표시할 영역 데이터 배열입니다.
//         let areas = [];

//         // 1. AJAX를 사용해 서버에서 JSON 데이터를 가져옵니다.
//         $.ajax({
//             url: '/api/kakao_city',
//             type: 'POST',
//             contentType: 'application/json',
//             success: function (response) {
//                 console.log('Data fetched:', response);
//                 let units = response.kakao_city_result.features; // 서버에서 가져온 JSON 데이터 처리
//                 $.each(units, function (index, unit) {
//                     let coordinates = unit.geometry.coordinates;
//                     let name = unit.properties.SIG_KOR_NM;

//                     let ob = {
//                         name: name,
//                         path: coordinates[0].map(function (coordinate) {
//                             return new kakao.maps.LatLng(coordinate[1], coordinate[0]);
//                         })
//                     };

//                     // 좌표 배열을 Kakao 지도 객체로 변환
//                     $.each(coordinates[0], function (index, coordinate) {
//                         ob.path.push(new kakao.maps.LatLng(coordinate[1], coordinate[0]));
//                     });

//                     areas.push(ob);
//                 });

//                 initializeMap(areas); // 데이터를 가져온 후 지도 초기화
//             },
//             error: function (xhr, status, error) {
//                 console.error('Error fetching data:', error);
//             }
//         });
//     }

//     function initializeMap(areas) {
//         console.log('Initializing map...');
//         console.log('Areas:', areas);
//         let mapContainer = document.getElementById('kakaoMap'), // 지도를 표시할 div
//             mapOption = {
//                 center: new kakao.maps.LatLng(37.006041, 127.907381), // 지도의 중심좌표
//                 level: 14 // 지도의 확대 레벨
//             };

//         let map = new kakao.maps.Map(mapContainer, mapOption);
//         customOverlay = new kakao.maps.CustomOverlay({});
//         infowindow = new kakao.maps.InfoWindow({ removable: true });

//         setTimeout(function () {
//             map.relayout(); // 지도의 크기를 재설정
//             map.setCenter(new kakao.maps.LatLng(37.006041, 127.907381)); // 중심 좌표를 재설정
//         }, 100);

//         // 폴리곤 도형을 지도 위에 표시
//         areas.forEach(function (area) {
//             let polygon = new kakao.maps.Polygon({
//                 map: map,
//                 path: area.path,
//                 strokeWeight: 2,
//                 strokeColor: '#004c80',
//                 strokeOpacity: 0.8,
//                 fillColor: '#a6c8ff',
//                 fillOpacity: 0.7
//             });

//             // 마우스 이벤트 추가
//             kakao.maps.event.addListener(polygon, 'mouseover', function () {
//                 polygon.setOptions({ fillColor: '#09f' });
//             });

//             kakao.maps.event.addListener(polygon, 'mouseout', function () {
//                 polygon.setOptions({ fillColor: '#a6c8ff' });
//             });
//         });
//     }

//     let overLayData = [
//         { position: new kakao.maps.LatLng(39.180358, 124.492402), title: '서울', size: '108MW', target: new kakao.maps.LatLng(37.566535, 126.9779692) },
//         { position: new kakao.maps.LatLng(38.353582, 122.991336), title: '인천', size: '108MW', target: new kakao.maps.LatLng(37.454490, 126.708008) },
//         { position: new kakao.maps.LatLng(37.455524, 123.280815), title: '경기도', size: '108MW', target: new kakao.maps.LatLng(37.401563, 127.507730) },
//         { position: new kakao.maps.LatLng(39.354775, 129.813829), title: '강원도', size: '108MW', target: new kakao.maps.LatLng(37.834661, 128.135235) },
//         { position: new kakao.maps.LatLng(36.586559, 123.271144), title: '충청남도', size: '108MW', target: new kakao.maps.LatLng(36.721632, 126.758261) },
//         { position: new kakao.maps.LatLng(37.257475, 125.066569), title: '세종', size: '108MW', target: new kakao.maps.LatLng(36.557693, 127.261246) },
//         { position: new kakao.maps.LatLng(36.614833, 125.038651), title: '대전', size: '108MW', target: new kakao.maps.LatLng(36.347516, 127.404961) },
//         { position: new kakao.maps.LatLng(36.593523, 126.232547), title: '충청북도', size: '108MW', target: new kakao.maps.LatLng(36.966712, 127.677124) },
//         { position: new kakao.maps.LatLng(38.672864, 129.990708), title: '경상북도', size: '108MW', target: new kakao.maps.LatLng(36.309761, 128.860126) },
//         { position: new kakao.maps.LatLng(37.415362, 130.414452), title: '대구', size: '150MW', target: new kakao.maps.LatLng(35.883407, 128.515096) },
//         { position: new kakao.maps.LatLng(35.582821, 124.818679), title: '전라북도', size: '108MW', target: new kakao.maps.LatLng(35.703461, 127.103913) },
//         { position: new kakao.maps.LatLng(35.342380, 125.479002), title: '광주', size: '108MW', target: new kakao.maps.LatLng(35.161186, 126.826606) },
//         { position: new kakao.maps.LatLng(34.776437, 125.207104), title: '전라남도', size: '108MW', target: new kakao.maps.LatLng(34.863404, 126.986827) },
//         { position: new kakao.maps.LatLng(36.412432, 130.559606), title: '경상남도', size: '108MW', target: new kakao.maps.LatLng(35.452862, 128.206977) },
//         { position: new kakao.maps.LatLng(35.576503, 130.831503), title: '울산', size: '108MW', target: new kakao.maps.LatLng(35.548182, 129.273068) },
//         { position: new kakao.maps.LatLng(34.846597, 130.248865), title: '부산', size: '200MW', target: new kakao.maps.LatLng(35.166224, 129.057385) },
//         { position: new kakao.maps.LatLng(33.509873, 128.135831), title: '제주도', size: '108MW', target: new kakao.maps.LatLng(33.399516, 126.573948) },
//     ];

//     function setCustomOverlay(map, position, content) {

//     }

//     initialize();
// });
