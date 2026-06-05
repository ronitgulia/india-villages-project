require("dotenv").config()
const express = require("express")
const { Pool } = require("pg")
const cors = require("cors")

const app  = express()
const PORT = process.env.PORT || 3001

// Connect to NeonDB
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

app.use(cors())
app.use(express.json())

const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100
})
app.use('/api/', limiter)

const authRoutes = require("./auth")
app.use("/api/auth", authRoutes)
const keyRoutes = require("./apikeys")
app.use("/api/keys", keyRoutes)

// ── ROUTE 1: Health check ─────────────────────────────────
app.get("/api/health", async (req, res) => {
    const result = await db.query("SELECT COUNT(*) FROM villages")
    res.json({
        status: "ok",
        total_villages: result.rows[0].count
    })
})

// ── ROUTE 2: Get all states ───────────────────────────────
app.get("/api/states", async (req, res) => {
    const result = await db.query(`
        SELECT DISTINCT state_name, state_code
        FROM villages
        ORDER BY state_name
    `)
    res.json({
        total: result.rows.length,
        states: result.rows
    })
})

// ── ROUTE 3: Get districts by state ──────────────────────
app.get("/api/districts", async (req, res) => {
    const { state } = req.query
    if (!state) {
        return res.json({ error: "Please provide state name. Example: /api/districts?state=Rajasthan" })
    }
    const result = await db.query(`
        SELECT DISTINCT district_name, district_code
        FROM villages
        WHERE state_name = $1
        ORDER BY district_name
    `, [state])
    res.json({
        state: state,
        total: result.rows.length,
        districts: result.rows
    })
})

// ── ROUTE 4: Get villages by state ────────────────────────
app.get("/api/villages", async (req, res) => {
    const { state, district, page = 1, limit = 50 } = req.query
    if (!state) {
        return res.json({ error: "Please provide state. Example: /api/villages?state=Rajasthan" })
    }

    let query = `
        SELECT village_name, subdistrict_name, district_name, state_name
        FROM villages
        WHERE state_name = $1
    `
    const params = [state]

    if (district) {
        params.push(district)
        query += ` AND district_name = $${params.length}`
    }

    query += ` ORDER BY village_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(parseInt(limit))
    params.push((parseInt(page) - 1) * parseInt(limit))

    const result = await db.query(query, params)
    res.json({
        state: state,
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length,
        villages: result.rows
    })
})

// ── ROUTE 5: Search villages by name ─────────────────────
app.get("/api/search", async (req, res) => {
    const { name } = req.query
    if (!name || name.length < 2) {
        return res.status(400).json({ error: "Minimum 2 characters required" })
    }
    const result = await db.query(`
        SELECT village_name, subdistrict_name, district_name, state_name
        FROM villages
        WHERE village_name ILIKE $1
        ORDER BY village_name
        LIMIT 50
    `, [`%${name}%`])
    res.json({
        search: name,
        total_found: result.rows.length,
        results: result.rows
    })
})

// ── ROUTE 6: Stats ────────────────────────────────────────
app.get("/api/stats", async (req, res) => {
    const result = await db.query(`
        SELECT state_name, COUNT(*) as village_count
        FROM villages
        GROUP BY state_name
        ORDER BY village_count DESC
    `)
    res.json({
        total_states: result.rows.length,
        data: result.rows
    })
})

// Start server
// ── ADMIN: Get all users ──────────────────────────────────
app.get("/api/admin/users", async (req, res) => {
    const result = await db.query(`
        SELECT u.id, u.name, u.email, u.plan, u.status, u.created_at,
               COUNT(k.id) as api_keys
        FROM users u
        LEFT JOIN api_keys k ON k.user_id = u.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    `)
    res.json({ success: true, users: result.rows })
})
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
    console.log(`   Connected to NeonDB (PostgreSQL)`)
})