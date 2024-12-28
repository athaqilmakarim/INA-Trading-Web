import { firestore, storage, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class ExportProductService {
  async uploadImage(imageFile) {
    try {
      if (!imageFile || !imageFile.name || !imageFile.type || !imageFile.size) {
        throw new Error('Invalid image file: missing required properties');
      }

      console.log('Starting export product image upload...', imageFile.name);
      
      // Clean the filename and ensure proper extension
      const extension = imageFile.name.split('.').pop()?.toLowerCase() || 
        imageFile.type.split('/')[1] || 'jpg';
      const baseName = imageFile.name.split('.')[0]
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      
      // Create a unique identifier that includes timestamp and file signature
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const fileSignature = `${imageFile.size}_${imageFile.lastModified}`.substring(0, 10);
      
      const metadata = {
        contentType: `image/${extension}`,
        customMetadata: {
          originalName: imageFile.name,
          uploadedAt: new Date().toISOString(),
          fileSignature: fileSignature
        }
      };
      
      const uniqueFileName = `export_products/${timestamp}_${uniqueId}_${baseName}.${extension}`;
      console.log('Generated unique filename:', uniqueFileName);
      
      const storageRef = ref(storage, uniqueFileName);
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

  async createExportProduct(productData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to create an export product');
      }

      const docRef = await addDoc(collection(firestore, 'export_products'), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating export product:', error);
      throw error;
    }
  }

  async getExportProductById(id) {
    try {
      const docRef = doc(firestore, 'export_products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting export product:', error);
      throw error;
    }
  }

  async getAllExportProducts() {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'export_products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting export products:', error);
      throw error;
    }
  }

  async updateExportProduct(id, productData, newImages = [], imagesToDelete = []) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to update an export product');
      }

      const docRef = doc(firestore, 'export_products', id);
      const currentProduct = await getDoc(docRef);
      
      if (!currentProduct.exists()) {
        throw new Error('Export product not found');
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
        updatedAt: new Date().toISOString()
      });

      return id;
    } catch (error) {
      console.error('Error updating export product:', error);
      throw error;
    }
  }

  async deleteExportProduct(id) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to delete an export product');
      }

      const docRef = doc(firestore, 'export_products', id);
      const productDoc = await getDoc(docRef);
      
      if (productDoc.exists()) {
        // Delete all associated images
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
      console.error('Error deleting export product:', error);
      throw error;
    }
  }
}

export const exportProductService = new ExportProductService(); 