# app/__init__.py
from flask import Flask

def create_app():
    app = Flask(__name__)

    # 각 라우트 파일을 임포트하여 앱에 라우트를 추가
    from .dashboard import dashboard
    from .ny_dashboard import ny_dashboard
    from .dy_dashboard import dy_dashboard

    app.register_blueprint(dashboard)
    app.register_blueprint(ny_dashboard)
    app.register_blueprint(dy_dashboard)

    return app
