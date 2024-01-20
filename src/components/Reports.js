import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Report.css'
const Reports = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [reportsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const [reports, setReports] = useState([]);
    const [displayedColumns, setDisplayedColumns] = useState({
        reportId: true,
        status: true,
        creationDate: true,
        clientDescription: true,
        customerId: true,
        userId: true
    });

    const columnDisplayNames = {
        reportId: 'ID Zgłoszenia',
        status: 'Status',
        creationDate: 'Data utworzenia',
        clientDescription: 'Opis',
        customerId: 'Klient',
        userId: 'Pracownik'

    };


    const [filters, setFilters] = useState({});

    const fetchCustomerName = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/customers/${customerId}`);
            return `${response.data.firstName} ${response.data.lastName}`;
        } catch (error) {
            console.error('Error fetching customer data:', error);
            return 'Unknown Customer';
        }
    };
    const fetchTechnicianName = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
            return `${response.data.username}`;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return 'Online Client';
        }
    };


    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/reports');
                const reportsWithNames = await Promise.all(response.data.map(async (report) => {
                    const customerName = await fetchCustomerName(report.customerId);
                    const technicianName = await fetchTechnicianName(report.userId);
                    return { ...report, customerName, technicianName };
                }));
                setReports(reportsWithNames);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };
        fetchReports();
    }, []);
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/reports');
                let reportsWithNames = await Promise.all(response.data.map(async (report) => {
                    const customerName = await fetchCustomerName(report.customerId);
                    const technicianName = await fetchTechnicianName(report.userId);
                    return { ...report, customerName, technicianName };
                }));

                if (searchTerm.length >= 3) {
                    reportsWithNames = reportsWithNames.filter(report =>
                        Object.values(report).some(value =>
                            value !== null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    );
                }

                setReports(reportsWithNames);
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        };
        fetchReports();
    }, [searchTerm]);

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedReports = [...reports].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setReports(sortedReports);
    };


    const toggleColumnDisplay = (column) => {
        setDisplayedColumns(prevState => ({ ...prevState, [column]: !prevState[column] }));
    };



    const formatDate = (dateString) => {
        if (!dateString) return '';

        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', options);
    };
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(reports.length / reportsPerPage); i++) {
        pageNumbers.push(i);
    }




    const handleFilterChange = (e, filterKey) => {
        setFilters({ ...filters, [filterKey]: e.target.value });
    };

    return (
        <div className="reports-container">
            <h2>Lista Zgłoszeń</h2>

            <div className="column-toggles">
                {Object.keys(displayedColumns).map(column => (
                    <label key={column}>
                        <input
                            type="checkbox"
                            checked={displayedColumns[column]}
                            onChange={() => toggleColumnDisplay(column)}
                        />
                        {columnDisplayNames[column]}
                    </label>
                ))}
            </div>
            <input
                type="text"
                placeholder="Szukaj..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <table className="reports-table">
                <thead>
                <tr>
                    {displayedColumns.reportId && <th onClick={() => sortData('reportID')}>ID Zgłoszenia</th>}
                    {displayedColumns.status && <th onClick={() => sortData('status')}>Status</th>}
                    {displayedColumns.clientDescription && <th onClick={() => sortData('clientDescription')}>Opis</th>}
                    {displayedColumns.customerId && <th onClick={() => sortData('customerName')}>Klient</th>}
                    {displayedColumns.userId && <th onClick={() => sortData('technicianName')}>Pracownik</th>}
                </tr>
                </thead>
                <tbody>

                {currentReports.map(report => (

                    <tr key={report.reportId}>
                        {displayedColumns.reportId && <td><Link to={`/edit-report/${report.reportId}`}>{report.reportId}</Link></td>}
                        {displayedColumns.status && <td>{report.status}</td>}
                        {displayedColumns.clientDescription && <td className="client-description">{report.clientDescription}</td>}
                        {displayedColumns.customerId && <td>{report.customerName}</td>}
                        {displayedColumns.userId && <td>{report.technicianName}</td>}
                    </tr>
                ))}
                </tbody>
            </table>

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

export default Reports;

