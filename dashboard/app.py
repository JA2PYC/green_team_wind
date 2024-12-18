from flask import Flask, request, render_template, jsonify
# from api.power import fetch_power_data
from api.kma_sfctm2 import fetch_kma_sfctm2_data
from models.random_forest_model import rf_model_predict
import random
import json

app = Flask(__name__)

# from flask_mysqldb import MySQL
# app.config['MYSQL_HOST'] = 'localhost' 
# app.config['MYSQL_USER'] = 'root' 
# app.config['MYSQL_PASSWORD'] = '1234' 
# app.config['MYSQL_DB'] = 'weather_db' 
# mysql = MySQL(app)

# 라우트 설정
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/data')
def get_data():
    # 더미 데이터 생성 (실제 데이터로 교체 가능)
    data = {
        "labels": ["January", "February", "March", "April", "May"],
        "values": [random.randint(0, 100) for _ in range(5)]
    }
    return jsonify(data)


# @app.route("/api/power", methods=["POST"])
# def power_data():
#     # 클라이언트로부터 요청받은 파라미터
#     params = request.json
#     trade_ymd = params.get("tradeYmd")
#     page_no = params.get("pageNo", 1)
#     num_of_rows = params.get("numOfRows", 30)

#     # power.py의 fetch_power_data 함수 호출
#     result = fetch_power_data(trade_ymd, page_no, num_of_rows)

#     # 결과 반환
#     return jsonify(result)

@app.route("/api/kma_sfctm2", methods=["POST"])
def kma_sfctm2_data():
    # 클라이언트로부터 요청받은 파라미터
    params = request.json
    tm = params.get("tm")
    stn = params.get("stn")

    result = fetch_kma_sfctm2_data(tm, stn)
    # 결과 반환
    return result

@app.route("/model/rf_model", methods=["POST"])
def rf_model_data():
    try:
        # Assuming you get the values from the request (e.g., JSON payload)
        data = request.get_json()

        # # Temperature (°C), "wind velocity (m/s)," "local atmospheric pressure (hPa)," "air density (kg/m^3)"
        # print ("route rf_model")
        # temp = float(data.get('temp'))
        # wind = float(data.get('wind'))
        # atmos = float(data.get('atmos'))
        # density = float(data.get('density'))
        # print(temp, type(temp))
        # print(wind, type(wind))
        # print(atmos, type(atmos))
        # print(density, type(density))

        # # Call the rf_model_predict function
        # predicted_value = rf_model_predict(temp, wind, atmos, density)

        # # Return the predicted value as a JSON response
        # return jsonify({'predicted_power': predicted_value})

        # JSON 데이터의 'inputs' 키에서 값 가져오기
        # 예시: {"inputs": [[4, 14, 24, 184], [5, 12, 22, 190], [6, 15, 25, 200]]}
        inputs = data.get("inputs")
        print("route rf_model - inputs")
        print(inputs, type(inputs))
        
        # 입력 검증: inputs가 리스트인지 확인
        if not isinstance(inputs, list) or not all(isinstance(row, list) and len(row) == 4 for row in inputs):
            return jsonify({"error": "Invalid input format. 'inputs' must be a list of 4-value lists."}), 400

        # rf_model_predict 함수 호출
        predictions = rf_model_predict(inputs)

        # 결과를 JSON으로 반환
        return jsonify({'predicted_power': predictions})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
