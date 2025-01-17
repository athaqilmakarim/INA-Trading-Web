import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { motion } from 'framer-motion';

const ExportProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(firestore, 'export_products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h3 className="text-xl font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600">{error || 'Product not found'}</p>
          <Link 
            to="/export-products"
            className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/export-products" className="text-gray-500 hover:text-red-600">
                Export Products
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-red-600 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {product.images?.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={`${product.name} - View ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden ${
                        selectedImage === index ? 'ring-2 ring-red-600' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h2 className="text-lg font-semibold mb-4">Product Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Price Range</div>
                    <div className="text-lg font-medium text-gray-900">
                      {typeof product.price === 'object' ? 
                        `${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()} ${product.price.currency}` :
                        product.price}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Per unit</div>
                  </div>

                  {/* Category */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="text-lg font-medium text-gray-900">{product.category}</div>
                  </div>

                  {/* Minimum Order */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Minimum Order</div>
                    <div className="text-lg font-medium text-gray-900">
                      {typeof product.minOrder === 'object' ? 
                        `${product.minOrder.quantity.toLocaleString()} ${product.minOrder.unit}` :
                        product.minOrder}
                    </div>
                  </div>

                  {/* Monthly Capacity */}
                  <div className="bg-gray-50 p-4 rounded-lg group relative">
                    <div className="flex items-center space-x-1">
                      <div className="text-sm text-gray-500">Monthly Production Capacity</div>
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                          Maximum amount the supplier can produce or supply per month
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-gray-900">
                      {typeof product.monthlyCapacity === 'object' ? 
                        `${product.monthlyCapacity.quantity.toLocaleString()} ${product.monthlyCapacity.unit}` :
                        product.monthlyCapacity}
                    </div>
                  </div>

                  {/* Additional Specifications */}
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      <div className="text-lg font-medium text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {product.certifications?.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-semibold mb-4">Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div className="border-t border-gray-100 pt-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Contact Supplier</h2>
                  <p className="text-gray-600">
                    Interested in this product? Contact the supplier to discuss your requirements,
                    request samples, or get more information about bulk orders.
                  </p>
                </div>
                <button
                  className="w-full bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                  onClick={() => window.location.href = `mailto:?subject=Inquiry about ${product.name}&body=I am interested in your product: ${product.name}%0D%0A%0D%0AProduct Details:%0D%0A- Category: ${product.category}%0D%0A- Price Range: ${product.price.min.toLocaleString()} - ${product.price.max.toLocaleString()} ${product.price.currency}%0D%0A- Minimum Order: ${product.minOrder.quantity.toLocaleString()} ${product.minOrder.unit}%0D%0A%0D%0APlease provide more information about this product.`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Supplier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExportProductDetail; 