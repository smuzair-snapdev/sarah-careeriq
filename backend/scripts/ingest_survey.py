import asyncio
import os
import sys
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
# Assuming .env is in backend/
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "careeriq")
COLLECTION_NAME = "market_benchmarks"

# Adjust CSV path relative to this script or current working directory
# We assume the script is run from backend/ or we can find it relative to the script file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(SCRIPT_DIR, "../survey_results_public.csv")

def clean_years_code(val):
    if pd.isna(val):
        return None
    if val == 'Less than 1 year':
        return 0.5
    if val == 'More than 50 years':
        return 50.0
    try:
        return float(val)
    except:
        return None

def parse_semicolon_list(val):
    if pd.isna(val):
        return []
    return [x.strip() for x in str(val).split(';')]

async def ingest_data():
    if not MONGODB_URI:
        print("Error: MONGODB_URI not found in .env")
        return

    print("Starting data ingestion...")
    print(f"Connecting to MongoDB: {DB_NAME}...")
    
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Check if CSV exists
    if not os.path.exists(CSV_PATH):
        print(f"Error: {CSV_PATH} not found.")
        return

    # 1. Read CSV
    print(f"Reading {CSV_PATH}...")
    
    # We found that 'YearsCodePro' is not in the columns, based on the schema and error 'YearsCode' might be the one or similar.
    # Looking at the CSV header: "YearsCode" exists. "YearsCodePro" might be missing or named differently in this year's survey?
    # Actually, looking at the header snippet: 
    # "ResponseId","MainBranch","Age","EdLevel","Employment","EmploymentAddl","WorkExp","LearnCodeChoose","LearnCode","LearnCodeAI","AILearnHow","YearsCode","DevType", ...
    # Wait, 'WorkExp' is there which is "How many years of professional work experience do you have?". 
    # 'YearsCode' is "Including any education, how many years have you been coding in total?".
    # So 'WorkExp' seems to be the professional experience equivalent if 'YearsCodePro' is missing.
    
    # Let's map 'WorkExp' to years_experience
    
    usecols = [
        'DevType', 'WorkExp', 'Country', 'ConvertedCompYearly',
        'LanguageHaveWorkedWith', 'DatabaseHaveWorkedWith', 
        'PlatformHaveWorkedWith', 'WebframeHaveWorkedWith'
    ]
    
    try:
        df = pd.read_csv(CSV_PATH, usecols=usecols)
        print("Columns found successfully.")
    except ValueError as e:
        print(f"Warning: Columns mismatch ({e}). Reading all columns to inspect...")
        df = pd.read_csv(CSV_PATH)
        print(f"Available columns: {df.columns.tolist()}")
        # If read all, we still need to process. We'll attempt to use available columns.
        if 'WorkExp' not in df.columns and 'YearsCodePro' in df.columns:
             df['WorkExp'] = df['YearsCodePro'] # fallback if logic reversed
        elif 'WorkExp' not in df.columns and 'YearsCode' in df.columns:
             df['WorkExp'] = df['YearsCode'] # fallback to total coding years if pro exp missing

    print(f"Total rows read: {len(df)}")

    # 2. Clean and Normalize
    print("Cleaning data...")
    
    # Filter rows with essential data
    # We need salary, role, experience, and country for meaningful benchmarks
    # Note: 'WorkExp' might be null, we should check.
    
    # Convert 'WorkExp' to numeric, handling errors
    df['WorkExp'] = pd.to_numeric(df['WorkExp'], errors='coerce')
    
    df = df.dropna(subset=['ConvertedCompYearly', 'DevType', 'WorkExp', 'Country'])
    print(f"Rows after dropping NaNs in essential columns: {len(df)}")
    
    documents = []
    
    for _, row in df.iterrows():
        years = float(row['WorkExp'])
            
        doc = {
            "country": str(row['Country']),
            "years_experience": years,
            "dev_role": str(row['DevType']),
            "salary": float(row['ConvertedCompYearly']),
            "languages": parse_semicolon_list(row.get('LanguageHaveWorkedWith')),
            "databases": parse_semicolon_list(row.get('DatabaseHaveWorkedWith')),
            "platforms": parse_semicolon_list(row.get('PlatformHaveWorkedWith')),
            "frameworks": parse_semicolon_list(row.get('WebframeHaveWorkedWith')),
            "source_year": 2024
        }
        documents.append(doc)

    print(f"Prepared {len(documents)} documents for insertion.")

    if documents:
        # 3. Insert into MongoDB
        print(f"Inserting into collection '{COLLECTION_NAME}'...")
        # Clear existing data or just append? 
        # Usually for a fresh ingestion script we might want to drop old data or update. 
        # For this task, let's drop to ensure clean state if run multiple times.
        await collection.drop()
        print("Dropped existing collection.")
        
        # Insert in batches to avoid message size limits
        batch_size = 1000
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]
            await collection.insert_many(batch)
            print(f"Inserted batch {i} to {i + len(batch)}")
            
        print("Ingestion complete.")
        
        # Verify count
        count = await collection.count_documents({})
        print(f"Total documents in '{COLLECTION_NAME}': {count}")
    else:
        print("No valid documents to insert.")

    client.close()

if __name__ == "__main__":
    asyncio.run(ingest_data())