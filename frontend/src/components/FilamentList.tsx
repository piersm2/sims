import { useState } from 'react'
import { Filament } from '../types/filament'
import FilamentForm from './FilamentForm'

type SortField = 'name' | 'material' | 'quantity' | 'manufacturer'
type SortDirection = 'asc' | 'desc'

interface FilamentListProps {
  filaments: Filament[]
  onUpdate: (filament: Filament) => void
  onDelete: (id: number) => void
}

export default function FilamentList({ filaments, onUpdate, onDelete }: FilamentListProps) {
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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
    .filter(filament => 
      filament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filament.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      filament.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
      <div className="border-2 border-black">
        <div className="border-b-2 border-black px-4 py-2 pr-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-baseline space-x-4">
                <h1 className="text-lg font-medium text-black tracking-wider">FILAMENT INVENTORY RECORDS</h1>
                <div className="flex text-xs space-x-2">
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
            <div className="w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="QUERY SIMS DATABASE"
                className="block w-full bg-white border-2 border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-sm"
              />
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
                <tr key={filament.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-black border-r-2 border-black">
                    <div className="flex items-center">
                      <div
                        className="h-4 w-4 border border-black mr-2 flex-shrink-0"
                        style={{ backgroundColor: filament.color }}
                      />
                      {filament.name}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border-r-2 border-black">
                    {filament.material}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border-r-2 border-black">
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
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-black border-r-2 border-black">
                    {filament.manufacturer || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium border-r-1 border-black">
                    <button
                      onClick={() => onEdit(filament)}
                      className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider mr-2"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => onDelete(filament.id!)}
                      className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 