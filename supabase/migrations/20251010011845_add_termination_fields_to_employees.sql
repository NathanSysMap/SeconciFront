/*
  # Add Termination Fields to Employees Table

  1. Changes
    - Add termination_date field to track when employee was terminated
    - Add termination_reason field to store reason for termination
    - Add termination_type field (resignation, dismissal, retirement, etc)
    - Add termination_notes field for additional information

  2. Notes
    - Fields are optional (nullable) as only terminated employees will have these filled
    - When termination_date is filled, status should typically be 'inactive'
*/

-- Add termination fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'termination_date'
  ) THEN
    ALTER TABLE employees ADD COLUMN termination_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'termination_reason'
  ) THEN
    ALTER TABLE employees ADD COLUMN termination_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'termination_type'
  ) THEN
    ALTER TABLE employees ADD COLUMN termination_type text CHECK (termination_type IN ('resignation', 'dismissal', 'retirement', 'mutual_agreement', 'end_of_contract', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'termination_notes'
  ) THEN
    ALTER TABLE employees ADD COLUMN termination_notes text;
  END IF;
END $$;
