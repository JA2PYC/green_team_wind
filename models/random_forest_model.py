import os
import numpy as np
import joblib
import subprocess
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
    rf_model = joblib.load(open(pkl_path, 'rb'))
except Exception as e:
    raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

def rf_model_predict(temp, wind, atmos, density):
    try:
        print (temp, type(temp))
        print (wind, type(wind))
        print (atmos, type(atmos))
        print (density, type(density))
        # Convert input values into a numpy array for prediction
        array = np.array([[float(temp), float(wind), float(atmos), float(density)]])
        print('rf model predict - array')
        print(array)
        
        # Use the trained model to make a prediction
        pred = rf_model.predict(array)  # No need for round() here, predict already returns a float
        print('rf model predict - pred')
        print(pred)
        
        # Round prediction to 1 decimal place and return as integer
        return round(pred[0], 1)
    except Exception as e:
        return {"error": str(e)}


# def rf_model_predict(temp, wind, atmos, density):
#     try:
#         array = np.array([[temp, wind, atmos, density]])
#         print ('rf model predict - array')
#         print(array)
        
#         pred = int(rf_model.predict(array).round(1))
#         print ('rf model predict - pred')
#         print (pred)
#         return pred
#     except Exception as e:
#         return {"error": str(e)}
