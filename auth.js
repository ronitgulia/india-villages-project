require("dotenv").config()
const express = require("express")
const router  = express.Router()
const jwt     = require("jsonwebtoken")
const bcrypt  = require("bcryptjs")
const { Pool } = require("pg")

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const JWT_SECRET = process.env.JWT_SECRET || "india_villages_secret_key"

// ── Create users table if not exists ─────────────────────
async function createUsersTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id          SERIAL PRIMARY KEY,
            name        TEXT NOT NULL,
            email       TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            plan        TEXT DEFAULT 'free',
            status      TEXT DEFAULT 'active',
            created_at  TIMESTAMP DEFAULT NOW()
        )
    `)
}
createUsersTable()

// ── ROUTE 1: Register ─────────────────────────────────────
// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields required" })
    }

    try {
        // Check if email already exists
        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1", [email]
        )
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Save user to database
        const result = await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, plan",
            [name, email, hashedPassword]
        )

        const user = result.rows[0]

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        )

        res.json({
            success: true,
            message: "Registration successful!",
            token: token,
            user: { id: user.id, name: user.name, email: user.email, plan: user.plan }
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// ── ROUTE 2: Login ────────────────────────────────────────
// POST /api/auth/login
router.post("/login", async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" })
    }

    try {
        // Find user by email
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1", [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }

        const user = result.rows[0]

        // Check password
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "Invalid email or password" })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        )

        res.json({
            success: true,
            message: "Login successful!",
            token: token,
            user: { id: user.id, name: user.name, email: user.email, plan: user.plan }
        })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// ── ROUTE 3: Get current user ─────────────────────────────
// GET /api/auth/me
router.get("/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ success: false, message: "No token provided" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        const result  = await db.query(
            "SELECT id, name, email, plan, status, created_at FROM users WHERE id = $1",
            [decoded.id]
        )
        res.json({ success: true, user: result.rows[0] })
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" })
    }
})

module.exports = router