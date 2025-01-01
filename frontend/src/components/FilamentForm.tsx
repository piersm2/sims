import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { Filament, FilamentFormData, MATERIAL_TYPES } from '../types/filament'
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
      quantity: 1,
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

          <div className="fixed inset-y-0 right-0 max-w-full flex sm:pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-full sm:max-w-md">
                <div className="h-full flex flex-col bg-white border-l-2 border-black overflow-y-scroll">
                  <div className="flex-1 py-4 sm:py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="border-b-2 border-black pb-3">
                      <Dialog.Title className="text-lg font-medium text-black tracking-wider pr-8">
                        {filament ? 'MODIFY EXISTING RECORD' : 'CREATE NEW RECORD'}
                      </Dialog.Title>
                      <div className="text-xs mt-1 text-gray-600">
                        SIMS DATABASE MANAGEMENT INTERFACE
                      </div>
                      <button
                        type="button"
                        className="absolute top-4 right-4 text-gray-600 hover:text-black transition-colors w-8 h-8 flex items-center justify-center"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        X
                      </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitForm)} className="mt-6 sm:mt-8">
                      <div className="space-y-5 sm:space-y-6">
                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Record Name
                          </label>
                          <input
                            type="text"
                            {...register('name', { required: 'Record name is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black placeholder-gray-500 text-base"
                          />
                          {errors.name && (
                            <p className="mt-2 text-xs text-red-600">! {errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Material Classification
                          </label>
                          <select
                            {...register('material', { required: 'Material classification is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black text-base appearance-none"
                          >
                            {MATERIAL_TYPES.map((material) => (
                              <option key={material} value={material}>
                                {material}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Color Reference
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              {...register('color', { required: 'Color reference is required' })}
                              onChange={(e) => setValue('color', e.target.value.toUpperCase())}
                              className="block w-16 h-16 bg-white border border-black rounded-none p-1 text-black"
                            />
                            <input
                              type="text"
                              {...register('color')}
                              className="flex-1 block bg-white border border-black rounded-none px-3 py-3 text-black text-base uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Inventory Count
                          </label>
                          <input
                            type="number"
                            {...register('quantity', {
                              required: 'Inventory count is required',
                              min: { value: 0, message: 'Count must be positive' }
                            })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black text-base"
                          />
                          {errors.quantity && (
                            <p className="mt-2 text-xs text-red-600">! {errors.quantity.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Manufacturer Data
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              {...register('manufacturer')}
                              onFocus={() => setShowSuggestions(true)}
                              onBlur={() => {
                                setTimeout(() => setShowSuggestions(false), 200)
                              }}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black placeholder-gray-500 text-base"
                            />
                            {showSuggestions && filteredManufacturers.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-lg max-h-60 overflow-auto">
                                {filteredManufacturers.map((manufacturer) => (
                                  <div
                                    key={manufacturer}
                                    className="px-4 py-3 text-base cursor-pointer hover:bg-gray-100 active:bg-gray-200"
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
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-2">
                            {'>>'} Additional Parameters
                          </label>
                          <textarea
                            {...register('notes')}
                            rows={1}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black text-base"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 mt-6 border-t-2 border-black">
                          <button
                            type="submit"
                            className="w-full px-6 py-3 border-2 border-black rounded-none text-sm font-medium text-white bg-black hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors uppercase tracking-wider"
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