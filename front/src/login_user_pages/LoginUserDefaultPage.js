import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginUserDefault() {

    const navigate = useNavigate();

    useEffect(() => {
        const sessionData = sessionStorage.getItem('userID');
        if (sessionData === null) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login'); // 예: 로그인 상태에 따라 다른 페이지로 이동
        } 
        else {
        }
    }, [navigate]);

    return (
        <div>
            {sessionStorage.getItem("userID") ? (
                <p>Session ID: {sessionStorage.getItem("userID")}</p>
            ) : (
                <p>Loading session data...</p>
            )}
        </div>
    );
}

export default LoginUserDefault;