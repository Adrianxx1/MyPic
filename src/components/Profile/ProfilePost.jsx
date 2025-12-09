import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useUserProfileStore from "../../store/userProfileStore";
import usePostStore from "../../store/postStore";
import useShowToast from "../../hooks/useShowToast";
import { storage, firestore } from "../../firebase/firebase";
import { deleteObject, ref } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";

const ProfilePost = ({ post, onDelete }) => {
  const authUser = useAuthStore((state) => state.user);
  const deletePostFromProfile = useUserProfileStore((state) => state.deletePost);
  const deletePostFromStore = usePostStore((state) => state.deletePost);
  const showToast = useShowToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!authUser)
      return showToast("Error", "Debes iniciar sesión", "error");

    if (authUser.uid !== post.createdBy)
      return showToast("Error", "No tienes permiso para eliminar esta publicación", "error");

    if (!window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")) {
      return;
    }

    setIsDeleting(true);

    try {
      // 🔥 1. Borrar imagen del Storage usando la ruta REAL guardada en Firestore
      if (post.imagePath) {
        const imageRef = ref(storage, post.imagePath);
        await deleteObject(imageRef);
      }

      // 🔥 2. Borrar documento del post en Firestore
      await deleteDoc(doc(firestore, "posts", post.id));

      // 🔥 3. Actualizar el userProfileStore (esto actualiza el contador)
      deletePostFromProfile(post.id);

      // 🔥 4. Actualizar el postStore
      deletePostFromStore(post.id);

      showToast("Listo", "Publicación eliminada", "success");

      if (onDelete) onDelete(post.id);
    } catch (error) {
      showToast("Error", error.message, "error");
      console.error("Error eliminando post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <img
        src={post.imageURL}
        className="w-full h-full object-cover rounded-lg"
        alt="post"
      />

      {/* Botón visible SOLO si es el propietario */}
      {authUser?.uid === post.createdBy && (
        <button
          onClick={handleDeletePost}
          disabled={isDeleting}
          className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      )}
    </div>
  );
};

export default ProfilePost;