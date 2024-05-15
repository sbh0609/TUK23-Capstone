from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql

app = Flask(__name__)
SECRETKEY = 'root'
app.secret_key = SECRETKEY
CORS(app, supports_credentials=True, origins='http://localhost:3000')

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
                return jsonify({'message': 'Login successful', 'userID': user['web_user_id']}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    userID = data.get('userID')
    password = data.get('password')
    try:
        with connection.cursor() as cursor:
            sql_check = "SELECT * FROM user WHERE web_user_id = %s"
            cursor.execute(sql_check, (userID), )
            user = cursor.fetchone()

            if user is None:
                sql_insert = "INSERT INTO user (web_user_id, pwd) VALUES (%s, %s)"
                cursor.execute(sql_insert, (userID, password))
                connection.commit() 
                return jsonify({'message(@register)': '회원가입 성공'}), 200
            else:
                return jsonify({'error(@register)': '중복 아이디'}), 409
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
       
if __name__ == '__main__':
    app.run(debug=True)