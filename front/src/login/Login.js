import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
    const [userID, setUserID] = useState("");
    const [password, setPassword] = useState("");
    const [buttonCheck, setButtonCheck] = useState(false);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [buttonText, setButtonText] = useState('> 로그인을 해야하는 이유가 무엇인가요?');
    //const [loginCheck, setLoginCheck] = useState(false);

    let sessionStorage = window.sessionStorage;

    const navigate = useNavigate();

    const onUserIdChangeHandler = (e) => {
        setUserID(e.target.value);
    };
    const onPasswordChangeHandler = (e) => {
        setPassword(e.target.value);
    };
    const onClickGoRegisterButtonHandler = (e) => {
        navigate('/register');
    }
    const onClickGoRepositoryButtonHandler = (e) => {
        navigate('/search');
    }
    const onClickPhaseButtonHandler = (e) => {
        if(isVisible === false) 
        {
            setIsVisible(true);
            setButtonText('∨ 로그인을 해야하는 이유가 무엇인가요?');
        }
        else {
            setIsVisible(false);
            setButtonText('> 로그인을 해야하는 이유가 무엇인가요?');
        }
    }
    const onSubmmitHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                userID,
                password
            });

            console.log('Login successful:', response.data);
            sessionStorage.setItem("userID", response.data.userID)
            navigate(-1);
            // 로그인 성공 시 리다이렉트 또는 다음 작업 수행
        } catch (error) {
            console.error('Login error:', error);
            alert('아이디 혹은 비밀번호가 일치하지 않습니다.');
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
            <p>Sign in</p>
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
                    로그인
                </button>
            </form>
        </div>

        <div className="register-box">
            <p>계정이 없으신가요?</p>
            <a href="/register">회원가입 하러가기</a>
        </div>


        <div>
            <button 
            onClick={onClickGoRegisterButtonHandler}
            className="register-button"
            >
                회원가입
            </button>
        </div>

        <div>
            <button
            onClick={onClickPhaseButtonHandler}
            className="phase-button"
            >
                {buttonText}
            </button>
            {isVisible && (
                <div className="phase-invisible">
                    <p>대병학을 찬양하고</p>
                    <p>엄준표를 숭배해야하기 때문입니다.</p>
                    <a href="/search">로그인 없이 이용하기</a>
                </div>
            )}

        </div>
    </div>
    )
}

export default Login;