-- Migration: Add layer4_result column to distillations table
-- Date: 2026-05-13
-- Purpose: 将第四层结果从 cognitive_profiles 表迁移到 distillations 表

-- Step 1: Add layer4_result column
ALTER TABLE distillations ADD COLUMN IF NOT EXISTS layer4_result JSONB;

-- Step 2: Migrate existing data from cognitive_profiles to distillations
UPDATE distillations d
SET layer4_result = cp.profile_json
FROM cognitive_profiles cp
WHERE d.id = cp.distillation_id;

-- Step 3: Verify migration (optional, for manual check)
-- SELECT 
--   d.id, 
--   d.name, 
--   d.layer4_result IS NOT NULL as has_layer4,
--   cp.profile_json IS NOT NULL as has_cognitive_profile
-- FROM distillations d
-- LEFT JOIN cognitive_profiles cp ON d.id = cp.distillation_id
-- WHERE d.status = 'completed';

-- Note: We keep cognitive_profiles table for backward compatibility
-- It will be deprecated in future versions
