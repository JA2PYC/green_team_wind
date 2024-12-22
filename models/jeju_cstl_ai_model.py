import os
import sys
import subprocess
import pandas as pd
from data.cstl_ai_data import create_model_pkl
import joblib

scriptname = 'cstl_ai_data'
dataname = 'Jeju_MergedData_20241217'
modelname = 'jeju_cstl_ai'
file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'saved_models', f'{modelname}.pkl')
scaler_X_path = os.path.join(file_dir, 'saved_models', f'{modelname}_scaler_X.pkl')
scaler_y_path = os.path.join(file_dir, 'saved_models', f'{modelname}_scaler_y.pkl')

script_path = os.path.join(file_dir, 'data', f'{scriptname}.py')

if not os.path.exists(pkl_path):
    print (f'{modelname}.pkl 파일이 존재하지 않습니다. 새로 생성합니다...')
    try:
        # create_model_pkl(dataname, modelname)
        # subprocess.run(['python', create_model_pkl, dataname, modelname], check=True)
        subprocess.run([sys.executable, script_path, dataname, modelname], check=True)
    except Exception as e:
        raise RuntimeError(f'{modelname}.pkl 파일 생성중 오류 발생: {e}')
    
try:
    model_file = joblib.load(open(pkl_path, 'rb'))
    scaler_X = joblib.load(open(scaler_X_path, 'rb'))
    scaler_y = joblib.load(open(scaler_y_path, 'rb'))
except Exception as e:
    raise RuntimeError(f'모델 로드 중 오류 발생: {e}')


def cstl_ai_model_predict(inputs):
    try:
        feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]
        input_data = pd.DataFrame(inputs, columns = feature_names)
        
        X_scaled = scaler_X.transform(input_data)
        
        preds_scaled = model_file.predict(X_scaled)
        
        preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()
        
        rounded_preds = [round(float(pred), 1) for pred in preds]
        
        return rounded_preds
    except Exception as e:
        return {'error' : str(e)}