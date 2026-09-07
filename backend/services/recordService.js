const crypto = require("crypto");
const db = require("../config/database");

const MAX_DUPLICATE_ATTEMPTS = 5;
const BAN_DURATION_HOURS = 24;


// Validate and clean user input
function validateInput(name, email) {

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();


    // Name validation
    if (!cleanName) {
        return {
            valid: false,
            message: "Name is required."
        };
    }

    if (cleanName.length < 2) {
        return {
            valid: false,
            message: "Name must contain at least 2 characters."
        };
    }

    if (cleanName.length > 100) {
        return {
            valid: false,
            message: "Name must not exceed 100 characters."
        };
    }


    // Allow letters, spaces, dots, apostrophes and hyphens
    const namePattern = /^[A-Za-z\s.'-]+$/;

    if (!namePattern.test(cleanName)) {
        return {
            valid: false,
            message: "Name contains invalid characters."
        };
    }


    // Email validation
    if (!cleanEmail) {
        return {
            valid: false,
            message: "Email is required."
        };
    }

    if (cleanEmail.length > 254) {
        return {
            valid: false,
            message: "Email is too long."
        };
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
        return {
            valid: false,
            message: "Please enter a valid email address."
        };
    }


    return {
        valid: true,
        name: cleanName,
        email: cleanEmail
    };
}


// Create hash using normalized email
function createDataHash(email) {

    return crypto
        .createHash("sha256")
        .update(email)
        .digest("hex");
}


// Check whether this email currently has an active ban
function getActiveEmailBan(email) {

    return db
        .prepare(`
            SELECT *
            FROM security_bans
            WHERE LOWER(email) = ?
            AND ban_type = 'email'
            AND datetime(expires_at) > datetime('now')
            ORDER BY id DESC
            LIMIT 1
        `)
        .get(email);
}


// Count duplicate attempts for an email
function getEmailDuplicateCount(email) {

    return db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM duplicate_logs
            WHERE LOWER(email) = ?
        `)
        .get(email).count;
}


// Create 24-hour email ban
function createEmailBan(email, attemptCount) {

    const bannedAt = new Date();

    const expiresAt = new Date(
        bannedAt.getTime() +
        BAN_DURATION_HOURS * 60 * 60 * 1000
    );


    db.prepare(`
        INSERT INTO security_bans
        (
            name,
            email,
            attempt_count,
            ban_type,
            banned_at,
            expires_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        "Multiple Names",
        email,
        attemptCount,
        "email",
        bannedAt.toISOString(),
        expiresAt.toISOString()
    );


    return expiresAt;
}


// Add a new record
function addRecord(name, email) {


    // STEP 1: Validate input on server
    const validation = validateInput(name, email);

    if (!validation.valid) {

        return {
            success: false,
            validationError: true,
            message: validation.message
        };
    }


    const cleanName = validation.name;
    const cleanEmail = validation.email;


    // STEP 2: Check active email ban
    const activeBan = getActiveEmailBan(cleanEmail);

    if (activeBan) {

        return {
            success: false,
            duplicate: true,
            banned: true,
            attemptCount: activeBan.attempt_count,
            message:
                "This email is temporarily blocked for 24 hours.",
            expiresAt: activeBan.expires_at
        };
    }


    // STEP 3: Create SHA-256 hash
    const dataHash = createDataHash(cleanEmail);


    // STEP 4: Check whether email already exists
    const existingRecord = db
        .prepare(`
            SELECT id
            FROM records
            WHERE data_hash = ?
        `)
        .get(dataHash);


    // STEP 5: Duplicate detected
    if (existingRecord) {


        // Save duplicate attempt
        db.prepare(`
            INSERT INTO duplicate_logs
            (
                data_hash,
                name,
                email,
                reason
            )
            VALUES (?, ?, ?, ?)
        `).run(
            dataHash,
            cleanName,
            cleanEmail,
            "Matching email already exists"
        );


        // Count duplicate attempts
        const attemptCount =
            getEmailDuplicateCount(cleanEmail);


        // More than 5 attempts = 24 hour ban
        if (attemptCount > MAX_DUPLICATE_ATTEMPTS) {

            const expiresAt = createEmailBan(
                cleanEmail,
                attemptCount
            );


            return {
                success: false,
                duplicate: true,
                banned: true,
                attemptCount,
                message:
                    "Too many duplicate attempts. This email is blocked for 24 hours.",
                expiresAt
            };
        }


        return {
            success: false,
            duplicate: true,
            banned: false,
            attemptCount,
            message:
                `This email already exists. Duplicate attempt ${attemptCount} of ${MAX_DUPLICATE_ATTEMPTS}.`
        };
    }


    // STEP 6: Unique record
    const result = db
        .prepare(`
            INSERT INTO records
            (
                name,
                email,
                data_hash
            )
            VALUES (?, ?, ?)
        `)
        .run(
            cleanName,
            cleanEmail,
            dataHash
        );


    return {
        success: true,
        duplicate: false,
        banned: false,
        message: "Record added successfully.",
        recordId: result.lastInsertRowid
    };
}


// Get dashboard statistics
function getRecordStats() {

    const totalRecords = db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM records
        `)
        .get().count;


    const duplicateCount = db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM duplicate_logs
        `)
        .get().count;


    const activeBans = db
        .prepare(`
            SELECT COUNT(*) AS count
            FROM security_bans
            WHERE datetime(expires_at) > datetime('now')
        `)
        .get().count;


    return {
        totalRecords,
        uniqueRecords: totalRecords,
        duplicateCount,
        activeBans
    };
}


// Get all records
function getAllRecords() {

    return db
        .prepare(`
            SELECT
                id,
                name,
                email,
                status,
                created_at
            FROM records
            ORDER BY id DESC
        `)
        .all();
}

// Get duplicate history
function getDuplicateHistory() {

    return db
        .prepare(`
            SELECT
                id,
                name,
                email,
                reason,
                created_at
            FROM duplicate_logs
            ORDER BY id DESC
        `)
        .all();
}


// Get ban history
function getBanHistory() {

    return db
        .prepare(`
            SELECT
                id,
                name,
                email,
                attempt_count,
                ban_type,
                banned_at,
                expires_at
            FROM security_bans
            ORDER BY id DESC
        `)
        .all();
}


module.exports = {
    addRecord,
    getRecordStats,
    getAllRecords,
    getDuplicateHistory,
    getBanHistory
};