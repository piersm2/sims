import { useState, useRef, useEffect } from 'react';
import { PurchaseListItem } from '../types/purchase';
import { Filament } from '../types/filament';
import { API_URL } from '../config';

interface PurchaseListProps {
    items: PurchaseListItem[];
    filaments: Filament[];
    onAdd: (item: PurchaseListItem) => void;
    onUpdate: (item: PurchaseListItem) => void;
    onDelete: (id: number) => void;
}

interface PurchaseItem {
  id: number;
  filament_id: number;
  quantity: number;
  notes?: string;
  ordered: boolean;
  created_at: string;
  updated_at: string;
  filament: Filament;
}

export default function PurchaseList({ items, filaments, onAdd, onUpdate, onDelete }: PurchaseListProps) {
    const [isFilamentDropdownOpen, setIsFilamentDropdownOpen] = useState(false);
    const [filamentSearch, setFilamentSearch] = useState('');
    const filamentDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filamentDropdownRef.current && !filamentDropdownRef.current.contains(event.target as Node)) {
                setIsFilamentDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredFilaments = filaments.filter(filament =>
        filament.name.toLowerCase().includes(filamentSearch.toLowerCase()) ||
        filament.manufacturer?.toLowerCase().includes(filamentSearch.toLowerCase())
    );

    const handleFilamentSelect = (filament: Filament) => {
        setIsFilamentDropdownOpen(false);
        onAdd({ 
            filament_id: filament.id!, 
            quantity: 1,
            ordered: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            filament: filament
        } as PurchaseListItem);
        setFilamentSearch('');
    };

    const handleToggleOrdered = async (item: PurchaseItem) => {
        try {
            console.log('Toggling ordered state for item:', item);
            const updatedItem = {
                ...item,
                ordered: !item.ordered
            };
            console.log('Sending update with data:', updatedItem);
            const response = await fetch(`${API_URL}/api/purchase-list/${item.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedItem),
            });
            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to update purchase item: ${errorText}`);
            }
            const updatedData = await response.json();
            console.log('Received updated data:', updatedData);
            onUpdate(updatedData);
        } catch (error) {
            console.error('Error updating purchase item:', error);
        }
    };

    return (
        <div className="bg-white border-2 border-black">
            <div className="p-4 bg-black text-white">
                <h2 className="text-lg font-medium tracking-wider">PURCHASE LIST</h2>
            </div>

            <div className="p-4">
                <div className="relative" ref={filamentDropdownRef}>
                    <div 
                        className="w-full px-3 py-2 border-2 border-black text-sm flex items-center cursor-pointer"
                        onClick={() => setIsFilamentDropdownOpen(!isFilamentDropdownOpen)}
                    >
                        <span className="text-gray-500">Add filament to purchase list</span>
                    </div>
                    {isFilamentDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-lg max-h-64 overflow-y-auto">
                            <input
                                type="text"
                                value={filamentSearch}
                                onChange={(e) => setFilamentSearch(e.target.value)}
                                placeholder="Search filaments..."
                                className="w-full px-3 py-2 border-b-2 border-black text-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="divide-y divide-black">
                                {filteredFilaments.map((filament) => (
                                    <div
                                        key={filament.id}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                        onClick={() => handleFilamentSelect(filament)}
                                    >
                                        <div 
                                            className="h-4 w-4 border border-black mr-2"
                                            style={{ backgroundColor: filament.color }}
                                        />
                                        <div>
                                            <div>{filament.name}</div>
                                            <div className="text-gray-500 text-xs">{filament.manufacturer}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredFilaments.length === 0 && (
                                    <div className="px-3 py-2 text-gray-500 text-sm">
                                        No filaments found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-2">
                    {Object.entries(
                        items.reduce((acc, item) => {
                            const filament = filaments.find(f => f.id === item.filament_id);
                            if (!filament) return acc;
                            
                            const manufacturer = filament.manufacturer || 'Uncategorized';
                            if (!acc[manufacturer]) {
                                acc[manufacturer] = [];
                            }
                            acc[manufacturer].push(item);
                            return acc;
                        }, {} as Record<string, typeof items>)
                    ).map(([manufacturer, manufacturerItems]) => (
                        <div key={manufacturer} className="space-y-2">
                            <div className="font-medium text-sm text-gray-500 uppercase tracking-wider px-2">
                                {manufacturer}
                            </div>
                            {manufacturerItems.map((item) => {
                                const filament = filaments.find(f => f.id === item.filament_id);
                                if (!filament) return null;

                                return (
                                    <div key={item.id} className="flex items-center justify-between border-2 border-black p-2">
                                        <div className="flex items-center space-x-2">
                                            <div 
                                                className="h-4 w-4 border border-black"
                                                style={{ backgroundColor: filament.color }}
                                            />
                                            <div>
                                                <div>{filament.name}</div>
                                                <div className="text-gray-500 text-xs">{filament.manufacturer}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onUpdate({ ...item, quantity: Math.max(1, item.quantity - 1) })}
                                                className="px-2 border border-black hover:bg-black hover:text-white"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdate({ ...item, quantity: item.quantity + 1 })}
                                                className="px-2 border border-black hover:bg-black hover:text-white"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleToggleOrdered(item as PurchaseItem)}
                                                className={`px-2 border text-xs font-bold uppercase tracking-wider ${
                                                    item.ordered 
                                                        ? 'border-green-600 text-green-600 hover:bg-green-50' 
                                                        : 'border-black text-black hover:bg-gray-50'
                                                }`}
                                            >
                                                {item.ordered ? '✓' : '○'}
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id!)}
                                                className="px-2 border border-black text-white bg-red-600 hover:bg-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 