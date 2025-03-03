import { Printer } from './printer';

export interface Part {
    id?: number;
    name: string;
    description?: string;
    quantity: number;
    minimum_quantity: number;
    supplier?: string;
    part_number?: string;
    price?: number;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    printers?: Printer[];
    printer_ids?: number[];
}

export type PartFormData = Omit<Part, 'id' | 'created_at' | 'updated_at' | 'printers'>; 