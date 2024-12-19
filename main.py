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

def activate_virtualenv():
    """가상환경 활성화"""
    if os.environ.get("VIRTUAL_ENV"):
        # 이미 가상환경이 활성화된 경우
        print("가상환경이 이미 활성화되어 있습니다.")
        return

    activate_script = os.path.join("venv", "Scripts" if os.name == "nt" else "bin", "activate")
    if not os.path.exists(activate_script):
        print("가상환경 활성화 스크립트를 찾을 수 없습니다.")
        sys.exit(1)
    
    os.environ["VIRTUAL_ENV"] = os.path.abspath("venv")
    os.environ["PATH"] = os.path.join("venv", "bin") + os.pathsep + os.environ["PATH"]
    print("가상환경 활성화 완료!")

def install_dependencies():
    """의존성 설치"""
    # 환경 변수로 설치 여부 확인
    if os.environ.get("DEPENDENCIES_CHECKED"):
        print("의존성 설치를 건너뜁니다. (이미 확인됨)")
        return

    requirements_file = "requirements.txt"
    if not os.path.exists(requirements_file):
        print("requirements.txt 파일을 찾을 수 없습니다. 의존성 설치를 건너뜁니다.")
        return

    if os.path.getsize(requirements_file) == 0:
        print("requirements.txt 파일이 비어 있습니다. 의존성 설치를 건너뜁니다.")
        return

    print("의존성을 설치합니다...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_file])
        print("의존성 설치 완료!")

        # 환경 변수 설정
        os.environ["DEPENDENCIES_CHECKED"] = "true"
    except Exception as e:
        print(f"의존성 설치 중 오류 발생: {e}")
        sys.exit(1)

def run_flask_app():
    """Flask 앱 실행"""
    try:
        from dashboard import create_app
        print("Flask 앱을 실행합니다...")
        app = create_app()

        # Flask 서버 실행 (디버그 모드 활성화)
        app.run(debug=True)
    except ImportError as e:
        print(f"Flask 앱 가져오는 중 오류 발생: {e}")
        sys.exit(1)

def main():
    """메인 로직"""
    # 가상환경 생성 및 활성화
    create_virtualenv()
    activate_virtualenv()

    # 의존성 설치
    install_dependencies()

    # Flask 앱 실행
    run_flask_app()

if __name__ == "__main__":
    # 재시작 방지 코드
    if "FLASK_RUN_FROM_CLI" not in os.environ:
        main()
