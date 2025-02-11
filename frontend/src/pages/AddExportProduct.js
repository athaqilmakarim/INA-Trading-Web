import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportProductService } from '../services/ExportProductService';
import { toast } from 'react-toastify';
import {
  handleImageSelection,
  ImagePreview,
  UploadProgress,
  ImageUploadZone
} from '../utils/imageUtils';

const AddExportProduct = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [monthlyCapacity, setMonthlyCapacity] = useState('');
  const [monthlyCapacityUnit, setMonthlyCapacityUnit] = useState('KG');
  const [minOrderQuantity, setMinOrderQuantity] = useState('');
  const [minOrderUnit, setMinOrderUnit] = useState('KG');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [onlineStore, setOnlineStore] = useState('');

  const handleImageChange = useCallback((e) => {
    handleImageSelection(e.target.files, setImages, setPreviewUrls);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleImageSelection(e.dataTransfer.files, setImages, setPreviewUrls);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed', {
      icon: "🗑️"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let imageUrls = [];
      if (images.length > 0) {
        const uploadToast = toast.loading('Uploading images...', {
          position: "bottom-right"
        });

        // Upload images one by one and track progress
        for (const [index, image] of images.entries()) {
          try {
            const imageUrl = await exportProductService.uploadImage(image);
            imageUrls.push(imageUrl);
            
            // Update progress
            const progress = ((index + 1) / images.length) * 100;
            setUploadProgress(Math.min(Math.round(progress), 100));
            
            toast.update(uploadToast, {
              render: `Uploaded ${index + 1} of ${images.length} images`,
            });
          } catch (error) {
            console.error('Error uploading image:', error);
            toast.error(`Failed to upload ${image.name}: ${error.message}`);
          }
        }
        
        toast.dismiss(uploadToast);
      }

      // Determine the final category value
      const finalCategory = category === 'Other' ? 
        customCategory.charAt(0).toUpperCase() + customCategory.slice(1) : 
        category;

      await exportProductService.createExportProduct({
        name,
        description,
        category: finalCategory,
        price: {
          min: Number(priceMin),
          max: Number(priceMax),
          currency
        },
        monthlyCapacity: {
          quantity: Number(monthlyCapacity),
          unit: monthlyCapacityUnit
        },
        minOrder: {
          quantity: Number(minOrderQuantity),
          unit: minOrderUnit
        },
        images: imageUrls,
        onlineStore: onlineStore
      });

      toast.success('Export product added successfully!', {
        icon: "🎉",
        className: "animate-slideUp"
      });
      setSuccess(true);
      
      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setCustomCategory('');
      setPriceMin('');
      setPriceMax('');
      setCurrency('USD');
      setMonthlyCapacity('');
      setMonthlyCapacityUnit('KG');
      setMinOrderQuantity('');
      setMinOrderUnit('KG');
      setImages([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      setOnlineStore('');
    } catch (err) {
      toast.error(err.message || 'An error occurred', {
        className: "animate-slideDown"
      });
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Export Product</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select a category</option>
                      <option value="Textiles">Textiles</option>
                      <option value="Handicrafts">Handicrafts</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Food">Food</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {category === 'Other' && (
                    <div>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter category name"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Online Store URL</label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={onlineStore}
                    onChange={(e) => setOnlineStore(e.target.value)}
                    placeholder="Enter your online store URL (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Description</h2>
              <textarea
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
              />
            </div>

            {/* Price Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Price Range</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                    <option value="HKD">HKD - Hong Kong Dollar</option>
                    <option value="NZD">NZD - New Zealand Dollar</option>
                    <option value="SEK">SEK - Swedish Krona</option>
                    <option value="KRW">KRW - South Korean Won</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="NOK">NOK - Norwegian Krone</option>
                    <option value="MXN">MXN - Mexican Peso</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="RUB">RUB - Russian Ruble</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="TRY">TRY - Turkish Lira</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                    <option value="TWD">TWD - Taiwan Dollar</option>
                    <option value="DKK">DKK - Danish Krone</option>
                    <option value="PLN">PLN - Polish Zloty</option>
                    <option value="THB">THB - Thai Baht</option>
                    <option value="IDR">IDR - Indonesian Rupiah</option>
                    <option value="HUF">HUF - Hungarian Forint</option>
                    <option value="CZK">CZK - Czech Koruna</option>
                    <option value="ILS">ILS - Israeli Shekel</option>
                    <option value="CLP">CLP - Chilean Peso</option>
                    <option value="PHP">PHP - Philippine Peso</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="COP">COP - Colombian Peso</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="MYR">MYR - Malaysian Ringgit</option>
                    <option value="RON">RON - Romanian Leu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Price</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Capacity and Order Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Capacity & Orders</h2>
              <div className="grid grid-cols-1 gap-6">
                {/* Minimum Order */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Minimum Order</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={minOrderQuantity}
                        onChange={(e) => setMinOrderQuantity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={minOrderUnit}
                        onChange={(e) => setMinOrderUnit(e.target.value)}
                      >
                        <option value="KG">Kilogram (KG)</option>
                        <option value="M3">Cubic Meter (M³)</option>
                        <option value="CONTAINER_20">20ft Container</option>
                        <option value="CONTAINER_40">40ft Container</option>
                        <option value="CONTAINER_40HC">40ft HC Container</option>
                        <option value="PALLET">Pallet</option>
                        <option value="TON">Metric Ton</option>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="BOX">Box</option>
                        <option value="CARTON">Carton</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Monthly Capacity */}
                <div>
                  <div className="flex items-center space-x-1 mb-2">
                    <label className="block text-sm font-medium text-gray-700">Monthly Production Capacity</label>
                    <div className="relative group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                        Maximum amount the supplier can produce or supply per month
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={monthlyCapacity}
                        onChange={(e) => setMonthlyCapacity(e.target.value)}
                      />
                    </div>
                    <div>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        value={monthlyCapacityUnit}
                        onChange={(e) => setMonthlyCapacityUnit(e.target.value)}
                      >
                        <option value="KG">Kilogram (KG)</option>
                        <option value="M3">Cubic Meter (M³)</option>
                        <option value="CONTAINER_20">20ft Container</option>
                        <option value="CONTAINER_40">40ft Container</option>
                        <option value="CONTAINER_40HC">40ft HC Container</option>
                        <option value="PALLET">Pallet</option>
                        <option value="TON">Metric Ton</option>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="BOX">Box</option>
                        <option value="CARTON">Carton</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Product Images</h2>
              <ImageUploadZone
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onChange={handleImageChange}
              />

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <ImagePreview
                      key={index}
                      url={url}
                      index={index}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <UploadProgress progress={uploadProgress} />
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
                  </span>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExportProduct; 