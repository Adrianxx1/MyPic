import { useEffect, useState } from "react";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  serverTimestamp,
  onSnapshot 
} from "firebase/firestore";

const useLikePost = (post) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post?.likes?.length || 0);

  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  // --- Mantener likes en tiempo real ---
  useEffect(() => {
    if (!post?.id) return;

    const postRef = doc(firestore, "posts", post.id);

    const unsub = onSnapshot(postRef, (snap) => {
      const data = snap.data();
      if (!data) return;

      const likeArray = data.likes || [];

      setLikes(likeArray.length);
      setIsLiked(authUser ? likeArray.includes(authUser.uid) : false);
    });

    return () => unsub();
  }, [post?.id, authUser]);

  const handleLikePost = async () => {
    if (!authUser) return showToast("Error", "Debes iniciar sesión", "error");

    if (!post || !post.id) {
      return showToast("Error", "Publicación inválida", "error");
    }

    const ownerId = post.createdBy ?? post.uid;
    if (!ownerId) {
      return showToast("Error", "Publicación sin propietario", "error");
    }

    setIsLiking(true);

    try {
      const postRef = doc(firestore, "posts", post.id);
      const alreadyLiked = isLiked;

      await updateDoc(postRef, {
        likes: alreadyLiked
          ? arrayRemove(authUser.uid)
          : arrayUnion(authUser.uid),
      });

      // Notificación
      if (!alreadyLiked && authUser.uid !== ownerId) {
        await addDoc(collection(firestore, "notifications"), {
          type: "like",
          action: "le gustó tu publicación",
          senderId: authUser.uid,
          senderUsername: authUser.username,
          senderPhoto: authUser.profilePicURL,
          recipientId: ownerId,
          postId: post.id,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  return { isLiking, handleLikePost, isLiked, likes };
};

export default useLikePost;
