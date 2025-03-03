import { useState } from 'react';
import { Part } from '../types/part';
import PartForm from './PartForm';

type SortField = 'name' | 'quantity' | 'supplier' | 'printers';
type SortDirection = 'asc' | 'desc';

interface PartListProps {
  parts: Part[];
  printers: { id: number; name: string }[];
  onUpdatePart: (part: Part) => void;
  onDeletePart: (id: number) => void;
}

const PartList = ({ parts, printers, onUpdatePart, onDeletePart }: PartListProps) => {
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const handleEditClick = (part: Part) => {
    setEditingPart(part);
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setIsEditModalOpen(false);
  };

  const handleSubmitEdit = (part: Part) => {
    onUpdatePart(part);
    setEditingPart(null);
    setIsEditModalOpen(false);
  };

  const sortedParts = [...parts]
    .filter(part => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        part.name.toLowerCase().includes(query) ||
        (part.description?.toLowerCase().includes(query) || false) ||
        (part.supplier?.toLowerCase().includes(query) || false) ||
        (part.part_number?.toLowerCase().includes(query) || false) ||
        // Search in all printers
        (part.printers?.some(printer => 
          printer.name.toLowerCase().includes(query)
        ) || false)
      );
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Special handling for printers to sort by printer names
      if (sortField === 'printers') {
        aValue = a.printers?.map(p => p.name).join(', ') || '';
        bValue = b.printers?.map(p => p.name).join(', ') || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <>
      {editingPart && (
        <PartForm
          isOpen={isEditModalOpen}
          part={editingPart}
          printers={printers}
          onSubmit={handleSubmitEdit}
          onClose={handleCancelEdit}
        />
      )}
      
      <div className="border-0 sm:border-2 sm:border-black">
        <div className="border-b-2 border-black px-0 sm:px-4 py-2">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col space-y-2 pt-0 px-3 sm:px-0 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-baseline sm:space-y-0 sm:space-x-4">
                  <h1 className="text-lg font-medium text-black tracking-wider">REPLACEMENT PARTS INVENTORY</h1>
                  <div className="flex flex-row space-y-0 space-x-2 text-xs">
                    <div className="flex">
                      <div className="bg-black text-white px-2 py-1 font-bold">PARTS</div>
                      <div className="border border-black px-2 py-1 font-mono tracking-wider">
                        {parts.length.toString().padStart(3, '0')}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="bg-black text-white px-2 py-1 font-bold">INVENTORY</div>
                      <div className="border border-black px-2 py-1 font-mono tracking-wider">
                        {parts.reduce((sum, p) => sum + p.quantity, 0).toString().padStart(3, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="QUERY PARTS DATABASE"
                    className="block w-full bg-white border-2 border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-sm pr-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-black">
            <thead className="bg-black">
              <tr>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('name')}
                >
                  Part Name {getSortIcon('name')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('quantity')}
                >
                  Inventory Count {getSortIcon('quantity')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('printers')}
                >
                  Printers {getSortIcon('printers')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('supplier')}
                >
                  Supplier {getSortIcon('supplier')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  Part Number
                </th>
                <th scope="col" className="relative py-3 px-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black">
              {sortedParts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    No parts found
                  </td>
                </tr>
              ) : (
                sortedParts.map(part => (
                  <tr 
                    key={part.id} 
                    className={`hover:bg-gray-50 ${part.quantity <= part.minimum_quantity ? 'bg-red-100' : ''}`}
                  >
                    <td className="px-3 py-2 text-sm font-medium text-black border-r-2 border-black">
                      {part.name}
                    </td>
                    <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                      {part.description || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdatePart({ ...part, quantity: Math.max(0, part.quantity - 1) })}
                          className="px-2 border border-black hover:bg-black hover:text-white"
                        >
                          -
                        </button>
                        <span className={`w-12 text-center ${part.quantity <= part.minimum_quantity ? 'text-red-600 font-bold' : ''}`}>
                          {part.quantity}
                        </span>
                        <button
                          onClick={() => onUpdatePart({ ...part, quantity: part.quantity + 1 })}
                          className="px-2 border border-black hover:bg-black hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                      {part.printers && part.printers.length > 0 
                        ? part.printers.map(printer => printer.name).join(', ')
                        : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                      {part.supplier || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                      {part.part_number || '-'}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(part)}
                          className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this part?')) {
                              onDeletePart(part.id!);
                            }
                          }}
                          className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PartList; 