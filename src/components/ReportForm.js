import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import './Reportform.css'
import { faUserPlus, faUserMinus,faUserPen} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {useNavigate} from "react-router-dom";
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

    const handleAddCustomerSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/customers/add', newCustomer);
            setCustomers([...customers, response.data]);
            setNewCustomer({ firstName: '', lastName: '', email: '', phoneNumber: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania klienta:', error);
        }
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
                // Przekierowanie do strony edycji zgłoszenia, jeśli zgłoszenie zostało pomyślnie utworzone
                navigate(`/edit-report/${response.data.reportId}`);
            } else {
                // Obsługa sytuacji, gdy odpowiedź nie zawiera oczekiwanych danych
                console.error('Odpowiedź nie zawiera oczekiwanych danych');
            }
        } catch (error) {
            console.error('Błąd podczas dodawania zgłoszenia:', error);
        }
    };
    return (
        <div>
            <h2>Nowe zgłoszenie</h2>
            {showAddCustomerForm && (
                <form onSubmit={handleAddCustomerSubmit}>
                    <div>
                        <label htmlFor="new-firstName">Imię:</label>
                        <input
                            type="text"
                            id="new-firstName"
                            value={newCustomer.firstName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-lastName">Nazwisko:</label>
                        <input
                            type="text"
                            id="new-lastName"
                            value={newCustomer.lastName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-email">Email:</label>
                        <input
                            type="email"
                            id="new-email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-phoneNumber">Numer Telefonu:</label>
                        <input
                            type="text"
                            id="new-phoneNumber"
                            value ={newCustomer.phoneNumber}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                        />
                    </div>
                    <button type="submit">Dodaj klienta</button>


                </form>
            )}
            <form onSubmit={handleReportSubmit}>
                <div>
                    <label htmlFor="customer-select">Klient:</label>
                    <select
                        id="customer-select"
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
                    <button type="button" onClick={() => setShowAddCustomerForm(!showAddCustomerForm)}>
                        {showAddCustomerForm ? 'Ukryj' : '+'}
                    </button>
                </div>

                <div>
                    <label htmlFor="client-description">Opis klienta:</label>
                    <textarea
                        id="client-description"
                        value={clientDescription}
                        onChange={(e) => setClientDescription(e.target.value)}
                    ></textarea>
                </div>
                <button type="submit">Stwórz zgłoszenie</button>
            </form>
        </div>
    );
};

export default ReportForm;
