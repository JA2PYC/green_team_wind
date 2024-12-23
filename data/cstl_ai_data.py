import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Conv1D, MaxPooling1D, Flatten
import joblib

def create_model_pkl(dataname, modelname):
    # 데이터 불러오기
    file_dir = os.path.dirname(__file__)
    file_path = os.path.join(file_dir, "processed", f"{dataname}.csv")
    data = pd.read_csv(file_path, encoding="EUC-KR")

    # 결측값 처리
    data = data.dropna()
    
    # 필요 없는 열 제거
    data = data.drop(columns=["지역", "일시", "풍향(16방위)", "습도(%)"])

    # 공기밀도(kg/m^3) 계산
    R = 287.05  # 공기 상수 (J/kg·K)
    data["공기밀도(kg/m^3)"] = (
        data["현지기압(hPa)"] * 100 / (R * (data["기온(°C)"] + 273.15))
    )

    # 변수 선택
    features = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]
    target = "발전량(mW)"  # 수정된 부분
    
    X = data[features].values
    y = data[target].values
    
    # 데이터 정규화 (0~1 범위로 스케일링)
    scaler_X = MinMaxScaler()
    scaler_y = MinMaxScaler()

    X_scaled = scaler_X.fit_transform(X)
    y_scaled = scaler_y.fit_transform(y.reshape(-1, 1))

    # 시계열 데이터 형태로 변환 (LSTM 입력 형태: [samples, timesteps, features])
    sequence_length = 10  # 과거 10개의 시간 단계 사용
    X_seq, y_seq = [], []
    for i in range(len(X_scaled) - sequence_length):
        X_seq.append(X_scaled[i : i + sequence_length])
        y_seq.append(y_scaled[i + sequence_length])
    X_seq, y_seq = np.array(X_seq), np.array(y_seq)

    # CNN + LSTM 모델 생성
    model = Sequential()

    # CNN 레이어
    model.add(
        Conv1D(
            filters=64,
            kernel_size=3,
            activation="relu",
            input_shape=(sequence_length, len(features)),
        )
    )
    model.add(MaxPooling1D(pool_size=2))

    # LSTM 레이어
    model.add(LSTM(50, activation="tanh", return_sequences=False))

    # 출력 레이어
    model.add(Dense(1))  # 발전량 예측

    # 모델 컴파일
    model.compile(optimizer="adam", loss="mean_squared_error")

    # 모델 학습
    model.fit(
        X_seq,
        y_seq,
        epochs=50,
        batch_size=32,
        # validation_data=(X_seq, y_seq),
        verbose=2,
    )

    model_dir = './models/saved_models'
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    # 모델 저장 (HDF5 형식)
    model_h5_path = os.path.join(model_dir, f"{modelname}.h5")
    model.save(model_h5_path)
    print(f"Model saved to {model_h5_path}")
    
    model_path = os.path.join(model_dir, f'{modelname}.pkl')
    joblib.dump(model,model_path)
    
    scaler_path_X = os.path.join(model_dir, f'{modelname}_scaler_X.pkl')
    scaler_path_y = os.path.join(model_dir, f'{modelname}_scaler_y.pkl')
    joblib.dump(scaler_X, scaler_path_X)
    joblib.dump(scaler_y, scaler_path_y)

    print(f'Model saved to {model_path}')
    print(f'Scaler saved to {scaler_path_X} and {scaler_path_y}')

    # # 테스트 데이터 예측
    # y_pred = model.predict(X_test)

    # # 스케일 복원 (역정규화)
    # y_test_rescaled = scaler_y.inverse_transform(y_test)
    # y_pred_rescaled = scaler_y.inverse_transform(y_pred)
