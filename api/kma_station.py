import json
import os

dataname = 'kma_station_id'
file_dir = os.path.dirname(__file__)
file_path = os.path.join(file_dir, "json", f"{dataname}.json")

# JSON 파일에서 스테이션 데이터를 불러오는 함수
def load_stations_from_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "파일을 찾을 수 없습니다."}
    except json.JSONDecodeError:
        return {"error": "JSON 파일을 읽는 데 문제가 발생했습니다."}
    except Exception as e:
        return {"error": f"알 수 없는 오류 발생: {str(e)}"}

# 스테이션 데이터를 파일에서 불러오기
stations = load_stations_from_file(file_path)

# 1. 스테이션 ID로 이름을 반환하는 함수
def get_station_name_by_id(station_id):
    return stations.get(str(station_id), "해당 ID에 대한 스테이션이 없습니다.")

# 2. 스테이션 이름으로 ID를 반환하는 함수
def get_station_id_by_name(station_name):
    # 이름을 기준으로 ID를 찾아주는 반대 매핑을 위해 역으로 딕셔너리를 생성
    name_to_id = {name: id for id, name in stations.items()}
    return name_to_id.get(station_name, "해당 이름에 대한 스테이션 ID가 없습니다.")

# 여러 스테이션 ID에 대한 데이터를 반환하는 함수
def fetch_station_data(station_ids):
    station_data = []
    for station_id in station_ids:
        station_name = get_station_name_by_id(station_id)
        if "해당 ID에 대한 스테이션이 없습니다." in station_name:
            station_data.append({"station_id": station_id, "station_name": "미확인"})
        else:
            # 여기에 실제 데이터를 가져오는 로직 추가 (예: API 호출)
            station_data.append({"station_id": station_id, "station_name": station_name})
    return station_data