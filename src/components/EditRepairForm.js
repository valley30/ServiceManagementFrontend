import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';

const EditRepairForm = () => {
    const { repairId } = useParams();
    const navigate = useNavigate();
    const [repair, setRepair] = useState({
        status: '',
        startDate: new Date(),
        endDate: null,
        customerDescription: '',
        technicianDescription: '',
        price: 0,
        parts: [],
        device: '',
        customerName: '',
    });
    const [customers, setCustomers] = useState([]); // Lista klientów z API
    const [devices, setDevices] = useState([]); // Lista urządzeń z API
    const [parts, setParts] = useState([]); // Lista części z API


    const [devicesList, setDevicesList] = useState([]);
    const [partsList, setPartsList] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]); // Wybrane części
    const [readOnly, setReadOnly] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // Kontroluje widoczność datepicker

    const [newPart, setNewPart] = useState(''); // Nowa część do dodania

    useEffect(() => {
        if (repairId) {
            // Pobierz dane naprawy
            axios.get(`http://localhost:8080/api/repairs/${repairId}`)
                .then(response => {
                    const fetchedRepair = response.data;
                    // Konwersja ciągów znaków na obiekty Date
                    fetchedRepair.startDate = new Date(fetchedRepair.startDate);
                    if (fetchedRepair.endDate) {
                        fetchedRepair.endDate = new Date(fetchedRepair.endDate);
                    }
                    setRepair(fetchedRepair);
                    setReadOnly(fetchedRepair.status === 'Zakończony');
                })
                .catch(error => console.error('Błąd podczas pobierania naprawy:', error));
        }
        axios.get('http://localhost:8080/api/devices')
            .then(response => {
                setDevicesList(response.data);
            })
            .catch(error => console.error('Błąd podczas pobierania urządzeń:', error));

        // Pobierz dostępne części
        axios.get('http://localhost:8080/api/parts')
            .then(response => {
                setPartsList(response.data);
            })
            .catch(error => console.error('Błąd podczas pobierania części:', error));
    }, [repairId]);

    const handleChange = (e) => {
        setRepair({ ...repair, [e.target.name]: e.target.value });
    };


    const handleEndDateChange = (date) => {
        if (repair.status === 'Zakończony') {
            setRepair({ ...repair, endDate: date });
        }
        setIsDatePickerOpen(false); // Ukryj datepicker po wyborze daty
    };
    const toggleDatePicker = () => {
        setIsDatePickerOpen(!isDatePickerOpen);
    };


    const handlePartSelect = (partId) => {
        // Dodaj wybraną część do listy wybranych części
        setSelectedParts([...selectedParts, partId]);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (repair.status === 'Zakończony' && !repair.endDate) {
            alert('Proszę ustawić datę zakończenia naprawy.');
            return;
        }
        axios.put(`http://localhost:8080/api/repairs/modify/${repairId}`, repair)
            .then(() => navigate(`/repairs`))
            .catch(error => console.error('Błąd podczas aktualizacji naprawy:', error));
    };
    const handlePartChange = (e) => {
        setNewPart(e.target.value);
    };
    // Funkcja wywoływana po kliknięciu ikony kalendarza

    const refreshRepairDetails = () => {
        axios.get(`http://localhost:8080/api/repairs/${repairId}`)
            .then(response => {
                const fetchedRepair = response.data;
                fetchedRepair.startDate = new Date(fetchedRepair.startDate);
                if (fetchedRepair.endDate) {
                    fetchedRepair.endDate = new Date(fetchedRepair.endDate);
                }
                setRepair(fetchedRepair);
            })
            .catch(error => {
                console.error('Error fetching repair details:', error);
            });
    };

// Funkcja do obsługi zmiany daty

    const addPartToRepair = (partId) => {
        axios.post(`http://localhost:8080/api/repairs/${repairId}/add-part`, { partId })
            .then(response => {
                console.log('Part added successfully', response);
                refreshRepairDetails();
            })
            .catch(error => {
                console.error('Error adding part to repair:', error);
            });
    };

    const removePartFromRepair = (repairPartId) => {
        axios.delete(`http://localhost:8080/api/repairs/${repairId}/remove-part/${repairPartId}`)
            .then(response => {
                console.log('Part removed successfully', response);
                refreshRepairDetails();
            })
            .catch(error => {
                console.error('Error removing part from repair:', error);
            });
    };

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
    return (
        <div>
            <h2>Naprawa Nr {repairId}</h2>
            <form onSubmit={handleSubmit}>
                <p>Data Rozpoczęcia: {repair.startDate && repair.startDate.toLocaleDateString()}</p>
                <label>
                    Opis Klienta:
                    <textarea name="customerDescription" value={repair.customerDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </label>
                <label>
                    Opis Technika:
                    <textarea name="technicianDescription" value={repair.technicianDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </label>
                <label>
                    Kwota Naprawy:
                    <input type="number" name="price" value={repair.price} onChange={handleChange} readOnly={readOnly} />
                </label>
                <label>
                    Status:
                    <select name="status" value={repair.status} onChange={handleChange} disabled={readOnly}>
                        <option value="Nowy">Nowy</option>
                        <option value="W trakcie">W trakcie</option>
                        <option value="Zakończony">Zakończony</option>
                    </select>
                </label>
                <label>
                    Urządzenie:
                    <select name="deviceId" value={repair.deviceId} onChange={handleChange} disabled={readOnly}>
                        {devicesList.map(device => (
                            <option key={device.id} value={device.id}>
                                {device.type}  {device.model}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Wybierz część:
                    <select onChange={(e) => handlePartSelect(e.target.value)} disabled={readOnly}>
                        {partsList.map(part => (
                            <option key={part.id} value={part.id}>{part.name}</option>
                        ))}
                    </select>
                </label>

                {repair.status === 'Zakończony' && (
                    <label>
                        Data Zakończenia:
                        <DatePicker
                            selected={repair.endDate}
                            onChange={handleEndDateChange}
                            showTimeSelect
                            dateFormat="Pp"
                            timeIntervals={30}
                            inline={false} // make sure to set this to false to avoid inline display
                            popperPlacement="bottom-end" // you can define popper placement
                            popperModifiers={{
                                offset: {
                                    enabled: true,
                                    offset: "5px, 10px" // you can adjust the offset here
                                },
                                preventOverflow: {
                                    enabled: true,
                                    escapeWithReference: false,
                                    boundariesElement: "viewport"
                                }
                            }}
                        />
                    </label>
                )}
                <button type="submit" disabled={readOnly}>Zapisz zmiany</button>
                {readOnly && <button type="button" onClick={handleGenerateProtocol}>Generuj Protokół</button>}
            </form>
        </div>
    );
};

export default EditRepairForm;
