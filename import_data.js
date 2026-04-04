require("dotenv").config()
const { Pool } = require("pg")
const fs = require("fs")
const path = require("path")

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

function readCSV(filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const lines = content.split("\n")
    const headers = lines[0].split(",")
    const rows = []
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(",")
        const row = {}
        headers.forEach((h, idx) => {
            row[h.trim()] = values[idx] ? values[idx].trim() : ""
        })
        rows.push(row)
    }
    return rows
}
async function importData() {
    try {
        const csvPath = path.join(__dirname, "..", "clean_villages.csv")
        console.log("Reading CSV file...")
        const rows = readCSV(csvPath)
        console.log(`Total rows: ${rows.length.toLocaleString()}`)

        await pool.query("TRUNCATE TABLE villages")
        console.log("Cleared old data")

        const batchSize = 5000
        let imported = 0

        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize)
            const values = []
            const placeholders = batch.map((row, idx) => {
                const base = idx * 8
                values.push(
                    parseInt(row.state_code)  || 0,
                    row.state_name            || "",
                    parseInt(row.district_code)    || 0,
                    row.district_name         || "",
                    parseInt(row.subdistrict_code) || 0,
                    row.subdistrict_name      || "",
                    parseInt(row.village_code)     || 0,
                    row.village_name          || ""
                )
                return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8})`
            }).join(",")
            await pool.query(`
                INSERT INTO villages 
                (state_code, state_name, district_code, district_name,
                 subdistrict_code, subdistrict_name, village_code, village_name)
                VALUES ${placeholders}
                ON CONFLICT DO NOTHING
            `, values)

            imported += batch.length
            console.log(`${imported.toLocaleString()} / ${rows.length.toLocaleString()} imported`)
        }

        const result = await pool.query("SELECT COUNT(*) FROM villages")
        console.log(`Import complete! Total: ${result.rows[0].count}`)
        pool.end()

    } catch (error) {
        console.log("Error:", error.message)
        pool.end()
    }
}

importData()