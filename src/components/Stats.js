import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import moment from 'moment';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import './stats.css';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Stats = () => {
    const days = [ 'Nd','Po', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb']
    const months = ['Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdiernik', 'Listopad', 'Grudzien']
    const locale = {
        localize: {
            day: n => days[n],
            month: n => months[n]
        },
        formatLong: {
            date: () => 'mm/dd/yyyy'
        }
    }
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        setLoading(true);
        const fetchRepairs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/repairs');
                const filteredRepairs = response.data.filter(repair => {
                    const repairEndDate = new Date(repair.endDate);
                    return repairEndDate >= startDate && repairEndDate <= endDate;
                });
                const repairsWithFullData = await Promise.all(filteredRepairs.map(async (repair) => {
                    const customerResponse = await axios.get(`http://localhost:8080/api/customers/${repair.customerId}`);
                    const userResponse = await axios.get(`http://localhost:8080/api/users/${repair.userId}`);
                    return {
                        ...repair,
                        customerName: `${customerResponse.data.firstName} ${customerResponse.data.lastName}`,
                        technicianName: userResponse.data.username
                    };
                }));
                setRepairs(repairsWithFullData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRepairs();
    }, [startDate, endDate]); // Dodaj startDate i endDate do listy zależności


    const processData = () => {
        const completedRepairs = repairs.filter(repair => repair.status === 'Zakończony');
        const repairsByCustomer = {};
        const repairsByTechnician = {};
        const repairDurationsByTechnician = {};

        completedRepairs.forEach(repair => {
            // Count repairs by customer
            repairsByCustomer[repair.customerName] = (repairsByCustomer[repair.customerName] || 0) + 1;

            // Count repairs by technician
            repairsByTechnician[repair.technicianName] = (repairsByTechnician[repair.technicianName] || 0) + 1;

            // Calculate repair durations
            if (repair.startDate && repair.endDate) {
                const duration = moment(repair.endDate).diff(moment(repair.startDate), 'hours');
                repairDurationsByTechnician[repair.technicianName] = repairDurationsByTechnician[repair.technicianName] || [];
                repairDurationsByTechnician[repair.technicianName].push(duration);
            }
        });

        const averageRepairDurationsByTechnician = {};
        Object.keys(repairDurationsByTechnician).forEach(tech => {
            averageRepairDurationsByTechnician[tech] = repairDurationsByTechnician[tech].reduce((a, b) => a + b, 0) / repairDurationsByTechnician[tech].length;
        });

        return { repairsByCustomer, repairsByTechnician, averageRepairDurationsByTechnician };
    };

    const { repairsByCustomer, repairsByTechnician, averageRepairDurationsByTechnician } = processData();

    const customerChartData = {
        labels: Object.keys(repairsByCustomer),
        datasets: [{
            label: 'Liczba napraw na klienta',
            data: Object.values(repairsByCustomer),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const technicianChartData = {
        labels: Object.keys(repairsByTechnician),
        datasets: [{
            label: 'Liczba napraw na technika',
            data: Object.values(repairsByTechnician),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };
    const averageDurationChartData = {
        labels: Object.keys(averageRepairDurationsByTechnician),
        datasets: [{
            label: 'Średni czas naprawy (w godzinach)',
            data: Object.values(averageRepairDurationsByTechnician),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }]
    };

    if (loading) {
        return <div>Ładowanie danych...</div>;
    }

    return (
        <div className="stats-container">
            <h2>Statystyki</h2>
            <div>
                <label>Wybierz zakres dat :</label>
                <DatePicker
                    locale={locale}
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    calendarStartDay={1}
                />
                <DatePicker
                    locale={locale}
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    calendarStartDay={1}

                />
            </div>
            <div className="chart-container">
                <Bar data={customerChartData} options={{ responsive: true }} />
                <Bar data={technicianChartData} options={{ responsive: true }} />
                <Bar data={averageDurationChartData} options={{ responsive: true }} />
            </div>
            {/* Tutaj możesz dodać inne komponenty raportów lub tabel, jeśli są potrzebne */}
        </div>
    );
};

export default Stats;