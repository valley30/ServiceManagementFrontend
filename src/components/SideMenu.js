// components/SideMenu.js

import React, { useState } from 'react';
import './SideMenu.css'; // Zaimportuj odpowiedni plik stylów

function SideMenu() {
    const [isOpen, setIsOpen] = useState(true); // Stan określający, czy menu jest otwarte

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
                {/* Dodaj więcej pozycji w menu według potrzeb */}
            </ul>
        </div>
    );
}

export default SideMenu;
