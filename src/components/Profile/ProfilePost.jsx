import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useShowToast from "../../hooks/useShowToast";
import { storage, firestore } from "../../firebase/firebase";
import { deleteObject, ref } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";

const ProfilePost = ({ post, onDelete }) => {
  const authUser = useAuthStore((state) => state.user);
  const showToast = useShowToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!authUser)
      return showToast("Error", "Debes iniciar sesión", "error");

    if (authUser.uid !== post.createdBy)
      return showToast("Error", "No tienes permiso para eliminar esta publicación", "error");

    setIsDeleting(true);

    try {
      // 🔥 1. Borrar imagen del Storage usando la ruta REAL guardada en Firestore
      if (post.imagePath) {
        const imageRef = ref(storage, post.imagePath);
        await deleteObject(imageRef);
      }

      // 🔥 2. Borrar documento del post en Firestore
      await deleteDoc(doc(firestore, "posts", post.id));

      showToast("Listo", "Publicación eliminada", "success");

      if (onDelete) onDelete(post.id);
    } catch (error) {
      showToast("Error", error.message, "error");
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
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
        >
          {isDeleting ? "..." : "Eliminar"}
        </button>
      )}
    </div>
  );
};

export default ProfilePost;
