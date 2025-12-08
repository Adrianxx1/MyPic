import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

// Utilidad para manejar IndexedDB (backup adicional)
class PostsDB {
  constructor() {
    this.dbName = 'MyPicDB';
    this.storeName = 'feedPosts';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  async savePosts(posts, userId) {
    if (!this.db) await this.init();
    
    await this.clearUserPosts(userId);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      let completed = 0;
      const total = posts.length;
      
      if (total === 0) {
        resolve();
        return;
      }

      posts.forEach(post => {
        const request = store.put({
          ...post,
          userId,
          timestamp: Date.now()
        });
        
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        
        request.onerror = () => reject(request.error);
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getPosts(userId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const posts = request.result || [];
        posts.sort((a, b) => b.createdAt - a.createdAt);
        resolve(posts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearUserPosts(userId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('userId');
      const request = index.openCursor(userId);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

const postsDB = new PostsDB();

const useGetFeedPosts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fromCache, setFromCache] = useState(false);
  const { posts, setPosts } = usePostStore();
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const { setUserProfile } = useUserProfileStore();

  // Detectar cambios en conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Conexión", "Conexión restaurada", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("Sin conexión", "Mostrando posts guardados", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  useEffect(() => {
    if (!authUser) {
      setIsLoading(false);
      return;
    }

    if (authUser.following.length === 0) {
      setIsLoading(false);
      setPosts([]);
      return;
    }

    let unsubscribe;

    const getFeedPosts = async () => {
      setIsLoading(true);

      // PASO 1: Cargar desde IndexedDB inmediatamente (carga rápida)
      try {
        const cachedPosts = await postsDB.getPosts(authUser.uid);
        if (cachedPosts.length > 0) {
          setPosts(cachedPosts);
          setFromCache(true);
          setIsLoading(false);
          console.log(`Cargados ${cachedPosts.length} posts desde caché (carga rápida)`);
        }
      } catch (dbError) {
        console.error('Error cargando caché inicial:', dbError);
      }

      // PASO 2: Configurar listener en tiempo real de Firestore
      // ⚠️ IMPORTANTE: onSnapshot usa la persistencia de Firestore automáticamente
      const q = query(
        collection(firestore, "posts"),
        where("createdBy", "in", authUser.following)
      );

      try {
        unsubscribe = onSnapshot(
          q,
          {
            // ⚠️ CRÍTICO: Esto permite detectar si los datos vienen de caché o servidor
            includeMetadataChanges: true
          },
          (snapshot) => {
            const feedPosts = [];
            
            snapshot.forEach((doc) => {
              feedPosts.push({ id: doc.id, ...doc.data() });
            });

            feedPosts.sort((a, b) => b.createdAt - a.createdAt);

            // Detectar fuente de datos
            const source = snapshot.metadata.fromCache ? "caché local" : "servidor";
            console.log(`Cargados ${feedPosts.length} posts desde ${source}`);

            setPosts(feedPosts);
            setFromCache(snapshot.metadata.fromCache);
            setIsLoading(false);

            // Guardar en IndexedDB como backup adicional (solo si viene del servidor)
            if (!snapshot.metadata.fromCache && feedPosts.length > 0) {
              postsDB.savePosts(feedPosts, authUser.uid).catch(err => {
                console.warn('Error guardando en IndexedDB:', err);
              });

              // Pre-cachear imágenes en el Service Worker
              if (window.precacheContent) {
                const imageUrls = feedPosts
                  .map(post => post.imageURL)
                  .filter(Boolean);
                window.precacheContent(imageUrls);
              }
            }
          },
          (error) => {
            console.error("Error en Firestore listener:", error);
            
            // Si Firestore falla completamente, intentar cargar desde IndexedDB
            postsDB.getPosts(authUser.uid)
              .then(cachedPosts => {
                if (cachedPosts.length > 0) {
                  setPosts(cachedPosts);
                  setFromCache(true);
                  console.log(`Fallback: ${cachedPosts.length} posts desde IndexedDB`);
                }
              })
              .catch(dbError => {
                console.error('Error cargando fallback:', dbError);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        );
      } catch (error) {
        console.error('Error configurando listener:', error);
        
        // Fallback a IndexedDB
        try {
          const cachedPosts = await postsDB.getPosts(authUser.uid);
          if (cachedPosts.length > 0) {
            setPosts(cachedPosts);
            setFromCache(true);
          }
        } catch (dbError) {
          console.error('Error en fallback:', dbError);
        }
        
        setIsLoading(false);
      }
    };

    getFeedPosts();

    // Cleanup: Desuscribirse del listener al desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [authUser, showToast, setPosts, setUserProfile]);

  return { isLoading, posts, isOnline, fromCache };
};

export default useGetFeedPosts;