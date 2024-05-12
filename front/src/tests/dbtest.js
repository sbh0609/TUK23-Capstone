import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import './dbtest.css';

function DBtest() {
    const [users, setUsers] = useState([]);

    console.log('콘솔로그 시작');

    useEffect(() => {
      // 백엔드 서버의 API 엔드포인트
      const apiUrl = 'http://localhost:5000/api/users';  // Flask 서버 주소에 맞게 수정

      // Axios를 사용하여 데이터 가져오기
      axios.get(apiUrl)
          .then(response => {
              console.log('Fetched data:', response.data);  // 데이터 확인을 위해 로그로 출력
              setUsers(response.data);  // 데이터 상태 업데이트
          })
          .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
        <h1>Users</h1>
        <ul>
            {users.map(user => (
                <li key={user.id}>
                    <strong>{user.username}</strong>
                </li>
            ))}
        </ul>
    </div>
    );
}

export default DBtest;