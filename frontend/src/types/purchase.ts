import { Filament } from './filament';

export interface PurchaseListItem {
    id?: number;
    filament_id: number;
    quantity: number;
    created_at?: string;
    updated_at?: string;
    filament?: Filament;
} 