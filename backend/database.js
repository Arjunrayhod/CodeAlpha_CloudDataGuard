const db = require("./config/database");


// Main records table
db.exec(`
    CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        data_hash TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'verified',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);


// Duplicate attempts table
db.exec(`
    CREATE TABLE IF NOT EXISTS duplicate_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        reason TEXT NOT NULL DEFAULT 'Matching email already exists',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);


// Security bans table
db.exec(`
    CREATE TABLE IF NOT EXISTS security_bans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        ban_type TEXT NOT NULL DEFAULT 'email',
        banned_at DATETIME NOT NULL,
        expires_at DATETIME NOT NULL
    );
`);


// Add ban_type column to old databases if it does not exist
const columns = db
    .prepare("PRAGMA table_info(security_bans)")
    .all();

const hasBanType = columns.some(
    (column) => column.name === "ban_type"
);

if (!hasBanType) {
    db.exec(`
        ALTER TABLE security_bans
        ADD COLUMN ban_type TEXT NOT NULL DEFAULT 'email'
    `);

    console.log("Added ban_type column to security_bans.");
}


console.log("Records table is ready.");
console.log("Duplicate logs table is ready.");
console.log("Security bans table is ready.");