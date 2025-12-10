import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "careeriq")
COLLECTION_NAME = "market_benchmarks"

async def verify_data():
    if not MONGODB_URI:
        print("Error: MONGODB_URI not found in .env")
        return

    print(f"Connecting to MongoDB: {DB_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    count = await collection.count_documents({})
    print(f"Total documents found: {count}")
    
    if count > 0:
        print("\n--- Sample Document ---")
        doc = await collection.find_one()
        import pprint
        pprint.pprint(doc)
        
        print("\n--- Verification ---")
        required_fields = ["country", "years_experience", "dev_role", "salary", "languages"]
        missing = [f for f in required_fields if f not in doc]
        if missing:
            print(f"FAILED: Missing fields in sample: {missing}")
        else:
            print("SUCCESS: Sample document structure looks correct.")
    else:
        print("FAILED: No documents found.")

    client.close()

if __name__ == "__main__":
    asyncio.run(verify_data())