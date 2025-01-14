import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services/PlaceService';
import { PlaceType } from '../types/Place';
import { toast } from 'react-toastify';
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
        type,
        address,
        contact,
        description,
        menu: type === PlaceType.RESTAURANT ? menuItems : undefined,
        imageURLs,
        coordinate: coordinates // Pass the coordinates from Places API
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
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 animate-fadeIn">Add New Place</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Place Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {Object.entries(PlaceType).map(([key, val]) => (
              <option key={key} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter address"
            required
          />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-sm font-medium mb-1">Contact</label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4 animate-fadeIn">
          <label className="block text-sm font-medium mb-1">Images</label>
          <ImageUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onChange={handleImageChange}
          />

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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

        <button
          type="submit"
          disabled={isLoading || !name || !address}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {uploadProgress > 0
                ? `Uploading... ${uploadProgress}%`
                : 'Submitting...'}
            </span>
          ) : (
            'Submit Place'
          )}
        </button>
      </form>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4 animate-slideUp">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-xl font-bold mt-4 mb-2">Success!</h2>
              <p className="text-gray-600">Your place has been submitted for review.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-600 p-4 rounded shadow-lg animate-slideUp">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPlace;
