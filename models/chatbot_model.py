import os
import joblib

file_dir = os.path.dirname(__file__)
pkl_path = os.path.join(file_dir, 'models', 'saved_models', 'chatbot_random_forest.pkl')

# pkl 파일 존재 여부 확인
if not os.path.exists(pkl_path):
    raise FileNotFoundError(f"{pkl_path} 파일이 존재하지 않습니다. 모델을 먼저 학습하세요.")

# pkl 파일 로드
model_data = joblib.load(pkl_path)
model = model_data['model']
vectorizer = model_data['vectorizer']

def predict_answer(question):
    question_vectorized = vectorizer.transform([question])
    category = model.predict(question_vectorized)[0]
    return f"예측된 카테고리: {category}"
