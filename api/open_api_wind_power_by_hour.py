import os
import requests
import urllib3
import xml.etree.ElementTree as ET
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context



# 공공데이터 포털에서 발급받은 API 키
API_KEY = os.getenv("WIND_POWER_BY_HOUR_KEY")
API_URL = "https://apis.data.go.kr/B551893/wind-power-by-hour"
API_URL_LIST = "https://apis.data.go.kr/B551893/wind-power-by-hour/list"
print(API_KEY)
def fetch_wind_data():
    # API 요청 URL (예: 서울시 지하철역 정보 API)

    # 요청 파라미터 설정
    params = {
        "serviceKey": API_KEY,  # API 키
        "startD": 20241215,            # 페이지 번호
        "endD": 20241216,        # 한 페이지당 결과 수
        # 필요한 추가 파라미터를 여기에 추가
    }

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    try:
        # API 요청
        response = requests.get(API_URL, params=params, verify=False)
        print(response.text)
        response.raise_for_status()  # HTTP 상태 코드 확인 (200 OK가 아닌 경우 예외 발생)

        # 응답 데이터 처리
        if params["type"] == "json":
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

def fetch_wind_data_tls():
    class TLSAdapter(HTTPAdapter):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.context = create_urllib3_context()
            self.context.options |= 0x4  # OP_NO_TLSv1_3 (사용자 환경에 따라 조정 가능)

    session = requests.Session()
    session.mount("https://", TLSAdapter())

    response = session.get(
        API_URL_LIST,
        params={
            "serviceKey": API_KEY, 
            "startD": "20241215",
            "endD": "20241216",
        }
    )
    print(response.text)