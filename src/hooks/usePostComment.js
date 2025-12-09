import { useState } from "react";
import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import usePostStore from "../store/postStore";
import { arrayUnion, doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const showToast = useShowToast();
	const authUser = useAuthStore((state) => state.user);
	const addComment = usePostStore((state) => state.addComment);

	const handlePostComment = async (postId, comment) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "Debes iniciar sesión para comentar", "error");
		if (!comment.trim()) return showToast("Error", "El comentario no puede estar vacío", "error");

		setIsCommenting(true);
		const newComment = {
			comment: comment.trim(),
			createdAt: Date.now(),
			createdBy: authUser.uid,
			postId: postId,
		};

		try {
			// Actualizar el post agregando el comentario al array
			await updateDoc(doc(firestore, "posts", postId), {
				comments: arrayUnion(newComment),
			});

			// Actualizar el store local
			addComment(postId, newComment);

			// Opcional: Crear notificación si quieres
			// const postDoc = await getDoc(doc(firestore, "posts", postId));
			// const postOwnerId = postDoc.data().createdBy;
			// if (authUser.uid !== postOwnerId) {
			//   await addDoc(collection(firestore, "notifications"), {
			//     type: "comment",
			//     action: "comentó tu publicación",
			//     senderId: authUser.uid,
			//     senderUsername: authUser.username,
			//     senderPhoto: authUser.profilePicURL,
			//     recipientId: postOwnerId,
			//     postId,
			//     createdAt: serverTimestamp(),
			//   });
			// }

			showToast("Éxito", "Comentario publicado", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
			console.error("Error al comentar:", error);
		} finally {
			setIsCommenting(false);
		}
	};

	return { isCommenting, handlePostComment };
};

export default usePostComment;