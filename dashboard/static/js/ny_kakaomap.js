	// 지도에 폴리곤으로 표시할 영역데이터 배열입니다 
	var areas = [];
	
	/* 1. JSON 파일을 읽어들여 areas 배열을 채워넣는 작업 */
	
	// 1) getJSON도 ajax 메소드와 같이 async(비동기) 방식으로 동작하는데, 순차실행을 위해 이걸 강제로 sync 방식으로 동작하도록 함.
	$.ajaxSetup({
		async : false 
	}); 
	
	// 2) getJSON 메소드를 이용해 JSON 파일을 파싱함
	$.getJSON("../static/images/sido.json", function(geojson) {
		var units = geojson.features; // 파일에서 key값이 "features"인 것의 value를 통으로 가져옴(이것은 여러지역에 대한 정보를 모두 담고있음)			
		$.each(units, function(index, unit) { // 1개 지역씩 꺼내서 사용함. val은 그 1개 지역에 대한 정보를 담음
			var coordinates = []; //좌표 저장할 배열
			var name = ''; // 지역 이름

			coordinates = unit.geometry.coordinates; // 1개 지역의 영역을 구성하는 도형의 모든 좌표 배열을 가져옴 
			name = unit.properties.SIG_KOR_NM; // 1개 지역의 이름을 가져옴

			var ob = new Object();
			ob.name = name;
			ob.path = [];

			$.each(coordinates[0], function(index, coordinate) { // []로 한번 더 감싸져 있어서 index 0번의 것을 꺼내야 배열을 접근가능.
				ob.path
						.push(new kakao.maps.LatLng(coordinate[1],
								coordinate[0]));
			});

			areas[index] = ob;
		});//each
	});//getJSON

	/* 2. 지도 띄우기 */
	
	var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.006041, 127.907381), // 지도의 중심좌표
        level: 14 // 지도의 확대 레벨
    };	

	var map = new kakao.maps.Map(mapContainer, mapOption),
    customOverlay = new kakao.maps.CustomOverlay({}),
    infowindow = new kakao.maps.InfoWindow({removable: true});

	setTimeout(function () {
    map.relayout(); // 지도의 크기를 재설정
    map.setCenter(new kakao.maps.LatLng(37.006041, 127.907381)); // 중심 좌표를 재설정
}, 100);
	
	/* 3. 폴리곤 도형을 지도위에 띄우고 마우스 이벤트 붙이기 */
	
// 원하는 초기 위치와 내용을 설정
// var initialPosition = new kakao.maps.LatLng(37.278690, 124.629120); // 초기 인포윈도우 좌표
// var connectedPosition = new kakao.maps.LatLng(37.566535, 126.9779692); // 연결할 지역 (예: 서울 광화문 좌표)

// 여러 개의 초기 위치와 내용을 설정
var initialData = [
      { position: new kakao.maps.LatLng(39.180358, 124.492402), title: '서울', size: '108MW', target: new kakao.maps.LatLng(37.566535, 126.9779692)},
      { position: new kakao.maps.LatLng(38.353582, 122.991336), title: '인천', size: '108MW', target: new kakao.maps.LatLng(37.454490, 126.708008)},
      { position: new kakao.maps.LatLng(37.455524, 123.280815), title: '경기도', size: '108MW', target: new kakao.maps.LatLng(37.401563, 127.507730)},
      { position: new kakao.maps.LatLng(39.354775, 129.813829), title: '강원도', size: '108MW', target: new kakao.maps.LatLng(37.834661, 128.135235)},
      { position: new kakao.maps.LatLng(36.586559, 123.271144), title: '충청남도', size: '108MW', target: new kakao.maps.LatLng(36.721632, 126.758261)},
      { position: new kakao.maps.LatLng(37.257475, 125.066569), title: '세종', size: '108MW', target: new kakao.maps.LatLng(36.557693, 127.261246)},
      { position: new kakao.maps.LatLng(36.614833, 125.038651), title: '대전', size: '108MW', target: new kakao.maps.LatLng(36.347516, 127.404961)},
      { position: new kakao.maps.LatLng(36.593523, 126.232547), title: '충청북도', size: '108MW', target: new kakao.maps.LatLng(36.966712, 127.677124)},
      { position: new kakao.maps.LatLng(38.672864, 129.990708), title: '경상북도', size: '108MW', target: new kakao.maps.LatLng(36.309761, 128.860126)},
      { position: new kakao.maps.LatLng(37.415362, 130.414452), title: '대구', size: '150MW', target: new kakao.maps.LatLng(35.883407, 128.515096)},
      { position: new kakao.maps.LatLng(35.582821, 124.818679), title: '전라북도', size: '108MW', target: new kakao.maps.LatLng(35.703461, 127.103913)},
      { position: new kakao.maps.LatLng(35.342380, 125.479002), title: '광주', size: '108MW', target: new kakao.maps.LatLng(35.161186, 126.826606)},
      { position: new kakao.maps.LatLng(34.776437, 125.207104), title: '전라남도', size: '108MW', target: new kakao.maps.LatLng(34.863404, 126.986827)},
      { position: new kakao.maps.LatLng(36.412432, 130.559606), title: '경상남도', size: '108MW', target: new kakao.maps.LatLng(35.452862, 128.206977)},
      { position: new kakao.maps.LatLng(35.576503, 130.831503), title: '울산', size: '108MW', target: new kakao.maps.LatLng(35.548182, 129.273068)},
      { position: new kakao.maps.LatLng(34.846597, 130.248865), title: '부산', size: '200MW', target: new kakao.maps.LatLng(35.166224, 129.057385)},
      { position: new kakao.maps.LatLng(33.509873, 128.135831), title: '제주도', size: '108MW', target: new kakao.maps.LatLng(33.399516, 126.573948)},
  ];

