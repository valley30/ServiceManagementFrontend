import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faFilter } from '@fortawesome/free-solid-svg-icons';
import './repairs.css';

const Repairs = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [repairsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const [repairs, setRepairs] = useState([]);
    const [displayedColumns, setDisplayedColumns] = useState({
        repairId: true,
        status: true,
        startDate: true,
        endDate: true,
        price: true,
        userId: true,
        customerId: true
    });
    const columnDisplayNames = {
        repairId: 'Numer naprawy',
        status: 'Status',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        price: 'Kwota',
        userId: 'Technik',
        customerId: 'Klient'

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
            return 'Unknown Technician';
        }
    };



    useEffect(() => {
        const fetchRepairs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/repairs');
                const repairsWithNames = await Promise.all(response.data.map(async (repair) => {
                    const customerName = await fetchCustomerName(repair.customerId);
                    const technicianName = await fetchTechnicianName(repair.userId);
                    return { ...repair, customerName, technicianName };
                }));
                setRepairs(repairsWithNames);
            } catch (error) {
                console.error('Error fetching repairs:', error);
            }
        };
        fetchRepairs();
    }, []);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            const filteredRepairs = repairs.filter(repair =>
                Object.values(repair).some(value =>
                    value !== null && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setRepairs(filteredRepairs);
        } else {
            const fetchRepairs = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/repairs');
                    const repairsWithNames = await Promise.all(response.data.map(async (repair) => {
                        const customerName = await fetchCustomerName(repair.customerId);
                        const technicianName = await fetchTechnicianName(repair.userId);
                        return { ...repair, customerName, technicianName };
                    }));
                    setRepairs(repairsWithNames);
                } catch (error) {
                    console.error('Error fetching repairs:', error);
                }
            };
            fetchRepairs();
        }
    }, [searchTerm]);


    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedRepairs = [...repairs].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setRepairs(sortedRepairs);
    };


    const toggleColumnDisplay = (column) => {
        setDisplayedColumns(prevState => ({ ...prevState, [column]: !prevState[column] }));
    };


    const handleFilterChange = (e, filterKey) => {
        setFilters({ ...filters, [filterKey]: e.target.value });
    };


    useEffect(() => {

    }, [filters]);
    const formatDate = (dateString) => {
        if (!dateString) return '';

        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', options);
    };
    const indexOfLastRepair = currentPage * repairsPerPage;
    const indexOfFirstRepair = indexOfLastRepair - repairsPerPage;
    const currentRepairs = repairs.slice(indexOfFirstRepair, indexOfLastRepair);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(repairs.length / repairsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="repairs-container">
            <h2>Lista Napraw</h2>


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
            <table className="repairs-table">
                <thead>
                <tr>

                    {displayedColumns.repairId &&  <th onClick={() => sortData('repairID')}>Numer Naprawy</th>}
                    {displayedColumns.status && <th onClick={() => sortData('status')}>Status</th>}
                    {displayedColumns.startDate && <th onClick={() => sortData('startDate')}>Data rozpoczęcia</th>}
                    {displayedColumns.endDate && <th onClick={() => sortData('endDate')}>Data zakończenia</th>}
                    {displayedColumns.price && <th onClick={() => sortData('price')}>Kwota</th>}
                    {displayedColumns.userId && <th onClick={() => sortData('technicianName')}>Technik</th>}
                    {displayedColumns.customerId && <th onClick={() => sortData('customerName')}>Klient</th>}
                </tr>
                </thead>
                <tbody>

                {currentRepairs.map(repair => (
                    <tr key={repair.repairID}>
                        {displayedColumns.repairId && <td><Link to={`/edit-repair/${repair.repairID}`}>{repair.repairID}</Link></td>}
                        {displayedColumns.status && <td>{repair.status}</td>}
                        {displayedColumns.startDate && <td>{formatDate(repair.startDate)}</td>}
                        {displayedColumns.endDate && <td>{formatDate(repair.endDate)}</td>}
                        {displayedColumns.price && <td>{repair.price}</td>}
                        {displayedColumns.userId && <td>{repair.technicianName}</td>}
                        {displayedColumns.customerId && <td>{repair.customerName}</td>}

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

export default Repairs;
