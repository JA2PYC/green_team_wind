from flask import Blueprint, render_template, request, jsonify
from api.kakao_city import get_kakao_city_data
from api.kma_reg import fetch_reg_data
from api.kma_station import fetch_station_data
from api.kma_sfctm2 import fetch_kma_sfctm2_data
from api.kma_sfctm3 import fetch_kma_sfctm3_data
from api.fct_afs_dl import fetch_fct_afs_dl_data
from api.open_api_PwrAmountByGen import fetch_open_pabg_data
from api.open_api_PvAmountByPwrGen import fetch_power_data
# from api.open_api_wind_power_by_hour import fetch_wind_data
from models.random_forest_model import rf_model_predict
from models.jeju_xgboost_ai_model import xgboost_ai_model_predict
from models.jeju_cstl_ai_model import cstl_ai_model_predict

# 라우트 설정
dashboard = Blueprint("dashboard", __name__)

# from flask_mysqldb import MySQL
# app.config['MYSQL_HOST'] = 'localhost'
# app.config['MYSQL_USER'] = 'root'
# app.config['MYSQL_PASSWORD'] = '1234'
# app.config['MYSQL_DB'] = 'weather_db'
# mysql = MySQL(app)


# 라우트 설정
@dashboard.route("/")
def dashboard_route():
    return render_template("dashboard.html")

# Kakao Map API
@dashboard.route("/api/kakao_city", methods=["POST"])
def kakao_city_data():
    try:
        print('route - kakao_city')
        # 클라이언트로부터 요청받은 파라미터
        # params = request.json
        # city = params.get("city")
        
        result = get_kakao_city_data()
        return jsonify({"kakao_city_result": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 한국전력거래소_발전원별 발전량(계통기준) OPEN API PABG
@dashboard.route("/api/open_pabg", methods=["POST"])
def open_pabg_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        baseDate = params.get("baseDate")
        pageNo = params.get("pageNo", 1)
        numOfRows = params.get("numOfRows", 300)
        dataType = params.get("dataType", "json")

        # fetch_open_pabg_data 함수 호출
        result = fetch_open_pabg_data(baseDate, pageNo, numOfRows, dataType)

        return jsonify({"open_pabg_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 공공 데이터 PvAmountByPowerGen API
@dashboard.route("/api/open_pabpg", methods=["POST"])
def power_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        trade_ymd = params.get("tradeYmd")
        page_no = params.get("pageNo", 1)
        num_of_rows = params.get("numOfRows", 30)

        # power.py의 fetch_power_data 함수 호출
        result = fetch_power_data(trade_ymd, page_no, num_of_rows)

        # 결과 반환
        return jsonify({"open_pabpg_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# kma_reg 지역 정보
@dashboard.route("/api/kma_reg", methods=["POST"])
def kma_reg_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        reg = params.get("reg")

        # fetch_reg_data 함수 호출
        result = fetch_reg_data(reg)

        return jsonify({"kma_reg_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# kma_station_id 스테이션 정보
@dashboard.route("/api/kma_station", methods=["POST"])
def kma_station_data():
    try:
        # print('route - station')
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        stn = params.get("stn")
        # print(stn, type(stn))

        # fetch_station_data 함수 호출
        result = fetch_station_data(stn)

        return jsonify({"kma_station_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# kma_sfctm2 기상 데이터
@dashboard.route("/api/kma_sfctm2", methods=["POST"])
def kma_sfctm2_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        tm = params.get("tm")
        stn = params.get("stn")

        result = fetch_kma_sfctm2_data(tm, stn)

        return jsonify({"kma_sfctm2_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# kma_sfctm3 기상 데이터
@dashboard.route("/api/kma_sfctm3", methods=["POST"])
def kma_sfctm3_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        tm1 = params.get("tm1")
        tm2 = params.get("tm2")
        stn = params.get("stn")

        result = fetch_kma_sfctm3_data(tm1, tm2, stn)

        return jsonify({"kma_sfctm3_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dashboard.route("/api/fct_afs_dl", methods=["POST"])
def fct_afs_dl_data():
    try:
        # 클라이언트로부터 요청받은 파라미터
        params = request.json
        stn = params.get("stn")
        reg = params.get("reg")
        # tmfc = params.get("tmfc")
        tmfc1 = params.get("tmfc1")
        tmfc2 = params.get("tmfc2")

        result = fetch_fct_afs_dl_data(stn, reg, tmfc1, tmfc2)

        return jsonify({"fct_afs_dl_result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# XGB 모델
@dashboard.route("/model/xgboost_ai_model", methods=["POST"])
def xgboost_ai_data():
    try:
        data = request.get_json()
        inputs = data.get("inputs")

        if not isinstance(inputs, list) or not all(
            isinstance(row, list) and len(row) == 4 for row in inputs
        ):
            return jsonify({"error": "Invalid input format."}), 400

        predictions = xgboost_ai_model_predict(inputs)

        return jsonify({"xgboost_ai_result": predictions})
    except Exception as e:
        return jsonify({"error": e}), 500


# RF 모델
@dashboard.route("/model/rf_model", methods=["POST"])
def rf_model_data():
    try:
        # # Temperature (°C), "wind velocity (m/s)," "local atmospheric pressure (hPa)," "air density (kg/m^3)"
        data = request.get_json()
        inputs = data.get("inputs")

        # 입력 검증: inputs가 리스트인지 확인
        if not isinstance(inputs, list) or not all(
            isinstance(row, list) and len(row) == 4 for row in inputs
        ):
            return (
                jsonify(
                    {
                        "error": "Invalid input format. 'inputs' must be a list of 4-value lists."
                    }
                ),
                400,
            )

        # rf_model_predict 함수 호출
        predictions = rf_model_predict(inputs)

        # 결과를 JSON으로 반환
        return jsonify({"rf_result": predictions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# CSTL 모델
@dashboard.route("/model/cstl_ai_model", methods=["POST"])
def cstl_ai_data():
    try:
        data = request.get_json()
        inputs = data.get("inputs")

        if not isinstance(inputs, list) or not all(
            isinstance(row, list) and len(row) == 4 for row in inputs
        ):
            return jsonify({"error": "Invalid input format."}), 400

        predictions = cstl_ai_model_predict(inputs)

        return jsonify({"cstl_ai_result": predictions})
    except Exception as e:
        return jsonify({"error": e}), 500


# Chart Data
# @dashboard.route('/api/chart_data', methods=['POST'])
# def chart_data():
#     # 클라이언트에서 보낸 데이터를 가져옴
#     received_data = request.json
#     print(received_data)
#     if not received_data or 'rf_result' not in received_data:
#         return jsonify({"error": "Invalid data format"}), 400

#     # Flask에서 처리된 결과를 반환
#     data = {
#         "labels": ["00:00", "01:00", "02:00", "03:00"],
#         "values": received_data['rf_result']  # 클라이언트로부터 받은 데이터 사용
#     }
#     return jsonify(data)

# Dummy Chart
# @dashboard_bp.route('/data')
# def get_data():
#     # 더미 데이터 생성 (실제 데이터로 교체 가능)
#     data = {
#         "labels": ["January", "February", "March", "April", "May"],
#         "values": [random.randint(0, 100) for _ in range(5)]
#     }
#     return jsonify(data)
