import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7zth2iVO96E7U1KoUVnsgq-8lcmVBGVY",
  authDomain: "longislandapptea.firebaseapp.com",
  databaseURL: "https://longislandapptea-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "longislandapptea",
  storageBucket: "longislandapptea.firebasestorage.app",
  messagingSenderId: "234515130363",
  appId: "1:234515130363:web:fdd57896466dbe18548d5e"
};

// Initialize Firebase if it has not been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

export const db = getDatabase(app);
export const signInAnonymouslyFunc = signInAnonymously; 