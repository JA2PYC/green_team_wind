from flask import Flask, request, render_template, jsonify
# from api.power import fetch_power_data
from api.kma_sfctm2 import fetch_kma_sfctm2_data
import random

app = Flask(__name__)

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
def power_data():
    # 클라이언트로부터 요청받은 파라미터
    # params = request.json
    # trade_ymd = params.get("tradeYmd")
    # page_no = params.get("pageNo", 1)
    # num_of_rows = params.get("numOfRows", 30)

    # power.py의 fetch_power_data 함수 호출
    result = fetch_kma_sfctm2_data()

    # 결과 반환
    return jsonify(result)

