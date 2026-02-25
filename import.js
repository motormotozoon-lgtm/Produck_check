const mysql = require('mysql2/promise');
const fs = require('fs');

async function importData() {
    try {
        // 1. Konfiguracja połączenia z bazą danych
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',      
            password: '',      
            database: 'produkt_check'
        });

        console.log('Połączono z bazą danych.');

        // 2. Wczytanie pliku JSON
        const rawData = fs.readFileSync('products.json');
        const products = JSON.parse(rawData);

        // 3. Przygotowanie danych
        const values = products.map(p => [
            p.product_id,
            p.product_code,
            p.product_name,
            p.supplier_code,
            p.supplier_id,
            p.net_price,
            p.gross_price,
            Array.isArray(p.ean_codes) ? p.ean_codes.join(',') : (p.ean_codes || '')
        ]);

        const sql = `INSERT INTO products 
                    (product_id, product_code, product_name, supplier_code, supplier_id, net_price, gross_price, ean_codes) 
                    VALUES ?`;

        // 4. Chunkowanie - podział na mniejsze paczki
        const chunkSize = 1000; // Wysyłamy po 1000 rekordów na raz
        let totalInserted = 0;

        console.log(`Rozpoczynam import ${values.length} rekordów...`);

        for (let i = 0; i < values.length; i += chunkSize) {
            const chunk = values.slice(i, i + chunkSize);
            
            try {
                const [result] = await connection.query(sql, [chunk]);
                totalInserted += result.affectedRows;
                console.log(`Zaimportowano paczkę: rekordy od ${i + 1} do ${i + chunk.length}`);
            } catch (err) {
                console.error(`Błąd przy paczce od ${i + 1}:`, err.message);
                // Kontynuuj z kolejną paczką pomimo błędu, lub zatrzymaj dodając 'break;'
            }
        }

        console.log(`Sukces! Zakończono import. Łącznie wstawiono rekordów: ${totalInserted}`);
        
        // Zamknięcie połączenia
        await connection.end();

    } catch (err) {
        console.error('Wystąpił błąd krytyczny:', err);
    }
}

// Uruchomienie funkcji
importData();