'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Get the ID token
        const token = await user.getIdToken();
        // Store it in a cookie
        Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
      } else {
        // Remove the token when user is not authenticated
        Cookies.remove('token');
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, []); // Empty dependency array since we only want this to run once

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Get the token right after sign in
      const token = await userCredential.user.getIdToken();
      // Store it in a cookie
      Cookies.set('token', token, { expires: 7 });
      
      router.push('/dashboard');
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Remove the token when signing out
      Cookies.remove('token');
      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut
  };
}; 