import { useState } from 'react';
import { PrintQueueItem, Printer } from '../types/printer';
import PrinterForm from './PrinterForm';

interface PrintQueueProps {
    items: PrintQueueItem[];
    printers: Printer[];
    onAdd: (item: PrintQueueItem) => void;
    onUpdate: (item: PrintQueueItem) => void;
    onDelete: (id: number) => void;
}

export default function PrintQueue({ items, printers, onAdd, onUpdate, onDelete }: PrintQueueProps) {
    const [newItem, setNewItem] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState<number | undefined>();
    const [showPrinterForm, setShowPrinterForm] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        onAdd({
            item_name: newItem.trim(),
            printer_id: selectedPrinter,
            status: 'pending'
        });

        setNewItem('');
        setSelectedPrinter(undefined);
    };

    const handlePrinterAdded = (printer: Printer) => {
        setShowPrinterForm(false);
        // The parent component will handle updating the printers list
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border-2 border-black">
                <div className="p-4 bg-black text-white">
                    <h2 className="text-lg font-medium tracking-wider">PRINT QUEUE</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-b-2 border-black">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder="Enter print item"
                            className="w-full px-3 py-2 border-2 border-black text-sm"
                        />
                        <div className="flex space-x-2">
                            <select
                                value={selectedPrinter || ''}
                                onChange={(e) => setSelectedPrinter(e.target.value ? Number(e.target.value) : undefined)}
                                className="flex-1 px-3 py-2 border-2 border-black text-sm"
                            >
                                <option value="">Select Printer (Optional)</option>
                                {printers.map((printer) => (
                                    <option key={printer.id} value={printer.id}>
                                        {printer.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowPrinterForm(true)}
                                className="px-2 py-1 border border-black text-xs hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider"
                        >
                            Add to Queue
                        </button>
                    </div>
                </form>

                <div className="divide-y-2 divide-black">
                    {items.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">{item.item_name}</div>
                                    <div className="text-sm text-gray-600">
                                        {item.printer ? `Printer: ${item.printer.name}` : 'No printer assigned'}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <select
                                        value={item.status}
                                        onChange={(e) => onUpdate({ ...item, status: e.target.value as PrintQueueItem['status'] })}
                                        className="text-xs border border-black px-2 py-1"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button
                                        onClick={() => item.id && onDelete(item.id)}
                                        className="text-xs border border-black px-2 py-1 hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">
                            No items in the print queue
                        </div>
                    )}
                </div>
            </div>

            {showPrinterForm && (
                <PrinterForm onPrinterAdded={handlePrinterAdded} />
            )}
        </div>
    );
} 