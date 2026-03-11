// 🔐 SERVICIO DE AUTENTICACIÓN

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { User } from '../types';

class AuthService {
  // Registrar nuevo usuario
  async register(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Actualizar perfil
      await updateProfile(firebaseUser, { displayName });

      // Crear documento de usuario en Firestore
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };

      // Crear objeto para Firestore sin campos undefined
      const firestoreData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        createdAt: new Date().toISOString(),
      };

      if (firebaseUser.photoURL) {
        firestoreData.photoURL = firebaseUser.photoURL;
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData);

      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Obtener datos del usuario de Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          createdAt: new Date(userData.createdAt),
        };
      }

      // Si no existe en Firestore, crear el documento
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };

      // Crear objeto para Firestore sin campos undefined
      const firestoreData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        createdAt: new Date().toISOString(),
      };

      if (firebaseUser.displayName) {
        firestoreData.displayName = firebaseUser.displayName;
      }

      if (firebaseUser.photoURL) {
        firestoreData.photoURL = firebaseUser.photoURL;
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData);

      return user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Error al cerrar sesión');
    }
  }

  // Observar cambios en el estado de autenticación
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Obtener usuario actual
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Manejar errores de autenticación
  private handleAuthError(error: any): Error {
    switch (error.code) {
      // Errores de registro
      case 'auth/email-already-in-use':
        return new Error('Este email ya está registrado');
      case 'auth/weak-password':
        return new Error('La contraseña debe tener al menos 6 caracteres');
      
      // Errores de email
      case 'auth/invalid-email':
        return new Error('El email no es correcto');
      case 'auth/user-not-found':
        return new Error('El email no es correcto');
      
      // Errores de contraseña
      case 'auth/wrong-password':
        return new Error('La contraseña no es correcta');
      case 'auth/invalid-credential':
        return new Error('El email o la contraseña no son correctos');
      
      // Otros errores
      case 'auth/user-disabled':
        return new Error('Esta cuenta ha sido deshabilitada');
      case 'auth/too-many-requests':
        return new Error('Demasiados intentos. Intenta más tarde');
      case 'auth/network-request-failed':
        return new Error('Error de conexión. Verifica tu internet');
      case 'auth/requires-recent-login':
        return new Error('Por seguridad, vuelve a iniciar sesión');
      
      default:
        console.error('Error de autenticación:', error.code, error.message);
        return new Error('Error de autenticación. Intenta de nuevo');
    }
  }
}

export default new AuthService();
