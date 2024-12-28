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
  const [price, setPrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

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

      await exportProductService.createExportProduct({
        name,
        description,
        category,
        price,
        minOrder,
        images: imageUrls,
        supplierId: currentUser.uid
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
      setPrice('');
      setMinOrder('');
      setImages([]);
      setPreviewUrls([]);
      setUploadProgress(0);
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Textiles">Textiles</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Food">Food</option>
                  </select>
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

            {/* Capacity and Order Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Capacity & Orders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Capacity</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                  />
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