import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RegisterPage.css';

function Login() {
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");
    const [loginCheck, setLoginCheck] = useState(false);
    const [buttonCheck, setButtonCheck] = useState(false);

    const navigate = useNavigate();
    
    const isIDValidInput = (value) => {
        return /^[a-zA-Z0-9]+$/.test(value);
    };
    const isPasswordValidInput = (value) => {
        return /^[^\u3131-\uD79D]+$/g.test(value);
    };
    const onUserIdChangeHandler = (e) => {
        const value = e.target.value;
        if (value === '' || isIDValidInput(value)) {
            setUserID(value);
        }
    };
    const onPasswordChangeHandler = (e) => {
        const value = e.target.value;
        if (value === '' || isPasswordValidInput(value)) {
            setPassword(value);
        }
    };
    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                userID,
                password
            });

            console.log('Register successful:', response.data);
            alert('회원가입이 완료되었습니다!');
            navigate("/login");
        } catch (error) {
            alert('중복된 아이디입니다.');
            console.error('Login error (registerPage):', error);
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
            <form onSubmit={onSubmitHandler}>
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