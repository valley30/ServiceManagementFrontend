import React, {useEffect, useState} from 'react';
import jwt_decode, {jwtDecode} from 'jwt-decode';

import LoginForm from './components/LoginForm';
import WelcomePage from './components/WelcomePage';
import SideMenu from './components/SideMenu';
import './App.css';
import axios from "axios";
// Możesz to zrobić na początku pliku App.js lub w dedykowanym pliku konfiguracyjnym Axios
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function App() {
    const isTokenValid = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Bieżący czas w sekundach
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    };
    const [user, setUser] = useState(null);
// App.js
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token && isTokenValid(token)) {
            try {
                const decoded = jwtDecode(token);
                setUser({ accessToken: token, data: decoded });
            } catch (error) {
                console.log('Błąd dekodowania tokenu:', error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('jwtToken', userData.accessToken);
        try {
            if (isTokenValid(userData.accessToken)) {
                const decoded = jwtDecode(userData.accessToken);
                setUser({ accessToken: userData.accessToken, data: decoded });
            } else {
                handleLogout();
            }
        } catch (error) {
            console.log('Błąd dekodowania tokenu:', error);
            handleLogout();
        }
    };

    const handleLoginFailure = () => {
    // Obsłuż nieudane logowanie
  };
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setUser(null);
    };
  return (
      <div className="App">
          {user && <SideMenu onLogout={handleLogout} />}

        <div className="top-bar">
          {user && <input type="text" placeholder="Wyszukaj..." className="search-box" />}
        </div>
        {!user && <LoginForm onLoginSuccess={handleLoginSuccess} onLoginFailure={handleLoginFailure} />}
        {user && (
            <div className="content">
              <WelcomePage user={user} />
            </div>
        )}
      </div>
  );
}

export default App;
