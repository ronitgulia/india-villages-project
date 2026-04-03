import sqlite3

# Connect to our database
conn = sqlite3.connect("india_villages.db")
cursor = conn.cursor()

# ── QUERY 1: Count total villages ─────────────────────────
print("── Query 1: Total villages ──")
cursor.execute("SELECT COUNT(*) FROM villages")
print("Total villages:", cursor.fetchone()[0])

# ── QUERY 2: List all states ───────────────────────────────
print("\n── Query 2: All states ──")
cursor.execute("SELECT DISTINCT state_name FROM villages ORDER BY state_name")
for row in cursor.fetchall():
    print(row[0])

# ── QUERY 3: Village count per state ──────────────────────
print("\n── Query 3: Villages per state ──")
cursor.execute("""
    SELECT state_name, COUNT(*) as village_count
    FROM villages
    GROUP BY state_name
    ORDER BY village_count DESC
""")
for row in cursor.fetchall():
    print(f"{row[0]:<30} {row[1]:>8,}")

# Close connection
# ── QUERY 4: Search villages by name ──────────────────────
print("\n── Query 4: Villages with name containing 'Rampur' ──")
cursor.execute("""
    SELECT village_name, subdistrict_name, district_name, state_name
    FROM villages
    WHERE village_name LIKE '%Rampur%'
    LIMIT 10
""")
for row in cursor.fetchall():
    print(f"{row[0]:<25} {row[1]:<20} {row[2]:<20} {row[3]}")

# ── QUERY 5: Districts in Rajasthan ───────────────────────
print("\n── Query 5: Districts in Rajasthan ──")
cursor.execute("""
    SELECT DISTINCT district_name, COUNT(*) as villages
    FROM villages
    WHERE state_name = 'Rajasthan'
    GROUP BY district_name
    ORDER BY district_name
""")
for row in cursor.fetchall():
    print(f"{row[0]:<25} {row[1]:>6,} villages")

# ── QUERY 6: Top 5 districts with most villages ───────────
print("\n── Query 6: Top 5 districts with most villages ──")
cursor.execute("""
    SELECT district_name, state_name, COUNT(*) as village_count
    FROM villages
    GROUP BY district_name, state_name
    ORDER BY village_count DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    print(f"{row[0]:<25} {row[1]:<20} {row[2]:>6,}")
conn.close()