import { useState, useEffect } from 'react'
import FilamentList from './components/FilamentList'
import FilamentForm from './components/FilamentForm'
import { Filament } from './types/filament'
import { API_URL } from './config'

function App() {
  const [filaments, setFilaments] = useState<Filament[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingFilament, setIsAddingFilament] = useState(false)

  useEffect(() => {
    fetchFilaments()
  }, [])

  const fetchFilaments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/filaments`)
      if (!response.ok) throw new Error('Failed to fetch filaments')
      const data = await response.json()
      setFilaments(data)
      setError(null)
    } catch (err) {
      setError('Failed to load filaments')
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 font-mono">
        <div className="text-black text-sm">INITIALIZING SIMS...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black border-2 border-black p-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline space-y-2 sm:space-y-0 sm:space-x-4">
                <h1 className="text-2xl font-medium tracking-wider text-white">SIMS TERMINAL v1.0</h1>
                <div className="text-xs text-gray-300">SPOOL INVENTORY MANAGEMENT SYSTEM</div>
              </div>
            </div>
            <button
              onClick={() => setIsAddingFilament(true)}
              className="w-full sm:w-auto px-4 py-2 border border-black rounded-none text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-1 focus:ring-black transition-colors uppercase tracking-wider"
            >
              NEW RECORD
            </button>
          </div>

          {error && (
            <div className="p-4 border-2 border-black bg-white text-black">
              <div className="text-xs font-medium uppercase tracking-wider mb-1">SIMS ERROR</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          <FilamentList
            filaments={filaments}
            onUpdate={handleUpdateFilament}
            onDelete={handleDeleteFilament}
          />

          {isAddingFilament && (
            <FilamentForm
              isOpen={isAddingFilament}
              onSubmit={handleAddFilament}
              onClose={() => setIsAddingFilament(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
