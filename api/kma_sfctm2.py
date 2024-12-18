import os
import requests
import json
import re

API_KEY = os.getenv("KMA_SFCTM2_KEY")
API_URL = "http://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php" 
def fetch_kma_sfctm2_data(tm, stn):
    print(tm)
    print(stn)
    
    # 기상청 API 호출
    params = {
        'tm': tm,
        'stn': stn,
        # 'help': 1,
        'authKey': API_KEY,
    }
    print(params)
    try:
        response = requests.get(API_URL, params=params)

        # 응답이 성공적인 경우
        if response.status_code == 200:
            response.encoding = 'euc-kr'  # 인코딩 처리
            # 텍스트 데이터를 확인하기 위해 출력
            print(response.text)  
            
            # 텍스트에서 필요한 데이터 추출하는 로직 추가
            # 예: 필요한 정보 추출 후 JSON으로 변환
            data = parse_weather_data(response.text)
            # data = response.text
            print(data)
            return data
        else:
            print(f"API 요청 실패: {response.status_code}")
            return {"error": "API 요청 실패"}
    
    except Exception as e:
        return {"error": str(e)}

def parse_weather_data(data):
    # # 텍스트에서 필요한 정보를 추출하는 로직 구현
    # # 예를 들어, 특정 패턴을 찾아서 필요한 데이터를 추출
    # lines = response_text.split('\n')
    # # 필요한 데이터 추출 로직 (예: 첫 번째 데이터 행)
    # weather_data = lines[6].split()  # 예시로 첫 번째 데이터 행 처리
    # return {
    #     "temperature": weather_data[10],  # 온도 정보 (예시)
    #     "humidity": weather_data[12],     # 습도 정보 (예시)
    # }

    # 정리된 데이터를 저장할 리스트
    weather_data = []
    
    # 데이터를 줄 단위로 나누기
    lines = data.split('\n')
    
    for line in lines:
        # '#'로 시작하는 주석 라인과 공백 라인은 무시
        if line.startswith('#') or not line.strip():
            continue
        
        # 각 라인에서 데이터를 추출
        parts = line.split()
        
        # 각 데이터를 JSON에 적합한 형태로 변환
        if len(parts) >= 18:  # 최소 18개의 값이 있어야 정상적인 데이터라고 가정
            weather_info = {
                "datetime": parts[0],
                "station_id": parts[1],
                "wind_direction": parts[2],
                "wind_speed": parts[3],
                "gust": parts[4],
                "temperature": parts[5],
                "pressure": parts[6],
                "humidity": parts[7],
                "rain_day": parts[8],
                "rain_june": parts[9],
                "rain_intensity": parts[10],
                "snow_day": parts[11],
                "snow_total": parts[12],
                "cloud": parts[13],
                "weather_code": parts[14],
                "additional_info": parts[15:]
            }
            
            # 리스트에 추가
            weather_data.append(weather_info)
    
    # 결과를 JSON 형식으로 변환하여 반환
    return json.dumps(weather_data, indent=4, ensure_ascii=False)
