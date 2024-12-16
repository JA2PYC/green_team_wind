$(document).ready(() => {
    function initialize() {
        callData();
        // callPowerAPI();
        callkma_sfctm2Data();
        // callWindAPI();
        eventHandler();
    }

    function eventHandler() {
        $('#testButton').click(function () {
            $('#output').text('jQuery file is working!');
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
        $.ajax({
            url: "/api/kma_sfctm2",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                // tradeYmd: tradeYmd,
                // pageNo: 1,
                // numOfRows: 30
            }),
            success: function (data) {
                console.log(data);
                // 성공 시 응답 데이터를 화면에 표시
                    let resultHtml = "<ul>";
                    data.response.body.items.item.forEach(item => {
                        resultHtml += `<li>Location: ${item.locationName}, Generation: ${item.amount}</li>`;
                    });
                    resultHtml += "</ul>";
                    $("#result").html(resultHtml);
            },
            error: function (error) {
                // 에러 시 메시지 표시
                $("#result").html("<p>Error occurred: " + error.responseJSON.error + "</p>");
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

    initialize();

});