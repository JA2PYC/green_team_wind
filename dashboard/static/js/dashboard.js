$(document).ready(() => {
    function initialize() {
        callOpen_pabpg();
        // callWindAPI();

        // callkma_sfctm3Data();
        initWidget();
        eventHandler();
    }

    function initWidget() {
        widgetWeather("11G00201");
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

    // 날씨 위젯
    function widgetWeather(reg_id) {
        callfct_afs_dlData(reg_id).then(function (fct_afs_data) {
            const widget = $(".widget.weatherForecast");
            let validWeather = null;
            console.log(fct_afs_data);

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

    // 모델별 예상 발전량 위젯젯
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

    // 풍속 발전량 차트 위젯젯
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
                callChartGraph($windPowerChart, windPowerChartData, 'line');
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
    function callChartGraph($target, chartData, chartType = 'line') {
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

        // Add ranges
        let bandsData = [
            { title: "", color: "#ee1f25", startValue: 0, endValue: 60 },
            { title: "", color: "#f04922", startValue: 60, endValue: 120 },
            { title: "", color: "#fdae19", startValue: 120, endValue: 180 },
            { title: "", color: "#f3eb0c", startValue: 180, endValue: 240 },
            { title: "", color: "#0f9747", startValue: 240, endValue: 300 }
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

        // Initial data
        chart.data = [
            { category: "20", value: 0, color: am4core.color("#ee1f25") },
            { category: "40", value: 0, color: am4core.color("#ee1f25") },
            { category: "60", value: 0, color: am4core.color("#ee1f25") },
            { category: "80", value: 0, color: am4core.color("#f04922") },
            { category: "100", value: 0, color: am4core.color("#f04922") },
            { category: "120", value: 0, color: am4core.color("#f04922") },
            { category: "140", value: 0, color: am4core.color("#fdae19") },
            { category: "160", value: 0, color: am4core.color("#fdae19") },
            { category: "180", value: 0, color: am4core.color("#fdae19") },
            { category: "200", value: 0, color: am4core.color("#f3eb0c") },
            { category: "220", value: 0, color: am4core.color("#f3eb0c") },
            { category: "240", value: 0, color: am4core.color("#f3eb0c") },
            { category: "260", value: 0, color: am4core.color("#0f9747") },
            { category: "280", value: 0, color: am4core.color("#0f9747") },
            { category: "300", value: 0, color: am4core.color("#0f9747") },
            // { category: "320", value: 100, color: am4core.color("#0f9747"), isMax: true }
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