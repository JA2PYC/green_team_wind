import requests
from requests.adapters import HTTPAdapter
from urllib3.util.ssl_ import create_urllib3_context

class TLSAdapter(HTTPAdapter):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.context = create_urllib3_context()
        self.context.options |= 0x4  # OP_NO_TLSv1_3 (사용자 환경에 따라 조정 가능)
API_KEY = "eHgX5J93R2wPgAq/JUQzHP3xbkJ16lQIJXvQeY4fxh3EutJ9W/REVVrb84PbqmDitlWiLPtmcxDg8TqhaV0TlQ=="

session = requests.Session()
session.mount("https://", TLSAdapter())

response = session.get(
    "https://apis.data.go.kr/B551893/wind-power-by-hour/list",
    params={
        "serviceKey": API_KEY, 
        "startD": "20241215",
        "endD": "20241216",
    }
)
print(response.text)
