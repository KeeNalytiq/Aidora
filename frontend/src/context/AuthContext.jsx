import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new user
    const register = async (email, password, displayName, role) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore via backend
            await authAPI.createProfile(user.uid, email, displayName, role);

            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Login
    const login = async (email, password) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid) => {
        try {
            console.log('📥 Fetching user profile for UID:', uid);

            // Fetch from BACKEND API instead of Firebase directly
            // This ensures we get data from MockDb in dev mode
            const response = await authAPI.getCurrentUser();
            const profileData = response.data;

            console.log('✅ Profile fetched from backend:', {
                email: profileData.email,
                emailVerified: profileData.emailVerified,
                role: profileData.role
            });

            const profile = {
                uid,
                ...profileData
            };
            setUserProfile(profile);
            return profile;
        } catch (error) {
            console.error('Fetch profile error:', error);
            // Fallback to Firebase if backend fails
            try {
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const fallbackData = docSnap.data();
                    console.log('⚠️ Using Firebase fallback data');
                    const profile = { uid, ...fallbackData };
                    setUserProfile(profile);
                    return profile;
                }
            } catch (fallbackError) {
                console.error('Fallback fetch error:', fallbackError);
            }
        }
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (user) {
                await fetchUserProfile(user.uid);
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
        register,
        login,
        logout,
        loading,
        refreshProfile: () => currentUser && fetchUserProfile(currentUser.uid) // Expose refresh function
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
