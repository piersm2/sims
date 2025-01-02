export interface Filament {
    id?: number;
    name: string;
    material: string;
    color: string;
    quantity: number;
    minimum_quantity: number;
    manufacturer?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
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