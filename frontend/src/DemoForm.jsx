import { useState } from "react"
import axios from "axios"

const API = "https://india-villages-project-h4ou.vercel.app"

function DemoForm() {
  const [name, setName]               = useState("")
  const [email, setEmail]             = useState("")
  const [phone, setPhone]             = useState("")
  const [message, setMessage]         = useState("")
  const [villageInput, setVillageInput] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [address, setAddress]         = useState({
    village: "", subdistrict: "", district: "", state: "", country: "India"
  })
  const [submitted, setSubmitted]     = useState(false)

  // Search villages as user types
  const handleVillageSearch = async (value) => {
    setVillageInput(value)
    if (value.length < 2) { setSuggestions([]); return }

    const res = await axios.get(`${API}/api/search?name=${value}`)
    setSuggestions(res.data.results.slice(0, 8))
  }

  // When user selects a village
  const selectVillage = (village) => {
    setVillageInput(village.village_name)
    setAddress({
      village:     village.village_name,
      subdistrict: village.subdistrict_name,
      district:    village.district_name,
      state:       village.state_name,
      country:     "India"
    })
    setSuggestions([])
  }

  const handleSubmit = () => {
    if (!name || !email || !address.village) {
      alert("Please fill in Name, Email and select a Village!")
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", backgroundColor: "white", padding: "40px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <h2 style={{ color: "#27ae60" }}>✅ Form Submitted!</h2>
        <p style={{ color: "gray" }}>Thank you {name}! We received your details.</p>
        <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginTop: "20px", textAlign: "left" }}>
          <h3>📍 Your Address:</h3>
          <p><strong>Village:</strong> {address.village}</p>
          <p><strong>Sub-District:</strong> {address.subdistrict}</p>
          <p><strong>District:</strong> {address.district}</p>
          <p><strong>State:</strong> {address.state}</p>
          <p><strong>Country:</strong> {address.country}</p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setName(""); setEmail(""); setPhone(""); setMessage(""); setVillageInput(""); setAddress({ village: "", subdistrict: "", district: "", state: "", country: "India" }) }}
          style={{ marginTop: "20px", padding: "10px 25px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ marginTop: 0, color: "#2c3e50" }}>📝 Contact Form</h2>
      <p style={{ color: "gray", marginBottom: "20px" }}>Demo — Village Address Autocomplete</p>

      {/* Name */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Full Name *</label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "15px" }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email *</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "15px" }}
        />
      </div>

      {/* Phone */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Phone</label>
        <input
          type="tel"
          placeholder="Enter your phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "15px" }}
        />
      </div>

      {/* Village Search */}
      <div style={{ marginBottom: "15px", position: "relative" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Village / Area * (type to search)</label>
        <input
          type="text"
          placeholder="Type village name e.g. Rampur"
          value={villageInput}
          onChange={(e) => handleVillageSearch(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #3498db", fontSize: "15px" }}
        />
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #ddd", borderRadius: "5px", zIndex: 100, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            {suggestions.map((v, i) => (
              <div
                key={i}
                onClick={() => selectVillage(v)}
                style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
              >
                <strong>{v.village_name}</strong>
                <span style={{ color: "gray", marginLeft: "8px" }}>{v.subdistrict_name}, {v.district_name}, {v.state_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto filled address */}
      {address.village && (
        <div style={{ backgroundColor: "#f0fff4", padding: "15px", borderRadius: "8px", marginBottom: "15px", border: "1px solid #27ae60" }}>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>📍 <strong>Sub-District:</strong> {address.subdistrict}</p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>📍 <strong>District:</strong> {address.district}</p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>📍 <strong>State:</strong> {address.state}</p>
          <p style={{ margin: "3px 0", fontSize: "14px" }}>📍 <strong>Country:</strong> {address.country}</p>
        </div>
      )}

      {/* Message */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Message</label>
        <textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", fontSize: "15px" }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        style={{ width: "100%", padding: "12px", backgroundColor: "#27ae60", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}
      >
        Submit Form
      </button>
    </div>
  )
}

export default DemoForm
