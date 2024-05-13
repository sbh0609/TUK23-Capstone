from flask import Flask, jsonify, request, session
from flask_cors import CORS
import pymysql

app = Flask(__name__)
SECRETKEY = 'root'
app.secret_key = SECRETKEY
cors = CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# MySQL 데이터베이스 연결 설정
connection = pymysql.connect(
    host='localhost',  # 호스트 주소
    port=3306,
    user='root',  # 데이터베이스 사용자 이름
    password='passwd',  # 데이터베이스 암호
    database='tuk23_capstone',  # 사용할 데이터베이스 이름
    charset='utf8mb4',  # 문자 인코딩 설정
    cursorclass=pymysql.cursors.DictCursor  # 결과를 딕셔너리 형태로 반환
)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    userID = data.get('userID')
    password = data.get('password')
    try:
        with connection.cursor() as cursor:
            sql = "SELECT * FROM user WHERE web_user_id = %s AND pwd = %s"
            cursor.execute(sql, (userID, password))
            user = cursor.fetchone()

            if user:
                session['id'] = user.get("web_user_id")
                return jsonify({'message': 'Login successful', 'user': user, 'session': session['id']}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/session', methods=['POST'])
def get_session():
    if 'id' in session:
        user_id = session['id']
        # 세션에 저장된 사용자 ID로 프로필 정보 조회 또는 작업 수행
        return jsonify({'user_id': user_id}), 200
    else:
        return jsonify({'error': 'User not authenticated'}), 401
    
@app.route('/api/register', methods=['POST'])
def register():
    if:
        return
    

if __name__ == '__main__':
    app.run(debug=True)