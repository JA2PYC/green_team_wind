import requests

def fetch_kma_sfctm2_data():
    # 기상청 API 호출
    url = 'https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?'  # 실제 API URL로 대체
    params = {
        'tm': '202412010000', #날짜
        'stn': 184, #지점번호
        'authKey': 'gW1elmiyQWWtXpZoslFl8w',
    }

    try :
        response = requests.get(url, params=params)

        # 응답이 성공적인 경우
        if response.status_code == 200:
            # 응답 본문을 EUCKR로 디코딩하여 한글을 제대로 처리
            response.encoding = 'utf-8'
            print(response.text)  # 텍스트로 출력
            return response.json()
        else:
            print(f"API 요청 실패: {response.status_code}")
            
    except Exception as e:
        return {"error" : str(e)}