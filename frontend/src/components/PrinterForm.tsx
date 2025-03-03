import { useState } from 'react';
import { Printer } from '../types/printer';
import { API_URL } from '../config';

interface PrinterFormProps {
    onPrinterAdded: (printer: Printer) => void;
}

export default function PrinterForm({ onPrinterAdded }: PrinterFormProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/printers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() })
            });

            if (!response.ok) throw new Error('Failed to add printer');
            
            const newPrinter = await response.json();
            onPrinterAdded(newPrinter);
            setName('');
            setError(null);
        } catch (err) {
            setError('Failed to add printer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter printer name"
                        className="w-full px-3 py-2 border-2 border-black text-sm"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider border border-black"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Printer'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="p-4 border-t-2 border-black">
                    <div className="text-sm text-red-600">{error}</div>
                </div>
            )}
        </div>
    );
} 