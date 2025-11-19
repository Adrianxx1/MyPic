import { useState } from "react";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";

const useLikePost = (post) => {
  const [isLiking, setIsLiking] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const handleLikePost = async () => {
    if (!authUser) return showToast("Error", "Debes iniciar sesión", "error");

    setIsLiking(true);

    try {
      const postRef = doc(firestore, "posts", post.id);
      const isLiked = post.likes.includes(authUser.uid);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });

      // -------------------------
      // NOTIFICACIÓN DE LIKE
      // -------------------------
      if (!isLiked && authUser.uid !== post.uid) {
        await addDoc(collection(firestore, "notifications"), {
          type: "like",
          action: "le gustó tu publicación",
          senderId: authUser.uid,
          senderUsername: authUser.username,
          senderPhoto: authUser.profilePicURL,
          recipientId: post.uid,
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

  return { isLiking, handleLikePost };
};

export default useLikePost;
