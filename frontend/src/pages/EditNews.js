import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NewsService from '../services/NewsService';
import { toast } from 'react-toastify';
import {
  handleImageSelection,
  uploadImages,
  ImagePreview,
  UploadProgress,
  ImageUploadZone
} from '../utils/imageUtils';

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await NewsService.getNewsById(id);
        if (newsData) {
          setTitle(newsData.title);
          setSubtitle(newsData.subtitle || '');
          setContent(newsData.content);
          setCategory(newsData.category);
          setExistingImages(newsData.images || []);
          setPreviewUrls(newsData.images || []);
          setImages([]); // Reset new images array
        }
      } catch (err) {
        setError(err.message);
        toast.error('Error fetching news: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...existingImages, ...newPreviewUrls]);
  }, [existingImages]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...existingImages, ...newPreviewUrls]);
  }, [existingImages]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      // Removing an existing image
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
      setPreviewUrls([...newExistingImages, ...images.map(file => URL.createObjectURL(file))]);
    } else {
      // Removing a new image
      const newImageIndex = index - existingImages.length;
      const newImages = images.filter((_, i) => i !== newImageIndex);
      setImages(newImages);
      setPreviewUrls([...existingImages, ...newImages.map(file => URL.createObjectURL(file))]);
    }
    toast.success('Image removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrls = [...existingImages];
      
      // Upload new images if any
      if (images.length > 0) {
        const uploadToast = toast.loading('Uploading new images...', {
          position: "bottom-right"
        });
        const newImageUrls = await uploadImages(images, 'news', setUploadProgress);
        finalImageUrls = [...finalImageUrls, ...newImageUrls];
        toast.dismiss(uploadToast);
      }

      const newsData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category,
        images: finalImageUrls,
        summary: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      };

      await NewsService.updateNews(id, newsData);
      toast.success('News article updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error(error.message || 'Failed to update news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit News Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="business">Business</option>
            <option value="technology">Technology</option>
            <option value="trade">Trade</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-48 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <ImageUploadZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onChange={handleImageChange}
          />

          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
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

          {uploadProgress > 0 && uploadProgress < 100 && (
            <UploadProgress progress={uploadProgress} />
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Updating...' : 'Update Article'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNews; 