import { Filament } from './filament';

export interface Product {
  id?: number;
  name: string;
  business: 'Super Fantastic' | 'Cedar & Sail';
  filament_used: number; // in grams
  print_prep_time: number; // in minutes
  post_processing_time: number; // in minutes
  additional_parts_cost: number; // cost of additional parts per piece
  list_price: number; // manually set price
  notes?: string;
  created_at?: string;
  updated_at?: string;
  filaments?: Filament[]; // Associated filaments
}

export interface ProductCalculations {
  labor_cost: number;
  filament_cost: number;
  wear_tear_cost: number;
  total_cost: number;
  selling_price: number;
  platform_fee_amount: number;
  gross_profit: number;
  profit_margin: number;
}

export type ProductWithCalculations = Product & ProductCalculations;

export interface ProductFormData {
  name: string;
  business: 'Super Fantastic' | 'Cedar & Sail';
  filament_used: number;
  print_prep_time: number;
  post_processing_time: number;
  additional_parts_cost: number;
  list_price: number;
  notes: string;
} 