// LoginForm.js

import React, { useState } from 'react';
import { loginUser } from '../api';
import './LoginForm.css';
function LoginForm({ onLoginSuccess, onLoginFailure }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');


    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await loginUser(username, password);
            localStorage.setItem('jwtToken', response.accessToken); // Zapisz token w Local Storage
            onLoginSuccess(response);
        } catch (err) {
            setError("Logowanie nieudane.");
            onLoginFailure();
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="form-login">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button type="submit">Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}

export default LoginForm;
