import os
import subprocess
import sys


def create_virtualenv():
    """가상환경 생성"""
    if not os.path.exists("venv"):
        print("가상환경이 존재하지 않습니다. 새로 생성합니다...")
        try:
            subprocess.check_call([sys.executable, "-m", "venv", "venv"])
            print("가상환경 생성 완료!")
        except Exception as e:
            print(f"가상환경 생성 중 오류 발생: {e}")
            sys.exit(1)

def install_dependencies():
    """의존성 설치"""
    requirements_file = "requirements.txt"
    if not os.path.exists(requirements_file):
        print("requirements.txt 파일을 찾을 수 없습니다. 의존성 설치를 건너뜁니다.")
        return

    print("의존성을 설치합니다...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
        print("의존성 설치 완료!")
    except Exception as e:
        print(f"의존성 설치 중 오류 발생: {e}")
        sys.exit(1)

def main():
    """메인 로직"""
    # 가상환경 생성 (없으면 새로 생성)
    create_virtualenv()

    # 의존성 설치
    install_dependencies()

    # Flask 앱 가져오기 및 실행
    try:
        from dashboard import create_app
        print("Flask 앱을 실행합니다...")
        app = create_app()
        app.run(debug=True)
    except ImportError as e:
        print(f"Flask 앱 가져오는 중 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
