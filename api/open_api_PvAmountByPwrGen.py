import os
import requests
import xml.etree.ElementTree as ET

# 공공데이터 포털 API 키 및 URL
API_KEY = os.getenv("PVAMOUNTBYPOWERGEN_KEY")
API_URL = "http://apis.data.go.kr/B552115/PvAmountByPwrGen/getPvAmountByPwrGen"

def fetch_power_data(trade_ymd, page_no=1, num_of_rows=30):
    """공공데이터 API 호출 함수"""
    params = {
        "tradeYmd": trade_ymd,
        "pageNo": page_no,
        "numOfRows": num_of_rows,
        
        "dataType": "json",
        "serviceKey": API_KEY,
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()  # HTTP 에러 발생 시 예외 처리
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

        return response.json()  # JSON 데이터 반환
    except Exception as e:
        return {"error": str(e)}
