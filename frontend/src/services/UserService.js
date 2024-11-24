import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const UserType = {
  B2C_CONSUMER: "B2C Consumer (Foreign Consumer)",
  B2C_BUSINESS_OWNER: "B2C Business Owner",
  B2B_IMPORTER: "B2B Importer",
  B2B_SUPPLIER: "B2B Supplier/Exporter"
};

export const UserService = {
  async checkUserType(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return userDoc.data().userType;
    } catch (error) {
      console.error('Error checking user type:', error);
      throw error;
    }
  },

  async verifySupplierProfile(userId) {
    try {
      const supplierDoc = await getDoc(doc(firestore, 'suppliers', userId));
      if (!supplierDoc.exists()) {
        throw new Error('Supplier profile not found');
      }
      
      const data = supplierDoc.data();
      if (!data.companyName || !data.email || !data.phone) {
        throw new Error('Please complete your supplier profile first');
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying supplier profile:', error);
      throw error;
    }
  }
}; 