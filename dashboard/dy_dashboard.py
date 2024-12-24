# app/kma.py
from flask import Flask, Blueprint, render_template, request, jsonify, send_from_directory, url_for
from train_chatbot_model import predict_answer #chatbot_model에서 predict_answer함수를 import
from flask_cors import CORS
import time  # time 모듈 추가

# Flask 애플리케이션 생성
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Content Security Policy 헤더 추가
@app.after_request
def add_csp_header(response):
    response.headers['Content-Security-Policy'] = (
        "script-src 'self' https://cdnstatic.ventusky.com; worker-src blob:;"
    )
    return response

# Flask Blueprint 생성
dy_dashboard = Blueprint('dy_dashboard', __name__)  

# 대시보드 라우트 정의
@dy_dashboard.route("/dy_dashboard")
def dashboard():
    return render_template('dy_dashboard.html')

# 정적 파일 매핑
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# 챗봇 API 라우트 정의
@dy_dashboard.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        # 클라이언트로부터 JSON 데이터를 가져옵니다.
        user_input = request.json.get("message")
        
        # 메시지가 비어 있는 경우 에러 반환
        if not user_input:
            return jsonify({"error": "No message provided"}), 400

        # `predict_answer` 함수를 호출해 사용자 입력에 대한 응답을 생성
        response = predict_answer(user_input)
        
        # 생성된 응답을 JSON 형식으로 반환
        return jsonify({"response": response})

    except Exception as e:
        # 예외 발생 시 에러 메시지를 JSON으로 반환
        return jsonify({"error": str(e)}), 500

# Flask 애플리케이션에 Blueprint 등록
app.register_blueprint(dy_dashboard)
# Blueprint를 Flask 애플리케이션에 등록하여 해당 라우트를 사용할 수 있도록 설정.

# 기상청 openAPI 풍속 값 불러옴.
@app.route('/get_wind_speed', methods=['GET'])
def get_wind_speed():
    wind_speed = 10
    # 풍속 데이터를 반환
    return jsonify({"wind_speed": wind_speed}) #고정값 반환

# Flask 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    # Flask 개발 서버를 실행합니다.
    # host="0.0.0.0"은 모든 네트워크 인터페이스에서 접근 가능하도록 설정
    # port=5000은 애플리케이션이 사용할 포트를 지정