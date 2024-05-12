from flask import Flask, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

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

@app.route('/api/users', methods=['GET'])
def get_users():
    try:

        # 연결된 커서 생성
        with connection.cursor() as cursor:
            # 사용자 테이블에서 모든 사용자 정보 가져오기
            sql = "SELECT * FROM user"
            cursor.execute(sql)

            # 결과 가져오기
            user = cursor.fetchall()

            # JSON 형식으로 변환하여 반환
            return jsonify(user)

    except Exception as e:
        return jsonify({'error': str(e)}), 500  # 예외 처리

if __name__ == '__main__':
    app.run(debug=True)