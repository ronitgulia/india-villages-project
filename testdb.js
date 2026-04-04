// Load environment variables from .env file
require("dotenv").config()

const { Pool } = require("pg")

// Connect to NeonDB using our connection string
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

// Test the connection
async function testConnection() {
    try {
        const result = await pool.query("SELECT version()")
        console.log("✅ Connected to NeonDB successfully!")
        console.log("PostgreSQL version:", result.rows[0].version)
        pool.end()
    } catch (error) {
        console.log("❌ Connection failed:", error.message)
    }
}

testConnection()