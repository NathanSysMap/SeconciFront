/*
  # Create Employee Attachments Table
  
  1. New Tables
    - `employee_attachments` - Armazena anexos de folha e FGTS por funcionário
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key para employees)
      - `attachment_type` (text: 'payroll' ou 'fgts')
      - `file_name` (text)
      - `file_size` (integer)
      - `file_url` (text)
      - `reference_month` (date)
      - `uploaded_by` (uuid, foreign key para auth.users)
      - `notes` (text, opcional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `employee_attachments` table
    - Add policies for authenticated users to view and insert
  
  3. Indexes
    - Index on employee_id for fast lookups
    - Index on reference_month for filtering by period
*/

-- Employee attachments table
CREATE TABLE IF NOT EXISTS employee_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  attachment_type text NOT NULL CHECK (attachment_type IN ('payroll', 'fgts')),
  file_name text NOT NULL,
  file_size integer,
  file_url text,
  reference_month date NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employee_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view employee attachments"
  ON employee_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert employee attachments"
  ON employee_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update employee attachments"
  ON employee_attachments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete employee attachments"
  ON employee_attachments FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_attachments_employee ON employee_attachments(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_attachments_month ON employee_attachments(reference_month);
CREATE INDEX IF NOT EXISTS idx_employee_attachments_type ON employee_attachments(attachment_type);
