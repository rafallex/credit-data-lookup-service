const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "cache.db");

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS credit_data (
        ssn TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        address TEXT NOT NULL,
        assessed_income INTEGER NOT NULL,
        balance_of_debt INTEGER NOT NULL,
        complaints INTEGER NOT NULL,
        cached_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
  return db;
}

function getCachedCreditData(ssn) {
  const row = getDb().prepare("SELECT * FROM credit_data WHERE ssn = ?").get(ssn);
  if (!row) return null;
  return {
    first_name: row.first_name,
    last_name: row.last_name,
    address: row.address,
    assessed_income: row.assessed_income,
    balance_of_debt: row.balance_of_debt,
    complaints: row.complaints === 1,
  };
}

function cacheCreditData(ssn, data) {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO credit_data
       (ssn, first_name, last_name, address, assessed_income, balance_of_debt, complaints)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      ssn,
      data.first_name,
      data.last_name,
      data.address,
      data.assessed_income,
      data.balance_of_debt,
      data.complaints ? 1 : 0
    );
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getCachedCreditData, cacheCreditData, closeDb, getDb };
