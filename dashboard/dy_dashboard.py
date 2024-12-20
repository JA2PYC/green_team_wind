# app/kma.py
from flask import Blueprint, render_template, request, jsonify
from chatbot_model import predict_answer #chatbot_model에서 predict_answer함수를 import

# 기상 데이터 관련 라우트
dy_dashboard = Blueprint('dy_dashboard', __name__)

@dy_dashboard.route("/dy_dashboard")
def dashboard():
    return render_template('dy_dashboard.html')


# @dy_dashboard.route('/api/chatbot', methods=['POST'])
# def chatbot():
#     data = request.json
#     user_message = data.get('message', '')
#     # 챗봇 로직 구현 (간단한 응답 예제)
#     response_message = f"당신이 입력한 메시지는: {user_message}"
#     return jsonify({'response': response_message})

#dy_dashboard.py파일과 chatbot_model.py파일 연동
#dy_dashboard.py파일의 챗봇 응답<=>chatbot_model.py의 predict(예측답변)
@dy_dashboard.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        user_input = request.json.get("message")
        if not user_input:
            return jsonify({"error": "No message provided"}), 400

        # AI모델을 사용해 Chatbot 응답 생성
        response = predict_answer(user_input)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)