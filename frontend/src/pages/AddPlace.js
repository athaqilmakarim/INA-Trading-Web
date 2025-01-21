import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services/PlaceService';
import { PlaceType } from '../types/Place';
import { toast } from 'react-toastify';
import AddressAutocomplete from '../components/AddressAutocomplete';
import {
  handleImageSelection,
  ImagePreview,
  UploadProgress,
  ImageUploadZone
} from '../utils/imageUtils';

const AddPlace = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState(PlaceType.RESTAURANT);
  const [customType, setCustomType] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [coordinates, setCoordinates] = useState(null);

  // Image management
  const [images, setImages] = useState([]);          // raw File objects
  const [previewUrls, setPreviewUrls] = useState([]); // local previews
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle file selection from <input> or drag-drop
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

  // Remove an image from the preview list
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    toast.success('Image removed', {
      icon: '🗑️'
    });
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (addressData) => {
    setAddress(addressData);
    setCoordinates(null); // We're not using coordinates anymore
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // We'll store the final Firebase download URLs in imageURLs
      let imageURLs = [];

      if (images.length > 0) {
        console.log(`Starting image upload with ${images.length} file(s).`);
        const uploadToast = toast.loading('Uploading images...', {
          position: 'bottom-right'
        });

        for (const [index, file] of images.entries()) {
          try {
            // Basic validation
            if (!(file instanceof File) || !file.name) {
              console.error('Invalid file object:', file);
              throw new Error('Invalid file object');
            }

            console.log(`Uploading image ${index + 1}/${images.length}`, {
              name: file.name,
              type: file.type,
              size: file.size
            });

            // Upload to Firebase
            const downloadUrl = await placeService.uploadImage(file);
            imageURLs.push(downloadUrl);

            // Update progress
            const progress = ((index + 1) / images.length) * 100;
            setUploadProgress(Math.round(progress));

            toast.update(uploadToast, {
              render: `Uploaded ${index + 1} of ${images.length} images`,
              type: 'success',
              isLoading: false
            });
          } catch (uploadErr) {
            console.error('Image upload error:', uploadErr);
            toast.error(`Failed to upload image ${index + 1}: ${uploadErr.message}`);
          }
        }

        toast.dismiss(uploadToast);
      }

      console.log('Creating place with these URL(s):', imageURLs);

      // Create place in Firestore with imageURLs and coordinates
      await placeService.createPlace({
        name,
        type: type === PlaceType.OTHER ? customType : type,
        address,
        contact,
        description,
        menu: type === PlaceType.RESTAURANT ? menuItems : undefined,
        imageURLs,
        // Remove coordinate field since we're not using it
      });

      toast.success('Place added successfully!', {
        icon: '🎉'
      });
      setSuccess(true);

      // Reset form
      setName('');
      setType(PlaceType.RESTAURANT);
      setAddress('');
      setContact('');
      setDescription('');
      setMenuItems([]);
      setImages([]);
      setPreviewUrls([]);
      setUploadProgress(0);
      setCoordinates(null);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Place</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* Type */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value);
                        if (e.target.value !== PlaceType.OTHER) {
                          setCustomType('');
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {Object.entries(PlaceType).map(([key, val]) => (
                        <option key={key} value={val}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {type === PlaceType.OTHER && (
                    <div>
                      <input
                        type="text"
                        value={customType}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '') {
                            setCustomType('');
                          } else {
                            setCustomType(value.charAt(0).toUpperCase() + value.slice(1));
                          }
                        }}
                        placeholder="Enter custom type"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Contact Information</h2>
              <div className="grid grid-cols-1 gap-6">
                {/* Address with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Start typing the address..."
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Description</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Describe your place..."
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 pb-2 border-b">Images</h2>
              <ImageUploadZone
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onChange={handleImageChange}
              />

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <ImagePreview
                      key={index}
                      url={url}
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
                className={`w-full bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Adding Place...
                  </>
                ) : (
                  'Add Place'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlace;
