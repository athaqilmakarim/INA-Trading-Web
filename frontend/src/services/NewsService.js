import { firestore, storage, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const NEWS_COLLECTION = 'news';
const USERS_COLLECTION = 'users';

class NewsService {
  async checkIsAdmin(userId) {
    const userDoc = await getDoc(doc(firestore, USERS_COLLECTION, userId));
    return userDoc.exists() && userDoc.data().userType === 'Admin';
  }

  async uploadImage(imageFile) {
    try {
      console.log('Starting news image upload...', imageFile.name);
      
      const metadata = {
        contentType: imageFile.type,
        customMetadata: {
          'Access-Control-Allow-Origin': 'https://admin.inatrading.co.id'
        }
      };
      
      const storageRef = ref(storage, `news/${Date.now()}-${imageFile.name}`);
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

  async createNews(newsData, images) {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to create news');
      }

      // Check if user is admin
      const isAdmin = await this.checkIsAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('Only admins can create news');
      }

      let imageUrls = [];
      
      // Upload images if provided
      if (images && images.length > 0) {
        for (const image of images) {
          const imageUrl = await this.uploadImage(image);
          imageUrls.push(imageUrl);
        }
      }

      // Create the news document
      const newsRef = await addDoc(collection(firestore, NEWS_COLLECTION), {
        ...newsData,
        images: imageUrls,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newsRef.id;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async getAllNews() {
    try {
      const querySnapshot = await getDocs(collection(firestore, NEWS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting news:', error);
      throw error;
    }
  }

  async getNewsById(id) {
    try {
      const docRef = doc(firestore, NEWS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting news by id:', error);
      throw error;
    }
  }

  async updateNews(id, newsData, newImages = [], imagesToDelete = []) {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to update news');
      }

      // Check if user is admin
      const isAdmin = await this.checkIsAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('Only admins can update news');
      }

      const docRef = doc(firestore, NEWS_COLLECTION, id);
      const currentNews = await getDoc(docRef);
      
      if (!currentNews.exists()) {
        throw new Error('News not found');
      }

      const currentData = currentNews.data();
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
        ...newsData,
        images: updatedImageUrls,
        updatedBy: user.uid,
        updatedAt: new Date().toISOString()
      });

      return id;
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  async deleteNews(id) {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to delete news');
      }

      // Check if user is admin
      const isAdmin = await this.checkIsAdmin(user.uid);
      if (!isAdmin) {
        throw new Error('Only admins can delete news');
      }

      const docRef = doc(firestore, NEWS_COLLECTION, id);
      const newsDoc = await getDoc(docRef);
      
      if (newsDoc.exists()) {
        // Delete all associated images
        const images = newsDoc.data().images || [];
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
      console.error('Error deleting news:', error);
      throw error;
    }
  }
}

export default new NewsService(); 