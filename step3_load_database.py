import pandas as pd
import sqlite3

# Load our clean CSV
print("Loading clean_villages.csv ...")
df = pd.read_csv("clean_villages.csv")
print(f"Loaded {len(df):,} villages")

# Connect to SQLite database
# This will CREATE the file if it doesn't exist
conn = sqlite3.connect("india_villages.db")
print("✅ Database connected")

# Load the data into a table called 'villages'
df.to_sql("villages", conn, if_exists="replace", index=False)
print("✅ Data loaded into 'villages' table")

# Verify it worked
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM villages")
count = cursor.fetchone()[0]
print(f"✅ Total rows in database: {count:,}")

# Close connection
conn.close()
print("✅ Database saved as india_villages.db")