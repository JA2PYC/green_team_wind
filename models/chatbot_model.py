import os
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from imblearn.over_sampling import SMOTE
import joblib

# pkl 파일 경로 설정
file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'saved_models', 'chatbot_random_forest.pkl')

# 모델 학습 및 저장 함수
def train_and_save_model():
    """챗봇 모델을 학습하고 pkl 파일로 저장"""
    # 1. JSON 파일 불러오기
    json_path = os.path.join(file_dir, 'data/chatbot/chatbot_dataset.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        print("JSON 파일 불러오기 성공!")
    except FileNotFoundError:
        raise FileNotFoundError("챗봇 데이터셋 파일이 없습니다. 경로를 확인하세요.")
    except json.JSONDecodeError:
        raise ValueError("JSON 형식이 잘못되었습니다. 파일 내용을 확인하세요.")

    # 2. 데이터를 DataFrame으로 변환
    questions = [item['question'] for item in data]
    answers = [item['answer'] for item in data]
    categories = [item['category'] for item in data]

    df = pd.DataFrame({'question': questions, 'answer': answers, 'category': categories})

    # 3. 데이터 준비
    X = df['question']
    y = df['category']

    # 4. TF-IDF 벡터화
    vectorizer = TfidfVectorizer()
    X_vectorized = vectorizer.fit_transform(X)

    # 5. SMOTE를 사용해 데이터 오버샘플링
    smote = SMOTE(random_state=42, k_neighbors=1)
    X_smote, y_smote = smote.fit_resample(X_vectorized, y)

    # 6. 데이터셋 분할
    X_train, X_test, y_train, y_test = train_test_split(
        X_smote, y_smote, test_size=0.2, stratify=y_smote, random_state=42
    )

    # 7. Random Forest 하이퍼파라미터 튜닝
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2],
        'random_state': [42]
    }

    rf = RandomForestClassifier()
    grid_search = GridSearchCV(rf, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
    grid_search.fit(X_train, y_train)

    # 최적의 모델로 평가
    best_model = grid_search.best_estimator_
    y_pred = best_model.predict(X_test)
    print("모델 정확도:", accuracy_score(y_test, y_pred))
    print("\n분류 보고서:\n", classification_report(y_test, y_pred))

    # 8. 모델과 벡터라이저 저장
    joblib.dump({'model': best_model, 'vectorizer': vectorizer}, pkl_path)
    print(f"모델이 {pkl_path}에 저장되었습니다.")

# 모델 로드 함수
def load_model():
    """pkl 파일에서 모델을 로드"""
    if not os.path.exists(pkl_path):
        print("pkl 파일이 존재하지 않습니다. 모델을 새로 학습합니다...")
        train_and_save_model()
    try:
        data = joblib.load(pkl_path)
        return data['model'], data['vectorizer']
    except Exception as e:
        raise RuntimeError(f"모델 로드 중 오류 발생: {e}")

# 예측 함수
def predict_category(question):
    """질문에 대해 카테고리를 예측"""
    model, vectorizer = load_model()
    question_vectorized = vectorizer.transform([question])
    category = model.predict(question_vectorized)[0]
    return category

def predict_answer(question):
    """질문에 대해 카테고리를 예측하고 해당 답변을 반환"""
    try:
        # 카테고리 예측
        category = predict_category(question)
        # 예측된 카테고리에 따른 답변 검색
        answer = df.loc[df['category'] == category, 'answer'].iloc[0]
        return answer
    except IndexError:
        return "죄송합니다, 질문에 대한 답변을 찾을 수 없습니다."

if __name__ == "__main__":
    # 예제 실행
    example_question = "고장 시 어떻게 해야 하니?"
    print("예측된 답변:", predict_answer(example_question))
