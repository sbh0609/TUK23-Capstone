import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");
    const [loginCheck, setLoginCheck] = useState(false);
    const [buttonCheck, setButtonCheck] = useState(false);

    const navigate = useNavigate();

    const onUserIdChangeHandler = (e) => {
        setUserID(e.target.value);
    };
    const onPasswordChangeHandler = (e) => {
        setPassword(e.target.value);
    };
    // 빈칸 존재시 로그인버튼 비활성화
    const handleLogin = async (e) => {
     
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                userID,
                password
            });

            console.log('Login successful:', response.data);
            // 로그인 성공 시 리다이렉트 또는 다음 작업 수행
        } catch (error) {
            console.error('Login error:', error);
            // 로그인 실패 시 처리
        }
    };

    useEffect(() => {
        if (userID.trim() === "" || password.trim() === "") {
            setButtonCheck(false);
        }
        else {
            setButtonCheck(true);
        }
    }, [userID, password]);

    return (
    <div className="LoginPage">
        <div className="LoginPage-Background">
        </div>
      
        <div className="phase">
            <p>Login</p>
        </div>
        
        <div className="login-box">
                <div>
                    <p className="userID">ID</p>
                
                    <label>
                        <input
                        type="text"
                        value={userID}
                        onChange={onUserIdChangeHandler}
                        placeholder="아이디를 입력해 주세요."
                        />
                    </label>

                    <p className="password">Password</p>
                
                    <label>
                        <input
                        type="password"
                        value={password}
                        onChange={onPasswordChangeHandler}
                        placeholder="비밀번호를 입력해 주세요."
                        />
                    </label>
                </div>

                <button 
                type="submit" 
                onClick={handleLogin}
                disabled={!buttonCheck} 
                className={`submmit-button ${!buttonCheck ? 'submmit-button-disabled' : ''}`}
                >
                    로그인
                </button>

        </div>

    </div>
    )
}

export default Login;