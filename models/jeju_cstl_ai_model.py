import os
import sys
import subprocess
import numpy as np
import pandas as pd
from data.cstl_ai_data import create_model_pkl
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import joblib

scriptname = "cstl_ai_data"
dataname = "Jeju_MergedData_20241217"
modelname = "jeju_cstl_ai"
file_dir = os.path.dirname(__file__)
keras_path = os.path.join(file_dir, "saved_models", f"{modelname}.keras")
pkl_path = os.path.join(file_dir, "saved_models", f"{modelname}.pkl")
scaler_X_path = os.path.join(file_dir, "saved_models", f"{modelname}_scaler_X.pkl")
scaler_y_path = os.path.join(file_dir, "saved_models", f"{modelname}_scaler_y.pkl")

script_path = os.path.join(file_dir, "data", f"{scriptname}.py")

if (
    not os.path.exists(pkl_path)
    or not os.path.exists(keras_path)
    or not os.path.exists(scaler_X_path)
    or not os.path.exists(scaler_y_path)
):
    print(f"{modelname}.pkl 파일이 존재하지 않습니다. 새로 생성합니다...")
    try:
        create_model_pkl(dataname, modelname)
        # subprocess.run(['python', create_model_pkl, dataname, modelname], check=True)
        # subprocess.run([sys.executable, script_path, dataname, modelname], check=True)
    except Exception as e:
        raise RuntimeError(f"{modelname}.pkl 파일 생성중 오류 발생: {e}")

try:
    # 모델 불러오기
    model_file = joblib.load(open(pkl_path, "rb"))
    scaler_X = joblib.load(open(scaler_X_path, "rb"))
    scaler_y = joblib.load(open(scaler_y_path, "rb"))

    # Keras 형식
    model_keras_file = load_model(keras_path)
    print("CSTL Model loaded successfully.")
except Exception as e:
    raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

def cstl_ai_model_predict_sequences(multi_inputs, sequence_length=10):
    try:
        # print('cstl_ai_model_predict_sequences')

        # 결과를 저장할 리스트
        all_predictions = []
        # print('multi_inputs',multi_inputs)
        # 다중 배열 데이터를 개별적으로 처리
        for inputs in multi_inputs:
            # print(inputs)
            # print('len : ',len(inputs))
            if len(inputs) != 10:
                continue
            # 입력 데이터를 NumPy 배열로 변환
            input_data = np.array(inputs).astype(float)
            # print(input_data)
            # 스케일링
            X_scaled = scaler_X.transform(input_data)
            # print(X_scaled)
            # 시퀀스 길이 정의
            sequence_length = 10
            num_samples = len(X_scaled) - sequence_length + 1

            # 시퀀스 생성
            X_seq = []
            for i in range(num_samples):
                X_seq.append(X_scaled[i : i + sequence_length])

            X_seq = np.array(X_seq)

            # 예측 수행
            preds_scaled = model_file.predict(X_seq)

            # 예측 결과를 역정규화
            preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

            # 예측 결과 반올림
            rounded_preds = [round(float(pred), 1) for pred in preds]

            # 결과 추가
            all_predictions.append(rounded_preds)
        # print(all_predictions)
        return all_predictions
        # # 입력 데이터 유효성 확인 (리스트 형태로 변환)
        # if not isinstance(inputs, (list, np.ndarray)):
        #     raise ValueError("입력 데이터는 리스트 또는 NumPy 배열이어야 합니다.")

        # inputs = np.array(inputs)  # 입력 데이터를 NumPy 배열로 변환

        # # 입력 데이터의 형상 확인
        # if len(inputs.shape) != 2:
        #     raise ValueError("입력 데이터는 2차원 배열이어야 합니다. (샘플 x 특성)")

        # num_samples, num_features = inputs.shape

        # # 시퀀스 생성
        # X_seq = []
        # for i in range(num_samples - sequence_length + 1):
        #     sequence = inputs[i : i + sequence_length]  # 시퀀스 추출
        #     if (
        #         len(sequence) == sequence_length
        #     ):  # 길이가 정확히 sequence_length인 경우만 추가
        #         X_seq.append(sequence)

        # X_seq = np.array(X_seq)  # 리스트를 NumPy 배열로 변환

        # # 예측 실행
        # if len(X_seq) == 0:
        #     return []  # 유효한 시퀀스가 없을 경우 빈 리스트 반환
        # preds_scaled = model_file.predict(X_seq)  # 모델 예측 수행

        # # 예측 값 역정규화 (예: MinMaxScaler 사용 시)
        # preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

        # # 결과를 반올림
        # rounded_preds = [round(float(pred), 1) for pred in preds]

        # return rounded_preds

    except Exception as e:
        return {"error": str(e)}


def cstl_ai_model_predict(inputs):
    try:
        # 입력 데이터를 DataFrame으로 변환
        features = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]
        input_data = np.array(inputs).astype(float)  # 문자열을 실수로 변환

        # 입력 데이터를 스케일링
        X_scaled = scaler_X.transform(input_data)

        # 시퀀스를 만들기 위한 코드 (10개씩 묶어서 예측)
        sequence_length = 10
        num_samples = len(X_scaled) - sequence_length + 1

        # 97개의 데이터를 시퀀스로 나누기
        X_seq = []
        for i in range(num_samples):
            X_seq.append(X_scaled[i : i + sequence_length])

        X_seq = np.array(X_seq)

        # 예측
        preds_scaled = model_file.predict(X_seq)

        # 예측된 값 역정규화
        preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

        # 예측 결과 반올림
        rounded_preds = [round(float(pred), 1) for pred in preds]

        return rounded_preds

        # print (inputs)
        # # feature_names = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)"]
        # # input_data = pd.DataFrame(inputs, columns = feature_names)
        # input_data = pd.DataFrame(inputs)

        # # X = data[features].values

        # # 데이터 정규화 (0~1 범위로 스케일링)
        # scaler_X = MinMaxScaler()
        # scaler_y = MinMaxScaler()

        # # X_scaled = scaler_X.transform(input_data)
        # # X_scaled = scaler_X.transform(input_data.to_numpy())
        # X_scaled = scaler_X.fit_transform(input_data)

        # # preds_scaled = model_file.predict(X_scaled)
        # preds_scaled = loaded_model_h5.predict(X_scaled)

        # preds = scaler_y.inverse_transform(preds_scaled.reshape(-1, 1)).flatten()

        # rounded_preds = [round(float(pred), 1) for pred in preds]

        # return rounded_preds
    except Exception as e:
        return {"error": str(e)}

