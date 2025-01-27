import { firestore, storage } from '../firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

class NewsService {
  constructor() {
    this.collection = collection(firestore, 'news');
  }

  // Upload image for news
  async uploadImage(imageFile) {
    try {
      const storageRef = ref(storage, `news/${Date.now()}-${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Get all news articles, ordered by creation date
  async getAllNews() {
    try {
      const q = query(this.collection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting news:', error);
      throw new Error('Failed to fetch news articles');
    }
  }

  // Get a single news article by ID
  async getNewsById(id) {
    try {
      const docRef = doc(this.collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('News article not found');
      }
    } catch (error) {
      console.error('Error getting news article:', error);
      throw error;
    }
  }

  // Create a new news article
  async createNews(newsData, images = []) {
    try {
      const imageUrls = [];
      
      // Upload all images
      for (const image of images) {
        const imageUrl = await this.uploadImage(image);
        imageUrls.push(imageUrl);
      }

      const docRef = await addDoc(this.collection, {
        ...newsData,
        images: imageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'published'
      });
      
      return {
        id: docRef.id,
        ...newsData,
        images: imageUrls
      };
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error('Failed to create news article');
    }
  }

  // Update a news article
  async updateNews(id, newsData, imagesToDelete = [], newImages = []) {
    try {
      const docRef = doc(this.collection, id);
      const currentDoc = await getDoc(docRef);
      
      if (!currentDoc.exists()) {
        throw new Error('News article not found');
      }

      const currentData = currentDoc.data();
      let updatedImages = [...(currentData.images || [])];

      // Delete old images if specified
      for (const imageUrl of imagesToDelete) {
        try {
          // Only delete if the image URL is from Firebase Storage
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          }
          updatedImages = updatedImages.filter(url => url !== imageUrl);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Upload new images
      for (const image of newImages) {
        const imageUrl = await this.uploadImage(image);
        updatedImages.push(imageUrl);
      }

      const updatedData = {
        ...newsData,
        images: updatedImages,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatedData);

      return {
        id,
        ...updatedData,
        images: updatedImages
      };
    } catch (error) {
      console.error('Error updating news:', error);
      throw new Error('Failed to update news article');
    }
  }

  // Delete a news article
  async deleteNews(id) {
    try {
      const docRef = doc(this.collection, id);
      const newsDoc = await getDoc(docRef);
      
      if (newsDoc.exists()) {
        // Delete associated images first
        const images = newsDoc.data().images || [];
        for (const imageUrl of images) {
          try {
            // Only delete if the image URL is from Firebase Storage
            if (imageUrl.includes('firebasestorage.googleapis.com')) {
              const imageRef = ref(storage, imageUrl);
              await deleteObject(imageRef);
            }
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
      
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw new Error('Failed to delete news article');
    }
  }
}

const newsService = new NewsService();
export default newsService; 