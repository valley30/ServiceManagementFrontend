import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideMenu.css';

function SideMenu({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`side-menu ${isOpen ? 'open' : 'closed'}`}>
            <button onClick={toggleMenu} className="toggle-button">
                {isOpen ? 'Zwiń' : 'Rozwiń'}
            </button>
            <ul className={isOpen ? 'menu-items' : 'hidden'}>
                {/* inne linki w menu */}
                {user.data.role === 'Admin' && (
                    <li><Link to="/devices">Zarządzaj urządzeniami</Link></li>
                )}
                {/* ... */}
            </ul>
            <button onClick={onLogout}>Wyloguj się</button>
        </div>
    );
}

export default SideMenu;
