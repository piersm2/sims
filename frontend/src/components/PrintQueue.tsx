import { useState, useRef, useEffect } from 'react';
import { PrintQueueItem, Printer } from '../types/printer';
import { Filament } from '../types/filament';
import PrinterForm from './PrinterForm';

interface PrintQueueProps {
    items: PrintQueueItem[];
    printers: Printer[];
    filaments: Filament[];
    onAdd: (item: PrintQueueItem) => void;
    onUpdate: (item: PrintQueueItem) => void;
    onDelete: (id: number) => void;
}

export default function PrintQueue({ items, printers, filaments, onAdd, onUpdate, onDelete }: PrintQueueProps) {
    const [newItem, setNewItem] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState<number | undefined>();
    const [selectedColor, setSelectedColor] = useState('');
    const [colorSearch, setColorSearch] = useState('');
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const [showPrinterForm, setShowPrinterForm] = useState(false);
    const colorDropdownRef = useRef<HTMLDivElement>(null);

    // Get unique colors and their associated filaments
    const colorOptions = Array.from(
        new Set(filaments.map(f => f.color))
    ).map(color => {
        const filament = filaments.find(f => f.color === color);
        return {
            color,
            name: filament?.name || '',
            manufacturer: filament?.manufacturer || ''
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const filteredColors = colorOptions.filter(option => 
        option.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
        option.manufacturer.toLowerCase().includes(colorSearch.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
                setIsColorDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        setColorSearch('');
        setIsColorDropdownOpen(false);
    };

    const selectedFilament = filaments.find(f => f.color === selectedColor);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        onAdd({
            item_name: newItem.trim(),
            printer_id: selectedPrinter,
            color: selectedColor || undefined,
            status: 'pending'
        });

        setNewItem('');
        setSelectedPrinter(undefined);
        setSelectedColor('');
        setColorSearch('');
    };

    const handlePrinterAdded = () => {
        setShowPrinterForm(false);
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
                        <div className="relative" ref={colorDropdownRef}>
                            <div 
                                className="w-full px-3 py-2 border-2 border-black text-sm flex items-center cursor-pointer"
                                onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                            >
                                {selectedColor ? (
                                    <>
                                        <div 
                                            className="h-4 w-4 border border-black mr-2"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                        <span>{selectedFilament?.name}</span>
                                        <span className="text-gray-500 text-xs ml-2">• {selectedFilament?.manufacturer}</span>
                                    </>
                                ) : (
                                    <span className="text-gray-500">Select Filament (Optional)</span>
                                )}
                            </div>
                            {isColorDropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-lg max-h-64 overflow-y-auto">
                                    <input
                                        type="text"
                                        value={colorSearch}
                                        onChange={(e) => setColorSearch(e.target.value)}
                                        placeholder="Search filaments..."
                                        className="w-full px-3 py-2 border-b-2 border-black text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="divide-y divide-black">
                                        {filteredColors.map(({ color, name, manufacturer }) => (
                                            <div
                                                key={color}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                onClick={() => handleColorSelect(color)}
                                            >
                                                <div 
                                                    className="h-4 w-4 border border-black mr-2"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <div>
                                                    <div>{name}</div>
                                                    <div className="text-gray-500 text-xs">{manufacturer}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredColors.length === 0 && (
                                            <div className="px-3 py-2 text-gray-500 text-sm">
                                                No filaments found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
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
                                        {item.color && (
                                            <span className="flex items-center mt-1">
                                                Color: 
                                                <div
                                                    className="h-3 w-3 border border-black ml-1"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="ml-1">
                                                    {filaments.find(f => f.color === item.color)?.name || item.color}
                                                </span>
                                            </span>
                                        )}
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