import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const Admin = () => {
  const [places, setPlaces] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('places'); // ['places', 'products']
  const [statusFilter, setStatusFilter] = useState('pending'); // ['pending', 'approved', 'rejected']

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

  const filteredPlaces = places.filter(place => place.status === statusFilter);
  const filteredProducts = products.filter(product => product.status === statusFilter);

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

      {/* Main Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('places')}
            className={`${
              activeTab === 'places'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Places
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Export Products
          </button>
        </nav>
      </div>

      {/* Status Tabs */}
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
                : products.filter(p => p.status === status).length})
            </button>
          ))}
        </nav>
      </div>

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
    </div>
  );
};

export default Admin; 