import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';

const PartForm = () => {
    const [parts, setParts] = useState([]);
    const [newPart, setNewPart] = useState({ name: '', price: '' });
    const [editPart, setEditPart] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editPartId, setEditPartId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [partsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const validateInput = (input) => {
        return input?.length > 1 && input?.length <= 50;
    };

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedParts = [...parts].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setParts(sortedParts);
    };

    useEffect(() => {
        const fetchParts = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/parts');
                setParts(response.data);
            } catch (error) {
                console.error('Błąd podczas pobierania części:', error);
            }
        };
        fetchParts();
    }, []);

    useEffect(() => {
        if (searchTerm.length >= 3) {
            const filteredParts = parts.filter(part =>
                part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.price.toString().includes(searchTerm)
            );
            setParts(filteredParts);
        } else {
            const fetchParts = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/parts');
                    setParts(response.data);
                } catch (error) {
                    console.error('Błąd podczas pobierania części:', error);
                }
            };
            fetchParts();
        }

    }, [searchTerm]);

    const handleEditButtonClick = (partId) => {
        if (editPartId === partId && showEditForm) {
            setEditPartId(null);
            setShowEditForm(false);
        } else {
            setEditPartId(partId);
            const partToEdit = parts.find(part => part.partID === partId);
            setEditPart(partToEdit);
            setShowEditForm(true);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!validateInput(newPart.name) || !validateInput(newPart.price.toString())) {
            alert("Pola muszą zawierać od 2 do 50 znaków.");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/parts/add', newPart);
            setParts([...parts, response.data]);
            setNewPart({ name: '', price: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania części:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateInput(editPart.name) || !validateInput(editPart.price.toString())) {
            alert("Pola muszą zawierać od 2 do 50 znaków.");
            return;
        }
        try {
            await axios.put(`http://localhost:8080/api/parts/modify/${editPart.partID}`, editPart);
            setParts(parts.map(part => part.partID === editPart.partID ? editPart : part));
            setEditPart(null);
            setShowEditForm(false);
            setEditPartId(null);
        } catch (error) {
            console.error('Błąd podczas aktualizacji części:', error);
        }
    };

    const deletePart = async (partId) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę część?")) {
            try {
                await axios.delete(`http://localhost:8080/api/parts/delete/${partId}`);
                setParts(parts.filter(part => part.partID !== partId));
            } catch (error) {
                console.error('Błąd podczas usuwania części:', error);
            }
        }
    };

    // Paginacja...
    const indexOfLastPart = currentPage * partsPerPage;
    const indexOfFirstPart = indexOfLastPart - partsPerPage;
    const currentParts = parts.slice(indexOfFirstPart, indexOfLastPart);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(parts.length / partsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div>
            <div className="header-container">
                <h2>Lista Części</h2>
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

            {showAddForm && (
                <form onSubmit={handleAddSubmit}>
                    <div>
                        <label htmlFor="name">Nazwa:</label>
                        <input
                            type="text"
                            id="name"
                            value={newPart.name}
                            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="price">Cena:</label>
                        <input
                            type="number"
                            id="price"
                            value={newPart.price}
                            onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                        />
                    </div>
                    <button type="submit">Dodaj część</button>
                </form>
            )}

            {showEditForm && editPartId && (
                <form onSubmit={handleEditSubmit}>
                    <div>
                        <label htmlFor="name">Nazwa:</label>
                        <input
                            type="text"
                            id="name"
                            value={editPart.name}
                            onChange={(e) => setEditPart({ ...editPart, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="price">Cena:</label>
                        <input
                            type="number"
                            id="price"
                            value={editPart.price}
                            onChange={(e) => setEditPart({ ...editPart, price: e.target.value })}
                        />
                    </div>
                    <button type="submit">Zapisz zmiany</button>
                </form>
            )}

            <table>
                <thead>
                <tr>
                    <th onClick={() => sortData('name')}>Nazwa</th>
                    <th onClick={() => sortData('price')}>Cena</th>
                    <th>Akcje</th>
                </tr>
                </thead>
                <tbody>
                {currentParts.map(part => (
                    <tr key={part.partID}>
                        <td>{part.name}</td>
                        <td>{part.price}</td>
                        <td>
                            <button onClick={() => handleEditButtonClick(part.partID)}>
                                {editPartId === part.partID && showEditForm ? "Ukryj" : "Modyfikuj"}
                            </button>
                            <button onClick={() => deletePart(part.partID)}>
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

export default PartForm;
