# 🇮🇳 All India Villages Platform

A production-grade full-stack application providing a REST API 
for India's complete village-level geographical data from Census 2011.

## Live URLs

| Service | URL |
|---------|-----|
| Frontend Dashboard | https://india-villages-frontend.vercel.app |
| Backend API | https://india-villages-project-h4ou.vercel.app |

## Data Coverage

| Level | Count |
|-------|-------|
| States & UTs | 29 |
| Districts | 530+ |
| Sub-Districts | 5,300+ |
| Villages | 457,061 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Data Processing | Python, Pandas |
| Database | PostgreSQL (NeonDB) |
| Backend | Node.js, Express.js |
| Authentication | JWT, bcryptjs |
| Frontend | React.js, Vite |
| Charts | Recharts |
| Deployment | Vercel |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/states | All states |
| GET | /api/districts?state= | Districts by state |
| GET | /api/villages?state= | Villages by state |
| GET | /api/search?name= | Search villages |
| GET | /api/stats | Village count per state |
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/keys/generate | Generate API key |

## Features

-  **Dashboard** — Stats cards + bar chart of villages per state
-  **Browse** — Filter villages by state
-  **Search** — Search any village across India
-  **Admin Panel** — User management with JWT auth
-  **Demo Form** — Live village autocomplete like Swiggy/Zomato
-  **API Keys** — Generate and manage API keys

## Project Structure
india-villages-project/
├── backend/
│   ├── server.js        # Main API server
│   ├── auth.js          # JWT authentication
│   ├── apikeys.js       # API key management
│   ├── setup_db.js      # Database setup
│   └── import_data.js   # Data import script
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Main dashboard
│   │   └── DemoForm.jsx # Demo contact form
│   └── package.json
├── etl/
│   ├── step1_read_data.py
│   ├── step2_all_states.py
│   ├── step3_load_database.py
│   └── step4_sql_queries.py
└── README.md
## Developer

**Ronit Gulia**
B.Tech AIML Student

## 📄 Data Source

Census 2011 — Ministry of Drinking Water and Sanitation (MDDS)
