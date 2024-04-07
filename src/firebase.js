import 'firebase/auth';
import 'firebase/firestore';

import Filter from 'bad-words';
import { ref, onUnmounted, computed } from 'vue';

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  getFirestore,
} from 'firebase/firestore';

import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDledKaZu4DVAmJRC8zAnvF9uXyLeoOeC0',
  authDomain: 'vue-chat-app-a5d2f.firebaseapp.com',
  projectId: 'vue-chat-app-a5d2f',
  storageBucket: 'vue-chat-app-a5d2f.appspot.com',
  messagingSenderId: '726432384439',
  appId: '1:726432384439:web:40870b5fc63da50f39d432',
  measurementId: 'G-L1KB45JCGQ',
};
const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
const firestore = getFirestore(app);

export function useAuth() {
  const user = ref(null);
  const unsubscribe = onAuthStateChanged(auth, (_user) => (user.value = _user));
  onUnmounted(() => unsubscribe());
  const isLogin = computed(() => user.value !== null);
  
  const signIn = async () => {
    const googleProvider = new GoogleAuthProvider();
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = () => firebaseSignOut(auth);

  return { user, isLogin, signIn, signOut };
}

export function useChat() {
  const messages = ref([]);
  const messagesCollection = collection(firestore, 'messages');
  const messagesQuery = query(
    messagesCollection,
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .reverse();
  });

  onUnmounted(() => unsubscribe());

  const { user, isLogin } = useAuth();
  const filter = new Filter();
  const sendMessage = (text) => {
    if (!isLogin.value) return;
    const { photoURL, uid, displayName } = user.value;
    addDoc(messagesCollection, {
      userName: displayName,
      userId: uid,
      userPhotoURL: photoURL,
      text: filter.clean(text),
      createdAt: serverTimestamp(),
    });
  };

  return { messages, sendMessage };
}
