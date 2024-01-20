import axios from 'axios';


const LOGIN_API_URL = 'http://localhost:8080/api/auth/login';


export const loginUser = async (username, password) => {
    console.log("Wysyłanie danych logowania:", { username, password });

    try {

        const response = await axios.post(LOGIN_API_URL, JSON.stringify({ username, password }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Odpowiedź z serwera:', response.data);
        return response.data;
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        throw error;
    }
};
