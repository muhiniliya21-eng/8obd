const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// 1. ПІДКЛЮЧЕННЯ ДО БАЗИ
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2105', 
    database: 'bank_system'
});

db.connect(err => {
    if (err) {
        console.error('Помилка підключення:', err.message);
    } else {
        console.log('Успіх! Сервер підключено до бази bank_system');
    }
});

// --- РОБОТА З ВАЛЮТАМИ (CURRENCIES) ---

app.get('/currencies', (req, res) => {
    db.query('SELECT * FROM currencies', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/currencies', (req, res) => {
    const { currency_code, currency_name } = req.body;
    const sql = 'INSERT INTO currencies (currency_code, currency_name) VALUES (?, ?)';
    db.query(sql, [currency_code, currency_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Валюту успішно додано!', id: result.insertId });
    });
});

app.put('/currencies/:id', (req, res) => {
    const { currency_name } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE currencies SET currency_name = ? WHERE currency_id = ?';
    db.query(sql, [currency_name, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Валюту оновлено' });
    });
});

app.delete('/currencies/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM currencies WHERE currency_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Валюту видалено' });
    });
});

// --- РОБОТА З КЛІЄНТАМИ (CLIENTS) ---

app.get('/clients', (req, res) => {
    db.query('SELECT * FROM clients', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/clients', (req, res) => {
    const { first_name, last_name, email } = req.body;
    const sql = 'INSERT INTO clients (first_name, last_name, email) VALUES (?, ?, ?)';
    db.query(sql, [first_name, last_name, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Клієнта додано', id: result.insertId });
    });
});

app.put('/clients/:id', (req, res) => {
    const { email } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE clients SET email = ? WHERE client_id = ?';
    db.query(sql, [email, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Email клієнта оновлено' });
    });
});

// --- РОБОТА З РАХУНКАМИ (ACCOUNTS) ---

app.get('/accounts', (req, res) => {
    const sql = `
        SELECT a.*, c.last_name, cur.currency_code 
        FROM accounts a
        JOIN clients c ON a.client_id = c.client_id
        JOIN currencies cur ON a.currency_id = cur.currency_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/accounts', (req, res) => {
    const { account_number, client_id, currency_id, balance } = req.body;
    const sql = 'INSERT INTO accounts (account_number, client_id, currency_id, balance) VALUES (?, ?, ?, ?)';
    db.query(sql, [account_number, client_id, currency_id, balance], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Рахунок створено', id: result.insertId });
    });
});

app.put('/accounts/:id', (req, res) => {
    const { balance } = req.body;
    const { id } = req.params;
    db.query('UPDATE accounts SET balance = ? WHERE account_id = ?', [balance, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Баланс рахунку оновлено' });
    });
});

// --- РОБОТА З ПОЗИКАМИ (LOANS) ---

app.get('/loans', (req, res) => {
    db.query('SELECT * FROM loans', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/loans', (req, res) => {
    const { account_id, amount, interest_rate } = req.body;
    const sql = 'INSERT INTO loans (account_id, amount, interest_rate) VALUES (?, ?, ?)';
    db.query(sql, [account_id, amount, interest_rate], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Позику оформлено', id: result.insertId });
    });
});

// --- РОБОТА З ТРАНЗАКЦІЯМИ (TRANSACTIONS) ---

app.get('/transactions', (req, res) => {
    db.query('SELECT * FROM transactions', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/transactions', (req, res) => {
    const { transaction_type, amount } = req.body;
    const sql = 'INSERT INTO transactions (transaction_type, amount) VALUES (?, ?)';
    db.query(sql, [transaction_type, amount], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Транзакцію зареєстровано', id: result.insertId });
    });
});

// ЗАПУСК СЕРВЕРА
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на: http://localhost:${PORT}`);
});
// test