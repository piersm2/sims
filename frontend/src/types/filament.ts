export interface Filament {
    id?: number;
    name: string;
    material: string;
    color: string;
    color2?: string;
    color3?: string;
    quantity: number;
    minimum_quantity: number;
    minimum_quantity_override?: number | null;
    manufacturer?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    filament_usage_amount?: number;
    cost?: number; // Cost per kg in USD
}

export type FilamentFormData = Omit<Filament, 'id' | 'created_at' | 'updated_at'>;

export const MATERIAL_TYPES = [
    'ABS',
    'ABS-GF',
    'ASA',
    'PAHT-CF',
    'PC',
    'PETG',
    'PETG-CF',
    'PLA',
    'PLA+WOOD',
    'PVA',
    'TPU',
    'Other'
] as const;