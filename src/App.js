import React, {useEffect, useState} from 'react';
import jwt_decode, {jwtDecode} from 'jwt-decode';
import {BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import DeviceForm from './components/DeviceForm';
import PartForm from './components/PartForm';
import CustomerForm from './components/CustomerForm';
import UserForm from './components/UserForm';
import LoginForm from './components/LoginForm';
import WelcomePage from './components/WelcomePage';
import SideMenu from './components/SideMenu';
import NewReportForm from './components/ReportForm';
import NewRepairForm from './components/RepairForm';
import EditReportForm from './components/EditReportForm';
import EditRepairForm from './components/EditRepairForm'
import RepairManagement from './components/RepairManagement';
import ReportManagement from './components/ReportManagement';
import MyRepairs from './components/MyRepairs';
import MyReports from './components/MyReports';
import Repairs from './components/Repairs';
import Reports from './components/Reports';
import Stats from './components/Stats';
import Logout from './components/Logout';
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
    const isTokenValid = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Bieżący czas w sekundach
            return decoded.exp > currentTime;
        } catch (error) {
            return false;
        }
    };
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token && isTokenValid(token)) {
            try {
                const decoded = jwtDecode(token);
                setUser({ accessToken: token, data: decoded });
            } catch (error) {
                console.log('Błąd dekodowania tokenu:', error);
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }, []);

    const handleLoginSuccess = (userData) => {
        localStorage.setItem('jwtToken', userData.accessToken);
        try {
            if (isTokenValid(userData.accessToken)) {
                const decoded = jwtDecode(userData.accessToken);
                setUser({ accessToken: userData.accessToken, data: decoded });
            } else {
                handleLogout();
            }
        } catch (error) {
            console.log('Błąd dekodowania tokenu:', error);
            handleLogout();
        }
    };

    const handleLoginFailure = () => {

    };
    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setUser(null);

    };
    const isAdmin = user && user.data.role === 'Admin';

    return (
        <Router>
            <div className="App">
                {user && <SideMenu user={user} onLogout={handleLogout} />}

                <div className="top-bar">
                    {user && <input type="text" placeholder="Wyszukaj..." className="search-box" />}
                </div>
                <Routes>
                    {!user ? (
                        <Route path="/" element={<LoginForm onLoginSuccess={handleLoginSuccess} onLoginFailure={handleLoginFailure} />} />

                    ) : (
                        <>
                            <Route path="/logout" element={<Logout onLogout={handleLogout} />} />

                            <Route path="/" element={<WelcomePage user={user} />} />
                            {isAdmin && (
                                <>
                                    <Route path="/devices" element={<DeviceForm />} />
                                    <Route path="/parts" element={<PartForm />} />
                                    <Route path="/customers" element={<CustomerForm />} />
                                    <Route path="/users" element={<UserForm />} />
                                    <Route path="/report-management" element={<Repairs />} />
                                    <Route path="/repair-management" element={<Reports />} />
                                    <Route path="/stats" element={<Stats />} />
                                </>
                            )}
                            <Route path="/new-repair" element={<NewRepairForm user={user} />} />
                            <Route path="/new-report" element={<NewReportForm user={user} />} />
                            <Route path="/edit-report/:reportId" element={<EditReportForm user={user} />} />
                            <Route path="/edit-repair/:repairId" element={<EditRepairForm user={user} />} />
                            <Route path="/my-repairs" element={<MyRepairs user={user} />} />
                            <Route path="/my-reports" element={<MyReports user={user} />} />
                            <Route path="/repairs" element={<Repairs />} />
                            <Route path="/reports" element={<Reports />} />
                        </>
                    )}
                </Routes>
            </div>
        </Router>

    );

}

export default App;

