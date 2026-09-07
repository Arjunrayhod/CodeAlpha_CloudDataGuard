const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
    addRecord,
    getRecordStats,
    getAllRecords,
    getDuplicateHistory,
    getBanHistory
} = require("./services/recordService");

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


// Home route
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "CloudDataGuard API is running."
    });

});


// Get dashboard statistics
app.get("/api/stats", (req, res) => {

    try {

        const stats = getRecordStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {

        console.error(
            "Error getting statistics:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load statistics."
        });

    }

});


// Get all records
app.get("/api/records", (req, res) => {

    try {

        const records = getAllRecords();

        res.json({
            success: true,
            data: records
        });

    } catch (error) {

        console.error(
            "Error getting records:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load records."
        });

    }

});


// Get duplicate history
app.get("/api/duplicates", (req, res) => {

    try {

        const duplicates = getDuplicateHistory();

        res.json({
            success: true,
            data: duplicates
        });

    } catch (error) {

        console.error(
            "Error getting duplicate history:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load duplicate history."
        });

    }

});


// Get ban history
app.get("/api/bans", (req, res) => {

    try {

        const bans = getBanHistory();

        res.json({
            success: true,
            data: bans
        });

    } catch (error) {

        console.error(
            "Error getting ban history:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load ban history."
        });

    }

});


// Add a new record
app.post("/api/records", (req, res) => {

    const { name, email } = req.body;


    // Basic validation
    if (!name || !email) {

        return res.status(400).json({
            success: false,
            message: "Name and email are required."
        });

    }


    try {

        const result = addRecord(
            name,
            email
        );


        // Validation error
        if (result.validationError) {

            return res.status(400).json(result);

        }


        // Duplicate or banned response
        if (result.duplicate) {

            return res.status(409).json(result);

        }


        // Successfully saved
        res.status(201).json(result);

    } catch (error) {

        console.error(
            "Error adding record:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Something went wrong while saving the record."
        });

    }

});


// Start server
app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});