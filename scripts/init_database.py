import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import init_db

async def main():
    print("🔧 Initializing database...")
    await init_db()
    print("✅ Database initialized successfully!")
    print("All tables created: patients, alerts, zones, locations, vitals, activities, etc.")

if __name__ == "__main__":
    asyncio.run(main())
