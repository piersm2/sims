import { useState, useEffect } from 'react'
import FilamentList from './components/FilamentList'
import FilamentForm from './components/FilamentForm'
import PrintQueue from './components/PrintQueue'
import PurchaseList from './components/PurchaseList'
import PartList from './components/PartList'
import PrinterList from './components/PrinterList'
import { Filament } from './types/filament'
import { PrintQueueItem, Printer } from './types/printer'
import { PurchaseListItem } from './types/purchase'
import { Part } from './types/part'
import { API_URL } from './config'
import PartForm from './components/PartForm'

function App() {
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [printers, setPrinters] = useState<Printer[]>([])
  const [queueItems, setQueueItems] = useState<PrintQueueItem[]>([])
  const [purchaseItems, setPurchaseItems] = useState<PurchaseListItem[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingFilament, setIsAddingFilament] = useState(false)
  const [isAddingPart, setIsAddingPart] = useState(false)
  const [activeView, setActiveView] = useState<'filaments' | 'parts' | 'printers'>('filaments')

  useEffect(() => {
    Promise.all([
      fetchFilaments(),
      fetchPrinters(),
      fetchPrintQueue(),
      fetchPurchaseItems(),
      fetchParts()
    ]).finally(() => setIsLoading(false))
  }, [])

  const fetchFilaments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/filaments`)
      if (!response.ok) throw new Error('Failed to fetch filaments')
      const data = await response.json()
      setFilaments(data)
    } catch (err) {
      setError('Failed to load filaments')
    }
  }

  const fetchPrinters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/printers`)
      if (!response.ok) throw new Error('Failed to fetch printers')
      const data = await response.json()
      setPrinters(data)
    } catch (err) {
      setError('Failed to load printers')
    }
  }

  const fetchPrintQueue = async () => {
    try {
      const response = await fetch(`${API_URL}/api/print-queue`)
      if (!response.ok) throw new Error('Failed to fetch print queue')
      const data = await response.json()
      setQueueItems(data)
    } catch (err) {
      setError('Failed to load print queue')
    }
  }

  const fetchPurchaseItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/purchase-list`)
      if (!response.ok) throw new Error('Failed to fetch purchase items')
      const data = await response.json()
      setPurchaseItems(data)
    } catch (err) {
      setError('Failed to load purchase list')
    }
  }

  const fetchParts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/parts`)
      if (!response.ok) throw new Error('Failed to fetch parts')
      const data = await response.json()
      setParts(data)
    } catch (err) {
      setError('Failed to load parts')
    }
  }

  const handleAddFilament = async (filament: Filament) => {
    try {
      const response = await fetch(`${API_URL}/api/filaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filament)
      })
      if (!response.ok) throw new Error('Failed to add filament')
      await fetchFilaments()
      setIsAddingFilament(false)
      setError(null)
    } catch (err) {
      setError('Failed to add filament')
    }
  }

  const handleUpdateFilament = async (filament: Filament) => {
    try {
      const response = await fetch(`${API_URL}/api/filaments/${filament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filament)
      })
      if (!response.ok) throw new Error('Failed to update filament')
      await fetchFilaments()
      setError(null)
    } catch (err) {
      setError('Failed to update filament')
    }
  }

  const handleDeleteFilament = async (id: number) => {
    if (!confirm('Are you sure you want to delete this filament?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/filaments/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete filament')
      await fetchFilaments()
      setError(null)
    } catch (err) {
      setError('Failed to delete filament')
    }
  }

  const handleAddQueueItem = async (item: PrintQueueItem) => {
    try {
      const response = await fetch(`${API_URL}/api/print-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!response.ok) throw new Error('Failed to add queue item')
      await fetchPrintQueue()
      setError(null)
    } catch (err) {
      setError('Failed to add queue item')
    }
  }

  const handleUpdateQueueItem = async (item: PrintQueueItem) => {
    try {
      const response = await fetch(`${API_URL}/api/print-queue/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!response.ok) throw new Error('Failed to update queue item')
      await fetchPrintQueue()
      setError(null)
    } catch (err) {
      setError('Failed to update queue item')
    }
  }

  const handleDeleteQueueItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this queue item?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/print-queue/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete queue item')
      await fetchPrintQueue()
      setError(null)
    } catch (err) {
      setError('Failed to delete queue item')
    }
  }

  const handleAddPurchaseItem = async (item: PurchaseListItem) => {
    try {
      const response = await fetch(`${API_URL}/api/purchase-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!response.ok) throw new Error('Failed to add purchase item')
      await fetchPurchaseItems()
      setError(null)
    } catch (err) {
      setError('Failed to add purchase item')
    }
  }

  const handleUpdatePurchaseItem = async (item: PurchaseListItem) => {
    try {
      const response = await fetch(`${API_URL}/api/purchase-list/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!response.ok) throw new Error('Failed to update purchase item')
      await fetchPurchaseItems()
      setError(null)
    } catch (err) {
      setError('Failed to update purchase item')
    }
  }

  const handleDeletePurchaseItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase item?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/purchase-list/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete purchase item')
      await fetchPurchaseItems()
      setError(null)
    } catch (err) {
      setError('Failed to delete purchase item')
    }
  }

  const handleAddPart = async (part: Part) => {
    try {
      const response = await fetch(`${API_URL}/api/parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(part)
      })
      if (!response.ok) throw new Error('Failed to add part')
      await fetchParts()
      setError(null)
    } catch (err) {
      setError('Failed to add part')
    }
  }

  const handleUpdatePart = async (part: Part) => {
    try {
      const response = await fetch(`${API_URL}/api/parts/${part.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(part)
      })
      if (!response.ok) throw new Error('Failed to update part')
      await fetchParts()
      setError(null)
    } catch (err) {
      setError('Failed to update part')
    }
  }

  const handleDeletePart = async (id: number) => {
    if (!confirm('Are you sure you want to delete this part?')) return
    
    try {
      const response = await fetch(`${API_URL}/api/parts/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete part')
      await fetchParts()
      setError(null)
    } catch (err) {
      setError('Failed to delete part')
    }
  }

  const handleAddPrinter = async (printer: Printer) => {
    try {
      await fetchPrinters();
    } catch (err) {
      setError('Failed to refresh printers');
    }
  }

  const handleUpdatePrinter = async (printer: Printer) => {
    try {
      await fetchPrinters();
    } catch (err) {
      setError('Failed to refresh printers');
    }
  }

  const handleDeletePrinter = async (id: number) => {
    try {
      await fetchPrinters();
    } catch (err) {
      setError('Failed to refresh printers');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 font-mono">
        <div className="text-black text-sm">INITIALIZING SIMS...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white sm:p-8 font-mono">
      <div className="w-full">
        <div className="flex flex-col space-y-0 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black border-2 border-black p-4 space-y-4 sm:space-y-0">
            <div className="w-1/4">
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-4">
                <h1 className="text-2xl font-medium tracking-wider text-white">SIMS TERMINAL v1.0</h1>
                <div className="text-xs text-gray-300">SPOOL INVENTORY MANAGEMENT SYSTEM</div>
              </div>
            </div>
            <div className="flex justify-center w-1/2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveView('filaments')}
                  className={`w-auto px-4 py-2 border border-black rounded-none text-xs font-bold text-white ${activeView === 'filaments' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase tracking-wider`}
                >
                  FILAMENTS
                </button>
                <button
                  onClick={() => setActiveView('parts')}
                  className={`w-auto px-4 py-2 border border-black rounded-none text-xs font-bold text-white ${activeView === 'parts' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase tracking-wider`}
                >
                  PARTS
                </button>
                <button
                  onClick={() => setActiveView('printers')}
                  className={`w-auto px-4 py-2 border border-black rounded-none text-xs font-bold text-white ${activeView === 'printers' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase tracking-wider`}
                >
                  PRINTERS
                </button>
              </div>
            </div>
            <div className="w-1/4 flex justify-end">
              <div className="flex space-x-2">
                {activeView !== 'printers' && (
                  <button
                    onClick={() => activeView === 'parts' ? setIsAddingPart(true) : setIsAddingFilament(true)}
                    className="w-full sm:w-auto px-4 py-2 border border-black rounded-none text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase tracking-wider"
                  >
                    NEW {activeView === 'parts' ? 'PART' : 'RECORD'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 border-2 border-black bg-white text-black">
              <div className="text-xs font-medium uppercase tracking-wider mb-1">SIMS ERROR</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          {isAddingFilament && activeView === 'filaments' && (
            <FilamentForm
              isOpen={isAddingFilament}
              onSubmit={handleAddFilament}
              onClose={() => setIsAddingFilament(false)}
            />
          )}

          {isAddingPart && activeView === 'parts' && (
            <PartForm
              isOpen={isAddingPart}
              printers={printers.filter(p => p.id !== undefined) as { id: number; name: string }[]}
              onSubmit={(part) => {
                handleAddPart(part);
                setIsAddingPart(false);
              }}
              onClose={() => setIsAddingPart(false)}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              {activeView === 'parts' && (
                <PartList
                  parts={parts}
                  printers={printers.filter(p => p.id !== undefined) as { id: number; name: string }[]}
                  onAddPart={handleAddPart}
                  onUpdatePart={handleUpdatePart}
                  onDeletePart={handleDeletePart}
                />
              )}
              {activeView === 'filaments' && (
                <FilamentList
                  filaments={filaments}
                  onUpdate={handleUpdateFilament}
                  onDelete={handleDeleteFilament}
                />
              )}
              {activeView === 'printers' && (
                <PrinterList
                  printers={printers}
                  onUpdate={handleUpdatePrinter}
                  onDelete={handleDeletePrinter}
                  onAdd={handleAddPrinter}
                />
              )}
            </div>
            <div>
              <PrintQueue
                items={queueItems}
                printers={printers}
                filaments={filaments}
                onAdd={handleAddQueueItem}
                onUpdate={handleUpdateQueueItem}
                onDelete={handleDeleteQueueItem}
              />
              <div className="mt-4">
                <PurchaseList
                  items={purchaseItems}
                  filaments={filaments}
                  onAdd={handleAddPurchaseItem}
                  onUpdate={handleUpdatePurchaseItem}
                  onDelete={handleDeletePurchaseItem}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
