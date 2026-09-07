const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(
    __dirname,
    "../../database/cloud_data.db"
);

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

console.log("Local database connected.");

module.exports = db;
