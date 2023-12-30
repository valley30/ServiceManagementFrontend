import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideMenu.css';

function SideMenu({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isAdmin = user && user.data.role === 'Admin';

    return (
        <div className={`side-menu ${isOpen ? 'open' : 'closed'}`}>
            <button onClick={toggleMenu} className="toggle-button">
                {isOpen ? 'Zwiń' : 'Rozwiń'}
            </button>
            <ul className={isOpen ? 'menu-items' : 'hidden'}>
                {isAdmin && (
                    <>
                        <li><Link to="/devices">Zarządzaj urządzeniami</Link></li>
                        <li><Link to="/parts">Zarządzaj częściami</Link></li>
                        <li><Link to="/customers">Zarządzaj klientami</Link></li>
                        <li><Link to="/users">Zarządzaj użytkownikami</Link></li>
                    </>
                )}
                {/* inne linki w menu */}
            </ul>
            <button onClick={onLogout}>Wyloguj się</button>
        </div>
    );
}

export default SideMenu;
