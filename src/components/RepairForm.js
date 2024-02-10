import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RepairForm.css';
import { faUserPlus, faUserMinus,faUserPen} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {useParams, useNavigate, useLocation} from 'react-router-dom';

const RepairForm = ({ user }) => {
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
        userId: user.data.userID,
        deviceId: '',
        endDate: null
    });
    const [readOnly, setReadOnly] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const reportIdFromQuery = queryParams.get('reportId');
    useEffect(() => {

        if (reportIdFromQuery) {
            axios.get(`http://localhost:8080/api/reports/${reportIdFromQuery}`)
                .then(response => {
                    const reportData = response.data;
                    setRepair(prevState => ({
                        ...prevState,
                        customerDescription: reportData.clientDescription,
                        customerId: reportData.customerId,
                        reportId: reportData.reportId // Ustawienie reportId w stanie naprawy
                    }));
                })
                .catch(error => console.error('Błąd podczas pobierania zgłoszenia:', error));
        }
    }, [reportIdFromQuery]);
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
    }, [repairId, user.data.userID]);


    const handleChange = (e) => {
        setRepair({ ...repair, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (repair.status === 'Zakończony' && !repair.endDate) {
            alert('Proszę ustawić datę zakończenia naprawy.');
            return;
        }

        // Przygotowanie obiektu naprawy do wysłania wraz z reportId
        const repairToSubmit = {
            ...repair,
            reportId: reportIdFromQuery // Dodanie reportId do obiektu naprawy
        };

        // Wybranie odpowiedniego endpointu w zależności od tego, czy naprawa jest nowa, czy aktualizowana
        const endpoint = repairId ? `modify/${repairId}` : 'add';

        // Wysyłanie żądania do API
        // Uwaga: zmieniono metodę z POST na PUT przy aktualizacji naprawy
        const method = repairId ? 'put' : 'post';
        axios({
            method: method,
            url: `http://localhost:8080/api/repairs/${endpoint}`,
            data: repairToSubmit
        })
            .then(response => {
                if (!repairId) {
                    // Jeśli to nowa naprawa, nawigacja do edycji tej naprawy
                    const newRepairId = response.data.repairID;
                    if (newRepairId) {
                        navigate(`/edit-repair/${newRepairId}`);
                    } else {
                        console.error('Nie otrzymano ID nowej naprawy');
                    }
                } else {
                    // Jeśli była to aktualizacja, pozostanie na obecnej stronie lub wykonanie innego działania
                    // Możesz również dodać tu nawigację do innego widoku, jeśli jest to wymagane
                    navigate('/'); // Przykładowy redirect
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
        <div className="repair-form-container">
            <h2>{repairId ? 'Edycja Naprawy' : 'Nowa Naprawa'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="repair-form-header">
                    <div className="form-group">
                        <label>
                            Status:
                            <select name="status" value={repair.status} onChange={handleChange} disabled={readOnly}>
                                <option value="Nowy">Nowy</option>
                                <option value="W trakcie">W trakcie</option>
                                <option value="Zakończony">Zakończony</option>
                            </select>
                        </label>
                    </div>
                    <button type="submit">Zapisz</button>
                </div>
                <div className="repair-form-body">
                    <div className="form-group">
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
                </div>
                <div className="form-group">
                    <label>
                        Opis Technika:
                        <textarea name="technicianDescription" value={repair.technicianDescription} onChange={handleChange} readOnly={readOnly}></textarea>
                    </label>
                    <label>
                        Cena:
                        <input type="number" name="price" value={repair.price} onChange={handleChange} readOnly={readOnly} />
                    </label>
                    {repair.status === 'Zakończony' && (
                        <label>
                            Data Zakończenia:
                            <input type="date" name="endDate" value={repair.endDate} onChange={handleChange} />
                        </label>
                    )}
                </div>
                {readOnly && <button type="button" onClick={handleGenerateProtocol}>Generuj Protokół</button>}
                </div>
            </form>
        </div>


    );
};

export default RepairForm;
