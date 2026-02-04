export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          company_id: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: string
          company_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          company_id?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          cnpj: string
          corporate_name: string
          trade_name: string | null
          status: string
          contract_type: string | null
          convention: string | null
          economic_group_id: string | null
          auto_billing_enabled: boolean
          contact_email: string | null
          contact_phone: string | null
          address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cnpj: string
          corporate_name: string
          trade_name?: string | null
          status?: string
          contract_type?: string | null
          convention?: string | null
          economic_group_id?: string | null
          auto_billing_enabled?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cnpj?: string
          corporate_name?: string
          trade_name?: string | null
          status?: string
          contract_type?: string | null
          convention?: string | null
          economic_group_id?: string | null
          auto_billing_enabled?: boolean
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string
          cpf: string
          full_name: string
          registration_number: string | null
          category: string | null
          admission_date: string | null
          termination_date: string | null
          status: string
          salary: number | null
          work_location: string | null
          esocial_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          cpf: string
          full_name: string
          registration_number?: string | null
          category?: string | null
          admission_date?: string | null
          termination_date?: string | null
          status?: string
          salary?: number | null
          work_location?: string | null
          esocial_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          cpf?: string
          full_name?: string
          registration_number?: string | null
          category?: string | null
          admission_date?: string | null
          termination_date?: string | null
          status?: string
          salary?: number | null
          work_location?: string | null
          esocial_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      billing_rules: {
        Row: {
          id: string
          name: string
          convention: string | null
          work_location: string | null
          rule_type: string
          percentages: Json | null
          minimums: Json | null
          exceptions: Json | null
          valid_from: string
          valid_until: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          convention?: string | null
          work_location?: string | null
          rule_type: string
          percentages?: Json | null
          minimums?: Json | null
          exceptions?: Json | null
          valid_from: string
          valid_until?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          convention?: string | null
          work_location?: string | null
          rule_type?: string
          percentages?: Json | null
          minimums?: Json | null
          exceptions?: Json | null
          valid_from?: string
          valid_until?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          billing_batch_id: string | null
          invoice_number: string
          reference_month: string
          due_date: string
          amount: number
          status: string
          payment_date: string | null
          barcode: string | null
          calculation_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          billing_batch_id?: string | null
          invoice_number: string
          reference_month: string
          due_date: string
          amount: number
          status?: string
          payment_date?: string | null
          barcode?: string | null
          calculation_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          billing_batch_id?: string | null
          invoice_number?: string
          reference_month?: string
          due_date?: string
          amount?: number
          status?: string
          payment_date?: string | null
          barcode?: string | null
          calculation_details?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          alert_type: string
          severity: string
          company_id: string | null
          reference_month: string | null
          title: string
          description: string | null
          alert_data: Json | null
          status: string
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alert_type: string
          severity?: string
          company_id?: string | null
          reference_month?: string | null
          title: string
          description?: string | null
          alert_data?: Json | null
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alert_type?: string
          severity?: string
          company_id?: string | null
          reference_month?: string | null
          title?: string
          description?: string | null
          alert_data?: Json | null
          status?: string
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
      }
    }
  }
}
