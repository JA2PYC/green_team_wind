import os
import requests
import xml.etree.ElementTree as ET

API_KEY = os.getenv("PVAMOUNTBYPOWERGEN_KEY")
API_URL = "http://apis.data.go.kr/B552115/PwrAmountByGen/getPwrAmountByGen"

def fetch_open_pabg_data(baseDate, pageNo=1, numOfRows=300, dataType="json"):
    params = {
        "baseDate": baseDate,
        "pageNo": pageNo,
        "numOfRows": numOfRows,
        "dataType": dataType,
        "serviceKey": API_KEY,
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()

        if params["dataType"] == "json":
            data = response.json()
            print("JSON 응답 데이터:")
            return data
        else:
            # XML 데이터를 JSON 형태로 변환
            root = ET.fromstring(response.text)
            items = root.findall(".//item")
            xml_data = []

            for item in items:
                record = {child.tag: child.text for child in item}
                xml_data.append(record)

            print("XML 응답 데이터:", xml_data)
            return {
                "header": {
                    "resultCode": root.findtext(".//resultCode"),
                    "resultMsg": root.findtext(".//resultMsg"),
                },
                "body": {
                    "dataType": root.findtext(".//dataType"),
                    "totalCount": root.findtext(".//totalCount"),
                    "numOfRows": root.findtext(".//numOfRows"),
                    "pageNo": root.findtext(".//pageNo"),
                    "items": xml_data,
                },
            }
    except Exception as e:
        return {"error": str(e)}
