import requests
import urllib3
import xml.etree.ElementTree as ET

# 공공데이터 포털에서 발급받은 API 키
API_KEY = "eHgX5J93R2wPgAq/JUQzHP3xbkJ16lQIJXvQeY4fxh3EutJ9W/REVVrb84PbqmDitlWiLPtmcxDg8TqhaV0TlQ=="

# API 요청 URL (예: 서울시 지하철역 정보 API)
url = "http://apis.data.go.kr/B552115/PvAmountByPwrGen/getPvAmountByPwrGen"  # API의 실제 엔드포인트로 변경

# 요청 파라미터 설정
params = {
    "serviceKey": API_KEY,  # API 키
    "pageNo": 1,            # 페이지 번호
    "numOfRows": 30,        # 한 페이지당 결과 수
    "dataType": "json",        
    "tradeYmd": 20241216,        # 한 페이지당 결과 수
}

# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
try:
    # API 요청
    response = requests.get(url, params=params, verify=False)
    print(response.text)
    response.raise_for_status()  # HTTP 상태 코드 확인 (200 OK가 아닌 경우 예외 발생)

    # 응답 데이터 출력
    print(response.text)

    # 응답 데이터 처리
    if params["dataType"] == "json":  # "type" 대신 "dataType" 사용
        data = response.json()
        print("JSON 응답 데이터:")
        print(data)
    else:
        # XML 형식인 경우 파싱
        root = ET.fromstring(response.text)
        print("XML 응답 데이터:")
        for child in root.iter():
            print(child.tag, child.text)


except requests.exceptions.RequestException as e:
    print(f"API 요청 중 오류 발생: {e}")
