import { useState } from "react";
import { firestore } from "../firebase/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";

const useComment = (postId, postOwnerId) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();

  const handlePostComment = async (text) => {
    if (!authUser) return showToast("Error", "Debes iniciar sesión", "error");

    setIsCommenting(true);

    try {
      // Guardar comentario
      await addDoc(collection(firestore, "posts", postId, "comments"), {
        text,
        uid: authUser.uid,
        username: authUser.username,
        userPhoto: authUser.profilePicURL,
        createdAt: serverTimestamp(),
      });

      // -------------------------
      // NOTIFICACIÓN DE COMENTARIO
      // -------------------------
      if (authUser.uid !== postOwnerId) {
        await addDoc(collection(firestore, "notifications"), {
          type: "comment",
          action: "comentó tu publicación",
          senderId: authUser.uid,
          senderUsername: authUser.username,
          senderPhoto: authUser.profilePicURL,
          recipientId: postOwnerId,
          postId,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsCommenting(false);
    }
  };

  return { isCommenting, handlePostComment };
};

export default useComment;
