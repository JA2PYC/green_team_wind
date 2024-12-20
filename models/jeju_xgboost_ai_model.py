# 라이브러리 불러오기
import os
import subprocess
import pandas as pd
import joblib
from sklearn.preprocessing import MinMaxScaler
from data.xgboost_ai_data import create_model_pkl

# model.py 파일의 절대 경로를 직접 활용
createname='xgboost_ai_data'
dataname='Jeju_MergedData_20241217'
modelname='jeju_xgboost_ai'
file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'saved_models', f'{modelname}.pkl')
scaler_X_path = os.path.join(file_dir, 'saved_models', f'{modelname}_scaler_X.pkl')
scaler_y_path = os.path.join(file_dir, 'saved_models', f'{modelname}_scaler_y.pkl')


# pkl 파일 존재 여부 확인
if not os.path.exists(pkl_path):
    print(f"{modelname}.pkl 파일이 존재하지 않습니다. 새로 생성합니다...")
    try:
        create_model_pkl(dataname, modelname)
        # subprocess.run(['python', f'data/{createname}.py', dataname, modelname], check=True)
    except Exception as e:
        raise RuntimeError(f"{modelname}.pkl 파일 생성 중 오류 발생: {e}")

# pkl 파일 로드
try:
    model_file = joblib.load(open(pkl_path, 'rb'))
    scaler_X = joblib.load(open(scaler_X_path, 'rb'))
    scaler_y = joblib.load(open(scaler_y_path, 'rb'))
except Exception as e:
    raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

def xgboost_ai_model_predict(inputs):
    try:
        # 입력 데이터를 데이터프레임으로 변환
        feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]
        input_data = pd.DataFrame(inputs, columns=feature_names)
        
        # 입력 데이터 정규화
        X_scaled = scaler_X.transform(input_data)

        # 예측
        preds_scaled = model_file.predict(X_scaled)

        # 예측 결과를 원래 값으로 복원
        preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

        # 예측 결과를 소수점 1자리로 반올림
        rounded_preds = [round(float(pred), 1) for pred in preds]
        
        return rounded_preds
    except Exception as e:
        return {"error": str(e)}