/*
  # Complete Billing Module Enhancement - Fixed

  This migration enhances the billing module with all required fields
  using correct column names (reference_month where applicable).
*/

-- Competency Status (global lifecycle control)
CREATE TABLE IF NOT EXISTS billing_competency_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_month date NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'calculating', 'reviewed', 'in_batch', 'closed')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  closed_by uuid REFERENCES users(id),
  calculation_started_at timestamptz,
  review_completed_at timestamptz,
  notes text,
  parameters_snapshot jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_competency_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can manage competency status"
  ON billing_competency_status FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational')
    )
  );

-- Enhanced category_minimums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'category_minimums' AND column_name = 'previous_value') THEN
    ALTER TABLE category_minimums ADD COLUMN previous_value decimal(10,2);
    ALTER TABLE category_minimums ADD COLUMN impact_estimate jsonb;
    ALTER TABLE category_minimums ADD COLUMN affected_companies_count integer DEFAULT 0;
    ALTER TABLE category_minimums ADD COLUMN reason text;
    ALTER TABLE category_minimums ADD COLUMN approved boolean DEFAULT false;
    ALTER TABLE category_minimums ADD COLUMN approved_by uuid REFERENCES users(id);
    ALTER TABLE category_minimums ADD COLUMN approved_at timestamptz;
    ALTER TABLE category_minimums ADD COLUMN version integer DEFAULT 1;
  END IF;
END $$;

-- Enhanced penalties
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penalties' AND column_name = 'trigger_rules') THEN
    ALTER TABLE penalties ADD COLUMN trigger_rules jsonb;
    ALTER TABLE penalties ADD COLUMN min_value decimal(10,2);
    ALTER TABLE penalties ADD COLUMN max_value decimal(10,2);
    ALTER TABLE penalties ADD COLUMN scope text DEFAULT 'company' CHECK (scope IN ('company', 'rule', 'location', 'global'));
    ALTER TABLE penalties ADD COLUMN accumulate boolean DEFAULT false;
    ALTER TABLE penalties ADD COLUMN global_cap decimal(10,2);
  END IF;
END $$;

-- Enhanced company_billing_rules
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_billing_rules' AND column_name = 'parameters_summary') THEN
    ALTER TABLE company_billing_rules ADD COLUMN parameters_summary jsonb;
    ALTER TABLE company_billing_rules ADD COLUMN impact_projection jsonb;
    ALTER TABLE company_billing_rules ADD COLUMN version integer DEFAULT 1;
  END IF;
END $$;

-- Enhanced location_billing_rules  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'location_billing_rules' AND column_name = 'priority') THEN
    ALTER TABLE location_billing_rules ADD COLUMN priority integer DEFAULT 100;
    ALTER TABLE location_billing_rules ADD COLUMN override_company_rule boolean DEFAULT true;
  END IF;
END $$;

-- Calculation Parameters
CREATE TABLE IF NOT EXISTS calculation_parameters_versioned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_month date NOT NULL,
  version integer NOT NULL DEFAULT 1,
  base_percentages jsonb NOT NULL,
  dependent_rules jsonb,
  absent_rules jsonb,
  thirteenth_rules jsonb,
  rounding_rules jsonb,
  allocation_policies jsonb,
  behavior_flags jsonb,
  valid_from date NOT NULL,
  valid_until date,
  created_by uuid REFERENCES users(id),
  locked boolean DEFAULT false,
  locked_at timestamptz,
  snapshot_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(reference_month, version)
);

ALTER TABLE calculation_parameters_versioned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can manage calc parameters"
  ON calculation_parameters_versioned FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

-- Complementary Imports
CREATE TABLE IF NOT EXISTS complementary_imports_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_month date NOT NULL,
  import_type text NOT NULL CHECK (import_type IN ('cards', 'dependents', 'absent', 'interns', 'prolabore')),
  file_name text NOT NULL,
  file_size bigint,
  layout_config jsonb,
  wizard_state text DEFAULT 'uploaded' CHECK (wizard_state IN ('uploaded', 'mapped', 'validated', 'previewed', 'applied', 'error')),
  mapping jsonb,
  validation_errors jsonb,
  preview_data jsonb,
  mode text DEFAULT 'append' CHECK (mode IN ('append', 'replace')),
  applied_at timestamptz,
  applied_by uuid REFERENCES users(id),
  row_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  rollback_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complementary_imports_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can manage imports"
  ON complementary_imports_v2 FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

