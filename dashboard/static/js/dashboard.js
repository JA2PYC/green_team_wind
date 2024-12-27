$(document).ready(() => {
    function initialize() {
        // callWindAPI();
        // callkma_sfctm3Data();
        initWidget();
        eventHandler();
    }

    function initWidget() {
        let today = new Date();
        widgetMap();
        widgetWeather("11G00201");
        widgetPowerStation(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString());
        widgetPredictPower(184);
        widgetWindPowerChart();
    }

    function eventHandler() {
        // 문서 전체에 클릭 이벤트 감지
        $(document).on("click", function (e) {
            // 클릭된 요소가 .forecast-energy 아래의 .model_rf인지 확인
            if ($(e.target).closest(".forecast-energy .model_rf").length) {
                let inputs = [
                    [18, 4, 1010, 1010 * 100 / (287.05 * (18 + 273.15))]
                ];

                // callRFModel 함수 호출
                callRFModel(inputs).then(function (response) {
                    // console.log("Returned data:", response);

                    // 예상 발전량을 forecast-now 요소에 업데이트
                    if (response && response.rf_result && response.rf_result.length > 0) {
                        $("#forecast-now").text(response.rf_result.join(", ") + " MW");
                    } else {
                        console.error("Invalid data format:", response);
                        $("#forecast-now").text("Error");
                    }
                }).catch(function (error) {
                    console.error("Error calling RF model:", error);
                    $("#forecast-now").text("Error");
                });
            }
        });
    }

    // 지도 위젯
    function widgetMap() {
        callkma_sfctm2Data(tm = 0, stn = 0).then(function (kma_sfctm2Data) {
            let selectedWeather = getWeatherDataByStationNames(kma_sfctm2Data,
                ['춘천', '서울', '인천', '수원', '청주',
                    '대전', '안동', '대구', '전주', '울산',
                    '창원', '광주', '부산', '목포', '홍성',
                    '제주'
                ]);
            let processedWeatehr = processWeatherData(selectedWeather);
            Promise.all([
                getCityData(),
                callXGBModel(processedWeatehr)
            ]).then(function ([areas, modelData]) {
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
                        polygon.setOptions({ fillColor: '#09f' });
                    });

                    kakao.maps.event.addListener(polygon, 'mouseout', function () {
                        polygon.setOptions({ fillColor: '#a6c8ff' });
                    });
                });

                modelData = modelData.xgboost_ai_result;
                let overLayData = [
                    { position: new kakao.maps.LatLng(38.754775, 129.813829), title: '강원도', class: 'info-big info-1', size: (modelData[0] + 'MW'), target: new kakao.maps.LatLng(37.834661, 128.135235) },
                    { position: new kakao.maps.LatLng(37.580358, 125.692402), title: '서울', class: 'info-big info-2', size:  (modelData[1] + 'MW'), target: new kakao.maps.LatLng(37.566535, 126.9779692) },
                    { position: new kakao.maps.LatLng(36.353582, 124.991336), title: '인천', class: 'info-3', size:  (modelData[2] + 'MW'), target: new kakao.maps.LatLng(37.454490, 126.708008) },
                    { position: new kakao.maps.LatLng(37.455524, 123.280815), title: '경기도', class: 'info-4', size:  (modelData[3] + 'MW'), target: new kakao.maps.LatLng(37.401563, 127.507730) },
                    { position: new kakao.maps.LatLng(35.593523, 123.232547), title: '충청북도', class: 'info-5', size:  (modelData[4] + 'MW'), target: new kakao.maps.LatLng(36.966712, 127.677124) },
                    { position: new kakao.maps.LatLng(34.614833, 125.038651), title: '대전', class: 'info-6', size:  (modelData[5] + 'MW'), target: new kakao.maps.LatLng(36.347516, 127.404961) },
                    { position: new kakao.maps.LatLng(36.772864, 131.090708), title: '경상북도', class: 'info-big info-7', size:  (modelData[6] + 'MW'), target: new kakao.maps.LatLng(36.309761, 128.860126) },
                    { position: new kakao.maps.LatLng(34.815362, 131.414452), title: '대구', class: 'info-big info-8', size:  (modelData[7] + 'MW'), target: new kakao.maps.LatLng(35.883407, 128.515096) },
                    { position: new kakao.maps.LatLng(34.082821, 122.818679), title: '전라북도', class: 'info-9', size:  (modelData[8] + 'MW'), target: new kakao.maps.LatLng(35.703461, 127.103913) },
                    { position: new kakao.maps.LatLng(33.876503, 130.831503), title: '울산', class: 'info-10', size:  (modelData[9] + 'MW'), target: new kakao.maps.LatLng(35.548182, 129.273068) },
                    { position: new kakao.maps.LatLng(32.552432, 128.259606), title: '경상남도', class: 'info-11', size:  (modelData[10] + 'MW'), target: new kakao.maps.LatLng(35.452862, 128.206977) },
                    { position: new kakao.maps.LatLng(33.042380, 124.779002), title: '광주', class: 'info-12', size:  (modelData[11] + 'MW'), target: new kakao.maps.LatLng(35.161186, 126.826606) },
                    { position: new kakao.maps.LatLng(32.646597, 130.048865), title: '부산', class: 'info-13', size:  (modelData[12] + 'MW'), target: new kakao.maps.LatLng(35.166224, 129.057385) },
                    { position: new kakao.maps.LatLng(31.576437, 122.707104), title: '전라남도', class: 'info-big info-14', size:  (modelData[13] + 'MW'), target: new kakao.maps.LatLng(34.863404, 126.986827) },
                    { position: new kakao.maps.LatLng(35.586559, 121.271144), title: '충청남도', class: 'info-15', size:  (modelData[14] + 'MW'), target: new kakao.maps.LatLng(36.721632, 126.758261) },
                    { position: new kakao.maps.LatLng(30.409873, 126.035831), title: '제주도', class: 'info-big info-16', size:  (modelData[15] + 'MW'), target: new kakao.maps.LatLng(33.399516, 126.573948) },
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

            }).catch(error => console.error("Failed to initialize Map:", error));
        });
    }

    function getWeatherDataByStationNames(weatherData, stationNames) {
        return weatherData.filter((data) => stationNames.includes(data.station_name));
    }

    function getCityData() {
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

    function setMapOverlay(map, position, content) {
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

    // 날씨 위젯
    function widgetWeather(reg_id) {
        callfct_afs_dlData(reg_id).then(function (fct_afs_data) {
            const widget = $(".widget.weatherForecast");
            let validWeather = null;
            // console.log(fct_afs_data);

            // Find the first valid weather data
            for (let weather of fct_afs_data) {
                if (weather.wf && weather.ta != "-99") {
                    validWeather = weather;
                    break;
                }
            }

            if (validWeather) {
                const iconClass = getWeatherIcon(validWeather.wf);
                let foreacastTime = formatDateTimeToKorean(validWeather.tm_ef, true);
                widget.find(".widgetIndicator.fcLocation").text(validWeather.stn_name);
                widget.find(".weather-icon").html(`<i class="${iconClass}"></i>`);
                widget.find(".weather-temp").text(validWeather.ta + "°C");
                widget.find(".weather-desc").text(validWeather.wf + ' ' + validWeather.st + '% ' + validWeather.w1);
                widget.find(".weather-detail").text(foreacastTime);
            } else {
                widget.find(".weather-icon").html(`<i class="bi-exclamation-circle"></i>`);
                widget.find(".weather-text").text("데이터가 유효하지 않습니다.");
            }
        });

    }

    // 날씨 아이콘 매핑
    function getWeatherIcon(wf) {
        // Bootstrap icons mapping based on weather forecast (wf)
        const iconMap = {
            "맑음": "bi-sun",
            "흐림": "bi-cloud-sun",
            "구름": "bi-cloud",
            "구름조금": "bi-cloud",
            "구름많음": "bi-clouds",
            "흐리고 비": "bi-cloud-rain",
            "흐리고 한때 비": "bi-cloud-rain",
            "흐리고 눈": "bi-cloud-rain",
            "흐리고 비/눈": "bi-cloud-sleet",
            "흐리고 눈/비": "bi-cloud-sleet",
            "구름많고 비": "bi-cloud-rain",
            "구름많고 눈": "bi-cloud-rain",
            "구름많고 비/눈": "bi-cloud-sleet",
            "구름많고 눈/비": "bi-cloud-sleet",
            "소나기": "bi-cloud-drizzle",
            "비": "bi-cloud-rain",
            "눈": "bi-cloud-snow",
        };
        return iconMap[wf] || "bi-question-circle"; // Default icon if wf is unknown
    }

    // 날짜 변환
    function formatDateTimeToKorean(timeString, includeTime = false) {
        // 입력값에서 연도, 월, 일, 시, 분 추출
        const year = timeString.slice(0, 4);
        const month = timeString.slice(4, 6); // JavaScript의 월은 0부터 시작
        const day = timeString.slice(6, 8);

        // 기본 형식: "YYYY-MM-DD"
        let formattedDate = `${year}년 ${month}월 ${day}일`;

        // 시간 데이터가 있을 경우에만 시간 추가
        if (includeTime && timeString.length >= 12) {
            const hour = timeString.slice(8, 10);
            const minute = timeString.slice(10, 12);
            formattedDate += ` ${hour}시 ${minute}분`;
        }

        return formattedDate;
    }

    // 실시간 발전원 위젯
    function widgetPowerStation(today) {
        callOpen_pabg(today).then(function (open_pabg_data) {
            console.log(open_pabg_data);
            const items = open_pabg_data.response.body.items.item;

            if (items.length > 0) {
                // 가장 최근 데이터를 추출
                const latestData = items[items.length - 1];
                // 발전량 데이터를 정리
                const chartData = {
                    // "수력": parseFloat(latestData.fuelPwr1 || 0),
                    // "유류": parseFloat(latestData.fuelPwr2 || 0),
                    "유연탄": parseFloat(latestData.fuelPwr3 || 0),
                    "원자력": parseFloat(latestData.fuelPwr4 || 0),
                    // "양수": parseFloat(latestData.fuelPwr5 || 0),
                    "가스": parseFloat(latestData.fuelPwr6 || 0),
                    // "국내탄": parseFloat(latestData.fuelPwr7 || 0),
                    "신재생(풍력)": parseFloat(latestData.fuelPwr8 || 0),
                    "태양광": parseFloat(latestData.fuelPwr9 || 0)
                };

                // 도넛 차트를 렌더링
                let $powerStationChart = $('#powerStationCanvas');

                createDonutChart($powerStationChart, chartData, 'doughnut');
            }
        }).catch(function (error) {
            console.error("Error(WidgetPowerStation):", error);
        });
    }

    // 모델별 예상 발전량 위젯
    function widgetPredictPower(station_id = 184) {
        callkma_sfctm2Data(tm = 0, station_id).then(function (kma_sfctm2Data) {
            let processedWeatehr = processWeatherData(kma_sfctm2Data);

            let gaugeInputs = [];
            let gaugeIntervalId = null;
            let gaugeChartContainer = 'gaugeChart';
            let gaugeChart = createGaugeChart(gaugeChartContainer);
            let gaugeXYChartContainer = 'gaugeXYChart';
            let gaugeXYChart = createGaugeXYChart(gaugeXYChartContainer);

            Promise.all([
                callXGBModel(processedWeatehr),
                callRFModel(processedWeatehr),
                callCSTLModel(processedWeatehr)
            ]).then(function ([xgb_response, rf_model_response, cstl_model_response]) {
                if (xgb_response.xgboost_ai_result) {
                    gaugeInputs.push(Math.round(xgb_response.xgboost_ai_result[0]));
                    $(".widget.predictPower .xgboost_value").text(xgb_response.xgboost_ai_result[0] + ' MW');
                }
                if (rf_model_response.rf_result) {
                    gaugeInputs.push(Math.round(rf_model_response.rf_result[0]));
                    $(".widget.predictPower .rf_value").text(rf_model_response.rf_result[0] + ' MW');
                }
                if (cstl_model_response.cstl_ai_result && cstl_model_response.cstl_ai_result.length > 0) {
                    $(".widget.predictPower .cstl_value").text(cstl_model_response.cstl_ai_result[0] + ' MW');
                }

                updateGaugeChart(gaugeChart, gaugeInputs[0]);
                updateGaugeXYChart(gaugeXYChart, gaugeInputs[0]);
                showModelAtIndex("modelList", 0);

                let index = 1; // Start with the second value in the array
                if (gaugeIntervalId) {
                    clearInterval(gaugeIntervalId);
                }
                gaugeIntervalId = setInterval(() => {
                    const value = gaugeInputs[index];

                    // Move to the next value in the array
                    updateGaugeChart(gaugeChart, value);
                    updateGaugeXYChart(gaugeXYChart, value);
                    showModelAtIndex("modelList", index);
                    index = (index + 1) % gaugeInputs.length;
                }, 3000);

            }).catch(function (error) {
                console.log("Error:", error)
            });
        });

    }

    // 풍속 발전량 차트 위젯
    function widgetWindPowerChart() {
        callkma_sfctm2Data().then(function (kma_sfctm2Data) {
            let processedWeatehr = processWeatherData(kma_sfctm2Data);
            let rfData;
            let xgbData;
            let cstlData;

            // 모델 응답 결과를 기다린 후 진행
            Promise.all([
                callXGBModel(processedWeatehr), // XGB 모델 호출
                callRFModel(processedWeatehr),   // RF 모델 호출
                callCSTLModel(processedWeatehr)
            ]).then(function ([xgb_response, rf_model_response, cstl_model_response]) {
                // XGB 모델 응답 처리
                if (xgb_response && xgb_response.xgboost_ai_result && xgb_response.xgboost_ai_result.length > 0) {
                    xgbData = xgb_response.xgboost_ai_result;
                }

                // RF 모델 응답 처리
                if (rf_model_response && rf_model_response.rf_result && rf_model_response.rf_result.length > 0) {
                    rfData = rf_model_response.rf_result;
                }

                // CSTL 모델 응답 처리
                if (cstl_model_response && cstl_model_response.cstl_ai_result && cstl_model_response.cstl_ai_result.length > 0) {
                    cstlData = cstl_model_response.cstl_ai_result;
                }

                // 차트 데이터 처리
                let windPowerChartData = processWindPowerChart(kma_sfctm2Data, xgbData, rfData, cstlData);
                let $windPowerChart = $('#windPowerCanvas');
                createChartGraph($windPowerChart, windPowerChartData, 'line');
            }).catch(function (error) {
                console.error('Error in fetching model data:', error);
            });
        });
    }


    // Show Model List
    function showModelAtIndex(containerClass, index) {
        const $container = $(`.${containerClass}`);
        const $items = $container.children();

        if (!$items.length) {
            console.error("Invalid index or container not initialized.");
            return;
        }

        // 현재 visible 상태인 항목 찾기
        const $currentItem = $items.filter(".item_visible");
        const $nextItem = $items.eq(index);

        // 현재 항목 왼쪽으로 사라짐
        $currentItem
            .removeClass("item_visible")
            .addClass("exit-left")
            .one("transitionend", function () {
                $(this).removeClass("exit-left");
            });

        // 다음 항목 오른쪽에서 나타남
        $nextItem
            .addClass("enter-right")
            .get(0).offsetWidth; // 강제로 리플로우를 발생시켜 애니메이션 트리거
        $nextItem
            .removeClass("enter-right")
            .addClass("item_visible");
    }

    // 한국전력거래소_발전원별 발전량(계통기준) OPEN API PABG
    function callOpen_pabg(baseDate, pageNo = 1, numOfRows = 300, dataType = "json") {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/open_pabg",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    baseDate: baseDate,
                    pageNo: pageNo,
                    numOfRows: numOfRows,
                    dataType: dataType
                }),
                success: function (data) {
                    if (data.open_pabg_result) {
                        resolve(data.open_pabg_result);
                    } else {
                        reject("Error");
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });
    }

    // OPEN API Power API
    function callOpen_pabpg() {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/open_pabpg",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tradeYmd: "20210801",
                    pageNo: 1,
                    numOfRows: 30
                }),
                success: function (data) {
                    console.log(data)
                    if (data.open_pabpg_result) {
                        resolve(data.open_pabpg_result);
                    } else {
                        reject("Error");
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });

        $("#powerForm").on("submit", function (event) {
            event.preventDefault(); // 기본 폼 제출 방지

            // 폼 데이터 가져오기
            const tradeYmd = $("#tradeYmd").val();

            // POST 요청 보내기
            $.ajax({
                url: "/api/open_pabpg",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tradeYmd: tradeYmd,
                    pageNo: 1,
                    numOfRows: 30
                }),
                success: function (data) {
                    console.log(data);
                    // 성공 시 응답 데이터를 화면에 표시
                    if (data.response.body.items.item.length > 0) {
                        let resultHtml = "<ul>";
                        data.response.body.items.item.forEach(item => {
                            resultHtml += `<li>Location: ${item.locationName}, Generation: ${item.amount}</li>`;
                        });
                        resultHtml += "</ul>";
                        $("#result").html(resultHtml);
                    } else {
                        $("#result").html("<p>No data available for the given date.</p>");
                    }
                },
                error: function (error) {
                    // 에러 시 메시지 표시
                    $("#result").html("<p>Error occurred: " + error.responseJSON.error + "</p>");
                }
            });
        });
    }

    function callkma_regData(reg = []) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/kma_reg",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    reg: reg
                }),
                success: function (data) {
                    if (data.kma_reg_result) {
                        resolve(data.kma_reg_result);
                    } else {
                        reject("Error")
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });
    }

    // 기상 예보
    function callfct_afs_dlData(reg = 0, tmfc1 = 0, tmfc2 = 0) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/fct_afs_dl",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    reg: reg,
                    tmfc1: tmfc1,
                    tmfc2: tmfc2,
                    // pageNo: pageNo,
                    // numOfRows: numOfRows
                }),
                success: function (data) {
                    if (data.fct_afs_dl_result) {
                        resolve(data.fct_afs_dl_result);
                    } else {
                        reject("Error")
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });
    }

    // 기상청 스테이션 정보보
    function callkma_stationData(stn = []) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/kma_station",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    stn: stn
                }),
                success: function (data) {
                    if (data.kma_station_result) {
                        resolve(data.kma_station_result);
                    } else {
                        reject("Error")
                    }
                },
                error: function (data) {
                    console.error("Error:", error);
                    reject(error);
                }
            })
        });
    }

    // 기상청 kma_sfctm2 API
    function callkma_sfctm2Data(tm = 0, stn = 0) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/kma_sfctm2",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tm: tm,
                    stn: stn,
                }),
                success: function (data) {
                    if (data.kma_sfctm2_result) {
                        // console.log(data.kma_sfctm2_result)
                        resolve(data.kma_sfctm2_result);
                    } else {
                        reject("error")
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });
    }

    // 기상청 kma_sfctm3 API
    function callkma_sfctm3Data(tm1 = 0, tm2 = 0, stn = 0) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/kma_sfctm3",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tm1: tm1,
                    tm2: tm2,
                    stn: stn,
                }),
                success: function (data) {
                    if (data.kma_sfctm3_result) {
                        // console.log(data.kma_sfctm3_result)
                        resolve(data.kma_sfctm3_result);
                    } else {
                        reject("error")
                    }
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            });
        });
    }

    // 기상 데이터 모델 입력 형태로로 전처리
    function processWeatherData(weatherData) {
        const inputs = [];
        weatherData.forEach(item => {
            inputs.push([item.temperature, item.wind_speed, item.air_pressure, item.density]);
        });
        return inputs;
    }

    function processWeatherTimeSeriesData(weatherData) {

    }

    // XGB Model Predict
    function callXGBModel(inputs) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/model/xgboost_ai_model",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    inputs: inputs
                }),
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            })
        })
    }

    // RF Model Predict
    function callRFModel(inputs) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/model/rf_model",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    inputs: inputs
                }),
                success: function (data) {
                    // console.log("Response Data:", data);
                    resolve(data); // 성공 시 데이터 반환
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error); // 에러 발생 시 에러 반환
                }
            });
        });
    }

    // CSTL Model Predict
    function callCSTLModel(inputs) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "model/cstl_ai_model",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    inputs: inputs
                }),
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error);
                }
            })
        });
    }

    // Chartjs Graph
    function createChartGraph($target, chartData, chartType = 'line') {
        // jQuery로 캔버스 요소를 가져옵니다.
        const ctx = $($target)[0].getContext('2d');
        const scales = {};

        // y축 설정이 chartData에 있을 경우 적용, 없으면 기본 설정을 사용
        if (chartData.yAxisConfig) {
            // chartData의 y축 설정을 사용
            Object.keys(chartData.yAxisConfig).forEach(axis => {
                scales[axis] = {
                    type: chartData.yAxisConfig[axis].type,
                    position: chartData.yAxisConfig[axis].position
                };
            });
        }

        // Chart.js로 그래프를 생성합니다.
        new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels, // x축 레이블 (datetime)
                datasets: chartData.datasets // 데이터셋
            },
            options: {
                responsive: true,
                scales: scales
            }
        });
    }

    function processWindPowerChart(weatherData, xgbData, rfData, cstlData) {
        // 데이터를 처리하여 그래프에 필요한 데이터 배열을 만듭니다.
        const labels = []; // datetime 배열
        const stations = []; // datetime 배열
        const windSpeeds = []; // 풍속 배열
        const xgb_model = []; // 기압 배열
        const rf_model = []; // 기압 배열
        const cstl_model = []; // 기압 배열
        // 데이터 반복 처리
        weatherData.forEach(item => {
            stations.push(item.station_id); // datetime을 x축 레이블로 사용
            windSpeeds.push(parseFloat(item.wind_speed)); // 풍속을 배열에 추가
        });
        xgbData.forEach(item => {
            xgb_model.push(parseFloat(item));
        });
        rfData.forEach(item => {
            rf_model.push(parseFloat(item));
        });
        cstlData.forEach(item => {
            cstl_model.push(parseFloat(item));
        })

        // console.log(stations)
        callkma_stationData(stations).then(function (stationData) {
            stationData.forEach(item => {
                labels.push(item.station_name);
            })
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: '풍속 (m/s)', // 풍속 그래프
                    data: windSpeeds,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(78, 230, 184)',
                    borderWidth: 1,
                    yAxisID: 'y1' // 첫 번째 y축
                },
                {
                    label: 'XGB Model (MW)', // 기압 그래프
                    data: xgb_model,
                    backgroundColor: 'rgba(243, 84, 97, 0.2)',
                    borderColor: 'rgb(243, 84, 97)',
                    borderWidth: 1,
                    yAxisID: 'y2' // 첫 번째 y축
                },
                {
                    label: 'RF Model (MW)', // 기압 그래프
                    data: rf_model,
                    backgroundColor: 'rgba(84, 100, 243, 0.2)',
                    borderColor: 'rgb(84, 100, 243)',
                    borderWidth: 1,
                    yAxisID: 'y2' // 첫 번째 y축
                },
                {
                    label: 'CSTL Model (MW)', // 기압 그래프
                    data: cstl_model,
                    backgroundColor: 'rgba(210, 31, 255, 0.2)',
                    borderColor: 'rgb(210, 31, 255)',
                    borderWidth: 1,
                    yAxisID: 'y2' // 첫 번째 y축
                },
            ],
            yAxisConfig: { // y축 설정 추가
                y1: {
                    title: '풍속 (m/s)',
                    beginAtZero: true,
                    type: 'linear',
                    position: 'left'
                },
                y2: {
                    title: '발전량 (MW)',
                    beginAtZero: true,
                    type: 'linear',
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // 오른쪽 y축의 격자선 제거
                    }
                }
            }
        }
    }

    // Chart.js를 사용해 도넛 차트를 생성
    function createDonutChart($target, chartData, chartType = 'doughnut') {
        const ctx = $($target)[0].getContext('2d');
        const labels = Object.keys(chartData);
        const values = Object.values(chartData);

        new Chart(ctx, {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: '발전원별 발전량',
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                        'rgba(83, 102, 255, 0.6)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value.toLocaleString()} MWh`;
                            }
                        }
                    }
                }
            }
        });
    }

    // AmChart
    // GaugeChart
    function createGaugeChart(target) {
        // Apply theme
        am4core.useTheme(am4themes_animated);

        // Create chart
        let chart = am4core.create(target, am4charts.GaugeChart);

        // Disable logo
        if (chart.logo) {
            chart.logo.disabled = true;
        }

        // Chart settings
        chart.radius = 120;
        chart.innerRadius = -30;
        chart.startAngle = 180;
        chart.endAngle = 360;

        // Create axis
        let axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = 0;
        axis.max = 300;
        axis.strictMinMax = true;

        // // Add ranges
        // let bandsData = [
        //     { title: "", color: "#ee1f25", startValue: 0, endValue: 60 },
        //     { title: "", color: "#f04922", startValue: 60, endValue: 120 },
        //     { title: "", color: "#fdae19", startValue: 120, endValue: 180 },
        //     { title: "", color: "#f3eb0c", startValue: 180, endValue: 240 },
        //     { title: "", color: "#0f9747", startValue: 240, endValue: 300 }
        // ];
        // #ff7d82
        // #ffbc7d
        // #fdff7d
        // #bcff7d
        // #7da6ff
        // #c07dff

        // '#ff6384',
        // '#ff9f40',
        // '#ffce56',
        // '#4bc0c0',
        // '#36a2eb',
        // 'rgba(153, 102, 255, 0.6)',
        // 'rgba(199, 199, 199, 0.6)',
        // 'rgba(83, 102, 255, 0.6)'
        let bandsData = [
            { title: "", color: "#ff6384", startValue: 0, endValue: 60 },    // 부드러운 빨강
            { title: "", color: "#ff9f40", startValue: 60, endValue: 120 },  // 파스텔 핑크
            { title: "", color: "#ffce56", startValue: 120, endValue: 180 }, // 연한 핑크/살구색
            { title: "", color: "#4bc0c0", startValue: 180, endValue: 240 }, // 부드러운 민트 그린
            { title: "", color: "#36a2eb", startValue: 240, endValue: 300 }  // 파스텔 블루
        ];



        bandsData.forEach(function (data) {
            let range = axis.axisRanges.create();
            range.value = data.startValue;
            range.endValue = data.endValue;
            range.axisFill.fill = am4core.color(data.color);
            range.axisFill.fillOpacity = 1.0;
            range.label.text = data.title;
            range.label.inside = true;
            range.label.location = 0.5;
            range.label.radius = 50;
            range.label.fill = am4core.color("#ffffff");
        });

        // Filter axis labels
        axis.renderer.labels.template.adapter.add("text", function (text, target) {
            const value = target.dataItem.value;
            return bandsData.some(band => band.startValue === value || band.endValue === value) ? text : "";
        });

        // Add hand
        let hand = chart.hands.push(new am4charts.ClockHand());
        hand.value = 0;  // value: 바늘이 처음 가리킬 값(50).
        hand.pin.radius = 25;
        hand.radius = am4core.percent(85);
        hand.innerRadius = am4core.percent(23);
        hand.startWidth = 10;
        hand.fill = am4core.color("#000000");
        hand.pin.fill = am4core.color("#000000");

        // Add value label
        let valueLabel = chart.radarContainer.createChild(am4core.Label);
        valueLabel.horizontalCenter = "middle";
        valueLabel.verticalCenter = "middle";
        valueLabel.fontSize = 20;
        valueLabel.fill = am4core.color("#ffffff");
        valueLabel.padding(10, 10, 10, 10);

        // Attach components to chart for updating later
        chart.hand = hand;
        chart.valueLabel = valueLabel;

        return chart;
    }

    // Updage GaugeChart
    function updateGaugeChart(chart, value) {
        // Immediately display the first value
        chart.hand.showValue(value, 1000, am4core.ease.cubicOut);

        let animation = chart.hand.animate(
            { property: "value", to: value },
            1000,
            am4core.ease.cubicOut
        );

        animation.events.on("animationprogress", function (ev) {
            chart.valueLabel.text = Math.round(ev.progress * value).toString();
        });

        animation.events.on("animationended", function () {
            chart.valueLabel.text = value.toString();
        });

    }

    function createGaugeXYChart(target) {
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        let chart = am4core.create(target, am4charts.XYChart);

        // Remove logo
        if (chart.logo) {
            chart.logo.disabled = true;
        }

        chart.paddingRight = 30;

        // '#ff6384',
        // '#ff9f40',
        // '#ffce56',
        // '#4bc0c0',
        // '#36a2eb',
        // Initial data
        chart.data = [
            { category: "20", value: 0, color: am4core.color("#ff6384") },
            { category: "40", value: 0, color: am4core.color("#ff7a8f") },
            { category: "60", value: 0, color: am4core.color("#ff918a") },
            { category: "80", value: 0, color: am4core.color("#ff9f40") },
            { category: "100", value: 0, color: am4core.color("#ffb454") },
            { category: "120", value: 0, color: am4core.color("#ffc768") },
            { category: "140", value: 0, color: am4core.color("#ffce56") },
            { category: "160", value: 0, color: am4core.color("#ffd86a") },
            { category: "180", value: 0, color: am4core.color("#ffe27e") },
            { category: "200", value: 0, color: am4core.color("#80dfd0") },
            { category: "220", value: 0, color: am4core.color("#66d2c6") },
            { category: "240", value: 0, color: am4core.color("#4bc0c0") },
            { category: "260", value: 0, color: am4core.color("#4ab9d8") },
            { category: "280", value: 0, color: am4core.color("#40aee5") },
            { category: "300", value: 0, color: am4core.color("#36a2eb") },
            // { category: "320", value: 100, color: am4core.color("#36a2eb"), isMax: true }
        ];

        // Create axes
        let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "category";
        categoryAxis.renderer.grid.template.disabled = true;
        categoryAxis.renderer.labels.template.disabled = true;

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;
        valueAxis.renderer.grid.template.disabled = true;
        valueAxis.renderer.labels.template.disabled = true;

        // Create series
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "value";
        series.dataFields.categoryX = "category";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.propertyFields.stroke = "color";
        series.columns.template.strokeWidth = 2;
        series.columns.template.width = am4core.percent(80); // 컬럼 너비를 줄임
        series.columns.template.marginRight = 5; // 컬럼 사이 간격 추가

        // Add a dedicated container for labels
        // let labelContainer = chart.createChild(am4core.Container);
        // labelContainer.isMeasured = false;

        // Return chart instance
        return chart;
    }

    // 값을 업데이트하는 함수
    function updateGaugeXYChart(chart, rawValue) {
        let categories = chart.data.map((item) => item.category);
        let roundedValue = Math.round(rawValue / 20) * 20;
        let targetIndex = categories.indexOf(roundedValue.toString());
        if (targetIndex === -1) return;

        // 모든 막대 높이 초기화 및 기존 라벨 제거
        chart.data.forEach((item) => {
            item.value = 0;
        });
        // labelContainer.children.clear();
        chart.invalidateRawData();

        // 막대 높이 점진적 증가
        let stepDuration = 100;
        for (let i = 0; i <= targetIndex; i++) {
            setTimeout(() => {
                chart.data[i].value = (i + 1) * (100 / (targetIndex + 1));
                chart.invalidateRawData();
            }, i * stepDuration);
        }
        // 로드 시 애니메이션
        chart.appear(500, 50);
    }

    initialize();
});