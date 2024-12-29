// Weather Data Filter By Station Name
export function filterkma_sfctm2ByStnName(weatherData = [], stationNames = []) {
    return weatherData.filter((data) => stationNames.includes(data.station_name));
}

export function filterkma_sfctm2ByStnId(weatherData = [], stationIds = []) {
    return weatherData.filter((data) => stationIds.includes(data.station_id));
}

// 기상청 예보구역 정보 BY JSON
export function callkma_regData(reg = []) {
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

// 기상청 스테이션 정보 BY JSON
export function callkma_stationData(stn = []) {
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

// 기상청 API 예특보 단기예보 단기육상예보 fct_afs_dl
export function callfct_afs_dlData(reg = 0, tmfc1 = 0, tmfc2 = 0) {
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


// 기상청 API 지상관측 시간자료 kma_sfctm2
export function callkma_sfctm2Data(tm = 0, stn = 0) {
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

// 기상청 API 지상관측 시간자료(기간조회) kma_sfctm3
export function callkma_sfctm3Data(tm1 = 0, tm2 = 0, stn = 0) {
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
