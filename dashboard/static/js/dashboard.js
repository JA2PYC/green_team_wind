$(document).ready(() => {
    function initialize() {
        // callData();
        // callPowerAPI();
        // callWindAPI();

        // Dummy data
        // feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]        
        initWidget();
        // callChart();
        eventHandler();
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
                callRFModel(inputs)
                    .then(function (response) {
                        // console.log("Returned data:", response);

                        // 예상 발전량을 forecast-now 요소에 업데이트
                        if (response && response.rf_result && response.rf_result.length > 0) {
                            $("#forecast-now").text(response.rf_result.join(", ") + " MW");
                        } else {
                            console.error("Invalid data format:", response);
                            $("#forecast-now").text("Error");
                        }
                    })
                    .catch(function (error) {
                        console.error("Error calling RF model:", error);
                        $("#forecast-now").text("Error");
                    });
            }
        });
    }

    function initWidget() {
        let inputs = [
            [12, 1, 1023, 1023 * 100 / (287.05 * (12 + 273.15))],
            // [15, 2, 1015, 1015 * 100 / (287.05 * (15 + 273.15))],
            // [10, 3, 1020, 1020 * 100 / (287.05 * (10 + 273.15))],
            // [18, 4, 1010, 1010 * 100 / (287.05 * (18 + 273.15))]
        ];

        callRFModel(inputs).then(function (response) {
            // console.log("Returned data:", response);

            // 예상 발전량을 forecast-now 요소에 업데이트
            if (response && response.rf_result && response.rf_result.length > 0) {
                $("#forecast-now").text(response.rf_result.join(", ") + " MW");
            } else {
                console.error("Invalid data format:", response);
                $("#forecast-now").text("Error");
            }
        })
            .catch(function (error) {
                console.error("Error calling RF model:", error);
                $("#forecast-now").text("Error");
            });


        callkma_sfctm2Data().then(function (kma_sfctm2Data) {

            let rf_model_data = processWeathertoRFData(kma_sfctm2Data);


            let weatherData = processWeatherChart(kma_sfctm2Data);
            console.log(weatherData);
            let $weatherChart = $('#windPowerChart');
            callChartGraph($weatherChart, weatherData, 'line')

        });

    }

    function processWeathertoRFData(weatherData) {


    }

    function processWeatherChart(weatherData, predictData) {
        // 데이터를 처리하여 그래프에 필요한 데이터 배열을 만듭니다.
        const labels = []; // datetime 배열
        const temperatures = []; // 온도 배열
        const rf_model = []; // 기압 배열
        const windSpeeds = []; // 풍속 배열

        // 데이터 반복 처리
        weatherData.forEach(item => {
            labels.push(item.station_id); // datetime을 x축 레이블로 사용
            windSpeeds.push(parseFloat(item.wind_speed)); // 풍속을 배열에 추가
        });



        return {
            labels: labels,
            datasets: [
                {
                    label: '예측치 (MW)', // 기압 그래프
                    data: rf_model,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '풍속 (m/s)', // 풍속 그래프
                    data: windSpeeds,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        };
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

    function callkma_sfctm2Data(tn = 0, stn = 0) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/api/kma_sfctm2",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    // tm: 202412160900,
                    // stn: 184,
                }),
                success: function (data) {
                    if (data.kma_sfctm2_result) {
                        console.log(data.kma_sfctm2_result)
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

    function callChartGraph($target, chartData, chartType = 'line') {
        // jQuery로 캔버스 요소를 가져옵니다.
        console.log($target)
        console.log(chartData)
        const ctx = $($target)[0].getContext('2d');

        // Chart.js로 그래프를 생성합니다.
        new Chart(ctx, {
            type: chartType, 
            data: {
                labels: chartData.labels, // x축 레이블 (datetime)
                datasets: chartData.datasets // 데이터셋
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false // y축은 0부터 시작하지 않음
                    }
                }
            }
        });
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