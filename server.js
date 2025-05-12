const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect DB
const db = new sqlite3.Database('contacts.db');

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS phones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    phone TEXT,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    email TEXT,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
  )`);
});

// POST /submit → Save new contact
app.post('/submit', (req, res) => {
  const { name, phones, emails } = req.body;

  if (!name || phones.length === 0 || emails.length === 0) {
    return res.status(400).send('Missing fields');
  }

  db.run(`INSERT INTO contacts (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).send('Failed to save contact');

    const contactId = this.lastID;

    const insertPhone = db.prepare(`INSERT INTO phones (contact_id, phone) VALUES (?, ?)`);
    phones.forEach(phone => insertPhone.run(contactId, phone));
    insertPhone.finalize();

    const insertEmail = db.prepare(`INSERT INTO emails (contact_id, email) VALUES (?, ?)`);
    emails.forEach(email => insertEmail.run(contactId, email));
    insertEmail.finalize();

    res.status(200).send('Contact saved successfully');
  });
});

// ✅ PUT /update/:id → Update contact
app.put('/update/:id', (req, res) => {
  const contactId = req.params.id;
  const { name, phones, emails } = req.body;

  if (!name || !phones || !emails) {
    return res.status(400).send('Missing fields');
  }

  db.run(`UPDATE contacts SET name = ? WHERE id = ?`, [name, contactId], function (err) {
    if (err) return res.status(500).send('Failed to update contact');

    db.run(`DELETE FROM phones WHERE contact_id = ?`, [contactId]);
    db.run(`DELETE FROM emails WHERE contact_id = ?`, [contactId]);

    const insertPhone = db.prepare(`INSERT INTO phones (contact_id, phone) VALUES (?, ?)`);
    phones.forEach(phone => insertPhone.run(contactId, phone));
    insertPhone.finalize();

    const insertEmail = db.prepare(`INSERT INTO emails (contact_id, email) VALUES (?, ?)`);
    emails.forEach(email => insertEmail.run(contactId, email));
    insertEmail.finalize();

    res.status(200).send('Contact updated successfully');
  });
});

// GET /api/contacts → Return contacts + phones + emails
app.get('/api/contacts', (req, res) => {
  const sql = `
    SELECT c.id, c.name,
           GROUP_CONCAT(DISTINCT p.phone) AS phones,
           GROUP_CONCAT(DISTINCT e.email) AS emails
    FROM contacts c
    LEFT JOIN phones p ON c.id = p.contact_id
    LEFT JOIN emails e ON c.id = e.contact_id
    GROUP BY c.id, c.name
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database query failed' });

    const formatted = rows.map(row => ({
      id: row.id,
      name: row.name,
      phones: row.phones ? row.phones.split(',') : [],
      emails: row.emails ? row.emails.split(',') : []
    }));

    res.json(formatted);
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
