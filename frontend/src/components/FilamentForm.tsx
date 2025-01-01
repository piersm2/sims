import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { Filament, FilamentFormData, MATERIAL_TYPES, COMMON_DIAMETERS } from '../types/filament'
import { API_URL } from '../config'

interface FilamentFormProps {
  isOpen: boolean
  filament?: Filament
  onClose: () => void
  onSubmit: (data: FilamentFormData) => void
}

export default function FilamentForm({ isOpen, filament, onClose, onSubmit }: FilamentFormProps) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FilamentFormData>({
    defaultValues: {
      name: '',
      material: 'PLA',
      color: '#000000',
      diameter: 1.75,
      quantity: 0,
      manufacturer: '',
      notes: ''
    }
  })

  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [filteredManufacturers, setFilteredManufacturers] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const manufacturerValue = watch('manufacturer')

  useEffect(() => {
    if (filament) {
      reset(filament)
    }
  }, [filament, reset])

  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/manufacturers`)
        if (!response.ok) throw new Error('Failed to fetch manufacturers')
        const data = await response.json()
        setManufacturers(data)
      } catch (error) {
        console.error('Failed to fetch manufacturers:', error)
      }
    }
    fetchManufacturers()
  }, [])

  useEffect(() => {
    if (manufacturerValue) {
      const filtered = manufacturers.filter(m => 
        m.toLowerCase().includes(manufacturerValue.toLowerCase()) &&
        m.toLowerCase() !== manufacturerValue.toLowerCase()
      )
      setFilteredManufacturers(filtered)
    } else {
      setFilteredManufacturers([])
    }
  }, [manufacturerValue, manufacturers])

  const onSubmitForm = (data: FilamentFormData) => {
    onSubmit(data)
    reset()
  }

  const handleManufacturerSelect = (manufacturer: string) => {
    setValue('manufacturer', manufacturer)
    setShowSuggestions(false)
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-hidden z-50 font-mono" onClose={onClose}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white border-l-2 border-black overflow-y-scroll">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="border-b-2 border-black pb-3">
                      <div className="text-xs text-right mb-1 text-gray-600">SIMS FORM</div>
                      <Dialog.Title className="text-lg font-medium text-black tracking-wider">
                        {filament ? 'MODIFY EXISTING RECORD' : 'CREATE NEW RECORD'}
                      </Dialog.Title>
                      <div className="text-xs mt-1 text-gray-600">
                        SIMS DATABASE MANAGEMENT INTERFACE
                      </div>
                      <button
                        type="button"
                        className="absolute top-4 right-4 text-gray-600 hover:text-black transition-colors"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        X
                      </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitForm)} className="mt-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Record Name
                          </label>
                          <input
                            type="text"
                            {...register('name', { required: 'Record name is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-sm"
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-600">! {errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Material Classification
                          </label>
                          <select
                            {...register('material', { required: 'Material classification is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black text-sm"
                          >
                            {MATERIAL_TYPES.map((material) => (
                              <option key={material} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Color Reference
                          </label>
                          <input
                            type="color"
                            {...register('color', { required: 'Color reference is required' })}
                            className="mt-1 block w-full h-10 bg-white border border-black rounded-none p-1 text-black text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Diameter Parameter
                          </label>
                          <select
                            {...register('diameter', { required: 'Diameter parameter is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black text-sm"
                          >
                            {COMMON_DIAMETERS.map((diameter) => (
                              <option key={diameter} value={diameter}>
                                {diameter}mm
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Inventory Count
                          </label>
                          <input
                            type="number"
                            {...register('quantity', {
                              required: 'Inventory count is required',
                              min: { value: 0, message: 'Count must be non-negative' }
                            })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black text-sm"
                          />
                          {errors.quantity && (
                            <p className="mt-1 text-xs text-red-600">! {errors.quantity.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Manufacturer Data
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              {...register('manufacturer')}
                              onFocus={() => setShowSuggestions(true)}
                              onBlur={() => {
                                // Delay hiding suggestions to allow clicking them
                                setTimeout(() => setShowSuggestions(false), 200)
                              }}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-sm"
                            />
                            {showSuggestions && filteredManufacturers.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-lg max-h-48 overflow-auto">
                                {filteredManufacturers.map((manufacturer) => (
                                  <div
                                    key={manufacturer}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                    onMouseDown={() => handleManufacturerSelect(manufacturer)}
                                  >
                                    {manufacturer}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider">
                            {'>>'} Additional Parameters
                          </label>
                          <textarea
                            {...register('notes')}
                            rows={3}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black text-sm"
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t-2 border-black">
                          <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border-2 border-black rounded-none text-xs font-medium text-black bg-white hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors uppercase tracking-wider"
                          >
                            [X] TERMINATE
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 border-2 border-black rounded-none text-xs font-medium text-white bg-black hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors uppercase tracking-wider"
                          >
                            {filament ? '[+] UPDATE' : '[+] CREATE'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 