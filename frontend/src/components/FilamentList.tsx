import { useState } from 'react'
import { Filament } from '../types/filament'
import FilamentForm from './FilamentForm'

type SortField = 'name' | 'material' | 'quantity' | 'manufacturer' | 'minimum_quantity'
type SortDirection = 'asc' | 'desc'

interface FilamentListProps {
  filaments: Filament[]
  onUpdate: (filament: Filament) => void
  onDelete: (id: number) => void
}

// Convert hex to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate color similarity (0-100)
function getColorSimilarity(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;

  // Calculate Euclidean distance in RGB space
  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  // Convert distance to similarity percentage (max distance in RGB space is ~442)
  const similarity = Math.max(0, 100 - (distance / 442) * 100);
  return similarity;
}

export default function FilamentList({ filaments, onUpdate, onDelete }: FilamentListProps) {
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchColor, setSearchColor] = useState('')
  const [colorThreshold, setColorThreshold] = useState(85) // Default 85% similarity
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const onEdit = (filament: Filament) => {
    setEditingFilament(filament)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return '○'
    return sortDirection === 'asc' ? '▲' : '▼'
  }

  const sortedFilaments = [...filaments]
    .filter(filament => {
      const textMatch = 
        filament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filament.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filament.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!searchColor) return textMatch;

      // Check primary color similarity
      const primarySimilarity = getColorSimilarity(searchColor, filament.color);
      if (primarySimilarity >= colorThreshold) return true;

      // Check secondary color similarity if exists
      if (filament.color2) {
        const secondarySimilarity = getColorSimilarity(searchColor, filament.color2);
        if (secondarySimilarity >= colorThreshold) return true;
      }

      // Check tertiary color similarity if exists
      if (filament.color3) {
        const tertiarySimilarity = getColorSimilarity(searchColor, filament.color3);
        if (tertiarySimilarity >= colorThreshold) return true;
      }

      return false;
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

  return (
    <>
      {editingFilament && (
        <FilamentForm
          isOpen={!!editingFilament}
          filament={editingFilament}
          onSubmit={(updatedFilament: Filament) => {
            onUpdate(updatedFilament)
            setEditingFilament(null)
          }}
          onClose={() => setEditingFilament(null)}
        />
      )}
      <div className="border-0 sm:border-2 sm:border-black">
        <div className="border-b-2 border-black px-0 sm:px-4 py-2">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-col space-y-2 pt-0 px-3 sm:px-0 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-baseline sm:space-y-0 sm:space-x-4">
                  <h1 className="text-lg font-medium text-black tracking-wider">FILAMENT INVENTORY RECORDS</h1>
                  <div className="flex flex-row space-y-0 space-x-2 text-xs">
                    <div className="flex">
                      <div className="bg-black text-white px-2 py-1 font-bold">FILAMENTS</div>
                      <div className="border border-black px-2 py-1 font-mono tracking-wider">
                        {filaments.length.toString().padStart(3, '0')}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="bg-black text-white px-2 py-1 font-bold">INVENTORY</div>
                      <div className="border border-black px-2 py-1 font-mono tracking-wider">
                        {filaments.reduce((sum, f) => sum + f.quantity, 0).toString().padStart(3, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="QUERY SIMS DATABASE"
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
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={searchColor}
                      onChange={(e) => setSearchColor(e.target.value)}
                      className="block w-8 h-8 bg-white border border-black rounded-none p-0 cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"
                      title="Search by color"
                    />
                    {searchColor && (
                      <>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={colorThreshold}
                          onChange={(e) => setColorThreshold(Number(e.target.value))}
                          className="w-24"
                          title="Color similarity threshold"
                        />
                        <span className="text-xs font-mono">{colorThreshold}%</span>
                        <button
                          onClick={() => setSearchColor('')}
                          className="px-2 py-1 border border-black hover:bg-black hover:text-white text-sm"
                          title="Clear color search"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-black md:table hidden">
            <thead className="bg-black">
              <tr>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('name')}
                >
                  Record Name {getSortIcon('name')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('material')}
                >
                  Material Classification {getSortIcon('material')}
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
                  onClick={() => handleSort('minimum_quantity')}
                >
                  Minimum Quantity {getSortIcon('minimum_quantity')}
                </th>
                <th
                  scope="col"
                  className="py-3 px-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('manufacturer')}
                >
                  Manufacturer Data {getSortIcon('manufacturer')}
                </th>
                <th scope="col" className="relative py-3 px-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-black">
              {sortedFilaments.map((filament) => (
                <tr 
                  key={filament.id} 
                  className={`bg-white ${filament.quantity < (filament.minimum_quantity_override ?? filament.minimum_quantity) ? 'bg-red-200' : ''}`}
                >
                  <td className="px-3 py-2 text-sm font-medium text-black border-r-2 border-black">
                    <div className="flex items-center">
                      <div
                        className="h-6 w-6 border border-black mr-2 flex-shrink-0"
                        style={{ 
                          background: filament.color3 
                            ? `linear-gradient(to right, ${filament.color}, ${filament.color2 || filament.color}, ${filament.color3})`
                            : filament.color2
                              ? `linear-gradient(to right, ${filament.color}, ${filament.color2})`
                              : filament.color
                        }}
                      />
                      {filament.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                    {filament.material}
                  </td>
                  <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdate({ ...filament, quantity: Math.max(0, filament.quantity - 1) })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{filament.quantity}</span>
                      <button
                        onClick={() => onUpdate({ ...filament, quantity: filament.quantity + 1 })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: Math.max(0, (filament.minimum_quantity_override ?? filament.minimum_quantity) - 1) })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">
                        {filament.minimum_quantity_override ?? filament.minimum_quantity}
                      </span>
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: (filament.minimum_quantity_override ?? filament.minimum_quantity) + 1 })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: null })}
                        className="text-xs text-gray-500 hover:text-black"
                        title="Reset to automatic calculation"
                      >
                        ↺
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-black border-r-2 border-black">
                    {filament.manufacturer || '-'}
                  </td>
                  <td className="px-3 py-2 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(filament)}
                        className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this filament?')) {
                            onDelete(filament.id!)
                          }
                        }}
                        className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card view */}
          <div className="md:hidden divide-y divide-black">
            {sortedFilaments.map((filament) => (
              <div 
                key={filament.id} 
                className={`bg-white px-2 py-3 sm:p-4 space-y-3 ${filament.quantity < (filament.minimum_quantity_override ?? filament.minimum_quantity) ? 'bg-red-200' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-6 w-6 border border-black flex-shrink-0"
                      style={{ 
                        background: filament.color3 
                          ? `linear-gradient(to right, ${filament.color}, ${filament.color2 || filament.color}, ${filament.color3})`
                          : filament.color2
                            ? `linear-gradient(to right, ${filament.color}, ${filament.color2})`
                            : filament.color
                      }}
                    />
                    <span className="font-medium text-black">{filament.name}</span>
                  </div>
                  <div className="text-sm text-black">{filament.material}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-black">
                    <span className="text-gray-500 uppercase text-xs">Manufacturer:</span> {filament.manufacturer || '-'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdate({ ...filament, quantity: Math.max(0, filament.quantity - 1) })}
                      className="px-2 border border-black hover:bg-black hover:text-white"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm">{filament.quantity}</span>
                    <button
                      onClick={() => onUpdate({ ...filament, quantity: filament.quantity + 1 })}
                      className="px-2 border border-black hover:bg-black hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-black">
                    <span className="text-gray-500 uppercase text-xs">Minimum:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: Math.max(0, (filament.minimum_quantity_override ?? filament.minimum_quantity) - 1) })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">
                        {filament.minimum_quantity_override ?? filament.minimum_quantity}
                      </span>
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: (filament.minimum_quantity_override ?? filament.minimum_quantity) + 1 })}
                        className="px-2 border border-black hover:bg-black hover:text-white"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onUpdate({ ...filament, minimum_quantity_override: null })}
                        className="text-xs text-gray-500 hover:text-black"
                        title="Reset to automatic calculation"
                      >
                        ↺
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => onEdit(filament)}
                    className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this filament?')) {
                        onDelete(filament.id!)
                      }
                    }}
                    className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 