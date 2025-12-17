import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_dir))

from database import async_session_maker
from sqlalchemy import text

async def fix_enum_values():
    """Fix enum values in database from uppercase to lowercase"""
    print("🔧 Fixing enum values in database...")
    
    async with async_session_maker() as session:
        # Fix patient status values
        await session.execute(
            text("UPDATE patients SET status = LOWER(status) WHERE status IN ('SAFE', 'MONITORING', 'WARNING', 'EMERGENCY')")
        )
        
        # Fix alert type values
        await session.execute(
            text("UPDATE alerts SET type = LOWER(type) WHERE type IN ('GEOFENCE', 'VITALS', 'FALL', 'INACTIVITY', 'BATTERY')")
        )
        
        # Fix alert level values
        await session.execute(
            text("UPDATE alerts SET level = LOWER(level) WHERE level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')")
        )
        
        await session.commit()
        print("✅ Database enum values fixed!")
        print("   - Patient status: uppercase → lowercase")
        print("   - Alert type: uppercase → lowercase")
        print("   - Alert level: uppercase → lowercase")

if __name__ == "__main__":
    asyncio.run(fix_enum_values())
