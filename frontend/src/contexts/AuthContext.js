import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      studySessions: 0,
      videosProcessed: 0,
      quizzesTaken: 0,
      flashcardsStudied: 0,
      totalStudyTime: 0
    });
    
    return userCredential.user;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        studySessions: 0,
        videosProcessed: 0,
        quizzesTaken: 0,
        flashcardsStudied: 0,
        totalStudyTime: 0
      });
    }
    
    return result.user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
  };

  const incrementStat = async (stat, value = 1) => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const currentValue = userDoc.data()[stat] || 0;
        await updateDoc(userRef, { [stat]: currentValue + value });
      }
    }
  };

  const saveToHistory = async (studyData) => {
    if (currentUser) {
      try {
        await addDoc(collection(db, 'history'), {
          userId: currentUser.uid,
          studyData: studyData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    incrementStat,
    saveToHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
