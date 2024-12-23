$(document).ready(() => {
    function initialize() {
        // callPowerAPI();
        // callWindAPI();
        // callkma_sfctm3Data();
        initWidget();
        eventHandler();
    }

    function initWidget() {
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

    function widgetPredictPower(station_id = 184) {
        callkma_sfctm2Data(tm = 0, station_id).then(function (kma_sfctm2Data) {
            let processedWeatehr = processWeatherData(kma_sfctm2Data);
            let gaugeInputs = [];
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

                updateGaugeChart(gaugeChart, gaugeInputs); // 150으로 업데이트
                updateGaugeXYChart(gaugeXYChart, gaugeInputs);

            }).catch(function (error) {
                console.log("Error:", error)
            });
        });

    }


    // Widget Wind Power Chart
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
                let $windPowerChart = $('#windPowerChart');
                callChartGraph($windPowerChart, windPowerChartData, 'line');
            }).catch(function (error) {
                console.error('Error in fetching model data:', error);
            });
        });
    }

    function callPowerAPI() {
        $("#powerForm").on("submit", function (event) {
            event.preventDefault(); // 기본 폼 제출 방지

            // 폼 데이터 가져오기
            const tradeYmd = $("#tradeYmd").val();

            // POST 요청 보내기
            $.ajax({
                url: "/api/power",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    tradeYmd: tradeYmd,
                    pageNo: 1,
                    numOfRows: 30
                }),
                success: function (data) {
                    // console.log(data);
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

    let intervalGaugeId = null;

    function updateGaugeChart(chart, values) {
        if (intervalGaugeId) {
            clearInterval(intervalGaugeId); // Stop any existing cycle
        }

        let index = 1; // Start with the second value in the array

        // Immediately display the first value
        const initialValue = values[0];
        chart.hand.showValue(initialValue, 1000, am4core.ease.cubicOut);

        let animation = chart.hand.animate(
            { property: "value", to: initialValue },
            1000,
            am4core.ease.cubicOut
        );

        animation.events.on("animationprogress", function (ev) {
            chart.valueLabel.text = Math.round(ev.progress * initialValue).toString();
        });

        animation.events.on("animationended", function () {
            chart.valueLabel.text = initialValue.toString();
        });

        intervalGaugeId = setInterval(() => {
            const value = values[index];
            // console.log(index)
            chart.hand.showValue(value, 1000, am4core.ease.cubicOut);

            // Animate value label
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

            // Move to the next value in the array
            index = (index + 1) % values.length;
        }, 3000); // Update every 3 seconds
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

        let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.min = 0;
        valueAxis.max = 100;
        valueAxis.strictMinMax = true;

        // Create series
        let series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "value";
        series.dataFields.categoryX = "category";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.width = am4core.percent(80);

        // Add a dedicated container for labels
        let labelContainer = chart.createChild(am4core.Container);
        labelContainer.isMeasured = false;

        // Return chart instance
        return chart;
    }


    function updateGaugeXYChart(chart, targetCategory, rawValue) {
        let targetIndex = chart.data.findIndex((item) => item.category === targetCategory);
        if (targetIndex === -1) return;

        // Reset and animate
        chart.data.forEach((item, index) => {
            item.value = index <= targetIndex ? (index + 1) * (100 / (targetIndex + 1)) : 0;
        });
        chart.invalidateRawData();

        // Add label to the top of the target column
        let series = chart.series.values[0];
        let targetColumn = series.columns.getIndex(targetIndex);
        if (targetColumn) {
            let label = chart.createChild(am4core.Label);
            label.text = rawValue.toString();
            label.horizontalCenter = "middle";
            label.verticalCenter = "bottom";
            label.x = targetColumn.pixelX + targetColumn.pixelWidth / 2;
            label.y = targetColumn.pixelY - 10;
        }
    }


    initialize();
});