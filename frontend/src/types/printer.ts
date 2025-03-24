export interface Printer {
    id?: number;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface PrintQueueItem {
    id?: number;
    item_name: string;
    printer_id?: number;
    color?: string;
    status: 'pending' | 'in_progress' | 'completed';
    position?: number;
    created_at?: string;
    updated_at?: string;
    printer?: Printer;
}

export type PrinterFormData = Omit<Printer, 'id' | 'created_at' | 'updated_at'>;
export type PrintQueueFormData = Omit<PrintQueueItem, 'id' | 'created_at' | 'updated_at' | 'printer'>; 