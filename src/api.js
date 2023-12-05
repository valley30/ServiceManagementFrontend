import axios from 'axios';

// Adres URL Twojego endpointu logowania
const LOGIN_API_URL = 'http://localhost:8080/api/auth/login';

// Funkcja do logowania użytkownika
export const loginUser = async (username, password) => {
    console.log("Wysyłanie danych logowania:", { username, password });

    try {
        // Wysyłanie żądania POST z danymi logowania
        const response = await axios.post(LOGIN_API_URL, JSON.stringify({ username, password }), {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Odpowiedź z serwera:', response.data);
        return response.data; // Zwraca odpowiedź z serwera (powinna zawierać token JWT)
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        throw error;
    }
};
