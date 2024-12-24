import os
import requests

API_KEY = os.getenv("KMA_SFCTM2_KEY")
API_URL = "http://apihub.kma.go.kr/api/typ01/url/fct_afs_dl.php" 
def fetch_fct_afs_dl_data(stn, reg, tmfc1, tmfc2):
    
    # 기상청 API 호출
    params = {
        'stn': stn,
        'reg': reg,
        'tmfc1': tmfc1,
        'tmfc2': tmfc2,
        # 'tmef1': tmef1,
        # 'tmef2': tmef2,
        # 'disp': 1,
        # 'help': 1,
        'authKey': API_KEY,
    }

    try:
        response = requests.get(API_URL, params=params)

        # 응답이 성공적인 경우
        if response.status_code == 200:
            response.encoding = 'euc-kr'  # 인코딩 처리
            
            # 텍스트에서 필요한 데이터 추출하는 로직 추가
            # 예: 필요한 정보 추출 후 JSON으로 변환
            data = parse_weather_data(response.text)
            # data = response.text
            return data
        else:
            print(f"API 요청 실패: {response.status_code}")
            return {"error": "API 요청 실패"}
    
    except Exception as e:
        return {"error": str(e)}

def parse_weather_data(data):
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
                "reg_id": parts[0],
                "tm_fc": parts[1],
                "tm_ef": parts[2],
                "ne": parts[4],
                "stn": parts[5],
                "ta": parts[12],
                "st": parts[13],
                "sky": parts[14],
                "prep": parts[15],
                "wf": parts[16],
            }
            
            # 리스트에 추가
            weather_data.append(weather_info)
    
    return weather_data
    
#START7777
#--------------------------------------------------------------------------------------------------
#  단기예보 육상 조회 [입력인수형태][예] ?reg=&tmfc1=2013121018&tmfc2=2013121106&disp=0&help=1
#--------------------------------------------------------------------------------------------------
#  1.0 REG_ID   : 예보구역코드
#  2.1 TM_FC    : 발표시각(년월일시분,KST)
#  3.2 TM_EF    : 발효시각(년월일시분,KST)
#  4.3 MOD      : 구간 (A01(24시간),A02(12시간))
#  5.4 NE       : 발효번호
#  6.5 STN      : 발표관서
#  7.6 C        : 발표코드
#  8.7 MAN_ID   : 예보관ID
#  9.8 MAN_FC   : 예보관명
# 10.9 W1       : 풍향1(16방위)
# 11.10 T        : 풍향경향(1:-, 2:후)
# 12.11 W2       : 풍향2(16방위)
# 13.12 TA       : 기온
# 14.13 ST       : 강수확률(%)
# 15.14 SKY      : 하늘상태코드 (DB01(맑음),DB02(구름조금),DB03(구름많음),DB04(흐림))
# 16.15 PREP     : 강수유무코드 (0(없음),1(비),2(비/눈),3(눈),4(눈/비(~'19.6.4.),소나기('19.6.4~)))
# 17.16 WF       : 예보
#--------------------------------------------------------------------------------------------------
# REG_ID TM_FC        TM_EF        MOD NE STN C MAN_ID       MAN_FC     W1 T W2  TA  ST SKY  PREP WF
# 11G00201 202412241100 202412241200 A02  0 184 2 yangjh       양정현     NW 1 N   11  20 DB03    0 "구름많음"
# 11G00201 202412241100 202412250000 A02  1 184 2 yangjh       양정현     W  1 NW   5  20 DB03    0 "구름많음"
# 11G00201 202412241100 202412251200 A02  2 184 2 yangjh       양정현     W  1 NW  13  30 DB04    0 "흐림"
# 11G00201 202412241100 202412260000 A02  3 184 2 yangjh       양정현     NW 1 N    8  80 DB04    1 "흐리고 비"
# 11G00201 202412241100 202412261200 A02  4 184 2 yangjh       양정현     NW 1 N   11  30 DB04    0 "흐림"
# 11G00201 202412241100 202412270000 A02  5 184 2 yangjh       양정현     NW 1 N    5  30 DB04    0 "흐림"
# 11G00201 202412241100 202412271200 A02  6 184 2 yangjh       양정현     NW 1 N    8  30 DB04    0 "흐림"
#7777END