import { auth, firestore } from '@/config/firebase';
import { AuthContextType, UserType } from '@/types';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const router = useRouter();

  // Listen to auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || null,
        });
        // router.replace('/(tabs)');
      } else {
        setUser(null);
        // router.replace('/(auth)/welcome');
      }
    });

    return () => unsub();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      return { success: false, msg };
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(firestore, 'users', response.user.uid), {
        name,
        email,
        uid: response.user.uid,
      });

      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes('auth/email-already-in-use')) msg = 'This email is already in use';
      if (msg.includes('auth/invalid-email')) msg = 'Invalid email';
      return { success: false, msg };
    }
  };

  // Update user data from Firestore
  const updateUserData = async (uid: string) => {
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userData: UserType = {
          uid: data.uid,
          email: data.email || null,
          name: data.name || null,
          image: data.image || null,
        };
        setUser({ ...userData });
      }
    } catch (error: any) {
      console.log('Error getting user data:', error.message);
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be wrapped inside AuthProvider');
  return context;
};




