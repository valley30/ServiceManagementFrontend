import React from 'react';
import './WelcomePage.css'; // Import stylów

function WelcomePage({ user }) {
    return (
        <div className="welcome-container">
            <h1>Witaj, {user.username}!</h1>

            <div className="menu">
                {/* Tutaj logika menu */}
            </div>
            {/* Reszta zawartości strony */}
        </div>
    );
}

export default WelcomePage;
