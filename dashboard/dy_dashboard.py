# app/kma.py
from flask import Blueprint, render_template, request, jsonify

# 기상 데이터 관련 라우트
dy_dashboard = Blueprint('dy_dashboard', __name__)

@dy_dashboard.route("/dy_dashboard")
def dashboard():
    return render_template('dy_dashboard.html')


@dy_dashboard.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_message = data.get('message', '')
    # 챗봇 로직 구현 (간단한 응답 예제)
    response_message = f"당신이 입력한 메시지는: {user_message}"
    return jsonify({'response': response_message})