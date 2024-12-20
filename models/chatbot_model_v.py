import os
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
import joblib

# 파일 경로 설정
file_dir = os.path.dirname(__file__)
base_dir = os.path.abspath(os.path.join(file_dir, ".."))
json_path = os.path.join(base_dir, 'data/chatbot/chatbot_dataset.json')
pkl_path = os.path.join(base_dir, 'models/saved_models/chatbot_random_forest.pkl')  # 전역 변수 정의

def load_dataset():
    """JSON 파일에서 데이터셋을 로드"""
    global json_path  # 전역 변수 사용
    print(f"json_path: {json_path}")
    print(f"파일 존재 여부: {os.path.exists(json_path)}")
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        print("JSON 파일 불러오기 성공!")
        questions = [item['question'] for item in data]
        answers = [item['answer'] for item in data]
        categories = [item['category'] for item in data]
        return pd.DataFrame({'question': questions, 'answer': answers, 'category': categories})
    except FileNotFoundError:
        raise FileNotFoundError(f"챗봇 데이터셋 파일이 {json_path}에 없습니다.")
    except json.JSONDecodeError:
        raise ValueError("JSON 형식이 잘못되었습니다. 파일 내용을 확인하세요.")

def train_and_save_model():
    """챗봇 모델을 학습하고 pkl 파일로 저장"""
    global pkl_path  # 전역 변수 사용
    df = load_dataset()

    # 데이터 준비
    X = df['question']
    y = df['category']

    # TF-IDF 벡터화
    vectorizer
