import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LoginUserDefault() {
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/session', { withCredentials: true });
                setSessionData(response.data);
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSession();
    }, []);

    return (
        <div>
            {sessionData ? (
                <p>Session ID: {sessionData.id}</p>
            ) : (
                <p>Loading session data...</p>
            )}
        </div>
    );
}

export default LoginUserDefault;