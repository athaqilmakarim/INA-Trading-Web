import { auth, firestore } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const UserType = {
  ADMIN: 'Admin',
  B2C_CONSUMER: 'B2C Consumer (Foreign Consumer)',
  B2C_BUSINESS_OWNER: 'B2C Business Owner',
  B2B_IMPORTER: 'B2B Importer',
  B2B_SUPPLIER: 'B2B Supplier/Exporter'
};

class UserService {
  async register(email, password, userType, profileData) {
    try {
      const API_BASE_URL = 'http://localhost:3001/api/v1.0';
      const endpoint = userType === UserType.B2B_SUPPLIER ? '/seller/register' : '/buyer/register';

      const payload = {
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: email,
        mobile: profileData.phoneNumber,
        password: password
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        message: 'Registration successful. Please login.'
      };
    } catch (error) {
      console.error('Error in registration:', error);
      throw error;
    }
  }

  async verifyEmail(actionCode) {
    try {
      await applyActionCode(auth, actionCode);

      // Get the email from the current user or from local storage
      const user = auth.currentUser;
      const email = localStorage.getItem('pendingEmail');

      if (email) {
        // Try to sign in with stored credentials
        const password = localStorage.getItem('pendingPassword');
        if (password) {
          await this.login(email, password);
          // Clear stored credentials
          localStorage.removeItem('pendingEmail');
          localStorage.removeItem('pendingPassword');
        }
      }

      // Update user profile in Firestore if needed
      if (user) {
        await setDoc(doc(firestore, 'users', user.uid), {
          emailVerified: true
        }, { merge: true });
      }

      return {
        success: true,
        message: 'Email verified successfully.'
      };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      console.log('Attempting login for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        console.log('Email not verified, signing out');
        await signOut(auth);
        throw new Error('Please verify your email before logging in.');
      }

      // Update user's emailVerified status in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        emailVerified: true,
        lastLogin: serverTimestamp()
      }, { merge: true });

      console.log('Login successful for user:', user.uid);
      return user;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async checkUserType(userId) {
    try {
      console.log('Checking user type for:', userId);
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const type = userDoc.data().userType;
        console.log('User type found:', type);
        return type;
      }
      console.log('No user document found');
      return null;
    } catch (error) {
      console.error('Error checking user type:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }
      return {
        ...userDoc.data(),
        id: userDoc.id
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async setUserAsAdmin(userId) {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        userType: UserType.ADMIN
      });
      return true;
    } catch (error) {
      console.error('Error setting user as admin:', error);
      throw error;
    }
  }

  async sendPasswordReset(email) {
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);

      return {
        success: true,
        message: 'Password reset email sent successfully.'
      };
    } catch (error) {
      console.error('Error sending password reset:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account exists with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      }
      throw error;
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        ...profileData,
        lastUpdated: serverTimestamp()
      });

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export default new UserService(); 