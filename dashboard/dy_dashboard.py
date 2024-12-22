# app/kma.py
from flask import Blueprint, render_template, request, jsonify

# dy_dashboard 블루프린트 생성
dy_dashboard = Blueprint('dy_dashboard', __name__)

# 기본 경로
@dy_dashboard.route('/')
def dashboard():
    return render_template('dy_dashboard.html')
