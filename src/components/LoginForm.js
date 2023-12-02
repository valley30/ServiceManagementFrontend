// LoginForm.js

import React, { useState } from 'react';
import { loginUser } from '../api';
import './LoginForm.css'; // Import stylów
function LoginForm({ onLoginSuccess, onLoginFailure }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await loginUser(username, password);
            onLoginSuccess(response); // Wywołaj, gdy logowanie jest udane
        } catch (err) {
            setError("Logowanie nieudane.");
            onLoginFailure(); // Wywołaj, gdy logowanie nie powiedzie się
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
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
