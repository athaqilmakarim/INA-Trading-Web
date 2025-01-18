import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import AddNews from '../components/News/AddNews';
import NewsService from '../services/NewsService';
import { placeService } from '../services/PlaceService';
import { exportProductService } from '../services/ExportProductService';
import { promoService } from '../services/PromoService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
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
  LinearProgress,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
  Snackbar,
  TextField,
  Fade,
  Zoom
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Admin = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [news, setNews] = useState([]);
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('places');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [operationMode, setOperationMode] = useState('approval');
  const [confirmText, setConfirmText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState(false);
  const [lastDeletedItem, setLastDeletedItem] = useState(null);
  const [deleteTimeout, setDeleteTimeout] = useState(null);

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

      // Fetch all promos
      const promosQuery = query(collection(firestore, 'promos'));
      const promosSnapshot = await getDocs(promosQuery);
      const promosData = promosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPromos(promosData);

    } catch (err) {
      setError(err.message);
      toast.error('Error fetching data: ' + err.message);
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
      toast.success('Place status updated successfully');
      
    } catch (err) {
      console.error('Error updating place status:', err);
      setError(err.message);
      toast.error('Error updating place status: ' + err.message);
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
      toast.success('Product status updated successfully');
      
    } catch (err) {
      console.error('Error updating product status:', err);
      setError(err.message);
      toast.error('Error updating product status: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setConfirmText('');
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to delete');
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      setIsLoading(true);
      const deletePromises = selectedItems.map(async (item) => {
        switch (activeTab) {
          case 'places':
            await placeService.deletePlaceImages(item);
            await deleteDoc(doc(firestore, 'places', item));
            break;
          case 'products':
            await exportProductService.deleteExportProduct(item);
            break;
          case 'news':
            await NewsService.deleteNews(item);
            break;
          case 'promos':
            await promoService.deletePromo(item);
            break;
          default:
            break;
        }
      });

      await Promise.all(deletePromises);
      toast.success('Selected items deleted successfully');
      setSelectedItems([]);
      setBulkDeleteDialogOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Error deleting items: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (id, type) => {
    setLastDeletedItem({ id, type });
    setUndoSnackbarOpen(true);
    
    const timeout = setTimeout(() => {
      handleHardDelete(id, type);
    }, 5000);
    
    setDeleteTimeout(timeout);
  };

  const handleUndoDelete = () => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
    }
    setUndoSnackbarOpen(false);
    setLastDeletedItem(null);
    toast.success('Delete operation cancelled');
  };

  const handleHardDelete = async (id, type) => {
    try {
      setIsLoading(true);
      switch (type) {
        case 'place':
          await placeService.deletePlaceImages(id);
          await deleteDoc(doc(firestore, 'places', id));
          break;
        case 'product':
          await exportProductService.deleteExportProduct(id);
          break;
        case 'news':
          await NewsService.deleteNews(id);
          break;
        case 'promo':
          await promoService.deletePromo(id);
          break;
        default:
          break;
      }
      await fetchAllData();
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item: ' + error.message);
    } finally {
      setIsLoading(false);
      setUndoSnackbarOpen(false);
      setLastDeletedItem(null);
    }
  };

  const confirmDelete = async () => {
    const itemName = itemToDelete?.name || itemToDelete?.title || 'this item';
    if (confirmText !== `delete ${itemName}`) {
      toast.error('Please type the confirmation text correctly');
      return;
    }
    
    handleSoftDelete(itemToDelete, deleteType);
    setDeleteDialogOpen(false);
  };

  const handleToggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (items) => {
    setSelectedItems(prev => 
      prev.length === items.length 
        ? [] 
        : items.map(item => item.id)
    );
  };

  const getStats = () => {
    const stats = {
      places: {
        total: places.length,
        pending: places.filter(p => p.status === 'pending').length,
        approved: places.filter(p => p.status === 'approved').length,
        rejected: places.filter(p => p.status === 'rejected').length
      },
      products: {
        total: products.length,
        pending: products.filter(p => p.status === 'pending').length,
        approved: products.filter(p => p.status === 'approved').length,
        rejected: products.filter(p => p.status === 'rejected').length
      },
      news: { total: news.length },
      promos: { total: promos.length },
      suppliers: { total: suppliers.length }
    };

    const barData = [
      { name: 'Places', total: stats.places.total },
      { name: 'Products', total: stats.products.total },
      { name: 'News', total: stats.news.total },
      { name: 'Promos', total: stats.promos.total },
      { name: 'Suppliers', total: stats.suppliers.total }
    ];

    const pieData = [
      { name: 'Pending', value: stats.places.pending + stats.products.pending },
      { name: 'Approved', value: stats.places.approved + stats.products.approved },
      { name: 'Rejected', value: stats.places.rejected + stats.products.rejected }
    ];

    return { stats, barData, pieData };
  };

  const renderStats = () => {
    const { stats, barData, pieData } = getStats();
    
    return (
      <Fade in={showStats}>
        <Card elevation={3} sx={{ mb: 3, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Dashboard Statistics</Typography>
            <IconButton onClick={() => setShowStats(false)} size="small">
              <CancelIcon />
            </IconButton>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Total Items by Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Approval Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Card>
      </Fade>
    );
  };

  const renderApprovalMode = (items, type) => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box mb={2}>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(e, value) => value && setStatusFilter(value)}
            aria-label="status filter"
            size="small"
          >
            <ToggleButton value="pending" aria-label="pending">
              <PendingIcon sx={{ mr: 1 }} />
              Pending
            </ToggleButton>
            <ToggleButton value="approved" aria-label="approved">
              <CheckCircleIcon sx={{ mr: 1 }} />
              Approved
            </ToggleButton>
            <ToggleButton value="rejected" aria-label="rejected">
              <CancelIcon sx={{ mr: 1 }} />
              Rejected
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Grid>
      {items
        .filter(item => item.status === statusFilter)
        .map(item => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card 
              elevation={3}
              onClick={() => type === 'place' ? handlePlaceClick(item.id) : null}
              sx={{ 
                cursor: type === 'place' ? 'pointer' : 'default',
                '&:hover': type === 'place' ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                  transition: 'all 0.2s ease-in-out'
                } : {}
              }}
            >
              <CardContent>
                <Box className="flex justify-between items-start">
                  <Box sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6" component="h3" sx={{ fontSize: '1.1rem' }}>
                        {item.name || item.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={item.type || type}
                        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
                      />
                    </Box>
                    {item.address && (
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.address}
                      </Typography>
                    )}
                    <Chip
                      size="small"
                      label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      color={getStatusColor(item.status)}
                      icon={getStatusIcon(item.status)}
                    />
                  </Box>
                  {statusFilter === 'pending' && (
                    <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
                      <Tooltip title="Approve">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking buttons
                            type === 'place' 
                              ? handleUpdatePlaceStatus(item.id, 'approved')
                              : handleUpdateProductStatus(item.id, 'approved');
                          }}
                          color="success"
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking buttons
                            type === 'place'
                              ? handleUpdatePlaceStatus(item.id, 'rejected')
                              : handleUpdateProductStatus(item.id, 'rejected');
                          }}
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
        ))}
    </Grid>
  );

  const handlePlaceClick = (placeId) => {
    navigate(`/place/${placeId}`);
  };

  const renderListItem = (item, type) => (
    <ListItem
      key={item.id}
      sx={{
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {operationMode === 'cleanup' && (
        <Checkbox
          checked={selectedItems.includes(item.id)}
          onChange={() => handleToggleSelect(item.id)}
          sx={{ mr: 2 }}
        />
      )}
      <ListItemText
        onClick={() => type === 'places' ? handlePlaceClick(item.id) : null}
        sx={{ 
          cursor: type === 'places' ? 'pointer' : 'default',
          '&:hover': type === 'places' ? { textDecoration: 'underline' } : {}
        }}
        primary={
          <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
            {item.name}
            <Chip
              size="small"
              label={item.type}
              sx={{ ml: 1, bgcolor: 'primary.light', color: 'white' }}
            />
          </Typography>
        }
        secondary={
          <Typography variant="body2" color="text.secondary">
            {item.address || item.description || ''}
          </Typography>
        }
      />
      
      {operationMode === 'approval' ? (
        <ListItemSecondaryAction>
          <Tooltip title="Approve">
            <IconButton
              edge="end"
              aria-label="approve"
              onClick={() => type === 'places' ? handleUpdatePlaceStatus(item.id, 'approved') : handleUpdateProductStatus(item.id, 'approved')}
              disabled={item.status === 'approved'}
              sx={{ color: 'success.main' }}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              edge="end"
              aria-label="reject"
              onClick={() => type === 'places' ? handleUpdatePlaceStatus(item.id, 'rejected') : handleUpdateProductStatus(item.id, 'rejected')}
              disabled={item.status === 'rejected'}
              sx={{ color: 'error.main', ml: 1 }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Details">
            <IconButton
              edge="end"
              aria-label="view"
              onClick={() => type === 'places' ? handlePlaceClick(item.id) : null}
              sx={{ color: 'info.main', ml: 1 }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      ) : (
        <ListItemSecondaryAction>
          <Tooltip title="Delete">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleDelete(item.id, type)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );

  const renderCleanupMode = (items, type) => (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Checkbox
            checked={selectedItems.length === items.length}
            indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
            onChange={() => handleSelectAll(items)}
            sx={{ mr: 1 }}
          />
          <Typography variant="body1" color="textSecondary">
            Select All
          </Typography>
        </Box>
        {selectedItems.length > 0 && (
          <Zoom in={selectedItems.length > 0}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
            >
              Delete Selected ({selectedItems.length})
            </Button>
          </Zoom>
        )}
      </Box>
      <List>
        <AnimatePresence>
          {items.map(item => renderListItem(item, type))}
        </AnimatePresence>
      </List>
    </Paper>
  );

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

  return (
    <div className="p-4">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Admin Dashboard
        </Typography>
        <Box>
          <IconButton 
            onClick={() => setShowStats(!showStats)}
            color={showStats ? 'primary' : 'default'}
            sx={{ mr: 1 }}
          >
            <BarChartIcon />
          </IconButton>
          <ToggleButtonGroup
            value={operationMode}
            exclusive
            onChange={(e, value) => value && setOperationMode(value)}
            aria-label="operation mode"
          >
            <ToggleButton value="approval" aria-label="approval mode">
              <CheckCircleIcon sx={{ mr: 1 }} />
              Approval Mode
            </ToggleButton>
            <ToggleButton value="cleanup" aria-label="cleanup mode">
              <CleaningServicesIcon sx={{ mr: 1 }} />
              Cleanup Mode
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {showStats && renderStats()}

      {isLoading && <LinearProgress />}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => {
            setActiveTab(newValue);
            setSelectedItems([]);
          }}
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Places" value="places" />
          <Tab label="Products" value="products" />
          <Tab label="News" value="news" />
          <Tab label="Promos" value="promos" />
          <Tab label="Suppliers" value="suppliers" />
        </Tabs>
      </Paper>

      <Box mt={3}>
        <AnimatePresence mode="wait">
          {operationMode === 'approval' ? (
            <motion.div
              key="approval"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'places' && renderApprovalMode(places, 'place')}
              {activeTab === 'products' && renderApprovalMode(products, 'product')}
              {activeTab === 'news' && (
                <Box>
                  <Card elevation={3} sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Add New Article
                      </Typography>
                      <AddNews onNewsAdded={fetchAllData} />
                    </CardContent>
                  </Card>

                  <Grid container spacing={3}>
                    {news.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card 
                          elevation={2}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 6,
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, p: 0 }}>
                            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                  }}
                                  onError={(e) => {
                                    e.target.src = '/placeholder-news.jpg';
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'grey.100',
                                  }}
                                >
                                  <Typography color="textSecondary">No image</Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  p: 1,
                                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                                }}
                              >
                                <Chip
                                  label={item.category || 'General'}
                                  size="small"
                                  sx={{
                                    color: 'white',
                                    bgcolor: 'primary.main',
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Typography variant="h6" gutterBottom component="div" sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.2,
                                minHeight: '2.4em'
                              }}>
                                {item.title}
                              </Typography>
                              <Typography color="textSecondary" variant="body2" sx={{ mb: 2 }}>
                                {item.createdAt ? (
                                  typeof item.createdAt === 'object' && item.createdAt.toDate ? 
                                    new Date(item.createdAt.toDate()).toLocaleDateString() :
                                    new Date(item.createdAt).toLocaleDateString()
                                ) : 'Date not available'}
                              </Typography>
                              <Typography color="textSecondary" variant="body2" sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '4.5em'
                              }}>
                                {item.summary || item.content}
                              </Typography>
                            </Box>
                          </CardContent>
                          <Divider />
                          <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Tooltip title="View News">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/news/${item.id}`)}
                                  sx={{ mr: 1 }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit News">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Tooltip title="Delete News">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(item.id, 'news')}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {news.length === 0 && (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography color="textSecondary" sx={{ mb: 1 }}>
                        No news articles available
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/admin/news/add')}
                      >
                        Add News Article
                      </Button>
                    </Paper>
                  )}
                </Box>
              )}
              {activeTab === 'promos' && renderApprovalMode(promos, 'promo')}
              {activeTab === 'suppliers' && renderApprovalMode(suppliers, 'supplier')}
            </motion.div>
          ) : (
            <motion.div
              key="cleanup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'places' && renderCleanupMode(places, 'place')}
              {activeTab === 'products' && renderCleanupMode(products, 'product')}
              {activeTab === 'news' && renderCleanupMode(news, 'news')}
              {activeTab === 'promos' && renderCleanupMode(promos, 'promo')}
              {activeTab === 'suppliers' && renderCleanupMode(suppliers, 'supplier')}
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirm Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Please type "delete {itemToDelete?.name || itemToDelete?.title || 'this item'}" to confirm.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={confirmText.length > 0 && confirmText !== `delete ${itemToDelete?.name || itemToDelete?.title || 'this item'}`}
            helperText={confirmText.length > 0 && confirmText !== `delete ${itemToDelete?.name || itemToDelete?.title || 'this item'}` ? 'Text does not match' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={confirmText !== `delete ${itemToDelete?.name || itemToDelete?.title || 'this item'}`}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        TransitionComponent={Zoom}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="error" sx={{ mr: 1 }} />
            Confirm Bulk Delete
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to delete {selectedItems.length} items. This action cannot be undone.
          </Alert>
          <DialogContentText>
            Please type "delete {selectedItems.length} items" to confirm.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={confirmText.length > 0 && confirmText !== `delete ${selectedItems.length} items`}
            helperText={confirmText.length > 0 && confirmText !== `delete ${selectedItems.length} items` ? 'Text does not match' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmBulkDelete} 
            color="error" 
            variant="contained"
            disabled={confirmText !== `delete ${selectedItems.length} items`}
          >
            Delete {selectedItems.length} Items
          </Button>
        </DialogActions>
      </Dialog>

      {/* Undo Delete Snackbar */}
      <Snackbar
        open={undoSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setUndoSnackbarOpen(false)}
        message="Item will be deleted"
        action={
          <Button color="secondary" size="small" onClick={handleUndoDelete}>
            UNDO
          </Button>
        }
      />
    </div>
  );
};

export default Admin; 