import { useState } from "react"
import axios from "axios"

function App() {

  // These are variables that store data
  const [states, setStates]     = useState([])
  const [villages, setVillages] = useState([])
  const [search, setSearch]     = useState("")
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)

  // ── Load all states when page opens ──────────────────────
  const loadStates = async () => {
    const res = await axios.get("http://localhost:3001/api/states")
    setStates(res.data)
  }

  // ── Load villages for a selected state ───────────────────
  const loadVillages = async (stateName) => {
    setLoading(true)
    const res = await axios.get(`http://localhost:3001/api/villages?state=${stateName}`)
    setVillages(res.data.villages)
    setLoading(false)
  }

  // ── Search villages by name ───────────────────────────────
  const searchVillages = async () => {
    if (!search) return
    setLoading(true)
    const res = await axios.get(`http://localhost:3001/api/search?name=${search}`)
    setResults(res.data.results)
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>

      <h1 style={{ color: "#2c3e50" }}>🇮🇳 All India Villages</h1>
      <p style={{ color: "gray" }}>Census 2011 — 457,290 Villages</p>

      <hr />

      {/* ── SECTION 1: Load States ── */}
      <h2>Step 1: Load All States</h2>
      <button
        onClick={loadStates}
        style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Load States
      </button>

      {states.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <h3>Select a State:</h3>
          <select
            onChange={(e) => loadVillages(e.target.value)}
            style={{ padding: "10px", fontSize: "16px", width: "300px" }}
          >
            <option value="">-- Select State --</option>
            {states.map((s, i) => (
              <option key={i} value={s.state_name}>{s.state_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── SECTION 2: Villages Table ── */}
      {loading && <p>Loading...</p>}

      {villages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Villages (showing first 100):</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Village</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Sub-District</th>
                <th style={{ padding: "10px", textAlign: "left" }}>District</th>
              </tr>
            </thead>
            <tbody>
              {villages.map((v, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                  <td style={{ padding: "8px" }}>{v.village_name}</td>
                  <td style={{ padding: "8px" }}>{v.subdistrict_name}</td>
                  <td style={{ padding: "8px" }}>{v.district_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr />

      {/* ── SECTION 3: Search ── */}
      <h2>Step 2: Search Villages by Name</h2>
      <input
        type="text"
        placeholder="Type village name e.g. Rampur"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", fontSize: "16px", width: "300px", marginRight: "10px" }}
      />
      <button
        onClick={searchVillages}
        style={{ padding: "10px 20px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Search
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Search Results ({results.length} found):</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#27ae60", color: "white" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Village</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Sub-District</th>
                <th style={{ padding: "10px", textAlign: "left" }}>District</th>
                <th style={{ padding: "10px", textAlign: "left" }}>State</th>
              </tr>
            </thead>
            <tbody>
              {results.map((v, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                  <td style={{ padding: "8px" }}>{v.village_name}</td>
                  <td style={{ padding: "8px" }}>{v.subdistrict_name}</td>
                  <td style={{ padding: "8px" }}>{v.district_name}</td>
                  <td style={{ padding: "8px" }}>{v.state_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

export default App