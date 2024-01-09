import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditReportForm = () => {
    const [report, setReport] = useState({
        clientDescription: '',
        status: '',
        customerName: '', // Nazwa klienta
        customerId: ''
    });
    const { reportId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReportAndCustomer = async () => {
            try {
                const reportResponse = await axios.get(`http://localhost:8080/api/reports/${reportId}`);
                const reportData = reportResponse.data;
                setReport({
                    ...reportData,
                    customerId: reportData.customerId // Ustawienie ID klienta
                });

                if (reportData.customerId) {
                    const customerResponse = await axios.get(`http://localhost:8080/api/customers/${reportData.customerId}`);
                    setReport(prevState => ({
                        ...prevState,
                        customerName: `${customerResponse.data.firstName} ${customerResponse.data.lastName}` // Ustawienie nazwy klienta
                    }));
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych:', error);
            }
        };

        fetchReportAndCustomer();
    }, [reportId]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReport({ ...report, [name]: value });
    };

    const handleCancel = async () => {
        // Logika anulowania zgłoszenia (np. usunięcie zgłoszenia)
        try {
            await axios.delete(`http://localhost:8080/api/reports/delete/${reportId}`);
            navigate('/'); // Powrót do strony głównej
        } catch (error) {
            console.error('Błąd podczas anulowania zgłoszenia:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Logika aktualizacji zgłoszenia
        try {
            await axios.put(`http://localhost:8080/api/reports/modify/${reportId}`, report);
            navigate(`/new-repair?reportId=${reportId}`); // Przejście do tworzenia naprawy
        } catch (error) {
            console.error('Błąd podczas aktualizacji zgłoszenia:', error);
        }
    };

    if (!report) return <div>Ładowanie...</div>;

    return (
        <div>
            <h2>Edycja zgłoszenia</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Klient:</label>
                    <p>{report.customerName}</p>
                </div>
                <div>
                    <label>Opis klienta:</label>
                    <textarea
                        name="clientDescription"
                        value={report.clientDescription}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Status:</label>
                    <select
                        name="status"
                        value={report.status}
                        onChange={handleInputChange}
                    >
                        <option value="Nowy">Nowy</option>
                        <option value="W trakcie">W trakcie</option>
                        <option value="Zakończony">Zakończony</option>
                        {/* Dodaj więcej opcji statusu zgodnie z potrzebami */}
                    </select>
                </div>
                <button type="submit">Przejdź do naprawy</button>
                <button type="button" onClick={handleCancel}>Anuluj</button>
            </form>
        </div>
    );
};

export default EditReportForm;
