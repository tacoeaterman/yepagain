import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, database, ref, set, get } from '@/lib/firebase';
import { useToast } from './use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      // If user exists but no database record, create one
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (!snapshot.exists()) {
            // Create user record if it doesn't exist
            console.log('🔧 Creating database record for user:', user.uid, user.displayName);
            await set(userRef, {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Unknown User',
              hasHostingPrivilege: false,
              createdAt: new Date().toISOString()
            });
            console.log('✅ User database record created successfully');
          } else {
            console.log('✅ User database record already exists for:', user.uid);
          }
        } catch (error) {
          console.error('Error checking/creating user record:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Create user record in Firebase Realtime Database
      console.log('🔧 Creating database record for new user:', result.user.uid, displayName);
      const userRef = ref(database, `users/${result.user.uid}`);
      await set(userRef, {
        id: result.user.uid,
        email: email,
        displayName: displayName,
        hasHostingPrivilege: false,
        createdAt: new Date().toISOString()
      });
      console.log('✅ New user database record created successfully');
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to Kicked in the Disc",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed in successfully!",
        description: "Welcome back",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    logout,
  };
}
