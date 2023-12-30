import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';

const UserForm = () => {
    const [users, setUsers] = useState([]);
    const [newUserData, setNewUserData] = useState({
        username: '',
        password: '',
        email: '',
        role: ''
    });
    const [editUser, setEditUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const validateInput = (input) => {
        return input?.length > 1 && input?.length <= 50;
    };

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedUsers = [...users].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setUsers(sortedUsers);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Błąd podczas pobierania danych użytkowników:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.length >= 3) {
            const filteredUsers = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setUsers(filteredUsers);
        } else {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/users');
                    setUsers(response.data);
                } catch (error) {
                    console.error('Błąd podczas pobierania danych użytkowników:', error);
                }
            };
            fetchUsers();
        }
    }, [searchTerm]);

    const handleEditButtonClick = (userId) => {
        if (editUserId === userId && showEditForm) {
            setEditUserId(null);
            setShowEditForm(false);
        } else {
            setEditUserId(userId);
            const userToEdit = users.find(user => user.userID === userId);
            setEditUser(userToEdit);
            setShowEditForm(true);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!validateInput(newUserData.username) || !validateInput(newUserData.email) || !validateInput(newUserData.password)) {
            alert("Pola muszą zawierać od 2 do 50 znaków.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/users/add', {
                username: newUserData.username,
                password: newUserData.password,
                email: newUserData.email,
                roleName: newUserData.role // Tutaj przesyłamy roleName
            });
            setUsers([...users, response.data]);
            setNewUserData({ username: '', password: '', email: '', role: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania użytkownika:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const updatedUserData = {};

        if (editUser.username !== newUserData.username) {
            updatedUserData.username = newUserData.username;
        }
        if (newPassword) {
            updatedUserData.password = newPassword;
        }
        if (editUser.email !== newUserData.email) {
            updatedUserData.email = newUserData.email;
        }
        if (editUser.role !== newUserData.role) {
            updatedUserData.roleName = newUserData.role; // Dodano zmianę roli
        }

        try {
            await axios.put(`http://localhost:8080/api/users/modify/${editUser.userID}`, updatedUserData);
            setEditUser(null);
            setNewPassword('');
            setNewUserData({ username: '', password: '', email: '', role: '' });
            // Opcjonalnie odśwież listę użytkowników
        } catch (error) {
            console.error('Błąd podczas aktualizacji użytkownika:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
            try {
                await axios.delete(`http://localhost:8080/api/users/delete/${userId}`);
                setUsers(users.filter(user => user.userID !== userId));
            } catch (error) {
                console.error('Błąd podczas usuwania użytkownika:', error);
            }
        }
    };

    // Paginacja
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(users.length / usersPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div>


            {showAddForm && (
                <form onSubmit={handleAddSubmit}>
                    <div>
                        <label htmlFor="new-username">Nazwa użytkownika:</label>
                        <input
                            type="text"
                            id="new-username"
                            value={newUserData.username}
                            onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password">Hasło:</label>
                        <input
                            type="password"
                            id="new-password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-email">Email:</label>
                        <input
                            type="email"
                            id="new-email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-role">Rola:</label>
                        <select
                            id="new-role"
                            value={newUserData.role}
                            onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                        >
                            <option value="">Wybierz rolę</option>
                            <option value="Admin">Admin</option>
                            <option value="User">Użytkownik</option>
                        </select>

                    </div>
                    <button type="submit">Dodaj użytkownika</button>
                </form>

            )}

            {showEditForm && editUser && (
                <form onSubmit={handleEditSubmit}>
                    {/* Pola formularza do edycji */}
                    <input
                        type="text"
                        placeholder="Nazwa użytkownika"
                        value={editUser.username}
                        onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={editUser.email}
                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Nowe hasło"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="submit">Zapisz zmiany</button>
                </form>
            )}

            <div className="header-container">
                <h2>Lista Użytkowników</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
                    {showAddForm ? "Ukryj" : <img src="/path/to/plus-icon.png" alt="Dodaj" />}
                </button>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <table>
                <thead>
                <tr>
                    <th onClick={() => sortData('username')}>Nazwa:</th>
                    <th onClick={() => sortData('email')}>Email:</th>
                    <th>Akcje</th>
                </tr>
                </thead>
                <tbody>
                {currentUsers.map(user => (
                    <tr key={user.userID}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                            <button onClick={() => handleEditButtonClick(user.userID)}>
                                {editUserId === user.userID && showEditForm ? "Ukryj" : "Modyfikuj"}
                            </button>
                            <button onClick={() => deleteUser(user.userID)}>
                                <img src="/path/to/bin.png" alt="Usuń" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <nav>
                <ul className="pagination">
                    {pageNumbers.map(number => (
                        <li key={number} className="page-item">
                            <button className="page-link" onClick={() => setCurrentPage(number)}>
                                {number}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default UserForm;