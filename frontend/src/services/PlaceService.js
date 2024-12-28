import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore, auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MapHelper } from '../utils/MapHelper';

class PlaceService {
  async uploadImage(imageFile) {
    try {
      console.log('Starting place image upload...', imageFile.name);
      
      const metadata = {
        contentType: imageFile.type,
        customMetadata: {
          'Access-Control-Allow-Origin': 'https://admin.inatrading.co.id'
        }
      };
      
      const storageRef = ref(storage, `places/${Date.now()}-${imageFile.name}`);
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

  async updatePlace(placeId, {
    name,
    type,
    address,
    contact,
    description,
    menu,
    newImages = [],
    imagesToDelete = []
  }) {
    try {
      const docRef = doc(firestore, 'places', placeId);
      const placeDoc = await getDoc(docRef);
      
      if (!placeDoc.exists()) {
        throw new Error('Place not found');
      }

      const currentData = placeDoc.data();
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

      let coordinate = currentData.coordinate;
      if (address && address !== currentData.address) {
        coordinate = await MapHelper.getCoordinates(address);
      }

      const placeData = {
        name,
        type,
        address,
        contact,
        description,
        menu: menu || currentData.menu,
        images: updatedImageUrls,
        coordinate,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, placeData);
      return placeId;
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  }

  async deletePlaceImages(placeId) {
    try {
      const docRef = doc(firestore, 'places', placeId);
      const placeDoc = await getDoc(docRef);
      
      if (placeDoc.exists()) {
        const images = placeDoc.data().images || [];
        for (const imageUrl of images) {
          const imageRef = ref(storage, imageUrl);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting place images:', error);
      throw error;
    }
  }

  async createPlace({
    name,
    type,
    address,
    contact,
    description,
    menu,
    images
  }) {
    try {
      const coordinate = await MapHelper.getCoordinates(address);
      
      // Upload images if provided
      const imageUrls = [];
      if (images && images.length > 0) {
        for (const image of images) {
          const imageUrl = await this.uploadImage(image);
          imageUrls.push(imageUrl);
        }
      }
      
      const placeData = {
        name,
        type,
        address,
        contact,
        description,
        menu: menu || [],
        rating: 0,
        createdAt: serverTimestamp(),
        ownerId: auth.currentUser?.uid,
        status: 'pending',
        coordinate,
        images: imageUrls
      };

      console.log('Creating place with data:', placeData);
      const docRef = await addDoc(collection(firestore, 'places'), placeData);
      console.log('Place created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating place:', error);
      throw error;
    }
  }

  async getApprovedPlaces() {
    try {
      console.log('Fetching approved places...');
      const placesRef = collection(firestore, 'places');
      const placesQuery = query(
        placesRef, 
        where('status', '==', 'approved')
      );
      
      const snapshot = await getDocs(placesQuery);
      console.log(`Found ${snapshot.size} approved places`);
      
      snapshot.docs.forEach(doc => {
        console.log('Document data:', doc.id, doc.data());
      });
      
      const places = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          status: data.status || 'pending'
        };
      });

      console.log('Processed places:', places);
      return places;
    } catch (error) {
      console.error('Error fetching approved places:', error);
      throw error;
    }
  }

  async getAllPlaces() {
    try {
      console.log('Fetching all places...');
      const placesRef = collection(firestore, 'places');
      const snapshot = await getDocs(placesRef);
      console.log(`Found ${snapshot.size} total places`);
      
      const places = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      console.log('All places:', places);
      return places;
    } catch (error) {
      console.error('Error fetching all places:', error);
      throw error;
    }
  }

  async getUserPlaces(userId) {
    try {
      console.log('Fetching places for user:', userId);
      const placesRef = collection(firestore, 'places');
      const placesQuery = query(placesRef, where('ownerId', '==', userId));
      const snapshot = await getDocs(placesQuery);
      
      const places = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      console.log('User places:', places);
      return places;
    } catch (error) {
      console.error('Error fetching user places:', error);
      throw error;
    }
  }
}

export const placeService = new PlaceService(); 