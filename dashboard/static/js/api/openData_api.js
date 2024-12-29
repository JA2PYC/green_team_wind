// 한국전력거래소_발전원별 발전량(계통기준) OPEN API PABG
export function callOpen_pabg(baseDate, pageNo = 1, numOfRows = 300, dataType = "json") {
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

// OPEN DATA API Power Amount By Power Gen
export function callOpen_pabpg() {
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
}
