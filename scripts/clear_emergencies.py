import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import async_session_maker
from sqlalchemy import text

async def clear_emergencies():
    """Clear all active emergencies so demo can run fresh"""
    print("🧹 Clearing active emergencies...")
    
    async with async_session_maker() as session:
        # Clear all emergencies
        result = await session.execute(text("SELECT COUNT(*) FROM emergencies WHERE status = 'active'"))
        count = result.scalar()
        
        if count > 0:
            await session.execute(text("UPDATE emergencies SET status = 'resolved', resolved_at = datetime('now')"))
            await session.execute(text("UPDATE patients SET status = 'safe' WHERE status = 'emergency'"))
            await session.commit()
            print(f"✅ Cleared {count} active emergencies")
            print("✅ Reset patient statuses to 'safe'")
        else:
            print("✅ No active emergencies found")

if __name__ == "__main__":
    asyncio.run(clear_emergencies())
