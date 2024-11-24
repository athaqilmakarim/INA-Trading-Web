import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExportProductService } from '../services/ExportProductService';

const ExportProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Starting to fetch products...');
        const data = await ExportProductService.getApprovedProducts();
        const approvedProducts = data.filter(product => product.status === 'approved');
        console.log('Fetched approved products:', approvedProducts);
        setProducts(approvedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      <h1 className="text-3xl font-bold mb-8">Export Products</h1>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl text-gray-800">{product.name}</h3>
                  <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {product.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    MOQ: {product.minOrderQuantity}
                  </div>
                  <div className="text-sm text-gray-500">
                    Monthly Capacity: {product.monthlyCapacity}
                  </div>
                  <div className="text-sm text-gray-500">
                    Price: {product.price.currency} {product.price.min} - {product.price.max}
                  </div>
                </div>
                {product.certifications?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Certifications:</div>
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.map((cert, index) => (
                        <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Link 
                    to={`/export-product/${product.id}`}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportProducts; 