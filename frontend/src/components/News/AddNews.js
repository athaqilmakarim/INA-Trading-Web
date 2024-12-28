import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  ImageList,
  ImageListItem,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import NewsService from '../../services/NewsService';
import { toast } from 'react-toastify';

const AddNews = ({ onNewsAdded }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const validateImage = (file) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return false;
    }

    return true;
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const validPreviewUrls = [];

    files.forEach(file => {
      if (validateImage(file)) {
        validFiles.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          validPreviewUrls.push(reader.result);
          if (validPreviewUrls.length === validFiles.length) {
            setPreviewUrls(prev => [...prev, ...validPreviewUrls]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setImages(prev => [...prev, ...validFiles]);
    event.target.value = ''; // Reset input
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const removeAllImages = () => {
    setImages([]);
    setPreviewUrls([]);
    toast.success('All images removed');
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCategory('general');
    setContent('');
    setImages([]);
    setPreviewUrls([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newsData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        content: content.trim(),
        summary: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      };

      await NewsService.createNews(newsData, images);
      toast.success('News created successfully!');
      
      // Reset form
      resetForm();
      
      if (onNewsAdded) {
        onNewsAdded();
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error(error.message || 'Failed to create news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
        Create New Article
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            variant="outlined"
            placeholder="Enter a compelling title"
            helperText="A clear and engaging title for your article"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            variant="outlined"
            placeholder="Enter a brief subtitle"
            helperText="A short description that appears below the title"
            disabled={loading}
          />

          <FormControl fullWidth disabled={loading}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="technology">Technology</MenuItem>
              <MenuItem value="export">Export</MenuItem>
              <MenuItem value="industry">Industry</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ position: 'relative' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageChange}
              disabled={loading}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <label htmlFor="image-upload" style={{ flexGrow: 1 }}>
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ height: '100px' }}
                  disabled={loading}
                >
                  <Typography color="textSecondary">
                    Click to upload images
                    <Typography variant="caption" display="block">
                      Recommended size: 1200x630px, Max size: 5MB per image
                    </Typography>
                  </Typography>
                </Button>
              </label>
              {previewUrls.length > 0 && (
                <Tooltip title="Remove all images">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={removeAllImages}
                    disabled={loading}
                    sx={{ minWidth: 'auto', width: '100px', height: '100px' }}
                  >
                    <DeleteIcon />
                  </Button>
                </Tooltip>
              )}
            </Box>

            {previewUrls.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  {previewUrls.length} {previewUrls.length === 1 ? 'image' : 'images'} selected
                </Typography>
                <ImageList cols={3} rowHeight={200} gap={8}>
                  {previewUrls.map((url, index) => (
                    <ImageListItem key={index} sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{ height: '200px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      {!loading && (
                        <Tooltip title="Remove image">
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                color: 'error.main'
                              }
                            }}
                            onClick={() => removeImage(index)}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={12}
            variant="outlined"
            placeholder="Write your article content here..."
            helperText="Use clear paragraphs and keep your content engaging"
            disabled={loading}
          />

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={resetForm}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Publish'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default AddNews; 