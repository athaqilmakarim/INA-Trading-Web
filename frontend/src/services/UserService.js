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
  async register(email, password, userType) {
    try {
      // Store credentials temporarily for after verification
      localStorage.setItem('pendingEmail', email);
      localStorage.setItem('pendingPassword', password);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false
      };

      await sendEmailVerification(user, actionCodeSettings);

      // Create user profile in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        id: user.uid,
        userType: userType,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        emailVerified: false
      });

      // Sign out the user until they verify their email
      await signOut(auth);

      return {
        success: true,
        message: 'Registration successful. Please check your email for verification.'
      };
    } catch (error) {
      console.error('Error in registration:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      }
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in.');
      }

      // Update user's emailVerified status in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        emailVerified: true
      }, { merge: true });

      return user;
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async checkUserType(userId) {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().userType;
      }
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
}

export default new UserService(); 