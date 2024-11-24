import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const ExportProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            {product.images?.[0] && (
              <img
                className="h-48 w-full object-cover md:h-full md:w-48"
                src={product.images[0]}
                alt={product.name}
              />
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {product.category}
              </span>
            </div>
            <p className="mt-4 text-gray-600">{product.description}</p>
            
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Specifications</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-gray-600">Minimum Order</dt>
                  <dd className="font-medium">{product.minOrderQuantity}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Monthly Capacity</dt>
                  <dd className="font-medium">{product.monthlyCapacity}</dd>
                </div>
              </dl>
            </div>

            {product.certifications?.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportProductDetail; 