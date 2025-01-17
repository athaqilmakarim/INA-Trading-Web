import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exportProductService } from '../services/ExportProductService';
import { toast } from 'react-toastify';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import {
  handleImageSelection,
  ImagePreview,
  UploadProgress,
  ImageUploadZone
} from '../utils/imageUtils';

const EditExportProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await exportProductService.getExportProductById(id);
        if (!product) {
          setError('Product not found');
          return;
        }

        // Set form data
        setName(product.name);
        setDescription(product.description);
        setCategory(product.category);
        if (product.price) {
          setPriceMin(product.price.min.toString());
          setPriceMax(product.price.max.toString());
          setCurrency(product.price.currency);
        }
        if (product.monthlyCapacity) {
          setMonthlyCapacity(product.monthlyCapacity.quantity.toString());
          setMonthlyCapacityUnit(product.monthlyCapacity.unit);
        }
        if (product.minOrder) {
          setMinOrderQuantity(product.minOrder.quantity.toString());
          setMinOrderUnit(product.minOrder.unit);
        }
        if (product.images) {
          setExistingImages(product.images);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Existing image removed', {
      icon: "🗑️"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      let imageUrls = [...existingImages];
      if (images.length > 0) {
        const uploadToast = toast.loading('Uploading new images...', {
          position: "bottom-right"
        });

        // Upload new images
        for (const [index, image] of images.entries()) {
          try {
            const imageUrl = await exportProductService.uploadImage(image);
            imageUrls.push(imageUrl);
            
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

      // Get the current product to compare images
      const currentProduct = await exportProductService.getExportProductById(id);
      const imagesToDelete = currentProduct.images?.filter(url => !existingImages.includes(url)) || [];

      // Delete removed images from storage
      for (const imageUrl of imagesToDelete) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      await exportProductService.updateExportProduct(id, {
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
        images: imageUrls
      });

      toast.success('Export product updated successfully!', {
        icon: "🎉",
        className: "animate-slideUp"
      });
      
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'An error occurred', {
        className: "animate-slideDown"
      });
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Export Product</h1>
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
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {existingImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Existing ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Images</h3>
                <ImageUploadZone
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onChange={handleImageChange}
                />

                {/* Image Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Saving...'}
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExportProduct; 