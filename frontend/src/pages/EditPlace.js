import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { placeService } from '../services/PlaceService';
import { useAuth } from '../context/AuthContext';
import { PlaceType } from '../types/Place';
import { toast } from 'react-toastify';
import AddressAutocomplete from '../components/AddressAutocomplete';
import {
  handleImageSelection,
  ImagePreview,
  UploadProgress,
  ImageUploadZone
} from '../utils/imageUtils';

const EditPlace = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState(PlaceType.RESTAURANT);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  // Image management
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchPlace = async () => {
      if (!currentUser || !placeId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const placeDoc = await placeService.getPlaceById(placeId);
        
        if (!placeDoc) {
          throw new Error('Place not found');
        }

        if (placeDoc.ownerId !== currentUser.uid) {
          throw new Error('You do not have permission to edit this place');
        }

        setName(placeDoc.name || '');
        setType(placeDoc.type || PlaceType.RESTAURANT);
        setAddress(placeDoc.address || '');
        setContact(placeDoc.contact || '');
        setDescription(placeDoc.description || '');
        setMenuItems(placeDoc.menu || []);
        setExistingImages(placeDoc.imageURLs || []);

      } catch (error) {
        console.error('Error fetching place:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [placeId, currentUser]);

  // Handle file selection from <input> or drag-drop
  const handleImageChange = useCallback((e) => {
    handleImageSelection(e.target.files, setNewImages, setNewImagePreviews);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    handleImageSelection(e.dataTransfer.files, setNewImages, setNewImagePreviews);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Remove a new image from the preview list
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success('Image removed', {
      icon: '🗑️'
    });
  };

  // Remove an existing image
  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
    setImagesToDelete(prev => [...prev, url]);
    toast.success('Image marked for deletion', {
      icon: '🗑️'
    });
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (addressData) => {
    setAddress(addressData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      const uploadToast = toast.loading('Updating place...', {
        position: 'bottom-right'
      });

      await placeService.updatePlace(placeId, {
        name,
        type,
        address,
        contact,
        description,
        menu: type === PlaceType.RESTAURANT ? menuItems : undefined,
        newImages,
        imagesToDelete
      });

      toast.update(uploadToast, {
        render: 'Place updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error updating place:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 animate-fadeIn">Edit Place</h1>

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

        {/* Address with Autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            placeholder="Start typing the address..."
            initialValue={address}
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

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Current Images</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <ImagePreview
                  key={index}
                  url={url}
                  index={index}
                  onRemove={() => removeExistingImage(url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* New Images Upload Section */}
        <div className="space-y-4 animate-fadeIn">
          <label className="block text-sm font-medium mb-1">Add New Images</label>
          <ImageUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onChange={handleImageChange}
          />

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {newImagePreviews.map((url, index) => (
                <ImagePreview
                  key={index}
                  url={url}
                  index={index}
                  onRemove={() => removeNewImage(index)}
                />
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <UploadProgress progress={uploadProgress} />
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !name || !address}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPlace; 