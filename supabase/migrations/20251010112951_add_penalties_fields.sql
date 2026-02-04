/*
  # Add Missing Fields to Penalties Table

  1. Changes
    - Add `percentage` field (decimal) - Percentage reduction in billing
    - Add `min_occurrences` field (integer) - Minimum number of occurrences to apply penalty
    
  2. Notes
    - Uses IF NOT EXISTS pattern to be safe for re-runs
    - Default values provided for existing records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'penalties' AND column_name = 'percentage'
  ) THEN
    ALTER TABLE penalties ADD COLUMN percentage decimal(5,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'penalties' AND column_name = 'min_occurrences'
  ) THEN
    ALTER TABLE penalties ADD COLUMN min_occurrences integer DEFAULT 1;
  END IF;
END $$;
