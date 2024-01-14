import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './form.css';
import { faUserPlus, faUserMinus,faUserPen} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useNavigate } from 'react-router-dom';

const RepairForm = ({ user }) => { // Przekazanie 'user' jako prop
    const { repairId } = useParams();
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [repair, setRepair] = useState({
        status: 'Nowy',
        startDate: new Date(),
        customerDescription: '',
        technicianDescription: '',
        price: 0,
        customerId: null,
        userId: user.data.userID, // Ustawienie ID użytkownika na podstawie danych logowania
        deviceId: '', // ID wybranego urządzenia
        endDate: null
    });
    const [readOnly, setReadOnly] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const deviceResponse = await axios.get('http://localhost:8080/api/devices');
                const customerResponse = await axios.get('http://localhost:8080/api/customers');
                setDevices(deviceResponse.data);
                setCustomers(customerResponse.data);
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
            }
        };

        fetchData();

        if (repairId) {
            axios.get(`http://localhost:8080/api/repairs/${repairId}`)
                .then(response => {
                    setRepair(response.data);
                    setReadOnly(response.data.status === 'Zakończony');
                })
                .catch(error => console.error('Błąd podczas pobierania naprawy:', error));
        }
    }, [repairId, user.data.userID]); // Dodanie 'user.data.userID' do listy zależności


    const handleChange = (e) => {
        setRepair({ ...repair, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (repair.status === 'Zakończony' && !repair.endDate) {
            alert('Proszę ustawić datę zakończenia naprawy.');
            return;
        }
        const endpoint = repairId ? `/modify/${repairId}` : '/add';
        axios.post(`http://localhost:8080/api/repairs${endpoint}`, repair)
            .then(response => {
                if (!repairId) {
                    const newRepairId = response.data.repairID; // Pobranie ID z odpowiedzi
                    if (newRepairId) {
                        navigate(`/edit-repair/${newRepairId}`);
                    } else {
                        console.error('Nie otrzymano ID nowej naprawy');
                    }
                }
            })
            .catch(error => console.error('Błąd podczas zapisywania naprawy:', error));
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
            <h2>{repairId ? 'Edycja Naprawy' : 'Nowa Naprawa'}</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Klient:
                    <select name="customerId" value={repair.customerId} onChange={handleChange} disabled={readOnly}>
                        <option value="">Wybierz klienta</option>
                        {customers.map(customer => (
                            <option key={customer.customerID} value={customer.customerID}>
                                {customer.firstName} {customer.lastName}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Opis Klienta:
                    <textarea name="customerDescription" value={repair.customerDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </label>
                <label>
                    Urządzenie:
                    <select name="deviceId" value={repair.deviceId} onChange={handleChange} disabled={readOnly}>
                        <option value="">Wybierz urządzenie</option>
                        {devices.map(device => (
                            <option key={device.deviceID} value={device.deviceID}>
                                {device.type} ({device.model})
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Opis Technika:
                    <textarea name="technicianDescription" value={repair.technicianDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                </label>
                <label>
                    Cena:
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
                {repair.status === 'Zakończony' && (
                    <label>
                        Data Zakończenia:
                        <input type="date" name="endDate" value={repair.endDate} onChange={handleChange} />
                    </label>
                )}
                <button type="submit">Zapisz</button>
                {readOnly && <button type="button" onClick={handleGenerateProtocol}>Generuj Protokół</button>}
            </form>
        </div>
    );
};

export default RepairForm;
