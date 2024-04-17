import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Temptemp.css';

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
    const onSubmmitHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/validation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userID, password })
            });

            // 로그인 성공 시 다음 페이지로 이동
            if (response.ok) {
                navigate('/dashboard');
            } 
            // 로그인 실패 시 처리
            else {
                console.log('로그인 실패');
            }
        } catch (error) {
            console.error('서버에 문제가 발생하였습니다.\n 잠시 후에 다시 시도해 주세요.', error);
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
            <p>Register</p>
        </div>
        
        <div className="login-box">
            <form onSubmit={onSubmmitHandler}>
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
                disabled={!buttonCheck} 
                className={`submmit-button ${!buttonCheck ? 'submmit-button-disabled' : ''}`}
                >
                    회원가입
                </button>
            </form>
        </div>

    </div>
    )
}

export default Login;