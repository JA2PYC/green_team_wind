import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
from xgboost import XGBRegressor

def create_model_pkl():
    # 데이터 불러오기
    data_name = 'Jeju_MergedData_20241217'
    file_dir = os.path.dirname(__file__)
    file_path = os.path.join(file_dir, 'processed', 'Jeju_MergedData_20241217.csv')

    data = pd.read_csv(file_path, encoding='EUC-KR')

    # 공기밀도(kg/m^3) 계산
    R = 287.05  # 공기 상수 (J/kg·K)
    data["공기밀도(kg/m^3)"] = data["현지기압(hPa)"] * 100 / (R * (data["기온(\u00b0C)"] + 273.15))

    # 변수 정의
    X = data[["기온(\u00b0C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]]
    y = data["발전량(mW)"]  # 출력 변수

    # 훈련 및 테스트 데이터 분리
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 랜덤 포레스트 모델 생성 및 학습
    
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    print(rf_model)
    
    xgb_model = XGBRegressor(
    n_estimators=1000,        # 트리 개수
    learning_rate=0.01,       # 학습률
    max_depth=6,              # 트리의 최대 깊이
    subsample=0.8,            # 데이터 샘플링 비율
    colsample_bytree=0.8,     # 각 트리에서 사용할 feature 비율
    random_state=42
    )
    
    
# 학습 (조기 종료 설정)
    xgb_model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],  # 평가 데이터셋 지정
        eval_metric="rmse",           # 평가 지표 (RMSE)
        early_stopping_rounds=50,     # 조기 종료 조건
        verbose=True                  # 학습 상태 출력
    )
    # 모델 피클링
    # model_path = os.path.join(file_dir, '..', 'model', 'saved_models', 'jeju_random_forest.pkl')
    model_path = "./models/saved_models/jeju_random_forest.pkl"
    joblib.dump(rf_model, model_path)

    print(f"Model saved to {model_path}")

create_model_pkl()