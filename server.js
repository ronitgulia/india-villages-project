// Import libraries
const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");

// Create the app
const app  = express();
const PORT = 3001;

// Connect to our database
const db = new Database("india_villages.db");

// Allow frontend to talk to backend
app.use(cors());
app.use(express.json());

// ── ROUTE 1: Health check ─────────────────────────────────
// Visit: http://localhost:3001/api/health
app.get("/api/health", (req, res) => {
    const count = db.prepare("SELECT COUNT(*) as c FROM villages").get();
    res.json({
        status: "ok",
        total_villages: count.c
    });
});

// ── ROUTE 2: Get all states ───────────────────────────────
// Visit: http://localhost:3001/api/states
app.get("/api/states", (req, res) => {
    const states = db.prepare(`
        SELECT DISTINCT state_name
        FROM villages
        ORDER BY state_name
    `).all();
    res.json(states);
});

// ── ROUTE 3: Get villages by state ────────────────────────
// Visit: http://localhost:3001/api/villages?state=Rajasthan
app.get("/api/villages", (req, res) => {
    const state = req.query.state;

    const villages = db.prepare(`
        SELECT village_name, district_name, subdistrict_name, state_name
        FROM villages
        WHERE state_name = ?
        ORDER BY village_name
        LIMIT 100
    `).all(state);

    res.json({
        state: state,
        total: villages.length,
        villages: villages
    });
});

// Start the server
// ── ROUTE 4: Search villages by name ─────────────────────
// Visit: http://localhost:3001/api/search?name=Rampur
app.get("/api/search", (req, res) => {
    const name = req.query.name;

    if (!name) {
        return res.json({ error: "Please provide a name. Example: /api/search?name=Rampur" });
    }

    const results = db.prepare(`
        SELECT village_name, subdistrict_name, district_name, state_name
        FROM villages
        WHERE village_name LIKE ?
        ORDER BY village_name
        LIMIT 50
    `).all(`%${name}%`);

    res.json({
        search: name,
        total_found: results.length,
        results: results
    });
});

// ── ROUTE 5: Village count per state ─────────────────────
// Visit: http://localhost:3001/api/stats
app.get("/api/stats", (req, res) => {
    const stats = db.prepare(`
        SELECT state_name, COUNT(*) as village_count
        FROM villages
        GROUP BY state_name
        ORDER BY village_count DESC
    `).all();

    res.json({
        total_states: stats.length,
        data: stats
    });
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});