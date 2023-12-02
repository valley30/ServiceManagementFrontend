import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import WelcomePage from './components/WelcomePage';
import SideMenu from './components/SideMenu';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLoginFailure = () => {
    // Obsłuż nieudane logowanie
  };

  return (
      <div className="App">
        {user && <SideMenu />}
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
