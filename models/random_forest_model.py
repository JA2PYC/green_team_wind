import numpy as np
import joblib

rf_model = joblib.load(open('./saved_models/jeju_random_forest.pkl', 'rb'))

def rf_model_predict(temp, wind, atmos, density):
    try:
        array = np.array([[temp, wind, atmos, density]])
        pred = int(rf_model.predict(array).round(1))
        print (pred)
        return pred
    except Exception as e:
        return {"error": str(e)}
