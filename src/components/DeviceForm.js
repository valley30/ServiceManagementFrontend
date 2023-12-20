import React, { useState } from 'react';
import axios from 'axios';

const DeviceForm = () => {
    const [type, setType] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/devices', { type, manufacturer, model });
            console.log(response.data);
            // Tutaj możesz dodać logikę po pomyślnym dodaniu urządzenia (np. wyświetlenie komunikatu, wyczyszczenie formularza)
        } catch (error) {
            console.error('Błąd podczas dodawania urządzenia:', error);
            // Tutaj możesz obsłużyć błędy (np. wyświetlić komunikat o błędzie)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="type">Typ:</label>
                <input
                    type="text"
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="manufacturer">Producent:</label>
                <input
                    type="text"
                    id="manufacturer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="model">Model:</label>
                <input
                    type="text"
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                />
            </div>
            <button type="submit">Dodaj urządzenie</button>
        </form>
    );
};

export default DeviceForm;
