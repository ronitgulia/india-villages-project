require("dotenv").config()
const express  = require("express")
const router   = express.Router()
const jwt      = require("jsonwebtoken")
const crypto   = require("crypto")
const { Pool } = require("pg")

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const JWT_SECRET = process.env.JWT_SECRET || "india_villages_secret_key"

// ── Create api_keys table ─────────────────────────────────
async function createApiKeysTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER REFERENCES users(id),
            key_name   TEXT NOT NULL,
            api_key    TEXT UNIQUE NOT NULL,
            plan       TEXT DEFAULT 'free',
            status     TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW()
        )
    `)
}
createApiKeysTable()

// ── Middleware: verify JWT token ──────────────────────────
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" })
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" })
    }
}

// ── ROUTE 1: Generate new API key ─────────────────────────
// POST /api/keys/generate
router.post("/generate", verifyToken, async (req, res) => {
    const { key_name } = req.body

    if (!key_name) {
        return res.status(400).json({ success: false, message: "Key name required" })
    }

    try {
        // Check how many keys user already has
        const existing = await db.query(
            "SELECT COUNT(*) FROM api_keys WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        )

        if (existing.rows[0].count >= 5) {
            return res.status(400).json({ success: false, message: "Maximum 5 API keys allowed" })
        }

        // Generate unique API key
        const apiKey = "ak_" + crypto.randomBytes(16).toString("hex")

        // Save to database
        const result = await db.query(
            "INSERT INTO api_keys (user_id, key_name, api_key) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, key_name, apiKey]
        )

        res.json({
            success: true,
            message: "API key generated!",
            api_key: result.rows[0]
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// ── ROUTE 2: Get all my API keys ──────────────────────────
// GET /api/keys
router.get("/", verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, key_name, api_key, plan, status, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        )
        res.json({ success: true, keys: result.rows })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// ── ROUTE 3: Revoke API key ───────────────────────────────
// DELETE /api/keys/:id
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        await db.query(
            "UPDATE api_keys SET status = 'revoked' WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        )
        res.json({ success: true, message: "API key revoked!" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

module.exports = router