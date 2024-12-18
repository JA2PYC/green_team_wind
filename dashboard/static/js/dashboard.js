$(document).ready(() => {
    function initialize() {
        // callData();
        // callPowerAPI();
        // callkma_sfctm2Data();
        // callWindAPI();

        // Dummy data
        // feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]        
        initWidget();
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
                        console.log("Returned data:", response);

                        // 예상 발전량을 forecast-now 요소에 업데이트
                        if (response && response.predicted_power && response.predicted_power.length > 0) {
                            $("#forecast-now").text(response.predicted_power.join(", ") + " MW");
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
            console.log("Returned data:", response);

            // 예상 발전량을 forecast-now 요소에 업데이트
            if (response && response.predicted_power && response.predicted_power.length > 0) {
                $("#forecast-now").text(response.predicted_power.join(", ") + " MW");
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

    function callData() {
        fetch('/data')
            .then(response => response.json())
            .then(data => {
                const ctx = document.getElementById('chart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Sample Data',
                            data: data.values,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
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

    function callkma_sfctm2Data() {
        let now = new Date();
        $.ajax({
            url: "/api/kma_sfctm2",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                // tm: 202412160900,
                stn: 184,
            }),
            success: function (data) {
                console.log(data);
                // 성공 시 응답 데이터를 화면에 표시
                // let resultHtml = "<ul>";
                // data.response.body.items.item.forEach(item => {
                //     resultHtml += `<li>Location: ${item.locationName}, Generation: ${item.amount}</li>`;
                // });
                // resultHtml += "</ul>";
                // $("#result").html(resultHtml);
            },
            error: function (error) {
                // 에러 시 메시지 표시
                $("#result").text("Error occurred: " + error.responseJSON.error);
            }
        });
    }

    function callWindAPI() {
        // API 요청 URL과 파라미터
        const API_KEY = "eHgX5J93R2wPgAq/JUQzHP3xbkJ16lQIJXvQeY4fxh3EutJ9W/REVVrb84PbqmDitlWiLPtmcxDg8TqhaV0TlQ=="; // 발급받은 API 키를 여기에 입력하세요
        const url = `https://apis.data.go.kr/B551893/wind-power-by-hour/list?serviceKey=${API_KEY}&startD=20241215&endD=20241216`;

        // API 호출 함수
        async function fetchData() {
            try {
                // fetch를 사용하여 데이터 가져오기
                const response = await fetch(url, { method: "GET" });


                // HTTP 상태 코드 확인
                if (!response.ok) {
                    throw new Error(`HTTP Error! status: ${response.status}`);
                }

                // JSON 응답 처리
                const data = await response.json();
                console.log("API 데이터:", data);
            } catch (error) {
                console.error("API 요청 중 오류 발생:", error);
            }
        }

        // 함수 실행
        fetchData();

    }

    function callRFModel(inputs) {
        console.log("Input Data:", inputs);


        // Promise 반환
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/model/rf_model",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    inputs: inputs // 여러 값의 배열을 JSON으로 보냄
                }),
                success: function (data) {
                    console.log("Response Data:", data);
                    resolve(data); // 성공 시 데이터 반환
                },
                error: function (error) {
                    console.error("Error:", error);
                    reject(error); // 에러 발생 시 에러 반환
                }
            });
        });
        // // Ajax POST 요청
        // $.ajax({
        //     url: "/model/rf_model",
        //     method: "POST",
        //     contentType: "application/json",
        //     data: JSON.stringify({
        //         inputs: inputs  // 여러 값의 배열을 JSON으로 보냄
        //     }),
        //     success: function (data) {
        //         console.log("Response Data:", data);

        //         return data;
        //     },
        //     error: function (error) {
        //         console.error("Error:", error);
        //     }
        // });

    }

    initialize();

});