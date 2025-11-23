import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useUserProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import { firestore } from "../firebase/firebase";
import { arrayRemove, arrayUnion, doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

const useFollowUser = (userId) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const fetchAuthUser = useAuthStore((state) => state.fetchUserFromFirestore);

  const { userProfile, setUserProfile } = useUserProfileStore();
  const showToast = useShowToast();

  const handleFollowUser = async () => {
    if (!authUser) return showToast("Error", "Debes iniciar sesión", "error");

    setIsUpdating(true);

    try {
      const currentUserRef = doc(firestore, "users", authUser.uid);
      const userToFollowRef = doc(firestore, "users", userId);

      // Firestore actualizaciones
      await updateDoc(currentUserRef, {
        following: isFollowing ? arrayRemove(userId) : arrayUnion(userId),
      });

      await updateDoc(userToFollowRef, {
        followers: isFollowing ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
      });

      // Notificación
      if (!isFollowing) {
        await addDoc(collection(firestore, "notifications"), {
          type: "follow",
          action: "te empezó a seguir",
          senderId: authUser.uid,
          senderUsername: authUser.username,
          senderPhoto: authUser.profilePicURL,
          recipientId: userId,
          createdAt: serverTimestamp(),
        });
      }

      // 🔥 Recargar datos reales del usuario desde Firestore
      await fetchAuthUser(authUser.uid);

      // Actualizar perfil del usuario visitado
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          followers: isFollowing
            ? userProfile.followers.filter((uid) => uid !== authUser.uid)
            : [...userProfile.followers, authUser.uid],
        });
      }

      setIsFollowing(!isFollowing);

    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setIsFollowing(authUser.following.includes(userId));
    }
  }, [authUser, userId]);

  return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
