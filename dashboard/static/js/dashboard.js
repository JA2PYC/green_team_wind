import * as KMA_API from './api/kma_api.js';
import { callOpen_pabg, callOpen_pabpg } from './api/openData_api.js';
import * as KAKAO_MAP from './api/kakaomap.js';

$(document).ready(() => {
    const KAKAO_API_KEY = 'e1ec5378979a9f3ffe97d798bdcd05e1'; // 자신의 Kakao API 키를 입력하세요.

    function initialize() {

        initAPIData();
        // eventHandler();
    }

    // Initialize Weather API
    function initAPIData() {
        // console.log('initAPIData');
        let today = new Date();

        let year = today.getFullYear().toString();
        let month = (today.getMonth() + 1).toString().padStart(2, '0'); // 2자리로 변환
        let date = today.getDate().toString().padStart(2, '0'); // 2자리로 변환
        let hour1 = (today.getHours() - 9).toString().padStart(2, '0'); // 2자리로 변환
        let hour2 = today.getHours().toString().padStart(2, '0'); // 2자리로 변환

        let tm1 = year + month + date + hour1 + '00';
        let tm2 = year + month + date + hour2 + '00';
        let baseDate = year + month + date;

        let kmaFctafsdlData = null
        let kmaSfctm2Data = null;
        let kmaSfctm3Data = null;
        let openPabgData = null;

        Promise.all([
            KMA_API.callfct_afs_dlData("11G00201"),
            KMA_API.callkma_sfctm2Data(),
            KMA_API.callkma_sfctm3Data(tm1, tm2),
            // On/Off Open API Data (Limit 100)
            callOpen_pabg(baseDate)
        ]).then(([responseFctafsdl, responseSfctm2, responseSfctm3, responseOpenPabg]) => {
            kmaFctafsdlData = responseFctafsdl;
            kmaSfctm2Data = responseSfctm2
            kmaSfctm3Data = responseSfctm3;
            openPabgData = responseOpenPabg;

            // Test Log
            console.log('kmaFctafsdlData : ', kmaFctafsdlData);
            console.log('kmaSfctm2Data : ', kmaSfctm2Data);
            console.log('kmaSfctm3Data : ', kmaSfctm3Data);
            console.log('openPabgData : ', openPabgData);

            // Initialize Widget
        }).catch(function (error) {
            console.log('Error : initAPIData', error);
        }).finally(function () {
            console.log('initAPIData Done');
            initWidget(kmaFctafsdlData, kmaSfctm2Data, kmaSfctm3Data, openPabgData);
        });
    }

    // 위젯 초기화
    function initWidget(kmaFctafsdlData, kmaSfctm2Data, kmaSfctm3Data, openPabgData) {
        // let selectedStnNames =
        //     ['춘천', '서울', '인천', '수원', '청주',
        //         '대전', '안동', '대구', '전주', '울산',
        //         '창원', '광주', '부산', '목포', '홍성',
        //         '제주']
        let selectedStnIds =
            ['101', '108', '112', '119', '131',
                '133', '136', '143', '146', '152',
                '155', '156', '159', '165', '177',
                '184'];
        let filteredKmaSfctm2Data = KMA_API.filterkma_sfctm2ByStnId(kmaSfctm2Data, selectedStnIds);
        let filteredKmaSfctm3Data = KMA_API.filterkma_sfctm3ByStnId(kmaSfctm3Data, selectedStnIds);

        widgetMap(filteredKmaSfctm2Data);
        widgetWeather(kmaFctafsdlData);
        widgetPredictPower(kmaSfctm2Data, kmaSfctm3Data, ['184']);
        widgetWindPowerChart(filteredKmaSfctm2Data);
        widgetWindPowerTimeSeriesChart(filteredKmaSfctm2Data, filteredKmaSfctm3Data);
        widgetPowerStation(openPabgData);

    }

    // 지도 위젯
    function widgetMap(filteredKmaSfctm2Data) {
        let processedWeatehr = processWeatherData(filteredKmaSfctm2Data);

        KAKAO_MAP.loadKakaoMapScript(KAKAO_API_KEY)
            .then(() => {
                console.log('Kakao Map script loaded successfully.');
                Promise.all([
                    KAKAO_MAP.getCityData(),
                    callXGBModel(processedWeatehr)
                ]).then(function ([areas, modelData]) {
                    KAKAO_MAP.createMap(areas, modelData);
                }).catch(error => console.error("Failed to initialize Map:", error));
            }).catch((error) => {
                console.error('Error loading Kakao Map script:', error);
            });

        // Promise.all([
        //     KAKAO_MAP.getCityData(),
        //     callXGBModel(processedWeatehr)
        // ]).then(function ([areas, modelData]) {
        //     KAKAO_MAP.createMap(areas, modelData);
        // }).catch(error => console.error("Failed to initialize Map:", error));
    }

    // 날씨 위젯
    function widgetWeather(fct_afs_data = []) {
        const widget = $(".widget.weatherForecast");

        // console.log(fct_afs_data);
        fct_afs_data.forEach((weather, index) => {
            weather.ta == '-99' ? weather.ta = '0' : weather.ta;
            if (index === 0) {
                // Set Indicator
                widget.find(".widgetIndicator.fcLocation").text(weather.stn_name);
                widget.find(".weatherFcTime").text(formatDateTimeToKorean(weather.tm_fc, true));

                // Today's Weather
                const iconClass = getWeatherIcon(weather.wf);
                widget.find(".weather-icon").html(`<i class="${iconClass}"></i>`);
                widget.find(".weather-temp").text(weather.ta + "°C");
                widget.find(".weather-desc").text(weather.wf + ' ' + weather.st + '% ' + weather.w1);
            } else {
                // Weekly Weather
                const forecastElement = $(`
                    <div class="forecast">
                        <i class="forecast-icon ${getWeatherIcon(weather.wf)}"></i>
                        <div class="forecast-temp">${weather.ta}°C</div>
                        <div class="forecast-desc">${weather.wf}</div>
                    </div>`
                );
                widget.find(".weatherWeek").append(forecastElement);
            }
        })
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
            "흐리고 가끔 비": "bi-cloud-rain",
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
    function widgetPowerStation(open_pabg_data) {
        // console.log(open_pabg_data);
        const widget = $(".widget.powerStation");

        if (open_pabg_data.response.body.items.item && open_pabg_data.response.body.items.item.length > 0) {
            const items = open_pabg_data.response.body.items.item;
            // 가장 최근 데이터를 추출
            const latestData = items[items.length - 1];
            let totalPower = parseFloat(latestData.fuelPwrTot || 0);
            let powerEtc = totalPower - latestData.fuelPwr3 - latestData.fuelPwr4 - latestData.fuelPwr6 - latestData.fuelPwr8 - latestData.fuelPwr9;
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
                "태양광": parseFloat(latestData.fuelPwr9 || 0),
                "기타": parseFloat(powerEtc || 0)
            };

            // 도넛 차트를 렌더링
            let $powerStationChart = $('#powerStationCanvas');
            createDonutChart($powerStationChart, chartData, 'doughnut');

            // 커스텀 차트 라벨
            widget.find(".powerStationData .powerStationItem.stationCoal .powerStationValue").text(chartData["유연탄"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationNuclear .powerStationValue").text(chartData["원자력"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationGas .powerStationValue").text(chartData["가스"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationWind .powerStationValue").text(chartData["신재생(풍력)"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationSolar .powerStationValue").text(chartData["태양광"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationEtc .powerStationValue").text(chartData["기타"].toLocaleString() + " MWh");
            widget.find(".powerStationData .powerStationItem.stationTotal .powerStationValue").text(totalPower.toLocaleString() + " MWh");
        } else {
            console.error("Failed to fetch power station data.");
        }
    }

    // 모델별 예상 발전량 위젯
    function widgetPredictPower(kma_sfctm2Data, kma_sfctm3Data, selectedStaionIds = ['184']) {
        let filteredKmaSfctm2Data = KMA_API.filterkma_sfctm2ByStnId(kma_sfctm2Data, selectedStaionIds);
        let filteredKmaSfctm3Data = KMA_API.filterkma_sfctm3ByStnId(kma_sfctm3Data, selectedStaionIds);
        let processedSfctm2 = processWeatherData(filteredKmaSfctm2Data);
        let processedSfctm3 = processWeatherTimeSeriesData(filteredKmaSfctm3Data);
        let gaugeInputs = [];
        let gaugeIntervalId = null;
        let gaugeChartContainer = 'gaugeChart';
        let gaugeChart = createGaugeChart(gaugeChartContainer);
        let gaugeXYChartContainer = 'gaugeXYChart';
        let gaugeXYChart = createGaugeXYChart(gaugeXYChartContainer);
        Promise.all([
            callXGBModel(processedSfctm2),
            callRFModel(processedSfctm2),
            callCSTLModelTimeSeries(processedSfctm3.data)
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
                gaugeInputs.push(Math.round(cstl_model_response.cstl_ai_result[0]));
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

    }

    // 풍속 발전량 차트 위젯
    function widgetWindPowerChart(kma_sfctm2Data) {
        let processedSfctm2 = processWeatherData(kma_sfctm2Data);
        // let processedSfctm3 = processWeatherTimeSeriesData(kma_sfctm3Data);
        let rfData;
        let xgbData;
        // let cstlData;

        // 모델 응답 결과를 기다린 후 진행
        Promise.all([
            callXGBModel(processedSfctm2), // XGB 모델 호출
            callRFModel(processedSfctm2),   // RF 모델 호출
            // callCSTLModelTimeSeries(processedSfctm3.data)
        ]).then(function ([xgb_response, rf_model_response]) {
            // XGB 모델 응답 처리
            if (xgb_response && xgb_response.xgboost_ai_result && xgb_response.xgboost_ai_result.length > 0) {
                xgbData = xgb_response.xgboost_ai_result;
            }
            // RF 모델 응답 처리
            if (rf_model_response && rf_model_response.rf_result && rf_model_response.rf_result.length > 0) {
                rfData = rf_model_response.rf_result;
            }
            // CSTL 모델 응답 처리
            // if (cstl_model_response && cstl_model_response.cstl_ai_result && cstl_model_response.cstl_ai_result.length > 0) {
            //     cstlData = cstl_model_response.cstl_ai_result;
            // }

            // 차트 데이터 처리
            let windPowerChartData = processWindPowerChart(kma_sfctm2Data, xgbData, rfData);
            let $windPowerChart = $('#windPowerCanvas');
            createChartGraph($windPowerChart, windPowerChartData, 'bar');
        }).catch(function (error) {
            console.error('Error in fetching model data:', error);
        });
    }

    function widgetWindPowerTimeSeriesChart(kma_sfctm2Data, kma_sfctm3Data) {
        // let processedSfctm2 = processWeatherData(kma_sfctm2Data);
        let processedSfctm3 = processWeatherTimeSeriesData(kma_sfctm3Data);
        let cstlData;

        // CSTL 모델 응답 처리
        callCSTLModelTimeSeries(processedSfctm3.data).then(function (cstl_model_response) {
            if (cstl_model_response && cstl_model_response.cstl_ai_result && cstl_model_response.cstl_ai_result.length > 0) {
                cstlData = cstl_model_response.cstl_ai_result;
            }
            // console.log('cstl_model_response : ',cstl_model_response)
            // console.log('cstlData : ',cstlData)
            // 차트 데이터 처리
            let windPowerTimeSeriesChartData = processWindPowerTimeSeriesChart(kma_sfctm2Data, cstlData);
            // console.log('windPowerTSChartData : ',windPowerTimeSeriesChartData)
            let $windPowerTimeSeriesChart = $('#windPowerTimeSeriesCanvas');
            createChartGraph($windPowerTimeSeriesChart, windPowerTimeSeriesChartData, 'line');
        }).catch(function (error) {
            console.error('Error in fetching model data:', error);
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

    // 기상 데이터 모델 입력 형태로로 전처리
    function processWeatherData(weatherData) {
        const inputs = [];
        weatherData.forEach(item => {
            inputs.push([item.temperature, item.wind_speed, item.air_pressure, item.density]);
        });
        return inputs;
    }

    function processWeatherTimeSeriesData(weatherData) {
        // Process Data for CSTL Model
        const groupedData = {};
        // console.log(weatherData)
        // 데이터를 반복하면서 그룹화
        weatherData.forEach(item => {
            const stationId = item.station_id;
            if (!groupedData[stationId]) {
                groupedData[stationId] = [];
            }
            groupedData[stationId].push([item.temperature, item.wind_speed, item.air_pressure, item.density]);
        });

        // 길이가 10 이상인 데이터만 필터링
        const filteredData = [];
        const stationIds = [];  // station_id만 별도로 저장

        $.each(groupedData, function (stationId, data) {
            // 길이가 10 미만이면 제외
            if (data.length >= 10) {
                filteredData.push(data);
                stationIds.push(stationId);
            }
        });

        // # 길이가 10 이상인 데이터만 반환
        return {
            stationIds: stationIds,
            data: filteredData
        };
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
        // console.log(inputs)
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

    function callCSTLModelTimeSeries(inputs) {
        // console.log(inputs)
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "model/cstl_ai_model_sq",
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

    function processWindPowerChart(weatherData, xgbData, rfData) {
        // 데이터를 처리하여 그래프에 필요한 데이터 배열을 만듭니다.
        const labels = []; // datetime 배열
        const stations = []; // datetime 배열
        const windSpeeds = []; // 풍속 배열
        const xgb_model = []; // 기압 배열
        const rf_model = []; // 기압 배열
        // const cstl_model = []; // 기압 배열
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
        // cstlData.forEach(item => {
        //     cstl_model.push(parseFloat(item));
        // })

        // console.log(stations)
        KMA_API.callkma_stationData(stations).then(function (stationData) {
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
                // {
                //     label: 'CSTL Model (MW)', // 기압 그래프
                //     data: cstl_model,
                //     backgroundColor: 'rgba(210, 31, 255, 0.2)',
                //     borderColor: 'rgb(210, 31, 255)',
                //     borderWidth: 1,
                //     yAxisID: 'y2' // 첫 번째 y축
                // },
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

    function processWindPowerTimeSeriesChart(weatherData, cstlData) {
        // 데이터를 처리하여 그래프에 필요한 데이터 배열을 만듭니다.
        const labels = []; // datetime 배열
        const stations = []; // datetime 배열
        const windSpeeds = []; // 풍속 배열
        const cstl_model = []; // 기압 배열
        // 데이터 반복 처리
        weatherData.forEach(item => {
            stations.push(item.station_id); // datetime을 x축 레이블로 사용
            windSpeeds.push(parseFloat(item.wind_speed)); // 풍속을 배열에 추가
        });
        cstlData.forEach(item => {
            cstl_model.push(parseFloat(item));
        })

        // console.log(stations)
        KMA_API.callkma_stationData(stations).then(function (stationData) {
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
                        display: false,
                        // position: 'bottom',
                        // labels: {
                        //     boxWidth: 10,
                        //     font: {
                        //         size: 12
                        //     }
                        // }
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

    initialize();
});