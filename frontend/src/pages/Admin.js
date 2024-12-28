import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AddNews from '../components/News/AddNews';
import NewsService from '../services/NewsService';
import { 
  Tab, 
  Tabs, 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { toast } from 'react-toastify';

const Admin = () => {
  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('places');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all places
      const placesQuery = query(collection(firestore, 'places'));
      const placesSnapshot = await getDocs(placesQuery);
      const placesData = placesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlaces(placesData);

      // Fetch all products
      const productsQuery = query(collection(firestore, 'export_products'));
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);

      // Fetch all suppliers
      const suppliersQuery = query(collection(firestore, 'suppliers'));
      const suppliersSnapshot = await getDocs(suppliersQuery);
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSuppliers(suppliersData);

      // Fetch all news
      const newsData = await NewsService.getAllNews();
      setNews(newsData);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlaceStatus = async (placeId, newStatus) => {
    try {
      setIsLoading(true);
      const placeRef = doc(firestore, 'places', placeId);
      
      await updateDoc(placeRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      await fetchAllData();
      
    } catch (err) {
      console.error('Error updating place status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProductStatus = async (productId, newStatus) => {
    try {
      setIsLoading(true);
      const productRef = doc(firestore, 'export_products', productId);
      
      await updateDoc(productRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      await fetchAllData();
      
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSupplierStatus = async (supplierId, newStatus) => {
    try {
      setIsLoading(true);
      const supplierRef = doc(firestore, 'suppliers', supplierId);
      
      await updateDoc(supplierRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      await fetchAllData();
      
    } catch (err) {
      console.error('Error updating supplier status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsAdded = () => {
    fetchAllData(); // Refresh the news list
  };

  const handleDeleteNews = async (newsId) => {
    setNewsToDelete(newsId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      await NewsService.deleteNews(newsToDelete);
      toast.success('News deleted successfully');
      fetchAllData(); // Refresh the news list
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news');
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const filteredPlaces = places.filter(place => place.status === statusFilter);
  const filteredProducts = products.filter(product => product.status === statusFilter);
  const filteredSuppliers = suppliers.filter(supplier => supplier.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const DashboardStats = () => (
    <Grid container spacing={3} className="mb-6">
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Places
            </Typography>
            <Typography variant="h4">
              {places.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(places.filter(p => p.status === 'approved').length / places.length) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Products
            </Typography>
            <Typography variant="h4">
              {products.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(products.filter(p => p.status === 'approved').length / products.length) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Suppliers
            </Typography>
            <Typography variant="h4">
              {suppliers.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(suppliers.filter(s => s.status === 'approved').length / suppliers.length) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={3}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total News
            </Typography>
            <Typography variant="h4">
              {news.length}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={100}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (isLoading) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" className="mt-4">
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="text-center py-12">
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Dashboard
        </Typography>
        <Typography color="textSecondary">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="flex items-center mb-6">
        <DashboardIcon className="mr-2" fontSize="large" />
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
      </Box>

      <DashboardStats />

      <Paper elevation={3} className="mb-6">
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
        >
          <Tab label="Places" value="places" />
          <Tab label="Export Products" value="products" />
          <Tab label="Exporters" value="suppliers" />
          <Tab label="News Management" value="news" />
        </Tabs>
      </Paper>

      {activeTab !== 'news' && (
        <Box className="mb-6">
          <Grid container spacing={2}>
            {['pending', 'approved', 'rejected'].map((status) => (
              <Grid item key={status}>
                <Chip
                  label={`${status.toUpperCase()} (${
                    activeTab === 'places' 
                      ? places.filter(p => p.status === status).length
                      : activeTab === 'products'
                      ? products.filter(p => p.status === status).length
                      : suppliers.filter(s => s.status === status).length
                  })`}
                  onClick={() => setStatusFilter(status)}
                  color={getStatusColor(status)}
                  variant={statusFilter === status ? 'filled' : 'outlined'}
                  className="capitalize"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Places Content */}
      {activeTab === 'places' && (
        <Grid container spacing={3}>
          {filteredPlaces.length === 0 ? (
            <Grid item xs={12}>
              <Paper elevation={2} className="p-6 text-center">
                <Typography color="textSecondary">
                  No {statusFilter} places found.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredPlaces.map(place => (
              <Grid item xs={12} md={6} key={place.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {place.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {place.description}
                        </Typography>
                        <Box className="flex gap-2 mt-2">
                          <Chip 
                            size="small" 
                            label={place.type} 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={place.status}
                            color={getStatusColor(place.status)}
                            icon={getStatusIcon(place.status)}
                          />
                        </Box>
                      </Box>
                      {statusFilter === 'pending' && (
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton
                              onClick={() => handleUpdatePlaceStatus(place.id, 'approved')}
                              color="success"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              onClick={() => handleUpdatePlaceStatus(place.id, 'rejected')}
                              color="error"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Products Content */}
      {activeTab === 'products' && (
        <Grid container spacing={3}>
          {filteredProducts.length === 0 ? (
            <Grid item xs={12}>
              <Paper elevation={2} className="p-6 text-center">
                <Typography color="textSecondary">
                  No {statusFilter} products found.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredProducts.map(product => (
              <Grid item xs={12} md={6} key={product.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {product.description}
                        </Typography>
                        <div className="mt-2 space-y-1">
                          <Typography variant="body2" color="textSecondary">
                            Category: {product.category}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Price: {product.price.currency} {product.price.min} - {product.price.max}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            MOQ: {product.minOrderQuantity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Status: {product.status}
                          </Typography>
                        </div>
                      </Box>
                      {statusFilter === 'pending' && (
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton
                              onClick={() => handleUpdateProductStatus(product.id, 'approved')}
                              color="success"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              onClick={() => handleUpdateProductStatus(product.id, 'rejected')}
                              color="error"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Suppliers Content */}
      {activeTab === 'suppliers' && (
        <Grid container spacing={3}>
          {filteredSuppliers.length === 0 ? (
            <Grid item xs={12}>
              <Paper elevation={2} className="p-6 text-center">
                <Typography color="textSecondary">
                  No {statusFilter} exporters found.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredSuppliers.map(supplier => (
              <Grid item xs={12} md={6} key={supplier.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {supplier.companyName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {supplier.description}
                        </Typography>
                        <div className="mt-2 space-y-1">
                          <Typography variant="body2" color="textSecondary">
                            Email: {supplier.email}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Phone: {supplier.phone}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Location: {supplier.location}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Monthly Capacity: {supplier.monthlyCapacity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Status: {supplier.status}
                          </Typography>
                        </div>
                        {supplier.certifications?.length > 0 && (
                          <div className="mt-2">
                            <Typography variant="body2" color="textSecondary">
                              Certifications:
                            </Typography>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {supplier.certifications.map((cert, index) => (
                                <Chip
                                  key={index}
                                  label={cert}
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </Box>
                      {statusFilter === 'pending' && (
                        <Box>
                          <Tooltip title="Approve">
                            <IconButton
                              onClick={() => handleUpdateSupplierStatus(supplier.id, 'approved')}
                              color="success"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              onClick={() => handleUpdateSupplierStatus(supplier.id, 'rejected')}
                              color="error"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* News Management Section */}
      {activeTab === 'news' && (
        <Box>
          <Card elevation={3} className="mb-6">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Article
              </Typography>
              <AddNews onNewsAdded={handleNewsAdded} />
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom className="mt-6">
            Existing Articles
          </Typography>
          <Grid container spacing={3}>
            {news.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card elevation={3}>
                  <CardContent>
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {item.content}
                        </Typography>
                      </Box>
                      <Tooltip title="Delete Article">
                        <IconButton
                          onClick={() => handleDeleteNews(item.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this news article? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin; 