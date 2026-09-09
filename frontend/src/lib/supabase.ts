import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  name: string;
  role: "citizen" | "official" | "dept_head" | "officer";
  department: string | null;
  created_at: string;
}

export interface Ticket {
  id: string;
  citizen_id: string;
  raw_text: string;
  photo_url: string | null;
  location: string | null;
  created_at: string;
}

export interface Issue {
  id: string;
  parent_ticket_id: string;
  department: string;
  issue_text: string;
  deadline: string | null;
  priority: "low" | "medium" | "high";
  assigned_officer_id: string | null;
  status: "new" | "assigned" | "in_progress" | "resolved" | "escalated";
  sla_deadline: string | null;
  resolution_photo_url: string | null;
  resolution_note: string | null;
  citizen_confirmed: boolean;
  citizen_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}