-- Enhanced penalty_applications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'penalty_applications' AND column_name = 'preview_mode') THEN
    ALTER TABLE penalty_applications ADD COLUMN preview_mode boolean DEFAULT false;
    ALTER TABLE penalty_applications ADD COLUMN trigger_met jsonb;
    ALTER TABLE penalty_applications ADD COLUMN excluded boolean DEFAULT false;
    ALTER TABLE penalty_applications ADD COLUMN exclusion_reason text;
  END IF;
END $$;

-- Enhanced payroll_adjustments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payroll_adjustments' AND column_name = 'diff_details') THEN
    ALTER TABLE payroll_adjustments ADD COLUMN diff_details jsonb;
    ALTER TABLE payroll_adjustments ADD COLUMN policy_applied text;
    ALTER TABLE payroll_adjustments ADD COLUMN linked_reference_month date;
  END IF;
END $$;

-- Enhanced sampling_groups
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sampling_groups' AND column_name = 'seed_value') THEN
    ALTER TABLE sampling_groups ADD COLUMN seed_value text;
    ALTER TABLE sampling_groups ADD COLUMN selection_method text DEFAULT 'random' CHECK (selection_method IN ('random', 'stratified'));
    ALTER TABLE sampling_groups ADD COLUMN universe_count integer;
    ALTER TABLE sampling_groups ADD COLUMN selected_count integer;
    ALTER TABLE sampling_groups ADD COLUMN exclusions jsonb;
    ALTER TABLE sampling_groups ADD COLUMN substitution_reason text;
  END IF;
END $$;

-- Enhanced billing_mode_transfers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'billing_mode_transfers' AND column_name = 'reference_month_start') THEN
    ALTER TABLE billing_mode_transfers ADD COLUMN reference_month_start date;
    ALTER TABLE billing_mode_transfers ADD COLUMN prevents_history_change boolean DEFAULT true;
  END IF;
END $$;

-- Manual Billing Entries
CREATE TABLE IF NOT EXISTS manual_billing_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  base_amount decimal(12,2) DEFAULT 0,
  dependents_amount decimal(12,2) DEFAULT 0,
  penalties_amount decimal(12,2) DEFAULT 0,
  adjustments_amount decimal(12,2) DEFAULT 0,
  discounts_amount decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) NOT NULL,
  components jsonb,
  justification text NOT NULL,
  attachment_url text,
  version integer DEFAULT 1,
  created_by uuid REFERENCES users(id),
  approved boolean DEFAULT false,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, reference_month, version)
);

ALTER TABLE manual_billing_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can manage manual entries"
  ON manual_billing_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

-- Enhanced billing_batches
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'billing_batches' AND column_name = 'protocol') THEN
    ALTER TABLE billing_batches ADD COLUMN protocol text;
    ALTER TABLE billing_batches ADD COLUMN batch_status text DEFAULT 'created' CHECK (batch_status IN ('created', 'sent', 'accepted', 'error', 'completed'));
    ALTER TABLE billing_batches ADD COLUMN filter_criteria jsonb;
    ALTER TABLE billing_batches ADD COLUMN company_count integer DEFAULT 0;
    ALTER TABLE billing_batches ADD COLUMN error_details jsonb;
    ALTER TABLE billing_batches ADD COLUMN file_path text;
    ALTER TABLE billing_batches ADD COLUMN authorized boolean DEFAULT false;
    ALTER TABLE billing_batches ADD COLUMN authorized_by uuid REFERENCES users(id);
    ALTER TABLE billing_batches ADD COLUMN authorized_at timestamptz;
  END IF;
END $$;

