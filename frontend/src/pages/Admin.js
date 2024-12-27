import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AddNews from '../components/News/AddNews';
import NewsService from '../services/NewsService';
import { Tab, Tabs, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const Admin = () => {
  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('places'); // ['places', 'products', 'suppliers', 'news']
  const [statusFilter, setStatusFilter] = useState('pending'); // ['pending', 'approved', 'rejected']
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Places" value="places" />
          <Tab label="Export Products" value="products" />
          <Tab label="Exporters" value="suppliers" />
          <Tab label="News Management" value="news" />
        </Tabs>
      </Box>

      {activeTab !== 'news' && (
        <div className="mb-6">
          <nav className="flex space-x-4">
            {['pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`${
                  statusFilter === status
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } px-4 py-2 rounded-md capitalize`}
              >
                {status} ({activeTab === 'places' 
                  ? places.filter(p => p.status === status).length
                  : activeTab === 'products'
                  ? products.filter(p => p.status === status).length
                  : suppliers.filter(s => s.status === status).length})
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Places Content */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          {filteredPlaces.length === 0 ? (
            <p className="text-gray-500">No {statusFilter} places found.</p>
          ) : (
            filteredPlaces.map(place => (
              <div key={place.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{place.name}</h3>
                    <p className="text-gray-600">{place.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Type: {place.type}</p>
                    <p className="text-sm text-gray-500">Status: {place.status}</p>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdatePlaceStatus(place.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdatePlaceStatus(place.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Products Content */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No {statusFilter} products found.</p>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-gray-600">{product.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">Category: {product.category}</p>
                      <p className="text-sm text-gray-500">
                        Price: {product.price.currency} {product.price.min} - {product.price.max}
                      </p>
                      <p className="text-sm text-gray-500">MOQ: {product.minOrderQuantity}</p>
                      <p className="text-sm text-gray-500">Status: {product.status}</p>
                    </div>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateProductStatus(product.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateProductStatus(product.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Suppliers Content */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {filteredSuppliers.length === 0 ? (
            <p className="text-gray-500">No {statusFilter} exporters found.</p>
          ) : (
            filteredSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{supplier.companyName}</h3>
                    <p className="text-gray-600">{supplier.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">Email: {supplier.email}</p>
                      <p className="text-sm text-gray-500">Phone: {supplier.phone}</p>
                      <p className="text-sm text-gray-500">Location: {supplier.location}</p>
                      <p className="text-sm text-gray-500">Monthly Capacity: {supplier.monthlyCapacity}</p>
                      <p className="text-sm text-gray-500">Status: {supplier.status}</p>
                    </div>
                    {supplier.certifications?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">Certifications:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {supplier.certifications.map((cert, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateSupplierStatus(supplier.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateSupplierStatus(supplier.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* News Management Content */}
      {activeTab === 'news' && (
        <div className="space-y-8">
          <AddNews onNewsAdded={handleNewsAdded} />
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Published Articles</h2>
            <div className="space-y-4">
              {news.map((article) => (
                <div key={article.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium">{article.title}</h3>
                      <p className="text-gray-600 mt-2">{article.summary}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Published: {new Date(article.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {article.imageUrl && (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-32 h-32 object-cover rounded-lg mx-4"
                      />
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteNews(article.id)}
                      sx={{ minWidth: 'auto', ml: 2 }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Delete News Article"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this news article? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDeleteDialogOpen(false)} 
                color="primary"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete} 
                color="error" 
                variant="contained"
                disabled={isLoading}
                autoFocus
              >
                {isLoading ? <CircularProgress size={24} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Admin; 