import React from 'react';
import './WelcomePage.css'; // Import stylów

function WelcomePage({ user }) {
    return (
        <div className="welcome-container">
            <h1>Witaj, {user.data.username}!</h1>
            <h1>Witaj, {user.data.userID}!</h1>
            <p>Rola użytkownika: {user.data.role}</p> {/* Wyświetlanie roli użytkownika */}
            <div className="menu">
                {/* Tutaj logika menu */}
            </div>
            {/* Reszta zawartości strony */}
        </div>
    );
}

export default WelcomePage;
