from flask import Flask, render_template, jsonify
import requests
from dotenv import load_dotenv
import os
import urllib3
import xml.etree.ElementTree as ET

app = Flask(__name__)

# .env 파일 로드
load_dotenv()

# 환경 변수에서 API 키 가져오기
API_KEY = os.getenv("WIND_POWER_BY_HOUR_KEY")
if not API_KEY:
    raise ValueError("API Key is not set. Please check your .env file.")

API_URL = "https://apis.data.go.kr/B551893/wind-power-by-hour"

# TLS 경고 비활성화
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

@app.route("/")
def index():
    return render_template("turbin.html")

@app.route("/get_wind_speed")
def get_wind_speed():
    params = {
        "serviceKey": API_KEY,
        "startD": "20241215",
        "endD": "20241216",
        "type": "json",  # JSON 응답을 요청
    }

    try:
        response = requests.get(API_URL, params=params, verify=False)
        response.raise_for_status()  # HTTP 오류 발생 시 예외

        if response.headers["Content-Type"] == "application/json":
            data = response.json()
            wind_speed = data["response"]["body"]["items"]["item"][0]["windSpeed"]
            return jsonify({"wind_speed": wind_speed})
        else:
            root = ET.fromstring(response.text)
            wind_speed = root.find(".//windSpeed").text
            return jsonify({"wind_speed": wind_speed})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API request failed: {e}"}), 500
    except (KeyError, IndexError, AttributeError):
        return jsonify({"error": "Wind speed data not available"}), 500

@app.route('/test_wind_turbine')
def test_wind_turbine():
    print("test_wind_turbine route was successfully called!")
    return render_template('test_wind_turbine.html')

@app.route('/api/wind_speed', methods=['GET'])
def wind_speed():
    return jsonify({"windSpeed": 4.5})  # 예시: 풍속 4.5m/s

if __name__ == "__main__":
    app.run(debug=True)
