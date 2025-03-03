import { useState } from 'react';
import { Printer } from '../types/printer';
import PrinterForm from './PrinterForm';
import { API_URL } from '../config';

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

interface PrinterListProps {
  printers: Printer[];
  onUpdate: (printer: Printer) => void;
  onDelete: (id: number) => void;
  onAdd: (printer: Printer) => void;
}

const PrinterList = ({ printers, onUpdate, onDelete, onAdd }: PrinterListProps) => {
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return '○';
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  const handleEditClick = (printer: Printer) => {
    setEditingPrinter(printer);
    setEditName(printer.name);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingPrinter(null);
    setIsEditModalOpen(false);
    setError(null);
  };

  const handleSubmitEdit = async () => {
    if (!editingPrinter || !editName.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/api/printers/${editingPrinter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingPrinter, name: editName.trim() })
      });

      if (!response.ok) throw new Error('Failed to update printer');
      
      const updatedPrinter = await response.json();
      onUpdate(updatedPrinter);
      setEditingPrinter(null);
      setIsEditModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to update printer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this printer?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/printers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete printer');
      
      onDelete(id);
    } catch (err) {
      setError('Failed to delete printer');
    }
  };

  const handlePrinterAdded = (printer: Printer) => {
    onAdd(printer);
    setIsAddModalOpen(false);
  };

  // Filter and sort printers
  const filteredPrinters = printers.filter(printer => 
    printer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPrinters = [...filteredPrinters].sort((a, b) => {
    if (sortField === 'name') {
      const comparison = a.name.localeCompare(b.name);
      return sortDirection === 'asc' ? comparison : -comparison;
    }
    return 0;
  });

  return (
    <div className="bg-white border-2 border-black">
      <div className="p-4 bg-black text-white flex justify-between items-center">
        <h2 className="text-lg font-medium tracking-wider">PRINTERS</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider border border-black"
        >
          Add Printer
        </button>
      </div>

      <div className="p-4 border-b-2 border-black">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search printers..."
          className="w-full px-3 py-2 border-2 border-black text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-black">
          <thead className="bg-gray-100">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {getSortIcon('name')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-black">
            {sortedPrinters.length > 0 ? (
              sortedPrinters.map((printer) => (
                <tr key={printer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{printer.name}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(printer)}
                        className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDelete(printer.id!)}
                        className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-4 py-3 text-sm text-center text-gray-500">
                  No printers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black w-full max-w-md">
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <h2 className="text-lg font-medium tracking-wider">ADD PRINTER</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white">
                ✕
              </button>
            </div>
            <PrinterForm onPrinterAdded={handlePrinterAdded} />
          </div>
        </div>
      )}

      {isEditModalOpen && editingPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black w-full max-w-md">
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <h2 className="text-lg font-medium tracking-wider">EDIT PRINTER</h2>
              <button onClick={handleCancelEdit} className="text-white">
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter printer name"
                  className="w-full px-3 py-2 border-2 border-black text-sm"
                />
                <button
                  onClick={handleSubmitEdit}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider border border-black"
                >
                  Update Printer
                </button>
              </div>
            </div>
            {error && (
              <div className="p-4 border-t-2 border-black">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterList; 