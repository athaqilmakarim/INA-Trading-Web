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
  Tooltip,
  Zoom,
} from '@mui/material';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import NewsService from '../../services/NewsService';
import { toast } from 'react-toastify';

const AddNews = ({ onNewsAdded }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Predefined categories
  const categories = [
    'general',
    'business',
    'technology',
    'export',
    'industry',
    'custom'
  ];

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === 'custom') {
      setShowCustomCategory(true);
      setCustomCategory('');
    } else {
      setShowCustomCategory(false);
      setCategory(value);
    }
  };

  const handleCustomCategoryChange = (event) => {
    const value = event.target.value;
    setCustomCategory(value);
    setCategory(value);
  };

  const validateImage = (file) => {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} is too large (max 5MB)`);
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image`);
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
    toast.success('Image removed', {
      icon: "🗑️"
    });
  };

  const removeAllImages = () => {
    setImages([]);
    setPreviewUrls([]);
    toast.success('All images removed', {
      icon: "🗑️"
    });
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCategory('general');
    setCustomCategory('');
    setShowCustomCategory(false);
    setContent('');
    setImages([]);
    setPreviewUrls([]);
    toast.info('Form cleared', {
      icon: "🔄"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (showCustomCategory && !customCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setLoading(true);
    try {
      const newsData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        category: showCustomCategory ? customCategory.trim() : category,
        content: content.trim(),
        summary: content.slice(0, 200) + (content.length > 200 ? '...' : ''),
      };

      await NewsService.createNews(newsData, images);
      toast.success('News created successfully!', {
        icon: "🎉"
      });
      
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
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

            <Box>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={showCustomCategory ? 'custom' : category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat === 'custom' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AddIcon sx={{ mr: 1 }} />
                          Create New Category
                        </Box>
                      ) : (
                        cat.charAt(0).toUpperCase() + cat.slice(1)
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Zoom in={showCustomCategory}>
                <TextField
                  fullWidth
                  label="New Category Name"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  disabled={loading}
                  sx={{ mt: 2, display: showCustomCategory ? 'block' : 'none' }}
                  placeholder="Enter a new category name"
                  helperText="Create a unique category name"
                />
              </Zoom>
            </Box>

            <Box>
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
                    startIcon={<AddPhotoIcon />}
                    disabled={loading}
                    sx={{ height: '100px' }}
                  >
                    <Box>
                      <Typography>
                        Click to upload images
                      </Typography>
                      <Typography variant="caption" display="block" color="textSecondary">
                        Recommended size: 1200x630px, Max size: 5MB per image
                      </Typography>
                    </Box>
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

              <AnimatePresence>
                {previewUrls.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <ImageList cols={3} gap={8}>
                      {previewUrls.map((url, index) => (
                        <ImageListItem key={index}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Box sx={{ position: 'relative' }}>
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'background.paper',
                                  '&:hover': { bgcolor: 'error.light', color: 'white' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </motion.div>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </motion.div>
                )}
              </AnimatePresence>
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
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
              <Zoom in={!loading}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? 'Publishing...' : 'Publish'}
                </Button>
              </Zoom>
            </Box>
          </Stack>
        </form>
      </Paper>
    </motion.div>
  );
};

export default AddNews; 