import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/login';

export const loginUser = async (username, password) => {
    console.log("Wysyłanie danych logowania:", { username, password });
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
        const response = await axios.post(API_URL, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        console.log('odpowiedz z serwera:', response.data);
        return response.data;
    } catch (error) {
        console.error('blad podczas logowania:', error);
        throw error;
    }
};
