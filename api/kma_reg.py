import json
import os

dataname = 'kma_reg'
file_dir = os.path.dirname(__file__)
file_path = os.path.join(file_dir, "json", f"{dataname}.json")

def load_reg_from_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "파일을 찾을 수 없습니다."}
    except json.JSONDecodeError:
        return {"error": "JSON 파일을 읽는 데 문제가 발생했습니다."}
    except Exception as e:
        return {"error": f"알 수 없는 오류 발생: {str(e)}"}
    
regs = load_reg_from_file(file_path)

# reg_name을 reg_id로 변환
def get_reg_id_by_name(reg_name):
    for item in regs:
        if item["reg_name"] == reg_name:
            return item["reg_id"]
    return None

# reg_id를 reg_name으로 변환
def get_reg_name_by_id(reg_id):
    for item in regs:
        if item["reg_id"] == reg_id:
            return item["reg_name"]
    return None

def fetch_reg_data(reg_ids):
    reg_data=[]
    for reg_id in reg_ids:
        reg_name = get_reg_name_by_id(reg_id)
        if reg_name is None:
            reg_data.append({"reg_id": reg_id, "reg_name": "미확인"})
        else:
            reg_data.append({"reg_id": reg_id, "reg_name": reg_name})
    return reg_data
