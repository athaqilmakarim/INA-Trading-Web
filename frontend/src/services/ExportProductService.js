import { firestore, storage, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const EXPORT_PRODUCTS_COLLECTION = 'export_products';
const USERS_COLLECTION = 'users';

class ExportProductService {
  async uploadImage(imageFile) {
    try {
      console.log('Starting product image upload...', imageFile.name);
      
      const metadata = {
        contentType: imageFile.type,
        customMetadata: {
          'Access-Control-Allow-Origin': 'https://admin.inatrading.co.id'
        }
      };
      
      const storageRef = ref(storage, `export_products/${Date.now()}-${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile, metadata);
      console.log('Image uploaded successfully', uploadResult);
      
      const imageUrl = await getDownloadURL(uploadResult.ref);
      console.log('Image URL obtained:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async createProduct(productData, images) {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to create a product');
      }

      let imageUrls = [];
      
      // Upload images if provided
      if (images && images.length > 0) {
        for (const image of images) {
          const imageUrl = await this.uploadImage(image);
          imageUrls.push(imageUrl);
        }
      }

      // Create the product document
      const productRef = await addDoc(collection(firestore, EXPORT_PRODUCTS_COLLECTION), {
        ...productData,
        images: imageUrls,
        sellerId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return productRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(firestore, EXPORT_PRODUCTS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const docRef = doc(firestore, EXPORT_PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      throw error;
    }
  }

  async updateProduct(id, productData, newImages = [], imagesToDelete = []) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to update a product');
      }

      const docRef = doc(firestore, EXPORT_PRODUCTS_COLLECTION, id);
      const currentProduct = await getDoc(docRef);
      
      if (!currentProduct.exists()) {
        throw new Error('Product not found');
      }

      const currentData = currentProduct.data();
      let updatedImageUrls = [...(currentData.images || [])];

      // Delete specified images
      for (const imageUrl of imagesToDelete) {
        const imageRef = ref(storage, imageUrl);
        try {
          await deleteObject(imageRef);
          updatedImageUrls = updatedImageUrls.filter(url => url !== imageUrl);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Upload new images
      for (const image of newImages) {
        const imageUrl = await this.uploadImage(image);
        updatedImageUrls.push(imageUrl);
      }

      await updateDoc(docRef, {
        ...productData,
        images: updatedImageUrls,
        updatedAt: serverTimestamp()
      });

      return id;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to delete a product');
      }

      const docRef = doc(firestore, EXPORT_PRODUCTS_COLLECTION, id);
      const productDoc = await getDoc(docRef);
      
      if (productDoc.exists()) {
        // Delete associated images
        const images = productDoc.data().images || [];
        for (const imageUrl of images) {
          const imageRef = ref(storage, imageUrl);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getSellerProducts(sellerId) {
    try {
      const productsRef = collection(firestore, EXPORT_PRODUCTS_COLLECTION);
      const q = query(productsRef, where('sellerId', '==', sellerId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting seller products:', error);
      throw error;
    }
  }

  async getApprovedProducts() {
    try {
      console.log('Fetching approved products...');
      const productsRef = collection(firestore, EXPORT_PRODUCTS_COLLECTION);
      const productsQuery = query(productsRef, where('status', '==', 'approved'));
      const snapshot = await getDocs(productsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));
    } catch (error) {
      console.error('Error fetching approved products:', error);
      throw error;
    }
  }
}

export default new ExportProductService(); 