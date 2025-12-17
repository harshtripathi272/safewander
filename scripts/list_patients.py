import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import async_session_maker
from sqlalchemy import text

async def list_patients():
    async with async_session_maker() as session:
        result = await session.execute(text('SELECT id, name FROM patients'))
        print("📋 Available patients in database:")
        for row in result:
            print(f"  • ID: {row[0]:<40} Name: {row[1]}")

if __name__ == "__main__":
    asyncio.run(list_patients())
