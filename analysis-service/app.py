from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    # data: { studentId, name, grades: [{subject, value, type, date}] }
    df = pd.DataFrame(data.get('grades', []))
    if df.empty:
        return jsonify({"studentId": data.get('studentId'), "recommendations": [], "message": "Sin calificaciones"})

    # compute averages per subject
    avg_by_subject = df.groupby('subject')['value'].mean().reset_index()
    # identify weak subjects (threshold configurable)
    threshold = 6.0
    weak = avg_by_subject[avg_by_subject['value'] < threshold]
    recs = []
    for _, row in weak.iterrows():
        recs.append({
            "subject": row['subject'],
            "average": round(float(row['value']), 2),
            "recommendation": f"Refuerzo en {row['subject']}. Actividades prácticas y revisión de fundamentos."
        })

    overall_avg = float(df['value'].mean())
    status = "Bien" if overall_avg >= 7.0 else ("Atención" if overall_avg >= 6.0 else "Riesgo")
    result = {
        "studentId": data.get('studentId'),
        "name": data.get('name'),
        "overallAverage": round(overall_avg,2),
        "status": status,
        "weakSubjects": recs
    }
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