// 초기 인포윈도우 생성
// var initialContent = '<div class="info" style="border:1px solid black; border-radius:30px; padding:10px; background:white; z-index:10;">' +
//                      '   <div class="title">서울</div>' +
//                      '   <div class="size">108MW</div>' +
//                      '</div>';

// 여러 개의 초기 인포윈도우 생성
initialData.forEach(function(data) {
      var initialContent = '<div class="info" style="border:1px solid black; border-radius:30px; padding:10px; background:white; z-index:10;">' +
                           '   <div class="title">' + data.title + '</div>' +
                           '   <div class="size">' + data.size + '</div>' +
                           '</div>';

// var customInfowindow = new kakao.maps.CustomOverlay({
//     position: initialPosition,
//     content: initialContent,
//     yAnchor: 0.5, // 0 = 상단, 0.5 = 중앙, 1 = 하단에 인포윈도우 위치
//     map: map // 생성 즉시 지도에 표시
// });

var customInfowindow = new kakao.maps.CustomOverlay({
      position: data.position,
      content: initialContent,
      yAnchor: 0.5, // 0 = 상단, 0.5 = 중앙, 1 = 하단에 인포윈도우 위치
      map: map // 생성 즉시 지도에 표시
  });

// Polyline(선) 생성
// var polyline = new kakao.maps.Polyline({
//     map: map, // 선을 표시할 지도 객체
//     path: [initialPosition, connectedPosition], // 선을 그릴 좌표 배열
//     strokeWeight: 1, // 선의 두께
//     strokeColor: '#000000', // 선의 색
//     strokeOpacity: 0.8, // 선의 투명도
//     strokeStyle: 'solid', // 선의 스타일 (solid, shortdash 등)
//     zIndex: 999 // 폴리곤보다 앞에 표시되도록 zIndex 설정
// });

    // Polyline(선) 생성 (각각의 초기 위치와 연결할 좌표로)
    var polyline = new kakao.maps.Polyline({
      map: map, // 선을 표시할 지도 객체
      path: [data.position, data.target], // 선을 그릴 좌표 배열
      strokeWeight: 1, // 선의 두께
      strokeColor: '#000000', // 선의 색
      strokeOpacity: 0.8, // 선의 투명도
      strokeStyle: 'solid', // 선의 스타일 (solid, shortdash 등)
      zIndex: 999 // 폴리곤보다 앞에 표시되도록 zIndex 설정
  });

// 지도에 연결할 마커 추가 (선의 끝점에 마커 표시)
// var connectedMarker = new kakao.maps.Marker({
//     position: data.target, // 마커가 표시될 위치
//     map: map, // 마커를 표시할 지도 객체
//     icon: {
//       content: `<div style="width: 40px; height: 40px; background-color: ${data.color}; border-radius: 50%;"></div>` // 마커 색상과 사이즈 지정
//   }
//       });
});

	// 지도에 영역데이터를 폴리곤으로 표시합니다 
	for (var i = 0, len = areas.length; i < len; i++) {
		displayArea(areas[i]);
	}

	// 다각형을 생상하고 이벤트를 등록하는 함수입니다
	function displayArea(area) {

	    // 다각형을 생성합니다 
	    var polygon = new kakao.maps.Polygon({
	        map: map, // 다각형을 표시할 지도 객체
	        path: area.path,
	        strokeWeight: 2,
	        strokeColor: '#004c80',
	        strokeOpacity: 0.8,
	        fillColor: '#fff',
	        fillOpacity: 0.7 
	    });

	    // 다각형에 mouseover 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 변경합니다 
	    // 지역명을 표시하는 커스텀오버레이를 지도위에 표시합니다
	    kakao.maps.event.addListener(polygon, 'mouseover', function(mouseEvent) {
	        polygon.setOptions({fillColor: '#09f'});

	        customOverlay.setContent('<div class="area">' + area.name + '</div>');
	        
	        customOverlay.setPosition(mouseEvent.latLng); 
	        customOverlay.setMap(map);
	    });

	    // 다각형에 mousemove 이벤트를 등록하고 이벤트가 발생하면 커스텀 오버레이의 위치를 변경합니다 
	    kakao.maps.event.addListener(polygon, 'mousemove', function(mouseEvent) {
	        
	        customOverlay.setPosition(mouseEvent.latLng); 
	    });

	    // 다각형에 mouseout 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 원래색으로 변경합니다
	    // 커스텀 오버레이를 지도에서 제거합니다 
	    kakao.maps.event.addListener(polygon, 'mouseout', function() {
	        polygon.setOptions({fillColor: '#fff'});
	        customOverlay.setMap(null);
	    }); 

	    // 다각형에 click 이벤트를 등록하고 이벤트가 발생하면 다각형의 이름과 면적을 인포윈도우에 표시합니다 
	    kakao.maps.event.addListener(polygon, 'click', function(mouseEvent) {
	        var content = '<div class="info">' + 
	                    '   <div class="title">' + area.name + '</div>' +
	                    '   <div class="size">총 면적 : 약 ' + Math.floor(polygon.getArea()) + ' m<sup>2</sup></div>' +
	                    '</div>';

	        infowindow.setContent(content); 
	        infowindow.setPosition(mouseEvent.latLng); 
	        infowindow.setMap(map);
	    });
	}