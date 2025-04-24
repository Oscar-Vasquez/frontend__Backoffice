import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCl2_3VzovURjyPezEkyxcv83W9qzU7V1w",
  authDomain: "localhost:3000",
  projectId: "workexpress-8732e",
  storageBucket: "workexpress-8732e.appspot.com",
  messagingSenderId: "104075378848",
  appId: "1:104075378848:web:8732e:web:104075378848"
};

// Inicializar Firebase solo si no hay instancias previas
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Configurar autenticación
if (typeof window !== 'undefined') {
  auth.useDeviceLanguage();
}

export { auth };
export default app; 