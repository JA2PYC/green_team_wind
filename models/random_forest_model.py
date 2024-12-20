import os
import subprocess
import joblib
import pandas as pd
# from data.random_forest_data import create_model_pkl

# model.py 파일의 절대 경로를 직접 활용
file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'saved_models', 'jeju_random_forest.pkl')

# pkl 파일 존재 여부 확인
if not os.path.exists(pkl_path):
    print("pkl 파일이 존재하지 않습니다. 새로 생성합니다...")
    try:
        # /data/random_forest_data.py 실행
        subprocess.run(['python', 'data/random_forest_data.py'], check=True)

        # subprocess.run(['python', create_model_pkl], check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"pkl 파일 생성 중 오류 발생: {e}")

# pkl 파일 로드
try:
    model_file = joblib.load(open(pkl_path, 'rb'))
except Exception as e:
    raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

def rf_model_predict(inputs):
    try:
        # Set DF
        feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]        
        input_data = pd.DataFrame(inputs, columns=feature_names)
        # print('rf model predict - array')
        # print(input_data)
        
        # Use the trained model to make a prediction
        preds = model_file.predict(input_data)
        # print('rf model predict - preds')
        # print(preds)
        
        # Round prediction to 1 decimal place and return as integer
        rounded_preds = [round(pred, 1) for pred in preds]
        return rounded_preds
        # return round(pred[0], 1)
    except Exception as e:
        return {"error": str(e)}
