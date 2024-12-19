# 라이브러리 불러오기
import os
import subprocess
import joblib
import pandas as pd

# model.py 파일의 절대 경로를 직접 활용
filename='jeju_xgboost_ai'
file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'saved_models', '{filename}.pkl')

# pkl 파일 존재 여부 확인
if not os.path.exists(pkl_path):
    print("{filename}.pkl 파일이 존재하지 않습니다. 새로 생성합니다...")
    try:
        subprocess.run(['python', 'data/{filename}.py'], check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"{filename}.pkl 파일 생성 중 오류 발생: {e}")

# pkl 파일 로드
try:
    model_file = joblib.load(open(pkl_path, 'rb'))
except Exception as e:
    raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

def xgboost_ai_model_predict(inputs):
    try:
        # Set DF
        feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]        
        input_data = pd.DataFrame(inputs, columns=feature_names)
        
        # Use the trained model to make a prediction
        preds = model_file.predict(input_data)
        
        # Round prediction to 1 decimal place and return as integer
        rounded_preds = [round(pred, 1) for pred in preds]
        return rounded_preds
    except Exception as e:
        return {"error": str(e)}