-- Enhanced export_parameters
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'export_parameters' AND column_name = 'version') THEN
    ALTER TABLE export_parameters ADD COLUMN version integer DEFAULT 1;
    ALTER TABLE export_parameters ADD COLUMN sample_preview text;
    ALTER TABLE export_parameters ADD COLUMN validation_rules jsonb;
    ALTER TABLE export_parameters ADD COLUMN destination jsonb;
    ALTER TABLE export_parameters ADD COLUMN checksum_config jsonb;
  END IF;
END $$;

-- Billing Reviews
CREATE TABLE IF NOT EXISTS billing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  base_component decimal(12,2) DEFAULT 0,
  dependents_component decimal(12,2) DEFAULT 0,
  absent_component decimal(12,2) DEFAULT 0,
  penalties_component decimal(12,2) DEFAULT 0,
  adjustments_component decimal(12,2) DEFAULT 0,
  discounts_component decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) NOT NULL,
  component_details jsonb,
  origin_traces jsonb,
  review_status text DEFAULT 'pending' CHECK (review_status IN ('pending', 'in_review', 'reviewed', 'approved')),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  checklist jsonb,
  pending_items jsonb,
  drill_down_data jsonb,
  parameters_snapshot jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, reference_month)
);

ALTER TABLE billing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can manage reviews"
  ON billing_reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

-- Enhanced economic_groups
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'economic_groups' AND column_name = 'consolidation_rules') THEN
    ALTER TABLE economic_groups ADD COLUMN consolidation_rules jsonb;
    ALTER TABLE economic_groups ADD COLUMN allocation_rules jsonb;
    ALTER TABLE economic_groups ADD COLUMN inherited_rules jsonb;
    ALTER TABLE economic_groups ADD COLUMN responsible_user uuid REFERENCES users(id);
  END IF;
END $$;

-- Enhanced billing_alerts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'billing_alerts' AND column_name = 'threshold_config') THEN
    ALTER TABLE billing_alerts ADD COLUMN threshold_config jsonb;
    ALTER TABLE billing_alerts ADD COLUMN historical_comparison jsonb;
    ALTER TABLE billing_alerts ADD COLUMN expectation_data jsonb;
    ALTER TABLE billing_alerts ADD COLUMN acceptance_justification text;
    ALTER TABLE billing_alerts ADD COLUMN blocks_batch boolean DEFAULT false;
    ALTER TABLE billing_alerts ADD COLUMN escalated boolean DEFAULT false;
    ALTER TABLE billing_alerts ADD COLUMN escalated_at timestamptz;
    ALTER TABLE billing_alerts ADD COLUMN days_until_due integer;
  END IF;
END $$;

-- Billing Transactions (unified ledger)
CREATE TABLE IF NOT EXISTS billing_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reference_month date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('base', 'complement', 'penalty', 'adjustment', 'manual', 'discount')),
  component text NOT NULL,
  amount decimal(12,2) NOT NULL,
  origin_type text NOT NULL,
  origin_id uuid,
  origin_description text,
  version integer DEFAULT 1,
  justification text,
  created_by uuid REFERENCES users(id),
  reversed boolean DEFAULT false,
  reversed_at timestamptz,
  reversed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operational can view transactions"
  ON billing_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

CREATE POLICY "System can insert transactions"
  ON billing_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'operational'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_competency_status_month ON billing_competency_status(reference_month);
CREATE INDEX IF NOT EXISTS idx_calc_params_month ON calculation_parameters_versioned(reference_month);
CREATE INDEX IF NOT EXISTS idx_imports_month ON complementary_imports_v2(reference_month);
CREATE INDEX IF NOT EXISTS idx_manual_entries_month ON manual_billing_entries(reference_month);
CREATE INDEX IF NOT EXISTS idx_reviews_month ON billing_reviews(reference_month);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON billing_reviews(review_status) WHERE review_status IN ('pending', 'in_review');
CREATE INDEX IF NOT EXISTS idx_transactions_month ON billing_transactions(reference_month);
CREATE INDEX IF NOT EXISTS idx_transactions_company ON billing_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_alerts_blocks ON billing_alerts(blocks_batch) WHERE blocks_batch = true;
