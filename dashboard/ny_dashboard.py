# app/kma.py
from flask import Blueprint, render_template, request, jsonify

# 기상 데이터 관련 라우트
ny_dashboard = Blueprint('ny_dashboard', __name__)

@ny_dashboard.route("/ny_dashboard")
def dashboard():
    return render_template('ny_dashboard.html')