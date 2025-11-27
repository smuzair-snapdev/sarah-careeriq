from motor.motor_asyncio import AsyncIOMotorClient
from .config import get_settings

settings = get_settings()

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        """Establish connection to MongoDB"""
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        print("Connected to MongoDB")

    def disconnect(self):
        """Close connection to MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    def get_db(self):
        """Get database instance"""
        return self.client[settings.DB_NAME]

db = Database()

async def get_database():
    return db.get_db()