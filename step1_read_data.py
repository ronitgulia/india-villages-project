import pandas as pd

# Read the file
file_path = "all-india-villages-master-list-excel/dataset/Rdir_2011_08_RAJASTHAN.xls"
df = pd.read_excel(file_path)

# Rename columns
df.columns = ['state_code', 'state_name', 'district_code', 'district_name',
              'subdistrict_code', 'subdistrict_name', 'village_code', 'village_name']

# Keep only villages
villages = df[df['village_code'] != 0].copy()

# ── CLEANING ──────────────────────────────────────────────

# 1. Remove extra spaces from text columns
villages['state_name']       = villages['state_name'].str.strip()
villages['district_name']    = villages['district_name'].str.strip()
villages['subdistrict_name'] = villages['subdistrict_name'].str.strip()
villages['village_name']     = villages['village_name'].str.strip()

# 2. Convert ALL CAPS to Title Case (e.g. RAJASTHAN → Rajasthan)
villages['state_name']       = villages['state_name'].str.title()
villages['district_name']    = villages['district_name'].str.title()
villages['subdistrict_name'] = villages['subdistrict_name'].str.title()
villages['village_name']     = villages['village_name'].str.title()

# 3. Check for missing values
print("Missing values in each column:")
print(villages.isnull().sum())

# 4. Show clean sample
print("\nClean sample data:")
print(villages[['state_name', 'district_name', 'subdistrict_name', 'village_name']].head(8))

# 5. Summary
print("\nTotal clean villages:", len(villages))
print("Total districts:", villages['district_name'].nunique())
print("Total sub-districts:", villages['subdistrict_name'].nunique())