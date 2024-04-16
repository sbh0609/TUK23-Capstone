import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [userID, setUserID] = useState("");
    const [passwords, setPasswords] = useState("");
    const [loginCheck, setLoginCheck] = useState(false);

    const navigate = useNavigate();
}