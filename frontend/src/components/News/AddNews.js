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
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NewsService from '../../services/NewsService';
import { toast } from 'react-toastify';

const AddNews = ({ onNewsAdded }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('general');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

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
    const file = event.target.files[0];
    if (file) {
      if (!validateImage(file)) {
        event.target.value = ''; // Reset input
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl('');
  };

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCategory('general');
    setContent('');
    setImage(null);
    setPreviewUrl('');
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

      await NewsService.createNews(newsData, image);
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
              onChange={handleImageChange}
              disabled={loading}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                sx={{ height: previewUrl ? 'auto' : '100px' }}
                disabled={loading}
              >
                {previewUrl ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                    />
                    {!loading && (
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          }
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage();
                        }}
                        size="small"
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                  </Box>
                ) : (
                  <Typography color="textSecondary">
                    Click to upload featured image
                    <Typography variant="caption" display="block">
                      Recommended size: 1200x630px, Max size: 5MB
                    </Typography>
                  </Typography>
                )}
              </Button>
            </label>
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