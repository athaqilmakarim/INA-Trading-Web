import { firestore } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export const ExportProductService = {
  async getApprovedProducts() {
    try {
      console.log('Fetching products...');
      const productsRef = collection(firestore, 'export_products');
      const q = query(productsRef);

      const snapshot = await getDocs(q);
      console.log('Found products:', snapshot.size);
      const products = [];

      for (const doc of snapshot.docs) {
        const productData = doc.data();
        
        const product = {
          id: doc.id,
          name: productData.name || '',
          category: productData.category || '',
          description: productData.description || '',
          monthlyCapacity: productData.monthlyCapacity || '',
          minOrderQuantity: productData.minOrderQuantity || '',
          price: {
            currency: productData.price?.currency || 'USD',
            min: productData.price?.min || 0,
            max: productData.price?.max || 0
          },
          images: productData.images || [],
          certifications: productData.certifications || [],
          specifications: productData.specifications || {},
          sellerId: productData.sellerId || '',
          status: productData.status || 'pending',
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt
        };

        products.push(product);
      }

      console.log('Processed products:', products);
      return products;

    } catch (error) {
      console.error('Error in getApprovedProducts:', error);
      throw error;
    }
  }
}; 