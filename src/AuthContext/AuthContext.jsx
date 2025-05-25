import { createContext, useContext, useState, useEffect } from "react";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";


const AuthContext = createContext();


export function useAuth() {
  return useContext(AuthContext);
}


export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const db = getFirestore();
  
  useEffect(() => {
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
           
            setUserRole(docSnap.data().rol);
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setUserRole("");
      }
      
      setLoading(false);
    });
    
   
    return unsubscribe;
  }, []);
  
  //Registrar un nuevo usuario
  async function register(email, password, userData) {
    try {
      //Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      //Guardar datos adicionales en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        email: email,
        rol: userData.rol,
        nombre: userData.nombre || "",
        institucion: userData.institucion || "",
        biografia: userData.biografia || "",
        telefono: userData.telefono || "",
        fechaRegistro: new Date(),
        fechaActualizacion: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: errorTraducido(error.code) 
      };
    }
  }
  
  //Iniciar sesión
  async function login(email, password) {
    try {
      //Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      //Obtener datos del usuario de Firestore
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole(userData.rol);
        return { 
          success: true, 
          role: userData.rol 
        };
      } else {
        return { 
          success: false, 
          message: "No se encontraron datos del usuario" 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: errorTraducido(error.code) 
      };
    }
  }
  
  // Función cerrar sesión
  async function logout() {
    await signOut(auth);
    setUserRole("");
  }

  //Actualiza los datos del usuario en Firestore
  async function updateUserData(userId, userData) {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      await updateDoc(userDocRef, {
        ...userData,
        fechaActualizacion: new Date()
      });
      return { success: true, message: "Datos actualizados correctamente" };
    } catch (error) {
      console.error("Error updating user data:", error);
      return { 
        success: false, 
        message: "Error al actualizar los datos: " + error.message 
      };
    }
  }

  //cambiar la contraseña del usuario
  async function updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { 
          success: false, 
          message: "No hay usuario autenticado" 
        };
      }

      //Crear credencial con la contraseña actual para re-autenticar
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      //Re-autenticar al usuario
      await reauthenticateWithCredential(user, credential);
      
      //Actualiza la contraseña
      await updatePassword(user, newPassword);
      
      //Actualiza la fecha al cambiar la contraseña
      const userDocRef = doc(db, "usuarios", user.uid);
      await updateDoc(userDocRef, {
        fechaCambioPassword: new Date(),
        fechaActualizacion: new Date()
      });
      
      return { 
        success: true, 
        message: "Contraseña actualizada exitosamente" 
      };
      
    } catch (error) {
      console.error("Error changing password:", error);
      return { 
        success: false, 
        message: errorTraducido(error.code) 
      };
    }
  }
  
 
  function errorTraducido(errorCode) {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "El correo electrónico ya está en uso por otra cuenta";
      case "auth/invalid-email":
        return "El formato del correo electrónico no es válido";
      case "auth/weak-password":
        return "La contraseña es demasiado débil (mínimo 6 caracteres)";
      case "auth/user-not-found":
        return "No existe un usuario con este correo electrónico";
      case "auth/wrong-password":
        return "Contraseña incorrecta";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intente más tarde";
      case "auth/requires-recent-login":
        return "Esta operación requiere autenticación reciente. Por favor, inicie sesión nuevamente";
      case "auth/invalid-credential":
        return "La contraseña actual es incorrecta";
      case "auth/network-request-failed":
        return "Error de conexión. Verifique su conexión a internet";
      default:
        return "Ocurrió un error inesperado. Por favor, inténtelo de nuevo";
    }
  }
  
  
  const value = {
    currentUser,
    userRole,
    loading,
    register,
    login,
    logout,
    updateUserData,
    updateUserPassword,
    errorTraducido
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}