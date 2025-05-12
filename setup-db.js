// setup-db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('contacts.db');

db.serialize(() => {
  // Create contacts table
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  // Create phones table
  db.run(`CREATE TABLE IF NOT EXISTS phones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    phone TEXT NOT NULL,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
  )`);

  // Create emails table
  db.run(`CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    FOREIGN KEY(contact_id) REFERENCES contacts(id)
  )`);

  console.log("Database initialized with contacts + phones + emails tables.");
});

db.close();
