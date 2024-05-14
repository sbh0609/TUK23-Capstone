import React, { useState, useEffect } from 'react';

function LoginUserDefault() {

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