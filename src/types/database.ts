import type { Database } from './supabase';

// Extract table types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Specific types for your tables
export type Item = Tables<'Items'>;
export type Registration = Tables<'Registration'>;

// Insert and update types
export type ItemInsert = TablesInsert<'Items'>;
export type ItemUpdate = TablesUpdate<'Items'>;
export type RegistrationInsert = TablesInsert<'Registration'>;
export type RegistrationUpdate = TablesUpdate<'Registration'>;

// Legacy aliases (in case code still references Payment types)
export type Payment = Registration;
export type PaymentInsert = RegistrationInsert;
export type PaymentUpdate = RegistrationUpdate;
