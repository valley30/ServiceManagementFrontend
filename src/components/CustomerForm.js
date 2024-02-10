import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Report.css';
import {  faPersonCirclePlus,faTrashCan} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomerForm = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });
    const [editCustomer, setEditCustomer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(5);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' lub 'desc'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editCustomerId, setEditCustomerId] = useState(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const toggleAddForm = () => {
        setIsAddFormVisible(!isAddFormVisible);
    };
    const validateInput = (input) => {
        return input?.length > 1 && input?.length <= 50;
    };

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedCustomers = [...customers].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setCustomers(sortedCustomers);
    };

    useEffect(() => {
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

    useEffect(() => {
        if (searchTerm.length >= 3) {
            const filteredCustomers = customers.filter(customer =>
                customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phoneNumber.includes(searchTerm)
            );
            setCustomers(filteredCustomers);
        } else {
            const fetchCustomers = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/customers');
                    setCustomers(response.data);
                } catch (error) {
                    console.error('Błąd podczas usuwania klienta:', error);

                    if (error.response && error.response.status === 403) {
                        alert("Niestety konto klienta jest w użyciu, nie można usunąć.");
                    } else {
                        // Możesz obsłużyć inne kody błędów lub ogólny błąd
                        alert("Wystąpił błąd podczas usuwania klienta.");
                    }
                }

            };
            fetchCustomers();
        }
    }, [searchTerm]);

    const handleEditButtonClick = (customerId) => {
        if (editCustomerId === customerId && showEditForm) {
            setEditCustomerId(null);
            setShowEditForm(false);
        } else {
            setEditCustomerId(customerId);
            const customerToEdit = customers.find(customer => customer.customerID === customerId);
            setEditCustomer(customerToEdit);
            setShowEditForm(true);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newCustomer || Object.values(newCustomer).some(value => !validateInput(value))) {
            alert("Pola muszą zawierać od 2 do 50 znaków.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/customers/add', newCustomer);
            setCustomers([...customers, response.data]);
            setNewCustomer({ firstName: '', lastName: '', email: '', phoneNumber: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania klienta:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/customers/modify/${editCustomer.customerID}`, editCustomer);
            setCustomers(customers.map(customer => customer.customerID === editCustomer.customerID ? editCustomer : customer));
            setEditCustomer(null);
        } catch (error) {
            console.error('Błąd podczas aktualizacji klienta:', error);
        }
    };

    const deleteCustomer = async (customerId) => {
        if (window.confirm("Czy na pewno chcesz usunąć tego klienta?")) {
            try {
                await axios.delete(`http://localhost:8080/api/customers/delete/${customerId}`);
                setCustomers(customers.filter(customer => customer.customerID !== customerId));
            } catch (error) {
                console.error('Błąd podczas usuwania klienta:', error);
            }
        }
    };

    const modifyCustomer = (customerId) => {
        const customerToEdit = customers.find(customer => customer.customerID === customerId);
        if (customerToEdit) {
            setEditCustomer(customerToEdit);
        }
    };

    // Paginacja
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(customers.length / customersPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="form-container">


            {showAddForm && (
                <form onSubmit={handleAddSubmit}>
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
                                value={newCustomer.phoneNumber}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                            />
                        </div>
                        <button type="submit">Dodaj klienta</button>


                </form>
            )}


            {showEditForm && editCustomer && (
                <form onSubmit={handleEditSubmit}>
                        <div>
                            <label htmlFor="edit-firstName">Imię:</label>
                            <input
                                type="text"
                                id="edit-firstName"
                                value={editCustomer.firstName}
                                onChange={(e) => setEditCustomer({ ...editCustomer, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-lastName">Nazwisko:</label>
                            <input
                                type="text"
                                id="edit-lastName"
                                value={editCustomer.lastName}
                                onChange={(e) => setEditCustomer({ ...editCustomer, lastName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-email">Email:</label>
                            <input
                                type="email"
                                id="edit-email"
                                value={editCustomer.email}
                                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-phoneNumber">Numer Telefonu:</label>
                            <input
                                type="text"
                                id="edit-phoneNumber"
                                value={editCustomer.phoneNumber}
                                onChange={(e) => setEditCustomer({ ...editCustomer, phoneNumber: e.target.value })}
                            />
                        </div>
                        <button type="submit">Zapisz zmiany</button>
                    </form>

            )}



            {/* Tabela klientów */}
            <div className="header-container">
                <h2>Lista Klientów</h2>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
                    {showAddForm ? "Ukryj" : <FontAwesomeIcon icon={faPersonCirclePlus}  alt="Dodaj" />}
                </button>

            </div>
            <table>
                <thead>
                <tr>
                    <th onClick={() => sortData('firstName')}>Imię</th>
                    <th onClick={() => sortData('lastName')}>Nazwisko</th>
                    <th onClick={() => sortData('email')}>Email</th>
                    <th onClick={() => sortData('phoneNumber')}>Numer Telefonu</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {currentCustomers.map(customer => (
                    <tr key={customer.customerID}>
                        <td>{customer.firstName}</td>
                        <td>{customer.lastName}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phoneNumber}</td>
                        <td>
                            <button onClick={() => handleEditButtonClick(customer.customerID)}>
                                {editCustomerId === customer.customerID && showEditForm ? "Ukryj" : "Modyfikuj"}
                            </button>
                            <button onClick={() => deleteCustomer(customer.customerID)}>
                                <FontAwesomeIcon icon={faTrashCan} alt="Usuń" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Paginacja */}
            <nav className="pagination-nav">
                <ul className="pagination">
                    {pageNumbers.map(number => (
                        <li key={number} className="page-item">
                            <button onClick={() => setCurrentPage(number)} className="page-link">
                                {number}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default CustomerForm;
