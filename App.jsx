import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import DemoForm from "./DemoForm"

const API = "https://india-villages-project-h4ou.vercel.app"

function App() {
  const [stats, setStats]       = useState([])
  const [totals, setTotals]     = useState({})
  const [search, setSearch]     = useState("")
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [states, setStates]     = useState([])
  const [villages, setVillages] = useState([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers]         = useState([])
  const [token, setToken]         = useState(localStorage.getItem("token") || "")
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  // Load stats when page opens
  useEffect(() => {
    loadStats()
    loadStates()
  }, [])

  const loadStats = async () => {
    const res = await axios.get(`${API}/api/stats`)
    setStats(res.data.data)
    const total_villages = res.data.data.reduce((sum, s) => sum + parseInt(s.village_count), 0)
    setTotals({
      villages: total_villages.toLocaleString(),
      states:   res.data.total_states,
    })
  }

  const loadStates = async () => {
    const res = await axios.get(`${API}/api/states`)
    setStates(res.data.states)
  }

  const loadVillages = async (stateName) => {
    setLoading(true)
    const res = await axios.get(`${API}/api/villages?state=${stateName}&limit=200`)
    setVillages(res.data.villages)
    setLoading(false)
  }

  const searchVillages = async () => {
    if (!search) return
    setLoading(true)
    const res = await axios.get(`${API}/api/search?name=${search}`)
    setResults(res.data.results)
    setLoading(false)
  }

  // Styles
  const handleLogin = async () => {
    try {
        const res = await axios.post(`${API}/api/auth/login`, {
            email: loginEmail,
            password: loginPassword
        })
        if (res.data.success) {
            localStorage.setItem("token", res.data.token)
            setToken(res.data.token)
            setIsLoggedIn(true)
            setLoginError("")
        }
    } catch (error) {
        setLoginError("Invalid email or password")
    }
}

const loadUsers = async () => {
    const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    setUsers(res.data.users)
}

const handleLogout = () => {
    localStorage.removeItem("token")
    setToken("")
    setIsLoggedIn(false)
}
  const tabStyle = (tab) => ({
    padding: "10px 25px",
    marginRight: "10px",
    backgroundColor: activeTab === tab ? "#2c3e50" : "#ecf0f1",
    color: activeTab === tab ? "white" : "#2c3e50",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  })

  return (
    <div style={{ fontFamily: "Arial", maxWidth: "1100px", margin: "0 auto", padding: "20px" }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: "#2c3e50", color: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>🇮🇳 All India Villages Platform</h1>
        <p style={{ margin: "5px 0 0 0", color: "#bdc3c7" }}>Census 2011 — Production API Dashboard</p>
      </div>

      {/* ── TABS ── */}
      <div style={{ marginBottom: "20px" }}>
        <button style={tabStyle("dashboard")} onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
        <button style={tabStyle("browse")}    onClick={() => setActiveTab("browse")}>🗺️ Browse</button>
        <button style={tabStyle("search")}    onClick={() => setActiveTab("search")}>🔍 Search</button>
        <button style={tabStyle("admin")} onClick={() => { setActiveTab("admin"); loadUsers() }}>⚙️ Admin</button>
        <button style={tabStyle("demo")} onClick={() => setActiveTab("demo")}>📝 Demo Form</button>
      </div>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === "dashboard" && (
        <div>
          {/* Stats Cards */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div style={{ flex: 1, backgroundColor: "#3498db", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "36px" }}>{totals.villages}</h2>
              <p style={{ margin: "5px 0 0 0" }}>Total Villages</p>
            </div>
            <div style={{ flex: 1, backgroundColor: "#27ae60", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "36px" }}>{totals.states}</h2>
              <p style={{ margin: "5px 0 0 0" }}>States & UTs</p>
            </div>
            <div style={{ flex: 1, backgroundColor: "#e74c3c", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "36px" }}>6</h2>
              <p style={{ margin: "5px 0 0 0" }}>API Routes</p>
            </div>
            <div style={{ flex: 1, backgroundColor: "#9b59b6", color: "white", padding: "20px", borderRadius: "10px", textAlign: "center" }}>
              <h2 style={{ margin: 0, fontSize: "36px" }}>Live</h2>
              <p style={{ margin: "5px 0 0 0" }}>API Status</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginTop: 0 }}>Villages per State</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats} margin={{ top: 10, right: 30, left: 20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state_name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Bar dataKey="village_count" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── BROWSE TAB ── */}
      {activeTab === "browse" && (
        <div>
          <h2>Browse by State</h2>
          <select
            onChange={(e) => loadVillages(e.target.value)}
            style={{ padding: "10px", fontSize: "16px", width: "300px", marginBottom: "20px" }}
          >
            <option value="">-- Select State --</option>
            {states.map((s, i) => (
              <option key={i} value={s.state_name}>{s.state_name}</option>
            ))}
          </select>

          {loading && <p>Loading...</p>}

          {villages.length > 0 && (
            <div>
              <p style={{ color: "gray" }}>Showing {villages.length} villages</p>
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
        </div>
      )}

      {/* ── SEARCH TAB ── */}
      {activeTab === "search" && (
        <div>
          <h2>Search Villages</h2>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Type village name e.g. Rampur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchVillages()}
              style={{ padding: "10px", fontSize: "16px", width: "350px", borderRadius: "5px", border: "1px solid #ddd" }}
            />
            <button
              onClick={searchVillages}
              style={{ padding: "10px 25px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
            >
              Search
            </button>
          </div>

          {loading && <p>Loading...</p>}

          {results.length > 0 && (
            <div>
              <p style={{ color: "gray" }}>{results.length} villages found</p>
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
      )}
    {/* ── ADMIN TAB ── */}
{activeTab === "admin" && (
    <div>
        {!isLoggedIn ? (
            <div style={{ maxWidth: "400px", margin: "0 auto", backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                <h2 style={{ marginTop: 0 }}>⚙️ Admin Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "16px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "16px" }}
                />
                {loginError && <p style={{ color: "red" }}>{loginError}</p>}
                <button
                    onClick={handleLogin}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
                >
                    Login
                </button>
            </div>
        ) : (
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0 }}>⚙️ Admin Panel — Users</h2>
                    <button
                        onClick={handleLogout}
                        style={{ padding: "8px 20px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                        Logout
                    </button>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
                            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                            <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
                            <th style={{ padding: "10px", textAlign: "left" }}>Plan</th>
                            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                            <th style={{ padding: "10px", textAlign: "left" }}>API Keys</th>
                            <th style={{ padding: "10px", textAlign: "left" }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, i) => (
                            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "white" }}>
                                <td style={{ padding: "8px" }}>{u.name}</td>
                                <td style={{ padding: "8px" }}>{u.email}</td>
                                <td style={{ padding: "8px" }}>
                                    <span style={{ backgroundColor: u.plan === "free" ? "#3498db" : "#27ae60", color: "white", padding: "3px 8px", borderRadius: "10px", fontSize: "12px" }}>
                                        {u.plan}
                                    </span>
                                </td>
                                <td style={{ padding: "8px" }}>
                                    <span style={{ backgroundColor: u.status === "active" ? "#27ae60" : "#e74c3c", color: "white", padding: "3px 8px", borderRadius: "10px", fontSize: "12px" }}>
                                        {u.status}
                                    </span>
                                </td>
                                <td style={{ padding: "8px" }}>{u.api_keys}</td>
                                <td style={{ padding: "8px" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
)}
    {/* ── DEMO FORM TAB ── */}
{activeTab === "demo" && (
    <DemoForm />
)}
    </div>
  )
}

export default App