import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import { faSquarePlus, faTrashCan} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const DeviceForm = () => {
    const [devices, setDevices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [newDevice, setNewDevice] = useState({ type: '', manufacturer: '', model: '' });
    const [editDevice, setEditDevice] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [devicesPerPage] = useState(5);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc'); // 'asc' lub 'desc'
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editDeviceId, setEditDeviceId] = useState(null);

    const validateInput = (input) => {
        return input?.length > 1 && input?.length <= 50;
    };

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedDevices = [...devices].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setDevices(sortedDevices);
    };

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/devices');
                setDevices(response.data);
            } catch (error) {
                console.error('Błąd podczas pobierania urządzeń:', error);
            }
        };
        fetchDevices();
    }, []);

    useEffect(() => {
        if (searchTerm.length >= 3) {
            const filteredDevices = devices.filter(device =>
                device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                device.model.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setDevices(filteredDevices);
        } else {
            const fetchDevices = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/devices');
                    setDevices(response.data);
                } catch (error) {
                    console.error('Błąd podczas pobierania urządzeń:', error);
                }
            };
            fetchDevices();
        }
    }, [searchTerm]);

    const handleEditButtonClick = (deviceId) => {
        if (editDeviceId === deviceId && showEditForm) {
            setEditDeviceId(null);
            setShowEditForm(false);
        } else {
            setEditDeviceId(deviceId);
            const deviceToEdit = devices.find(device => device.deviceID === deviceId);
            setEditDevice(deviceToEdit);
            setShowEditForm(true);
        }
    };
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newDevice || Object.values(newDevice).some(value => !validateInput(value))){
            alert("Pola muszą zawierać od 2 do 50 znaków. ");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/devices/add', newDevice);
            setDevices([...devices, response.data]);
            setNewDevice({ type: '', manufacturer: '', model: '' });
        } catch (error) {
            console.error('Błąd podczas dodawania urządzenia:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8080/api/devices/modify/${editDevice.deviceID}`, editDevice);
            setDevices(devices.map(device => device.deviceID === editDevice.deviceID ? editDevice : device));
            setEditDevice(null);
        } catch (error) {
            console.error('Błąd podczas aktualizacji urządzenia:', error);
        }
    };

    const deleteDevice = async (deviceId) => {
        if (window.confirm("Czy na pewno chcesz usunąć to urządzenie?")) {
            try {
                await axios.delete(`http://localhost:8080/api/devices/delete/${deviceId}`);
                setDevices(devices.filter(device => device.deviceID !== deviceId));
            } catch (error) {
                console.error('Błąd podczas usuwania urządzenia:', error);
            }
        }
    };

    const modifyDevice = (deviceId) => {
        const deviceToEdit = devices.find(device => device.deviceID === deviceId);
        if (deviceToEdit) {
            setEditDevice(deviceToEdit);
        }
    };

    // Paginacja
    const indexOfLastDevice = currentPage * devicesPerPage;
    const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
    const currentDevices = devices.slice(indexOfFirstDevice, indexOfLastDevice);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(devices.length / devicesPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="form-container">

            {showAddForm && (
                <form onSubmit={handleAddSubmit}>
                    <div>
                        <label htmlFor="type">Typ:</label>
                        <input
                            type="text"
                            id="type"
                            value={newDevice.type}
                            onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="manufacturer">Producent:</label>
                        <input
                            type="text"
                            id="manufacturer"
                            value={newDevice.manufacturer}
                            onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="model">Model:</label>
                        <input
                            type="text"
                            id="model"
                            value={newDevice.model}
                            onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                        />
                    </div>
                    <button type="submit">Dodaj urządzenie</button>
                </form>
            )}

            {showEditForm && editDevice && (
                <form onSubmit={handleEditSubmit}>
                    <div>
                        <label htmlFor="type">Typ:</label>
                        <input
                            type="text"
                            id="type"
                            value={editDevice.type}
                            onChange={(e) => setEditDevice({ ...editDevice, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="manufacturer">Producent:</label>
                        <input
                            type="text"
                            id="manufacturer"
                            value={editDevice.manufacturer}
                            onChange={(e) => setEditDevice({ ...editDevice, manufacturer: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="model">Model:</label>
                        <input
                            type="text"
                            id="model"
                            value={editDevice.model}
                            onChange={(e) => setEditDevice({ ...editDevice, model: e.target.value })}
                        />
                    </div>
                    <button type="submit">Zapisz zmiany</button>
                </form>
            )}
            <div className="header-container">
                <h2>Lista Urządzeń</h2>

                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
                    {showAddForm ? "Ukryj" : <FontAwesomeIcon icon={faSquarePlus}  alt="Dodaj" />}
                </button>
            </div>
            <table className="table-container">
                <thead>
                <tr>
                    <th onClick={() => sortData('type')}>Typ</th>
                    <th onClick={() => sortData('manufacturer')}>Producent</th>
                    <th onClick={() => sortData('model')}>Model</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {currentDevices.map(device => (
                    <tr key={device.deviceID}>
                        <td>{device.type}</td>
                        <td>{device.manufacturer}</td>
                        <td>{device.model}</td>
                        <td>
                            <button onClick={() => handleEditButtonClick(device.deviceID)}>
                                {editDeviceId === device.deviceID && showEditForm ? "Ukryj" : "Modyfikuj"}
                            </button>
                            <button onClick={() => deleteDevice(device.deviceID)}>
                                <FontAwesomeIcon icon={faTrashCan} alt="Usuń" />
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

export default DeviceForm;
