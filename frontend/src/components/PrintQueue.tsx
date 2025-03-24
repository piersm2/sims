import { useState, useRef, useEffect } from 'react';
import { PrintQueueItem, Printer } from '../types/printer';
import { Filament } from '../types/filament';
import PrinterForm from './PrinterForm';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface PrintQueueProps {
    items: PrintQueueItem[];
    printers: Printer[];
    filaments: Filament[];
    onAdd: (item: PrintQueueItem) => void;
    onUpdate: (item: PrintQueueItem) => void;
    onDelete: (id: number) => void;
    onReorder: (items: PrintQueueItem[]) => void;
}

type DragItem = {
    index: number;
    id: number;
    type: string;
}

const ItemTypes = {
    QUEUE_ITEM: 'queueItem',
};

interface QueueItemProps {
    item: PrintQueueItem;
    filaments: Filament[];
    index: number;
    onUpdate: (item: PrintQueueItem) => void;
    onDelete: (id: number) => void;
    moveItem: (dragIndex: number, hoverIndex: number) => void;
}

const QueueItem = ({ item, filaments, index, onUpdate, onDelete, moveItem }: QueueItemProps) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.QUEUE_ITEM,
        item: () => ({ id: item.id, index, type: ItemTypes.QUEUE_ITEM }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    
    const [, drop] = useDrop({
        accept: ItemTypes.QUEUE_ITEM,
        hover: (draggedItem: DragItem, monitor) => {
            if (!ref.current) {
                return;
            }
            
            const dragIndex = draggedItem.index;
            const hoverIndex = index;
            
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();
            
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            
            // Get pixels to the top
            const hoverClientY = (clientOffset?.y ?? 0) - hoverBoundingRect.top;
            
            // Only perform the move when the mouse has crossed half of the item's height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            
            // Time to actually perform the action
            moveItem(dragIndex, hoverIndex);
            
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            draggedItem.index = hoverIndex;
        },
    });
    
    drag(drop(ref));
    
    return (
        <div 
            ref={ref} 
            className={`p-4 ${isDragging ? 'opacity-50 bg-gray-100' : ''}`}
            style={{ cursor: 'move' }}
        >
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
                        className="text-xs border border-black px-2 py-1 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:6px_6px] bg-[right_8px_center] bg-no-repeat pr-6"
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
    );
};

export default function PrintQueue({ items, printers, filaments, onAdd, onUpdate, onDelete, onReorder }: PrintQueueProps) {
    const [newItem, setNewItem] = useState('');
    const [selectedPrinter, setSelectedPrinter] = useState<number | undefined>();
    const [selectedColor, setSelectedColor] = useState('');
    const [colorSearch, setColorSearch] = useState('');
    const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
    const [showPrinterForm, setShowPrinterForm] = useState(false);
    const colorDropdownRef = useRef<HTMLDivElement>(null);
    const [queueItems, setQueueItems] = useState<PrintQueueItem[]>([]);

    // Update local state when props change
    useEffect(() => {
        setQueueItems(items);
    }, [items]);

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

    const moveItem = (dragIndex: number, hoverIndex: number) => {
        const dragItem = queueItems[dragIndex];
        const newItems = [...queueItems];
        newItems.splice(dragIndex, 1);
        newItems.splice(hoverIndex, 0, dragItem);
        
        setQueueItems(newItems);
    };

    // Trigger reorder API call when drops are completed
    useEffect(() => {
        // Only trigger if the queue items are different from the original items
        if (queueItems.length > 0 && 
            items.length > 0 && 
            JSON.stringify(queueItems.map(i => i.id)) !== JSON.stringify(items.map(i => i.id))) {
            onReorder(queueItems);
        }
    }, [queueItems]); // eslint-disable-line react-hooks/exhaustive-deps

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
                                className="flex-1 px-3 py-2 border-2 border-black text-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_12px_center] bg-no-repeat"
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

                <DndProvider backend={HTML5Backend} options={{ enableTouchEvents: true }}>
                    <div className="divide-y-2 divide-black">
                        {queueItems.map((item, index) => (
                            <QueueItem
                                key={item.id}
                                item={item}
                                filaments={filaments}
                                index={index}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                moveItem={moveItem}
                            />
                        ))}
                        {queueItems.length === 0 && (
                            <div className="p-4 text-sm text-gray-500">
                                No items in the print queue
                            </div>
                        )}
                    </div>
                </DndProvider>
            </div>

            {showPrinterForm && (
                <PrinterForm onPrinterAdded={handlePrinterAdded} />
            )}
        </div>
    );
} 