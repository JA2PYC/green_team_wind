import requests

def fetch_kma_sfctm2_data(tm, stn):
    # 기상청 API 호출
    url = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?'  # 실제 API URL로 대체
    params = {
        # 'tm': 202412150900,       # 날짜/시간
        'tm': tm,
        'stn': stn,
        'authKey': 'gW1elmiyQWWtXpZoslFl8w',
    }
    try:

        response = requests.get(url, params=params)

        # 응답이 성공적인 경우
        if response.status_code == 200:
            response.encoding = 'utf-8'  # 인코딩 처리
            # 텍스트 데이터를 확인하기 위해 출력
            print(response.text)  
            
            # 텍스트에서 필요한 데이터 추출하는 로직 추가
            # 예: 필요한 정보 추출 후 JSON으로 변환
            # data = parse_weather_data(response.text)
            data = response.text
            print(data)
            return data
        else:
            print(f"API 요청 실패: {response.status_code}")
            return {"error": "API 요청 실패"}
    
    except Exception as e:
        return {"error": str(e)}

def parse_weather_data(response_text):
    # 텍스트에서 필요한 정보를 추출하는 로직 구현
    # 예를 들어, 특정 패턴을 찾아서 필요한 데이터를 추출
    lines = response_text.split('\n')
    # 필요한 데이터 추출 로직 (예: 첫 번째 데이터 행)
    weather_data = lines[6].split()  # 예시로 첫 번째 데이터 행 처리
    return {
        "temperature": weather_data[10],  # 온도 정보 (예시)
        "humidity": weather_data[12],     # 습도 정보 (예시)
    }
