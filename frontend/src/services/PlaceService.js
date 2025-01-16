import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';
import { firestore, auth, storage } from '../firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { MapHelper } from '../utils/MapHelper';

class PlaceService {
  // Upload single image to Firebase Storage
  async uploadImage(imageFile) {
    try {
      if (!imageFile) {
        console.error('No image file provided');
        throw new Error('No image file provided');
      }

      // Convert to Blob if needed
      const blob =
        imageFile instanceof Blob
          ? imageFile
          : new Blob([imageFile], { type: imageFile.type });

      // Create a new File object with guaranteed properties
      const file = new File(
        [blob],
        imageFile.name || `image-${Date.now()}.jpg`,
        {
          type: imageFile.type || 'image/jpeg',
          lastModified: Date.now()
        }
      );

      console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const extension = file.type.split('/')[1] || 'jpg';
      const uniqueFileName = `places/${timestamp}_${uniqueId}.${extension}`;

      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      };

      // Upload to Firebase Storage
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

  // Create new place with `imageURLs`
  async createPlace({
    name,
    type,
    address,
    contact,
    description,
    menu,
    imageURLs = [],
    coordinate = null
  }) {
    try {
      const placeData = {
        name,
        type,
        address,
        contact,
        description,
        menu: menu || [],
        createdAt: serverTimestamp(),
        ownerId: auth.currentUser?.uid,
        status: 'pending',
        imageURLs,
        updatedAt: serverTimestamp()
      };

      // Only add coordinate if it exists
      if (coordinate) {
        placeData.coordinate = coordinate;
      }

      console.log('Creating place with data:', placeData);
      const docRef = await addDoc(collection(firestore, 'places'), placeData);
      console.log('Place created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating place:', error);
      throw error;
    }
  }

  // Update existing place (converts from images -> imageURLs if needed)
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

      // Handle images
      let updatedImageURLs = [...(currentData.imageURLs || [])];
      
      // Delete specified images
      for (const urlToDelete of imagesToDelete) {
        const imageRef = ref(storage, urlToDelete);
        try {
          await deleteObject(imageRef);
          updatedImageURLs = updatedImageURLs.filter((url) => url !== urlToDelete);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Upload new images
      for (const img of newImages) {
        const newUrl = await this.uploadImage(img);
        updatedImageURLs.push(newUrl);
      }

      // Only update allowed fields according to Firebase rules
      const placeData = {
        name,
        type,
        address,
        contact,
        description,
        menu: menu || currentData.menu,
        imageURLs: updatedImageURLs,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, placeData);
      return placeId;
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  }

  // Delete all images from a place
  async deletePlaceImages(placeId) {
    try {
      const docRef = doc(firestore, 'places', placeId);
      const placeDoc = await getDoc(docRef);

      if (placeDoc.exists()) {
        const data = placeDoc.data();

        // Fallback to imageURLs or images
        let existingURLs = [];
        if (Array.isArray(data.imageURLs) && data.imageURLs.length > 0) {
          existingURLs = data.imageURLs;
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          existingURLs = data.images;
        }

        for (const url of existingURLs) {
          const imageRef = ref(storage, url);
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

  // Fetch only "approved" places, fallback to images if no imageURLs
  async getApprovedPlaces() {
    try {
      console.log('Fetching approved places...');
      const placesRef = collection(firestore, 'places');
      const placesQuery = query(placesRef, where('status', '==', 'approved'));

      const snapshot = await getDocs(placesQuery);
      console.log(`Found ${snapshot.size} approved places`);

      const places = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        // Fallback logic
        let finalURLs = [];
        if (Array.isArray(data.imageURLs) && data.imageURLs.length > 0) {
          finalURLs = data.imageURLs;
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          finalURLs = data.images;
        }

        console.log('Raw place data:', {
          id: docSnap.id,
          images: data.images,
          imageURLs: data.imageURLs
        });

        return {
          id: docSnap.id,
          ...data,
          // unify for the UI if needed
          imageURLs: finalURLs,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          status: data.status || 'pending'
        };
      });

      console.log('Processed places:', places.map((p) => ({
        id: p.id,
        name: p.name,
        imageURLs: p.imageURLs
      })));

      return places;
    } catch (error) {
      console.error('Error fetching approved places:', error);
      throw error;
    }
  }

  // Fetch all places
  async getAllPlaces() {
    try {
      console.log('Fetching all places...');
      const placesRef = collection(firestore, 'places');
      const snapshot = await getDocs(placesRef);
      console.log(`Found ${snapshot.size} total places`);

      const places = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()
        };
      });

      console.log('All places:', places);
      return places;
    } catch (error) {
      console.error('Error fetching all places:', error);
      throw error;
    }
  }

  // Fetch places for a specific user
  async getUserPlaces(userId) {
    try {
      console.log('Fetching places for user:', userId);
      const placesRef = collection(firestore, 'places');
      const placesQuery = query(placesRef, where('ownerId', '==', userId));
      const snapshot = await getDocs(placesQuery);

      const places = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Verify each image URL
        if (data.imageURLs && Array.isArray(data.imageURLs)) {
          const validImageURLs = [];
          for (const url of data.imageURLs) {
            const isValid = await this.verifyImageURL(url);
            if (isValid) {
              validImageURLs.push(url);
            }
          }
          
          // If some images were invalid, update the document
          if (validImageURLs.length !== data.imageURLs.length) {
            await updateDoc(doc(firestore, 'places', docSnap.id), {
              imageURLs: validImageURLs
            });
            data.imageURLs = validImageURLs;
          }
        }

        places.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()
        });
      }

      console.log('User places:', places);
      return places;
    } catch (error) {
      console.error('Error fetching user places:', error);
      throw error;
    }
  }

  async deletePlace(placeId) {
    try {
      const docRef = doc(firestore, 'places', placeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting place:', error);
      throw error;
    }
  }

  async getPlaceById(placeId) {
    try {
      const docRef = doc(firestore, 'places', placeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Verify each image URL
        if (data.imageURLs && Array.isArray(data.imageURLs)) {
          const validImageURLs = [];
          for (const url of data.imageURLs) {
            const isValid = await this.verifyImageURL(url);
            if (isValid) {
              validImageURLs.push(url);
            }
          }
          
          // If some images were invalid, update the document
          if (validImageURLs.length !== data.imageURLs.length) {
            await updateDoc(docRef, {
              imageURLs: validImageURLs
            });
            data.imageURLs = validImageURLs;
          }
        }

        return {
          id: docSnap.id,
          ...data
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting place:', error);
      throw error;
    }
  }

  // Helper method to check if image URL is valid
  async verifyImageURL(url) {
    try {
      const imageRef = ref(storage, url);
      await getDownloadURL(imageRef); // This will throw an error if the file doesn't exist
      return true;
    } catch (error) {
      console.log('Image not found:', url);
      return false;
    }
  }
}

export const placeService = new PlaceService();
