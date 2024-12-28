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
      console.log('Starting image upload...', imageFile.name);
      
      // Create a metadata object with CORS settings
      const metadata = {
        contentType: imageFile.type,
        customMetadata: {
          'Access-Control-Allow-Origin': 'https://admin.inatrading.co.id'
        }
      };
      
      const storageRef = ref(storage, `news/${Date.now()}-${imageFile.name}`);
      
      // Upload the file with metadata
      const uploadResult = await uploadBytes(storageRef, imageFile, metadata);
      console.log('Image uploaded successfully', uploadResult);
      
      // Get the URL
      const imageUrl = await getDownloadURL(uploadResult.ref);
      console.log('Image URL obtained:', imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async createNews(newsData, imageFile) {
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

      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        try {
          imageUrl = await this.uploadImage(imageFile);
        } catch (error) {
          throw new Error(`Image upload failed: ${error.message}`);
        }
      }

      // Create the news document
      const newsRef = await addDoc(collection(firestore, NEWS_COLLECTION), {
        ...newsData,
        imageUrl,
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

  async updateNews(id, newsData, imageFile) {
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
      
      let imageUrl = newsData.imageUrl;

      if (imageFile) {
        // Delete old image if exists
        if (currentNews.data().imageUrl) {
          const oldImageRef = ref(storage, currentNews.data().imageUrl);
          await deleteObject(oldImageRef);
        }

        // Upload new image
        const storageRef = ref(storage, `news/${Date.now()}-${imageFile.name}`);
        const metadata = {
          contentType: imageFile.type,
          customMetadata: {
            'Access-Control-Allow-Origin': 'https://admin.inatrading.co.id'
          }
        };
        await uploadBytes(storageRef, imageFile, metadata);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(docRef, {
        ...newsData,
        imageUrl,
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
      
      if (newsDoc.exists() && newsDoc.data().imageUrl) {
        const imageRef = ref(storage, newsDoc.data().imageUrl);
        await deleteObject(imageRef);
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }
}

export default new NewsService(); 