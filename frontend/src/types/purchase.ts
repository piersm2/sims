import { Filament } from './filament';

export interface PurchaseListItem {
    id: number;
    filament_id: number;
    quantity: number;
    notes?: string;
    ordered: boolean;
    created_at: string;
    updated_at: string;
    filament: Filament;
} 