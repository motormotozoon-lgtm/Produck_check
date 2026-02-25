const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 3000;

// Serwowanie plików statycznych (czyli naszego pliku HTML) z bieżącego folderu
app.use(express.static(__dirname));

// Konfiguracja połączenia z bazą danych (uzupełnij swoje dane!)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'produkt_check' // <--- ZMIEŃ TO
};

// Endpoint API, który zwraca produkty w formacie JSON
app.get('/api/products', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Pobieramy pierwsze 500 produktów (aby strona się nie zawiesiła przy tysiącach rekordów)
        const [rows] = await connection.execute('SELECT * FROM products'); 
        await connection.end();
        
        res.json(rows);
    } catch (error) {
        console.error('Błąd pobierania danych z bazy:', error);
        res.status(500).send('Wystąpił błąd serwera');
    }
});

app.listen(PORT, () => {
    console.log(`Serwer działa! Otwórz przeglądarkę i wejdź na: http://localhost:${PORT}/index.html`);
});