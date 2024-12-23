$(document).ready(() => {
    function initialize() {
        // callData();
        // callPowerAPI();
        // callWindAPI();
        callkma_stationData([90, 184]);
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

            Promise.all([
                callXGBModel(processedWeatehr),
                callRFModel(processedWeatehr),
                callCSTLModel(processedWeatehr)
            ]).then(function ([xgb_response, rf_model_response, cstl_model_response]) {
                if (xgb_response.xgboost_ai_result) {
                    $(".widget.predictPower .xgboost_value").text(xgb_response.xgboost_ai_result[0] + ' MW');
                }
                if (rf_model_response.rf_result) {
                    $(".widget.predictPower .rf_value").text(rf_model_response.rf_result[0] + ' MW');
                }
                if (cstl_model_response.cstl_ai_result && cstl_model_response.cstl_ai_result.length > 0) {
                    $(".widget.predictPower .cstl_value").text(cstl_model_response.cstl_ai_result[0] + ' MW');
                }
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
                        console.log(data.kma_sfctm3_result)
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

    // Make Chart Graph
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

    function processWeatherData(weatherData) {
        const inputs = [];
        weatherData.forEach(item => {
            inputs.push([item.temperature, item.wind_speed, item.air_pressure, item.density]);
        });
        return inputs;
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

        console.log(stations)
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



    // const ctx = document.getElementById('myChart').getContext('2d');
    // const chart = new Chart(ctx, {
    //     type: 'bar',
    //     data: {
    //         labels: [], // 초기 레이블
    //         datasets: [{
    //             label: '예상 발전량 (MW)',
    //             data: [], // 초기 데이터
    //             backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //             borderColor: 'rgba(75, 192, 192, 1)',
    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true, // 차트 크기가 자동으로 조절되도록 설정
    //         maintainAspectRatio: true, // 차트의 가로 세로 비율을 유지하지 않음
    //         // 차트 애니메이션 효과를 설정
    //         animation: {
    //             duration: 500, // 애니메이션 지속 시간을 설정
    //             easing: 'ease-in-out' // 애니메이션의 변화 속도 설정
    //         },
    //         scales: {
    //             y: {
    //                 beginAtZero: true
    //             }
    //         }
    //     }
    // });

    // // 차트 업데이트 함수
    // function updateChart(labels, values) {
    //     chart.data.labels = labels; // X축 레이블 업데이트
    //     chart.data.datasets[0].data = values; // Y축 데이터 업데이트
    //     chart.update(); // 차트 다시 렌더링
    // }

    // // Call Chart
    // function callChart() {
    //     let inputs = [
    //         [12, 1, 1023, 1023 * 100 / (287.05 * (12 + 273.15))],
    //         [15, 2, 1015, 1015 * 100 / (287.05 * (15 + 273.15))],
    //         [10, 3, 1020, 1020 * 100 / (287.05 * (10 + 273.15))],
    //         [18, 4, 1010, 1010 * 100 / (287.05 * (18 + 273.15))]
    //     ];

    //     // callRFModel 실행 후 서버로 데이터 전송 및 차트 업데이트
    //     callRFModel(inputs).then(function (response) {
    //         // console.log(response)
    //         if (response && response.rf_result && response.rf_result.length > 0) {
    //             // Flask로 데이터 전송
    //             fetch('/api/chart_data', {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ rf_result: response.rf_result })
    //             })
    //                 .then(res => res.json())
    //                 .then(data => {
    //                     // console.log("Received data from Flask:", data);
    //                     updateChart(data.labels, data.values); // 차트 업데이트
    //                 })
    //                 .catch(error => {
    //                     console.error("Error updating chart:", error);
    //                 });

    //         } else {
    //             console.error("Invalid data format:", response);
    //         }
    //     })
    //         .catch(function (error) {
    //             console.error("Error calling RF model:", error);
    //         });


    // }


    initialize();

});