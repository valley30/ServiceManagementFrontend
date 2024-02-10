import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUserPlus, faUserMinus,faUserPen} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useParams, useNavigate } from 'react-router-dom';

const EditReportForm = () => {
    const [report, setReport] = useState({
        clientDescription: '',
        status: '',
        customerName: '',
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

        try {
            await axios.delete(`http://localhost:8080/api/reports/delete/${reportId}`);
            navigate('/');
        } catch (error) {
            console.error('Błąd podczas anulowania zgłoszenia:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedReport = {
                ...report,
                status: 'W naprawie'
            };
            await axios.put(`http://localhost:8080/api/reports/modify/${reportId}`, updatedReport);
            navigate(`/new-repair?reportId=${reportId}`); // Przekazanie reportId do RepairForm
        } catch (error) {
            console.error('Błąd podczas aktualizacji zgłoszenia:', error);
        }
    };

    if (!report) return <div className="loading">Ładowanie...</div>;

    return (
        <div className="form-container">
            <h2 className="form-title">Edycja zgłoszenia</h2>
            <form onSubmit={handleSubmit} className="edit-report-form">
                <div className="form-group">
                    <label>Klient:</label>
                    <p className="customer-name">{report.customerName}</p>
                </div>
                <div className="form-group">
                    <label>Opis klienta:</label>
                    <textarea
                        name="clientDescription"
                        className="form-control"
                        value={report.clientDescription}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Status:</label>
                    <select
                        name="status"
                        className="form-control"
                        value={report.status}
                        onChange={handleInputChange}
                    >
                        <option value="Nowy">Nowy</option>
                        <option value="W naprawie">W naprawie</option>
                        <option value="Zakończony">Zakończony</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">Przejdź do naprawy</button>
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Anuluj</button>
                </div>
            </form>
        </div>
    );
};

export default EditReportForm;