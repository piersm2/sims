import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useForm } from 'react-hook-form'
import { Part } from '../types/part'

interface PartFormProps {
  isOpen: boolean
  part?: Part
  printers: { id: number; name: string }[]
  onClose: () => void
  onSubmit: (data: Part) => void
}

export default function PartForm({ isOpen, part, printers, onClose, onSubmit }: PartFormProps) {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<Part>({
    defaultValues: {
      name: '',
      description: '',
      quantity: 1,
      minimum_quantity: 0,
      printer_ids: [],
      supplier: '',
      part_number: '',
      price: undefined,
      notes: ''
    }
  })

  // State to track selected printer IDs
  const [selectedPrinterIds, setSelectedPrinterIds] = useState<number[]>([]);
  
  useEffect(() => {
    if (part) {
      // Create a modified part object with printer_ids
      const modifiedPart = {
        ...part,
        printer_ids: part.printers?.map(printer => printer.id).filter((id): id is number => id !== undefined) || []
      };
      reset(modifiedPart);
      setSelectedPrinterIds(modifiedPart.printer_ids);
    } else {
      setSelectedPrinterIds([]);
    }
  }, [part, reset]);

  // Watch printer_ids to keep local state in sync
  const watchedPrinterIds = watch('printer_ids');
  
  useEffect(() => {
    if (watchedPrinterIds) {
      setSelectedPrinterIds(
        Array.isArray(watchedPrinterIds) 
          ? watchedPrinterIds.filter((id): id is number => typeof id === 'number')
          : []
      );
    }
  }, [watchedPrinterIds]);

  const onSubmitForm = (data: Part) => {
    // Ensure minimum_quantity is sent as a number
    const formattedData = {
      ...data,
      minimum_quantity: Number(data.minimum_quantity),
      quantity: Number(data.quantity),
      price: data.price ? Number(data.price) : undefined,
      printer_ids: selectedPrinterIds
    };
    onSubmit(formattedData);
    reset();
    setSelectedPrinterIds([]);
  }

  // Handle printer selection
  const handlePrinterToggle = (printerId: number) => {
    const updatedSelection = selectedPrinterIds.includes(printerId)
      ? selectedPrinterIds.filter(id => id !== printerId)
      : [...selectedPrinterIds, printerId];
    
    setSelectedPrinterIds(updatedSelection);
    setValue('printer_ids', updatedSelection);
  };

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
                  <div className="flex-1 py-2 sm:py-4 overflow-y-auto px-4 sm:px-6">
                    <div className="border-b-2 border-black pb-2">
                      <Dialog.Title className="text-lg font-medium text-black tracking-wider pr-8">
                        {part ? 'MODIFY EXISTING PART' : 'CREATE NEW PART'}
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

                    <form onSubmit={handleSubmit(onSubmitForm)} className="mt-4 sm:mt-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                            {'>>'} Part Name
                          </label>
                          <input
                            type="text"
                            autoComplete="off"
                            {...register('name', { required: 'Part name is required' })}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                          />
                          {errors.name && (
                            <p className="mt-2 text-xs text-red-600">! {errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                            {'>>'} Description
                          </label>
                          <input
                            type="text"
                            {...register('description')}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                              {'>>'} Quantity
                            </label>
                            <input
                              type="number"
                              {...register('quantity', { 
                                required: 'Quantity is required',
                                min: { value: 0, message: 'Minimum value is 0' }
                              })}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                            />
                            {errors.quantity && (
                              <p className="mt-2 text-xs text-red-600">! {errors.quantity.message}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                              {'>>'} Min Quantity
                            </label>
                            <input
                              type="number"
                              {...register('minimum_quantity', { 
                                required: 'Minimum quantity is required',
                                min: { value: 0, message: 'Minimum value is 0' }
                              })}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                            />
                            {errors.minimum_quantity && (
                              <p className="mt-2 text-xs text-red-600">! {errors.minimum_quantity.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                            {'>>'} Printers
                          </label>
                          <div className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black">
                            {printers.length === 0 ? (
                              <div className="text-gray-500">No printers available</div>
                            ) : (
                              <div className="space-y-2">
                                {printers.map(printer => (
                                  <div key={printer.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`printer-${printer.id}`}
                                      checked={selectedPrinterIds.includes(printer.id)}
                                      onChange={() => handlePrinterToggle(printer.id)}
                                      className="h-4 w-4 border-black rounded-none focus:ring-0"
                                    />
                                    <label htmlFor={`printer-${printer.id}`} className="ml-2 block text-sm">
                                      {printer.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Hidden input to register the field with react-hook-form */}
                            <input
                              type="hidden"
                              {...register('printer_ids')}
                              value={selectedPrinterIds.join(',')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                            {'>>'} Supplier
                          </label>
                          <input
                            type="text"
                            {...register('supplier')}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                              {'>>'} Part Number
                            </label>
                            <input
                              type="text"
                              {...register('part_number')}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                              {'>>'} Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register('price')}
                              className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-2 text-black placeholder-gray-500 text-base"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-black uppercase tracking-wider mb-1">
                            {'>>'} Additional Parameters
                          </label>
                          <textarea
                            {...register('notes')}
                            rows={3}
                            className="mt-1 block w-full bg-white border border-black rounded-none px-3 py-3 text-black text-base"
                          />
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-black text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors uppercase tracking-wider"
                        >
                          {part ? 'UPDATE' : 'CREATE'}
                        </button>
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