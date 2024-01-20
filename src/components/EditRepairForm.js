import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import PartsModal from './PartsModal';
const EditRepairForm = () => {
    const { repairId } = useParams();
    const navigate = useNavigate();

    // State
    const [repair, setRepair] = useState({
        status: '',
        startDate: new Date(),
        endDate: null,
        customerDescription: '',
        technicianDescription: '',
        price: 0,
        parts: [],
        device: '',
        customerId: '',
        customerName: '',
    });
    const [devicesList, setDevicesList] = useState([]);
    const [partsList, setPartsList] = useState([]);
    const [selectedPartsToAdd, setSelectedPartsToAdd] = useState([]);
    const [readOnly, setReadOnly] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);



    const [repairParts, setRepairParts] = useState([]);

    useEffect(() => {
        if (repairId) {
            fetchRepairDetails();
            fetchDevices();
            fetchParts();

        }
    }, [repairId]);
    useEffect(() => {
        if (repair.status === 'Zakończony') {
            setRepair(prevState => ({
                ...prevState,
                endDate: new Date()
            }));
            setReadOnly(true);
        }
    }, [repair.status]);

    const fetchCustomer = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/customers/${customerId}`);
            const customerData = response.data;
            setRepair(prevState => ({
                ...prevState,
                customerName: `${customerData.firstName} ${customerData.lastName}`
            }));
        } catch (error) {
            console.error('Error fetching customer data:', error);
        }
    };


    const fetchRepairDetails = () => {
        axios.get(`http://localhost:8080/api/repairs/${repairId}`)
            .then(response => {
                const fetchedRepair = response.data;
                fetchedRepair.startDate = new Date(fetchedRepair.startDate);
                if (fetchedRepair.endDate) {
                    fetchedRepair.endDate = new Date(fetchedRepair.endDate);
                }
                setRepair(fetchedRepair);
                setReadOnly(fetchedRepair.status === 'Zakończony');

                if (fetchedRepair.customerId) {
                    fetchCustomer(fetchedRepair.customerId);
                }
            })
            .catch(error => console.error('Error fetching repair:', error));
    };


    const fetchDevices = () => {
        axios.get('http://localhost:8080/api/devices')
            .then(response => setDevicesList(response.data))
            .catch(error => console.error('Error fetching devices:', error));
    };
    const fetchRepairParts = () => {
        axios.get(`http://localhost:8080/api/repair-parts/${repairId}`)
            .then(response => setRepairParts(response.data))
            .catch(error => console.error('Error fetching repair parts:', error));
    };


    const fetchParts = () => {
        axios.get('http://localhost:8080/api/parts')
            .then(response => setPartsList(response.data))
            .catch(error => console.error('Error fetching parts:', error));
    };



    const handleChange = (e) => setRepair({ ...repair, [e.target.name]: e.target.value });

    const handleEndDateChange = (date) => {
        if (repair.status === 'Zakończony') {
            setRepair({ ...repair, endDate: date });
        }
        setIsDatePickerOpen(false);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (repair.status === 'Zakończony' && !repair.endDate) {
            alert('Proszę ustawić datę zakończenia naprawy.');
            return;
        }


        try {
            const response = await axios.put(`http://localhost:8080/api/repairs/modify/${repairId}`, repair);
            console.log('Repair updated successfully:', response.data);

        } catch (error) {
            console.error('Error updating repair:', error);
        }

    };
    const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);


    const openPartsModal = () => {
        setIsPartsModalOpen(true);
    };
    const closePartsModal = () => {
        setIsPartsModalOpen(false);
    };

    const addPartToRepair = async (partId) => {
        try {
            console.log("Wysyłanie do backendu:", { repairId, partId }); // Dodaj to, aby zobaczyć, co jest wysyłane
            const response = await axios.post(`http://localhost:8080/api/repair-parts/add`, { repairId, partId });
            console.log("Odpowiedź z backendu:", response); // Dodaj to, aby zobaczyć odpowiedź
            fetchRepairParts(); // Pobierz aktualizowaną listę części
        } catch (error) {
            console.error('Error adding part to repair:', error);
        }
    };

    const totalPartsPrice = repairParts.reduce((sum, repairPart) => sum + repairPart.part.price, 0);



    const handleGenerateProtocol = () => {
        axios.get(`http://localhost:8080/api/repairs/generate-protocol/${repairId}`, { responseType: 'blob' })
            .then(response => {
                const file = new Blob([response.data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);
                const link = document.createElement('a');
                link.href = fileURL;
                link.setAttribute('download', `protokol_naprawy_${repairId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(error => console.error('Błąd podczas generowania protokołu:', error));
    };

    const removePartFromRepair = async (repairPartID) => {
        console.log("usuwanie części z ID:", repairPartID); // Dodaj to, aby zobaczyć, czy ID części jest prawidłowe
        try {
            await axios.delete(`http://localhost:8080/api/repair-parts/delete/${repairPartID}`, {
                params: { repairPartID: repairPartID }

            });
            setRepairParts(currentParts => currentParts.filter(part => part.repairPartID !== repairPartID));
        } catch (error) {
            console.error('Error removing part from repair:', error);
            fetchRepairParts();
        }
    };


    useEffect(() => {
        const fetchRepairParts = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/repair-parts/${repairId}`);
                setRepairParts(response.data);
            } catch (error) {
                console.error('Error fetching repair parts:', error);
            }
        };

        fetchRepairParts();
    }, [repairId]);

    return (
        <div className="container mt-5">
            <h2 className="text-left mb-4">Naprawa Nr {repairId}</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Imię i Nazwisko Klienta:</label>
                        <p className="form-control">{repair.customerName}</p>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Status:</label>
                        <select name="status" value={repair.status} onChange={handleChange} className="form-select" disabled={readOnly}>
                            <option value="Nowy">Nowy</option>
                            <option value="W trakcie">W trakcie</option>
                            <option value="Zakończony">Zakończony</option>
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Opis Klienta:</label>
                    <textarea name="customerDescription" className="form-control" value={repair.customerDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Urządzenie:</label>
                        <select name="deviceId" className="form-select" value={repair.deviceId} onChange={handleChange} disabled={readOnly}>
                            {devicesList.map(device => (
                                <option key={device.deviceID} value={device.deviceID}>{device.type} {device.model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Wybrane części:</label>
                        <div className="selected-parts-list">
                            {repairParts.map(repairPart => (
                                <div key={repairPart.repairPartID}>
                                    {repairPart.part.name} - {repairPart.part.price} PLN
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removePartFromRepair(repairPart.repairPartID, repairPart.part.id)}
                                        disabled={readOnly}
                                    >
                                        Usuń
                                    </button>
                                </div>
                            ))}
                            <p>Suma części: {totalPartsPrice} PLN</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={openPartsModal}
                            disabled={readOnly}
                        >
                            Dodaj części
                        </button>
                        {isPartsModalOpen && (
                            <PartsModal
                                closePartsModal={() => setIsPartsModalOpen(false)}
                                addPartToRepair={addPartToRepair}
                                partsList={partsList}
                            />
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Kwota Naprawy:</label>
                        <input
                            type="number"
                            name="price"
                            className="form-control"
                            value={(repair.price || 0) + totalPartsPrice}
                            onChange={handleChange}
                            readOnly={readOnly}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Opis Technika:</label>
                    <textarea name="technicianDescription" className="form-control" value={repair.technicianDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </div>

                <div className="row">
                    {repair.status === 'Zakończony' && (
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Data Zakończenia:</label>
                            <DatePicker
                                selected={repair.endDate}
                                onChange={handleEndDateChange}
                                className="form-control"
                                showTimeSelect
                                dateFormat="Pp"
                                timeIntervals={30}
                                readOnly={readOnly}
                            />
                        </div>
                    )}
                </div>

                {readOnly && <button type="button" className="btn btn-secondary" onClick={handleGenerateProtocol}>Generuj Protokół</button>}
                <button type="submit" className="btn btn-primary">Zapisz zmiany</button>
            </form>
        </div>
    );

};

export default EditRepairForm;

