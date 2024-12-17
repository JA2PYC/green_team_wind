import requests

# 공공데이터 포털 API 키 및 URL
API_KEY = "eHgX5J93R2wPgAq/JUQzHP3xbkJ16lQIJXvQeY4fxh3EutJ9W/REVVrb84PbqmDitlWiLPtmcxDg8TqhaV0TlQ=="
API_URL = "http://apis.data.go.kr/B552115/PvAmountByPwrGen/getPvAmountByPwrGen"

def fetch_power_data(trade_ymd, page_no=1, num_of_rows=30):
    """공공데이터 API 호출 함수"""
    params = {
        "serviceKey": API_KEY,
        "pageNo": page_no,
        "numOfRows": num_of_rows,
        "dataType": "json",
        "tradeYmd": trade_ymd,
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()  # HTTP 에러 발생 시 예외 처리
        return response.json()  # JSON 데이터 반환
    except Exception as e:
        return {"error": str(e)}
