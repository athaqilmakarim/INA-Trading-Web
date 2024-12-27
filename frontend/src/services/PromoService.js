import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';

class PromoService {
  async createPromo({
    placeId,
    title,
    description,
    discountPercentage,
    startDate,
    endDate,
    terms
  }) {
    try {
      const promoData = {
        placeId,
        title,
        description,
        discountPercentage,
        startDate,
        endDate,
        terms,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        status: 'active'
      };

      const docRef = await addDoc(collection(firestore, 'promos'), promoData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating promo:', error);
      throw error;
    }
  }

  async getPlacePromos(placeId) {
    try {
      const promosRef = collection(firestore, 'promos');
      const promosQuery = query(
        promosRef,
        where('placeId', '==', placeId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(promosQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching place promos:', error);
      throw error;
    }
  }

  async getUserPromos(userId) {
    try {
      const promosRef = collection(firestore, 'promos');
      const promosQuery = query(
        promosRef,
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(promosQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching user promos:', error);
      throw error;
    }
  }

  async deletePromo(promoId) {
    try {
      await deleteDoc(doc(firestore, 'promos', promoId));
    } catch (error) {
      console.error('Error deleting promo:', error);
      throw error;
    }
  }

  async updatePromo(promoId, updates) {
    try {
      await updateDoc(doc(firestore, 'promos', promoId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating promo:', error);
      throw error;
    }
  }
}

export const promoService = new PromoService(); 