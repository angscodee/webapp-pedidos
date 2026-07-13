// Firebase reemplazado por Supabase.
// Este archivo se mantiene para compatibilidad con imports existentes.
import { hasSupabaseCredentials } from './supabase';

export const isMockMode = !hasSupabaseCredentials;
export const app = null;
export const auth = null;
export const db = null;
export const storage = null;
