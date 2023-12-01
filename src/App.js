import React, { useState } from 'react';
import LoginForm from './components/LoginForm';

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
        {!user && <LoginForm onLoginSuccess={handleLoginSuccess} onLoginFailure={handleLoginFailure} />}
        {user && (
            <div>
              <h1>Witaj, {user.username}!</h1>
              {user.role === 'Admin' && <p>PANEL ADMIN</p>}
              {/* Wyświetl informacje dla zalogowanego użytkownika */}
            </div>
        )}
      </div>
  );
}

export default App;
