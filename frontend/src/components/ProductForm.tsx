import { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../types/product';

interface ProductFormProps {
  product: Product | null;
  isOpen: boolean;
  onSubmit: (product: ProductFormData) => void;
  onClose: () => void;
  hourlyRate: number;
  wearTearPercentage: number;
  desiredMarkup: number;
  platformFees: number;
  filamentSpoolPrice: number;
}

const ProductForm = ({
  product,
  isOpen,
  onSubmit,
  onClose,
  hourlyRate,
  wearTearPercentage,
  desiredMarkup,
  platformFees,
  filamentSpoolPrice
}: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    business: 'Super Fantastic',
    filament_used: 0,
    print_prep_time: 0,
    post_processing_time: 0,
    additional_parts_cost: 0,
    list_price: 0,
    notes: ''
  });

  const [calculations, setCalculations] = useState({
    labor_cost: 0,
    filament_cost: 0,
    wear_tear_cost: 0,
    total_cost: 0,
    selling_price: 0,
    platform_fee_amount: 0,
    gross_profit: 0,
    profit_margin: 0,
    markup_price: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        business: product.business,
        filament_used: product.filament_used,
        print_prep_time: product.print_prep_time,
        post_processing_time: product.post_processing_time,
        additional_parts_cost: product.additional_parts_cost || 0,
        list_price: product.list_price || 0,
        notes: product.notes || ''
      });
    }
  }, [product]);

  useEffect(() => {
    calculateProfitMargin();
  }, [formData, hourlyRate, wearTearPercentage, desiredMarkup, platformFees, filamentSpoolPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (
      name === 'filament_used' ||
      name === 'print_prep_time' ||
      name === 'post_processing_time' ||
      name === 'additional_parts_cost' ||
      name === 'list_price'
    ) {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const calculateProfitMargin = () => {
    // Calculate labor cost
    const totalMinutes = formData.print_prep_time + formData.post_processing_time;
    const laborCost = (totalMinutes / 60) * hourlyRate;
    
    // Calculate filament cost
    const filamentCost = (formData.filament_used / 1000) * filamentSpoolPrice;
    
    // Calculate wear and tear cost
    const wearTearCost = filamentCost * (wearTearPercentage / 100);
    
    // Calculate total cost (including additional parts cost)
    const totalCost = laborCost + filamentCost + wearTearCost + formData.additional_parts_cost;
    
    // Calculate markup-based price (for display only)
    const markupPrice = totalCost * (1 + desiredMarkup / 100);
    
    // Use list_price if set, otherwise calculate from markup
    const sellingPrice = formData.list_price > 0 
      ? formData.list_price 
      : totalCost * (1 + desiredMarkup / 100);
    
    // Calculate platform fees
    const platformFeeAmount = sellingPrice * (platformFees / 100);
    
    // Calculate gross profit
    const grossProfit = sellingPrice - totalCost - platformFeeAmount;
    
    // Calculate profit margin
    const profitMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
    
    setCalculations({
      labor_cost: laborCost,
      filament_cost: filamentCost,
      wear_tear_cost: wearTearCost,
      total_cost: totalCost,
      selling_price: sellingPrice,
      platform_fee_amount: platformFeeAmount,
      gross_profit: grossProfit,
      profit_margin: profitMargin,
      markup_price: markupPrice
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border-2 border-black p-4 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4 bg-black text-white p-2">
          <h2 className="text-lg font-medium tracking-wider uppercase">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Business</label>
              <select
                name="business"
                value={formData.business}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                required
              >
                <option value="Super Fantastic">Super Fantastic</option>
                <option value="Cedar & Sail">Cedar & Sail</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Filament Used (grams)</label>
              <input
                type="number"
                name="filament_used"
                value={formData.filament_used}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                min="0"
                step="0.1"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Print Prep Time (minutes)</label>
              <input
                type="number"
                name="print_prep_time"
                value={formData.print_prep_time}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Post-Processing Time (minutes)</label>
              <input
                type="number"
                name="post_processing_time"
                value={formData.post_processing_time}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Additional Parts Cost ($)</label>
              <input
                type="number"
                name="additional_parts_cost"
                value={formData.additional_parts_cost}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                min="0"
                step="0.01"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Cost of additional parts required per piece</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">List Price ($)</label>
              <input
                type="number"
                name="list_price"
                value={formData.list_price}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">If set, this price will be used instead of calculating from markup</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="mt-1 block w-full border border-black rounded-none p-2 text-sm"
                rows={3}
              />
            </div>
            
            <div className="border-2 border-black p-4 mt-4">
              <h3 className="text-xs font-medium uppercase tracking-wider mb-2">Calculations</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-600 uppercase">Labor Cost:</span>
                  <p className="font-semibold">{formatCurrency(calculations.labor_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Filament Cost:</span>
                  <p className="font-semibold">{formatCurrency(calculations.filament_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Wear & Tear:</span>
                  <p className="font-semibold">{formatCurrency(calculations.wear_tear_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Additional Parts:</span>
                  <p className="font-semibold">{formatCurrency(formData.additional_parts_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Total Cost:</span>
                  <p className="font-semibold">{formatCurrency(calculations.total_cost)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Markup Price:</span>
                  <p className="font-semibold">{formatCurrency(calculations.markup_price)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Platform Fee:</span>
                  <p className="font-semibold">{formatCurrency(calculations.platform_fee_amount)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Gross Profit:</span>
                  <p className="font-semibold">{formatCurrency(calculations.gross_profit)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 uppercase">Profit Margin:</span>
                  <p className="font-semibold">{formatPercent(calculations.profit_margin)}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Using global settings: {formatPercent(desiredMarkup)} markup, {formatPercent(platformFees)} platform fees, ${filamentSpoolPrice.toFixed(2)}/kg filament</p>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-none border border-black uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-none border border-black uppercase tracking-wider"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 