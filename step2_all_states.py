import pandas as pd
import os

# Folder path
folder = "all-india-villages-master-list-excel/dataset"

# Get all files
all_files = os.listdir(folder)

# This empty list will collect data from all states
all_states_data = []

# Counter to track progress
success = 0
failed  = 0

# Loop through every file
for filename in all_files:

    # ── SKIP the ODS file for now (we'll handle it separately)
    if filename.endswith(".ods"):
        print(f"⏭️  Skipping {filename} for now")
        continue

    # Build full path to the file
    file_path = os.path.join(folder, filename)

    try:
        # Read .xls files only
        if filename.endswith(".xls"):
            df = pd.read_excel(file_path, engine="xlrd")
        else:
            continue

        # Rename columns
        df.columns = ['state_code', 'state_name', 'district_code', 'district_name',
                      'subdistrict_code', 'subdistrict_name', 'village_code', 'village_name']

        # Keep only villages
        df = df[df['village_code'] != 0].copy()

        # Clean text columns
        for col in ['state_name', 'district_name', 'subdistrict_name', 'village_name']:
            df[col] = df[col].str.strip().str.title()

        # Add this state's data to our list
        all_states_data.append(df)
        success += 1
        print(f"✅ {filename} — {len(df)} villages")

    except Exception as e:
        failed += 1
        print(f"❌ {filename} — ERROR: {e}")

# Combine all states into one big DataFrame
final_df = pd.concat(all_states_data, ignore_index=True)

print("\n─────────────────────────────────")
print(f"Files read:     {success}")
print(f"Files failed:   {failed}")
print(f"Total villages: {len(final_df):,}")
print(f"Total states:   {final_df['state_name'].nunique()}")
# Save to CSV file
final_df.to_csv("clean_villages.csv", index=False)
print("\n✅ Saved to clean_villages.csv")