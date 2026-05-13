#!/usr/bin/env python3
"""
Migration script: Add layer4_result column and migrate data from cognitive_profiles
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.config import settings

def main():
    database_url = settings.DATABASE_URL
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        # Step 1: Add layer4_result column
        print("Step 1: Adding layer4_result column...")
        conn.execute(text("""
            ALTER TABLE distillations 
            ADD COLUMN IF NOT EXISTS layer4_result JSONB
        """))
        conn.commit()
        print("✓ Column added")
        
        # Step 2: Migrate data from cognitive_profiles
        print("\nStep 2: Migrating data from cognitive_profiles...")
        result = conn.execute(text("""
            UPDATE distillations d
            SET layer4_result = cp.profile_json
            FROM cognitive_profiles cp
            WHERE d.id = cp.distillation_id
            AND d.layer4_result IS NULL
        """))
        conn.commit()
        print(f"✓ Migrated {result.rowcount} records")
        
        # Step 3: Verify migration
        print("\nStep 3: Verifying migration...")
        result = conn.execute(text("""
            SELECT 
                COUNT(*) as total,
                COUNT(layer4_result) as with_layer4
            FROM distillations
            WHERE status = 'completed'
        """))
        row = result.fetchone()
        print(f"✓ Total completed tasks: {row[0]}")
        print(f"✓ Tasks with layer4_result: {row[1]}")
        
    print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    main()
