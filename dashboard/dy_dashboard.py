# app/kma.py
from flask import Blueprint, render_template, request, jsonify

# 기상 데이터 관련 라우트
dy_dashboard = Blueprint('dy_dashboard', __name__)

@dy_dashboard.route("/dy_dashboard")
def dashboard():
    return render_template('dy_dashboard.html')