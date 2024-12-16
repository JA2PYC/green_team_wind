from flask import Flask, render_template, jsonify
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

if __name__ == '__main__':
    app.run(debug=True)
