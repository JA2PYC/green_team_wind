# app/kma.py
from flask import Flask, Blueprint, render_template, request, jsonify, url_for
from train_chatbot_model import predict_answer #chatbot_model에서 predict_answer함수를 import
import time  # time 모듈 추가

# Flask 애플리케이션 객체 생성
app = Flask(__name__)  
# Flask 클래스를 사용해 웹 애플리케이션 객체를 생성
# __name__은 현재 모듈의 이름. Flask가 현재 파일의 경로를 기준으로 애플리케이션을 설정하도록 도와줌

# Flask Blueprint 생성
dy_dashboard = Blueprint('dy_dashboard', __name__)  
# Blueprint는 Flask 애플리케이션의 라우트를 모듈별로 분리하여 관리
# 'dy_dashboard'는 블루프린트 이름, __name__은 이 블루프린트가 정의된 모듈의 이름

# 정적 파일 캐싱 방지 코드
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        values['q'] = int(time.time())  # 타임스탬프 추가
    return url_for(endpoint, **values)

# 대시보드 라우트 정의
@dy_dashboard.route("/dy_dashboard")
def dashboard():
    """
    /dy_dashboard URL 요청 시 dy_dashboard.html 템플릿을 렌더링합니다.
    """
    return render_template('dy_dashboard.html')


# 챗봇 API 라우트 정의
@dy_dashboard.route('/api/chatbot', methods=['POST'])
def chatbot():
    """
    클라이언트에서 챗봇 메시지를 전송할 때 호출되는 API 라우트입니다.
    """
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

# Flask 서버 실행
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    # Flask 개발 서버를 실행합니다.
    # host="0.0.0.0"은 모든 네트워크 인터페이스에서 접근 가능하도록 설정
    # port=5000은 애플리케이션이 사용할 포트를 지정