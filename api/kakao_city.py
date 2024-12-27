import json
import os

dataname = "kakao_city"
file_dir = os.path.dirname(__file__)
file_path = os.path.join(file_dir, "json", f"{dataname}.json")

def load_city_from_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "파일을 찾을 수 없습니다."}
    except json.JSONDecodeError:
        return {"error": "JSON 파일을 읽는 데 문제가 발생했습니다."}
    except Exception as e:
        return {"error": f"알 수 없는 오류 발생: {str(e)}"}
    
cities = load_city_from_file(file_path)

def get_kakao_city_data():

    # for item in cities:
    #     if item["city"] == city:
    #         return item
    return cities

