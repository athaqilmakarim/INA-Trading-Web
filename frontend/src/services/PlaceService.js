import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore, auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { MapHelper } from '../utils/MapHelper';

class PlaceService {
  async uploadImage(imageFile) {
    try {
      // Initial validation
      if (!imageFile) {
        console.error('No image file provided');
        throw new Error('No image file provided');
      }

      // Convert to Blob if needed
      const blob = imageFile instanceof Blob ? imageFile : new Blob([imageFile], { type: imageFile.type });
      
      // Create a new File object with guaranteed properties
      const file = new File(
        [blob],
        imageFile.name || `image-${Date.now()}.jpg`,
        {
          type: imageFile.type || 'image/jpeg',
          lastModified: Date.now()
        }
      );

      // Log the file we're about to upload
      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const extension = file.type.split('/')[1] || 'jpg';
      const uniqueFileName = `places/${timestamp}_${uniqueId}.${extension}`;

      // Set metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      };

      // Upload the file
      const storageRef = ref(storage, uniqueFileName);
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log('Upload successful:', uploadResult);

      // Get download URL
      const imageUrl = await getDownloadURL(uploadResult.ref);
      console.log('Download URL obtained:', imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('Error in uploadImage:', {
        error: error.message,
        stack: error.stack
      });
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
      
      const places = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw place data:', {
          id: doc.id,
          images: data.images,
          imageURLs: data.imageURLs
        });
        
        return {
          id: doc.id,
          ...data,
          images: data.images || [], // Ensure images array exists
          createdAt: data.createdAt?.toDate?.() || new Date(),
          status: data.status || 'pending'
        };
      });

      console.log('Processed places:', places.map(p => ({
        id: p.id,
        name: p.name,
        images: p.images
      })));
      
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