import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reportform.css';
import { faUserPlus, faUserMinus, faCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";

const ReportForm = ({ user }) => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [clientDescription, setClientDescription] = useState('');
    const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });

    useEffect(() => {
        // Pobranie listy klientów
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/customers');
                setCustomers(response.data);
            } catch (error) {
                console.error('Błąd podczas pobierania klientów:', error);
            }
        };
        fetchCustomers();
    }, []);
    const isCustomerValid = () => {
        const { firstName, lastName, email, phoneNumber } = newCustomer;
        return (
            firstName.length >= 3 && firstName.length <= 30 &&
            lastName.length >= 5 && lastName.length <= 30 &&
            email.length >= 5 && email.length <= 30 &&
            phoneNumber.length >= 5 && phoneNumber.length <= 30
        );
    };
    const handleAddCustomerSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/customers/add', newCustomer);
            setCustomers([...customers, response.data]);
            setNewCustomer({ firstName: '', lastName: '', email: '', phoneNumber: '' });
            setSelectedCustomer(response.data.customerID.toString());
        } catch (error) {
            console.error('Błąd podczas dodawania klienta:', error);
        }
    };
    const handleHideAddCustomerForm = () => {
        setShowAddCustomerForm(false);
        setNewCustomer({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    };
    const navigate = useNavigate(); // Hook do nawigacji

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const newReport = {
                customerId: parseInt(selectedCustomer, 10),
                userId: user.data.userID,
                clientDescription,
                status: 'Nowy'
            };

            const response = await axios.post('http://localhost:8080/api/reports/add', newReport);
            if (response.data && response.data.reportId) {
                navigate(`/edit-report/${response.data.reportId}`);
            } else {
                console.error('Odpowiedź nie zawiera oczekiwanych danych');
            }
        } catch (error) {
            console.error('Błąd podczas dodawania zgłoszenia:', error);
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Nowe zgłoszenie</h2>
            {showAddCustomerForm && (
                <form onSubmit={handleAddCustomerSubmit} className="add-customer-form">
                    <div className="form-group">
                        <label htmlFor="new-firstName">Imię:</label>
                        <input
                            type="text"
                            id="new-firstName"
                            className="form-control"
                            value={newCustomer.firstName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-lastName">Nazwisko:</label>
                        <input
                            type="text"
                            id="new-lastName"
                            className="form-control"
                            value={newCustomer.lastName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-email">Email:</label>
                        <input
                            type="email"
                            id="new-email"
                            className="form-control"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="new-phoneNumber">Numer Telefonu:</label>
                        <input
                            type="text"
                            id="new-phoneNumber"
                            className="form-control"
                            value={newCustomer.phoneNumber}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!isCustomerValid()}>
                        Dodaj klienta
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={handleHideAddCustomerForm}>
                        Ukryj
                    </button>
                </form>
            )}
            <form onSubmit={handleReportSubmit} className="report-form">
                <div className="form-group">
                    <label htmlFor="customer-select">Klient:</label>
                    <select
                        id="customer-select"
                        className="form-control"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                    >
                        <option value="">Wybierz klienta</option>
                        {customers.map(customer => (
                            <option key={customer.customerID} value={customer.customerID}>
                                {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </select>
                    <button type="button" className="toggle-customer-form-btn" onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}>
                        <FontAwesomeIcon icon={showAddCustomerForm ? faUserMinus : faUserPlus} />
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="client-description">Opis klienta:</label>
                    <textarea
                        id="client-description"
                        className="form-control"
                        value={clientDescription}
                        onChange={(e) => setClientDescription(e.target.value)}
                    ></textarea>
                </div>
                <div className="form-group">
                </div>
                <button type="submit" className="btn btn-primary submit-report-btn">Stwórz zgłoszenie</button>
            </form>
        </div>
    );
};

export default ReportForm;