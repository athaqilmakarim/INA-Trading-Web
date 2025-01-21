import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services/PlaceService';
import userService, { UserType } from '../services/UserService';
import { exportProductService } from '../services/ExportProductService';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, userType } = useAuth();
  const [places, setPlaces] = useState([]);
  const [exportProducts, setExportProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Sort places alphabetically by name
  const sortedPlaces = [...places].sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    console.log('Profile useEffect - currentUser:', currentUser?.uid, 'userType:', userType);
    const fetchUserData = async () => {
      if (!currentUser) {
        console.log('No current user, skipping data fetch');
        setIsLoading(false);
        return;
      }

      if (!userType) {
        console.log('No user type yet, waiting...');
        return;
      }

      try {
        console.log('Fetching user data...');
        setIsLoading(true);
        const [userPlaces, profile] = await Promise.all([
          placeService.getUserPlaces(currentUser.uid),
          userService.getUserProfile(currentUser.uid)
        ]);
        
        console.log('Setting places:', userPlaces.length);
        setPlaces(userPlaces);
        setUserData(profile);

        // Fetch export products if user is a B2B supplier
        if (userType === UserType.B2B_SUPPLIER) {
          console.log('Fetching export products for B2B supplier');
          const products = await exportProductService.getUserExportProducts(currentUser.uid);
          setExportProducts(products);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, userType]); // Dependencies include both currentUser and userType

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await placeService.deletePlaceImages(placeId);
        await placeService.deletePlace(placeId);
        setPlaces(places.filter(place => place.id !== placeId));
      } catch (error) {
        console.error('Error deleting place:', error);
        alert('Failed to delete place');
      }
    }
  };

  const handleDeleteExportProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this export product?')) {
      try {
        await exportProductService.deleteExportProduct(productId);
        setExportProducts(exportProducts.filter(product => product.id !== productId));
      } catch (error) {
        console.error('Error deleting export product:', error);
        alert('Failed to delete export product');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
          <Link to="/auth" className="text-red-600 hover:text-red-700 font-medium">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {userData?.firstName} {userData?.lastName}
                  </h1>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-gray-900">{currentUser.email}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Phone Number</label>
                      <p className="text-gray-900">{userData?.phoneNumber || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Address</label>
                      <p className="text-gray-900">{userData?.address || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-500">Account Type</label>
                      <p className="text-gray-900">{userType}</p>
                    </div>

                    {userType === UserType.B2B_SUPPLIER && userData?.companyName && (
                      <div>
                        <label className="text-sm text-gray-500">Company Name</label>
                        <p className="text-gray-900">{userData.companyName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Picture Section */}
                <div className="flex justify-center md:justify-end">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-6">
              <button
                onClick={signOut}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Places */}
        {(userType === UserType.B2C_BUSINESS_OWNER || userType === UserType.ADMIN) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Places</h2>
              <Link
                to="/add-place"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Add New Place
              </Link>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {sortedPlaces.map(place => (
                  <div
                    key={place.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <Link 
                        to={`/place/${place.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">{place.name}</h3>
                          <p className="text-gray-600 mt-1">{place.type}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {place.address}
                          </p>
                        </div>
                      </Link>
                      <div className="flex space-x-4 ml-4">
                        <button
                          onClick={() => navigate(`/edit-place/${place.id}`)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDeletePlace(place.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <FaTrash size={20} />
                        </button>
                        <span className={`px-2 py-1 rounded text-sm ${
                          place.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : place.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {place.status.charAt(0).toUpperCase() + place.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {places.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No places added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Export Products */}
        {(userType === UserType.B2B_SUPPLIER || userType === UserType.ADMIN) && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Export Products</h2>
              <Link
                to="/add-export-product"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Add New Product
              </Link>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {exportProducts.length > 0 ? (
                  exportProducts.map(product => (
                    <div
                      key={product.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-gray-600 mt-1">{product.category}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Price: {typeof product.price === 'object' ? 
                              `${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()} ${product.price.currency}` :
                              product.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            Minimum Order: {typeof product.minOrder === 'object' ? 
                              `${product.minOrder.quantity.toLocaleString()} ${product.minOrder.unit}` :
                              product.minOrder}
                          </p>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => navigate(`/edit-export-product/${product.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <FaEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteExportProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <FaTrash size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any export products yet</p>
                    <Link
                      to="/add-export-product"
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Add an Export Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 