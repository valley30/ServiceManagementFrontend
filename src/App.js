import React, {useEffect, useState} from 'react';
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

    const [user, setUser] = useState(null);
// App.js
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            // Możesz dodać tutaj dodatkową logikę weryfikacji tokenu, np. sprawdzenie daty wygaśnięcia
            // Zakładamy, że jeśli token istnieje, użytkownik jest zalogowany
            setUser({ accessToken: token });
        }
    }, []);




    const handleLoginSuccess = (userData) => {
        localStorage.setItem('jwtToken', userData.accessToken); // Zapisz token w Local Storage
        setUser(userData);
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
