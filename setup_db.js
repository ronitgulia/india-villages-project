require("dotenv").config()
const { Pool } = require("pg")

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function setupDatabase() {
    try {
        console.log("Creating tables...")

        // Create states table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS states (
                id SERIAL PRIMARY KEY,
                state_code INTEGER UNIQUE NOT NULL,
                state_name TEXT NOT NULL
            )
        `)
        console.log("✅ states table created")

        // Create districts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS districts (
                id SERIAL PRIMARY KEY,
                state_code INTEGER NOT NULL,
                district_code INTEGER NOT NULL,
                district_name TEXT NOT NULL,
                UNIQUE(state_code, district_code)
            )
        `)
        console.log("✅ districts table created")

        // Create subdistricts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subdistricts (
                id SERIAL PRIMARY KEY,
                state_code INTEGER NOT NULL,
                district_code INTEGER NOT NULL,
                subdistrict_code INTEGER NOT NULL,
                subdistrict_name TEXT NOT NULL,
                UNIQUE(state_code, district_code, subdistrict_code)
            )
        `)
        console.log("✅ subdistricts table created")

        // Create villages table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS villages (
                id SERIAL PRIMARY KEY,
                state_code INTEGER NOT NULL,
                district_code INTEGER NOT NULL,
                subdistrict_code INTEGER NOT NULL,
                village_code INTEGER NOT NULL,
                village_name TEXT NOT NULL,
                state_name TEXT NOT NULL,
                district_name TEXT NOT NULL,
                subdistrict_name TEXT NOT NULL,
                UNIQUE(state_code, district_code, subdistrict_code, village_code)
            )
        `)
        console.log("✅ villages table created")

        // Create index for fast village name search
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_village_name 
            ON villages(village_name)
        `)
        console.log("✅ search index created")

        console.log("\n✅ All tables ready in NeonDB!")
        pool.end()

    } catch (error) {
        console.log("❌ Error:", error.message)
        pool.end()
    }
}

setupDatabase()