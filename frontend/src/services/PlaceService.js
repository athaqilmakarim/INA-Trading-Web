import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import { MapHelper } from '../utils/MapHelper';

class PlaceService {
  async createPlace({
    name,
    type,
    address,
    contact,
    description,
    menu
  }) {
    try {
      const coordinate = await MapHelper.getCoordinates(address);
      
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
        coordinate
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