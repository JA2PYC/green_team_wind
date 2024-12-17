#AI머신러닝 랜덤포레스트 모델 선택기준 근거
#1.풍속발전량은 비선형관계성을 나타냄. y(발전량)=x(풍속)의 3승. 갑작스러운 풍속 증가 또는 감소. 자연 변동성이 큼.
#2.전처리 데이터 갯수가 적음. 수천 개 이하
# =============================================================================
# 데이터량에 따른 알고리즘 선택 기준(비선형모델 종류)
# 데이터 크기	        적합한 알고리즘                     	이유
# 적음(수천 개 이하)	랜덤 포레스트, XGBoost	   소규모 데이터에서 안정적인 성능.
# 보통(수천~수만 개)	XGBoost, LightGBM	   적당히 복잡한 패턴 학습.
# 많음(수십만 개 이상)	ANN, CNN, LSTM	       대규모 데이터로 비선형 복잡한 패턴 학습 가능.
# =============================================================================
# 풍속발전량 데이터가 소규모이므로 수업시간에 학습한 '랜덤 포레스트'를 선택


#주피터 노트북 사용한다면 사이킷런 라이브러리 설치
#pip install scikit-learn pandas numpy


#랜덤 포레스트 모델 구현 코드
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split #훈련데이터 테스트 데이터로 구분
from sklearn.ensemble import RandomForestRegressor #랜덤포레스트 모델 사용

#전처리된 데이터 로드
file_path = "D:/01-STUDY/2차 팀PJ/processed_wind_power_newdata.csv"
data = pd.read_csv(file_path, encoding='EUC-KR') #csv파일 읽기


# 변수 적용
X = data[["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)", "hour", "풍향_cos", "풍향_sin"]]
y = data["발전량(kW)"]  # 출력 변수

#훈련데이터와 테스트데이터 구분(훈련데이터80%, 테스트데이터20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 랜덤 포레스트 모델 생성 및 학습
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# 테스트 데이터 예측
y_prd = rf_model.predict(X_test)



# 성능 평가
from sklearn.metrics import mean_absolute_error, mean_squared_error #성능평가 RMSE,MAE
from sklearn.metrics import r2_score
#mae:실제값과 예측값의 절대 오차 평균(낮을수록 좋음)
mae = mean_absolute_error(y_test, y_prd)
print(f"MAE (Mean Absolute Error): {mae:.2f}")

#mse:오차의 제곱 평균(낮을 수록 좋음)
mse = mean_squared_error(y_test, y_prd)
print(f"MSE: {mse:.2f}")

#rmse: 오차의 제곱근(낮을 수록 좋음)
rmse = mean_squared_error(y_test, y_prd, squared=False)
print(f"RMSE: {rmse:.2f}")

#r2 score: 모델의 설명력(1에 가까울 수록 좋음)
r2 = r2_score(y_test, y_prd)
print(f"R² Score: {r2:.2f}")

# 최초 1년치 data
# x변수: "기온(°C)","현지기압(hPa)", "공기밀도(kg/m^3)","풍향_cos", "풍향_sin"
# 성능평가 결과==================================================================
# MAE (Mean Absolute Error): 40.24
# MSE: 2901.01
# RMSE: 53.86
# R² Score:  0.31
# =============================================================================
# 모델의 예측 오차가 (40.24 kW ~ 53.86 kW), 정확한 예측에는 한계가 있음을 보여줍니다.

# 최초 1년치 data
# x변수: "기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)","풍향_cos", "풍향_sin"
# 성능평가 결과==================================================================
# MAE (Mean Absolute Error): 35.76
# MSE: 2375.87
# RMSE: 48.74
# R² Score: 0.43
# =============================================================================
# 모델의 예측 오차가 (35.76 kW ~ 48.74 kW), 정확한 예측에는 한계가 있음을 보여줍니다.

# 최초 1년치 data
# x변수: "기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)","풍향_cos", "풍향_sin, hour"
# =============================================================================
# MAE (Mean Absolute Error): 34.11
# MSE: 2157.07
# RMSE: 46.44
# R² Score: 0.48
# =============================================================================


# 2019.12.01~2024.09.30 데이터 추가 결과
# 풍속발전량 데이터 증가 2019.12.01~2023.08.31
# MAE (Mean Absolute Error): 35.07
# MSE: 2153.21
# RMSE: 46.40
# R² Score: 0.42
#전처리된 데이터 로드
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
file_path = "D:/01-STUDY/2차 팀PJ/processed_wind_power_newdata.csv"
data = pd.read_csv(file_path, encoding='EUC-KR') #csv파일 읽기


# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'  
plt.rcParams['axes.unicode_minus'] = False

# 산점도
features = ["기온(°C)", "풍속(m/s)", "현지기압(hPa)", "공기밀도(kg/m^3)", "hour", "풍향_cos", "풍향_sin"]
for feature in features:
    plt.figure(figsize=(8, 5))
    sns.scatterplot(x=data[feature], y=data["발전량(kW)"])
    plt.title(f"Scatterplot: {feature} vs 발전량(kW)")
    plt.xlabel(feature)
    plt.ylabel("발전량(kW)")
    plt.grid(True)
    plt.show()


print(data.dtypes)


# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'  
plt.rcParams['axes.unicode_minus'] = False
# 숫자형 데이터만 선택
numeric_data = data.select_dtypes(include=[np.number])

# 상관계수 계산 및 히트맵 생성
correlation_matrix = numeric_data.corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, fmt=".2f", cmap="coolwarm", cbar=True)
plt.title("Correlation Heatmap")
plt.show()





#####################################################################################
# 풍력발전량 AI예측 모델 논문 리뷰 결과 대부분 인공신경망의 모델인 CSTL모델을 사용했음.
# 딥러닝 기반 시계열 예측 모델 