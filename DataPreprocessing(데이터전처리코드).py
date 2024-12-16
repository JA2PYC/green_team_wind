#데이터 로드 및 준비
import pandas as pd
import numpy as np


# 데이터 파일 경로
file_path_weather = "D:/01-STUDY/2차 팀PJ/24년 제주지역 시간대별 기온,풍속,풍향,습도,기압(2023.09.01~2024.09.30).csv"
file_path_power = "D:/01-STUDY/2차 팀PJ/24년 제주지역 풍력 시간대별 발전량.csv"


# 파일 읽기
weather_data = pd.read_csv(file_path_weather, encoding='EUC-KR')
power_data = pd.read_csv(file_path_power, encoding='EUC-KR')


# 발전량 데이터 형식 변환
power_data_melted = power_data.melt(
    id_vars=["날짜"],
    var_name="시간",
    value_name="발전량(kW)"
)


# '24시'를 '0시'로 변환
power_data_melted["시간"] = power_data_melted["시간"].str.replace("시", "").replace("24", "0").astype(int)

# 날짜와 시간을 합쳐 '일시' 컬럼 생성
power_data_melted["일시"] = pd.to_datetime(
    power_data_melted["날짜"] + " " + power_data_melted["시간"].astype(str) + ":00"
)

print(power_data_melted);

# 불필요한 열 제거
power_data_melted = power_data_melted.drop(columns=["날짜", "시간"])

# 기상 데이터에서 '일시' 컬럼을 datetime 형식으로 변환
weather_data["일시"] = pd.to_datetime(weather_data["일시"])

# 두 데이터를 '일시' 기준으로 병합
merged_data = pd.merge(weather_data, power_data_melted, on="일시", how="inner")

#결측값 조회
missing_summary = merged_data.isnull().sum()
print(missing_summary)
# =============================================================================
# 지점            0
# 지점명           0
# 일시            0
# 기온(°C)        0
# 풍속(m/s)      26
# 풍향(16방위)     26
# 습도(%)         0
# 현지기압(hPa)     0
# 발전량(kW)       0
# =============================================================================
#결측값 풍속 26개, 풍향(16방위) 26개


#결측값을 선형 보간법(Linear Interpolation)으로 채움:
#결측값 주변의 데이터를 이용해 결측값을 선형적으로 추정
#시간 연속형 데이터에서 자연스러운 보간 결과을 얻을 수 있어 적합
merged_data["풍속(m/s)"] = merged_data["풍속(m/s)"].interpolate(method="linear", limit_direction="both")
merged_data["풍향(16방위)"] = merged_data["풍향(16방위)"].interpolate(method="linear", limit_direction="both")


# 공기 밀도 계산 (기압, 기온 활용)
R = 287.05  # 공기 상수 (J/kg·K)
merged_data["공기밀도(kg/m^3)"] = merged_data["현지기압(hPa)"] * 100 / (
    R * (merged_data["기온(°C)"] + 273.15)
)


#풍향 구분
def categorize_wind_direction(degree):
    if (337.5 <= degree <= 360) or (0 <= degree < 22.5):
        return "북풍"
    elif 22.5 <= degree < 67.5:
        return "북동풍"
    elif 67.5 <= degree < 112.5:
        return "동풍"
    elif 112.5 <= degree < 157.5:
        return "남동풍"
    elif 157.5 <= degree < 202.5:
        return "남풍"
    elif 202.5 <= degree < 247.5:
        return "남서풍"
    elif 247.5 <= degree < 292.5:
        return "서풍"
    elif 292.5 <= degree < 337.5:
        return "북서풍"
    else:
        return "알 수 없음"  # 예외 처리

# 풍향 데이터에 적용
merged_data["풍향_카테고리"] = merged_data["풍향(16방위)"].apply(categorize_wind_direction)
# 헤드값 확인
print(merged_data.head())


#결과값 csv파일로 생성
merged_data.to_csv("D:/01-STUDY/2차 팀PJ/processed_wind_power_newdata.csv", index=False, encoding='EUC-KR')
print(merged_data.head())




