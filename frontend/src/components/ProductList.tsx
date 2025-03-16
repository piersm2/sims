import { useState, useEffect } from 'react';
import { Product, ProductWithCalculations } from '../types/product';
import { API_URL } from '../config';
import ProductForm from './ProductForm';

interface ProductListProps {
  products: ProductWithCalculations[];
  onUpdate: (product: Product) => void;
  onDelete: (id: number) => void;
  hourlyRate: number;
  wearTearPercentage: number;
  desiredMarkup?: number;
  platformFees?: number;
  filamentSpoolPrice?: number;
  onUpdateSettings?: (settings: any) => void;
}

interface Settings {
  spool_weight: number;
  filament_markup: number;
  hourly_rate: number;
  wear_tear_markup: number;
  desired_markup: number;
  platform_fees: number;
  filament_spool_price: number;
  [key: string]: number;
}

const ProductList = ({
  products,
  onUpdate,
  onDelete,
  hourlyRate,
  wearTearPercentage,
  desiredMarkup = 0,
  platformFees = 0,
  filamentSpoolPrice = 18,
  onUpdateSettings
}: ProductListProps) => {
  const [sortField, setSortField] = useState<keyof ProductWithCalculations>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterBusiness, setFilterBusiness] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    spool_weight: 1000,
    filament_markup: 20,
    hourly_rate: hourlyRate,
    wear_tear_markup: wearTearPercentage,
    desired_markup: desiredMarkup,
    platform_fees: platformFees,
    filament_spool_price: filamentSpoolPrice
  });

  // Update local settings when props change
  useEffect(() => {
    setSettings({
      ...settings,
      hourly_rate: hourlyRate,
      wear_tear_markup: wearTearPercentage,
      desired_markup: desiredMarkup || 0,
      platform_fees: platformFees || 0,
      filament_spool_price: filamentSpoolPrice || 18
    });
  }, [hourlyRate, wearTearPercentage, desiredMarkup, platformFees, filamentSpoolPrice]);

  const handleSort = (field: keyof ProductWithCalculations) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof ProductWithCalculations) => {
    if (field !== sortField) return '○';
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  const filteredProducts = products
    .filter(product => !filterBusiness || product.business === filterBusiness)
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });

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

  const handleEdit = async (product: Product) => {
    try {
      // Fetch the product with its filaments
      const response = await fetch(`${API_URL}/api/products/${product.id}`);
      if (!response.ok) throw new Error('Failed to fetch product details');
      
      const productWithFilaments = await response.json();
      
      // Set the product with filaments for editing
      setEditingProduct(productWithFilaments);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback to using the product without filaments
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (productData: any) => {
    // Make sure we're passing the complete product with filaments to the update function
    const updatedProduct = {
      ...productData,
      // Ensure the ID is preserved
      id: editingProduct?.id
    };
    
    onUpdate(updatedProduct);
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleSettingsChange = (key: keyof Settings, value: number) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const handleSaveSettings = () => {
    // Save settings if the callback is provided
    if (onUpdateSettings) {
      onUpdateSettings(settings);
    }
    // Close the modal
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="border-0 sm:border-2 sm:border-black w-full">
      {isEditModalOpen && editingProduct && (
        <ProductForm
          isOpen={isEditModalOpen}
          product={editingProduct}
          onSubmit={handleEditSubmit}
          onClose={() => setIsEditModalOpen(false)}
          hourlyRate={hourlyRate}
          wearTearPercentage={wearTearPercentage}
          desiredMarkup={desiredMarkup}
          platformFees={platformFees}
          filamentSpoolPrice={filamentSpoolPrice}
        />
      )}

      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black w-full max-w-2xl">
            <div className="p-4 bg-black text-white flex justify-between items-center">
              <h2 className="text-lg font-medium tracking-wider">PROFIT MARGIN SETTINGS</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-white">
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Spool Weight (g):</div>
                  <input
                    type="number"
                    value={settings.spool_weight}
                    onChange={(e) => handleSettingsChange('spool_weight', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Filament Markup (%):</div>
                  <input
                    type="number"
                    value={settings.filament_markup}
                    onChange={(e) => handleSettingsChange('filament_markup', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Hourly Rate ($):</div>
                  <input
                    type="number"
                    value={settings.hourly_rate}
                    onChange={(e) => handleSettingsChange('hourly_rate', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Wear & Tear (%):</div>
                  <input
                    type="number"
                    value={settings.wear_tear_markup}
                    onChange={(e) => handleSettingsChange('wear_tear_markup', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Desired Markup (%):</div>
                  <input
                    type="number"
                    value={settings.desired_markup}
                    onChange={(e) => handleSettingsChange('desired_markup', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Platform Fees (%):</div>
                  <input
                    type="number"
                    value={settings.platform_fees}
                    onChange={(e) => handleSettingsChange('platform_fees', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Filament Spool Price ($):</div>
                  <input
                    type="number"
                    value={settings.filament_spool_price}
                    onChange={(e) => handleSettingsChange('filament_spool_price', parseFloat(e.target.value) || 0)}
                    className="border border-black rounded-none text-xs p-1 w-16"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-2 border border-black text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors uppercase tracking-wider"
                >
                  SAVE SETTINGS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b-2 border-black px-0 sm:px-4 py-2">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-2 pt-0 px-3 sm:px-0 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col space-y-1 sm:flex-row sm:items-baseline sm:space-y-0 sm:space-x-4">
                <div className="flex items-center">
                  <h1 className="text-lg font-medium text-black tracking-wider">PRODUCT INVENTORY RECORDS</h1>
                  <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded-full"
                    title="Profit Margin Settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-row space-y-0 space-x-2 text-xs">
                  <div className="flex">
                    <div className="bg-black text-white px-2 py-1 font-bold">PRODUCTS</div>
                    <div className="border border-black px-2 py-1 font-mono tracking-wider">
                      {products.length.toString().padStart(3, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="text-xs uppercase tracking-wider">Filter by Business:</div>
                  <select
                    className="border border-black rounded-none text-xs p-1"
                    value={filterBusiness}
                    onChange={(e) => setFilterBusiness(e.target.value)}
                  >
                    <option value="">All Businesses</option>
                    <option value="Super Fantastic">Super Fantastic</option>
                    <option value="Cedar & Sail">Cedar & Sail</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-black">
          <thead className="bg-black">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                Name {getSortIcon('name')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('business')}>
                Business {getSortIcon('business')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('filament_used')}>
                Filament {getSortIcon('filament_used')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Filaments
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('labor_cost')}>
                Labor {getSortIcon('labor_cost')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('filament_cost')}>
                Filament Cost {getSortIcon('filament_cost')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total_cost')}>
                Total Cost {getSortIcon('total_cost')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('additional_parts_cost')}>
                Parts Cost {getSortIcon('additional_parts_cost')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('list_price')}>
                List Price {getSortIcon('list_price')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('gross_profit')}>
                Gross Profit {getSortIcon('gross_profit')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" onClick={() => handleSort('profit_margin')}>
                Profit Margin {getSortIcon('profit_margin')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-black">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{product.name}</td>
                <td className="px-4 py-3 text-sm">{product.business}</td>
                <td className="px-4 py-3 text-sm">{product.filament_used}g</td>
                <td className="px-4 py-3 text-sm">
                  {product.filaments && product.filaments.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {product.filaments.map(filament => (
                        <div 
                          key={filament.id} 
                          className="h-4 w-4 border border-black cursor-help"
                          style={{ backgroundColor: filament.color }}
                          title={`${filament.name} - ${filament.material} - ${filament.color}${filament.manufacturer ? ` - ${filament.manufacturer}` : ''}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.labor_cost)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.filament_cost)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.total_cost)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.additional_parts_cost)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.list_price)}</td>
                <td className="px-4 py-3 text-sm">{formatCurrency(product.gross_profit)}</td>
                <td className="px-4 py-3 text-sm">{formatPercent(product.profit_margin)}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-1 border border-black text-xs font-bold text-black bg-white hover:bg-gray-200 transition-colors uppercase tracking-wider"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => onDelete(product.id!)}
                      className="px-4 py-1 border border-black text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors uppercase tracking-wider"
                    >
                      DELETE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-3 text-sm text-center text-gray-500">
                  No products found. Add a product to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList; 