import { Printer } from './printer';

export interface Part {
    id?: number;
    name: string;
    description?: string;
    quantity: number;
    minimum_quantity: number;
    printer_id?: number;
    supplier?: string;
    part_number?: string;
    price?: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    printer?: Printer;
}

export type PartFormData = Omit<Part, 'id' | 'created_at' | 'updated_at' | 'printer'>; 