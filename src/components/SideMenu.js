import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideMenu.css';
import { faScrewdriverWrench,faMarker,faToolbox,faBars,faAddressBook,faUserGear,faMobile,faGears,faFlag,faChartSimple,faPencil,faWrench,faExclamation,faScrewdriver,faBug,faPowerOff} from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function SideMenu({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const isAdmin = user && user.data.role === 'Admin';

    return (
        <div className={`side-menu ${isOpen ? 'open' : 'closed'}`}>
            <button onClick={toggleMenu} className="toggle-button">
                {isOpen ? <FontAwesomeIcon icon={faBars} /> : <FontAwesomeIcon icon={faBars} />}
            </button>
            <ul className="no-bullet">
                {isAdmin && (
                    <>
                        <li><Link to="/devices"><FontAwesomeIcon icon={faMobile} />{isOpen && ' Zarządzaj urządzeniami'}</Link></li>
                        <li><Link to="/parts"><FontAwesomeIcon icon={faToolbox} /> {isOpen && ' Zarządzaj częściami'}</Link></li>
                        <li><Link to="/customers"><FontAwesomeIcon icon={faAddressBook} /> {isOpen && ' Zarządzaj klientami'}</Link></li>
                        <li><Link to="/users"><FontAwesomeIcon icon={faUserGear} /> {isOpen && ' Zarządzaj użytkownikami'}</Link></li>
                        <li><Link to="/repair-management"><FontAwesomeIcon icon={faGears} /> {isOpen && ' Zarządzaj naprawami'}</Link></li>
                        <li><Link to="/report-management"><FontAwesomeIcon icon={faFlag} /> {isOpen && ' Zarządzaj zgłoszeniami'}</Link></li>
                        <li><Link to="/stats"><FontAwesomeIcon icon={faChartSimple} /> {isOpen && ' Statystyki '}</Link></li>
                    </>
                )}
                <li><Link to="/new-report"><FontAwesomeIcon icon={faMarker} />{isOpen && ' Nowe zgłoszenie '}</Link></li>
                <li><Link to="/new-repair"><FontAwesomeIcon icon={faWrench} /> {isOpen && ' Nowa naprawa '}</Link></li>
                <li><Link to="/repairs"><FontAwesomeIcon icon={faScrewdriverWrench} /> {isOpen && ' Naprawy '}</Link></li>
                <li><Link to="/my-repairs"><FontAwesomeIcon icon={faScrewdriver} /> {isOpen && ' Moje naprawy '}</Link></li>
                <li><Link to="/reports"><FontAwesomeIcon icon={faExclamation} /> {isOpen && ' Zgłoszenia '}</Link></li>
                <li><Link to="/my-reports"><FontAwesomeIcon icon={faBug} /> {isOpen && ' Moje zgłoszenia '}</Link></li>
                {/* inne linki w menu */}
            </ul>
            <button className="logoff" onClick={onLogout}><FontAwesomeIcon icon={faPowerOff} /> {isOpen && ' Wyloguj się '}</button>
        </div>
    );
}

export default SideMenu;
