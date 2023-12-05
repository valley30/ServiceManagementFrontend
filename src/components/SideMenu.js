// components/SideMenu.js

import React, { useState } from 'react';
import './SideMenu.css';

function SideMenu({ onLogout }) { // Dodajemy onLogout jako prop
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
                <li><a href="/strona1">Strona 1</a></li>
                <li><a href="/strona2">Strona 2</a></li>
                <li><a href="/strona3">Strona 3</a></li>
                {/* ... */}
            </ul>
            <button onClick={onLogout}>Wyloguj się</button> {/* Używamy funkcji onLogout */}
        </div>
    );
}

export default SideMenu;
