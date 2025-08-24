const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'database.db'));

app.use(express.json());
app.use(express.static(__dirname));

// ایجاد جداول در صورت عدم وجود
function initDB() {
    db.run(`CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        desc TEXT,
        amount INTEGER,
        FOREIGN KEY(person_id) REFERENCES persons(id) ON DELETE CASCADE
    )`);
}
initDB();

// API افراد
app.get('/api/persons', (req, res) => {
    db.all('SELECT * FROM persons', (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});
app.post('/api/persons', (req, res) => {
    const {name} = req.body;
    db.run('INSERT INTO persons (name) VALUES (?)', [name], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({id: this.lastID, name});
    });
});
app.delete('/api/persons/:id', (req, res) => {
    db.run('DELETE FROM persons WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true});
    });
});

// API رکوردها
app.get('/api/persons/:id/records', (req, res) => {
    db.all('SELECT * FROM records WHERE person_id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({error: err.message});
        res.json(rows);
    });
});
app.post('/api/persons/:id/records', (req, res) => {
    const {desc, amount} = req.body;
    db.run('INSERT INTO records (person_id, desc, amount) VALUES (?, ?, ?)', [req.params.id, desc, amount], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({id: this.lastID, person_id: req.params.id, desc, amount});
    });
});
app.delete('/api/records/:id', (req, res) => {
    db.run('DELETE FROM records WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true});
    });
});
app.put('/api/records/:id', (req, res) => {
    const {desc, amount} = req.body;
    db.run('UPDATE records SET desc = ?, amount = ? WHERE id = ?', [desc, amount, req.params.id], function(err) {
        if (err) return res.status(500).json({error: err.message});
        res.json({success: true});
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




