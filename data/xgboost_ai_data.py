import os
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from xgboost import XGBRegressor
import joblib

def create_model_pkl(dataname, modelname):
    # 데이터 불러오기
    file_dir = os.path.dirname(__file__)
    file_path = os.path.join(file_dir, 'processed', f'{dataname}.csv')
    data = pd.read_csv(file_path, encoding='EUC-KR')

    # 공기밀도(kg/m^3) 계산
    R = 287.05  # 공기 상수 (J/kg·K)
    data["공기밀도(kg/m^3)"] = data["현지기압(hPa)"] * 100 / (R * (data["기온(\u00b0C)"] + 273.15))

    # 변수 정의
    X = data[["기온(\u00b0C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]]
    y = data["발전량(mW)"]  # 출력 변수

    # 데이터 정규화 (0~1 범위로 스케일링)
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.values.reshape(-1, 1)).flatten()

    # 모델 생성
    xgb_model = XGBRegressor(
        n_estimators=1000,        # 트리 개수
        learning_rate=0.01,       # 학습률
        max_depth=6,              # 트리의 최대 깊이
        subsample=0.8,            # 데이터 샘플링 비율
        colsample_bytree=0.8,     # 각 트리에서 사용할 feature 비율
        random_state=42
    )
    
    # 모델 학습 (전체 데이터로 학습)
    xgb_model.fit(X_scaled, y_scaled)
    
    # 모델 피클링 디렉터리 존재 여부 확인 및 생성
    model_dir = './models/saved_models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    # 모델 피클링
    model_path = os.path.join(model_dir, f'{modelname}.pkl')
    joblib.dump(xgb_model, model_path)
    
    # 정규화 객체도 함께 저장 (예측 후 원래 스케일로 복원용)
    scaler_path_X = os.path.join(model_dir, f'{modelname}_scaler_X.pkl')
    scaler_path_y = os.path.join(model_dir, f'{modelname}_scaler_y.pkl')
    joblib.dump(scaler_X, scaler_path_X)
    joblib.dump(scaler_y, scaler_path_y)

    print(f"Model saved to {model_path}")
    print(f"Scalers saved to {scaler_path_X} and {scaler_path_y}")
