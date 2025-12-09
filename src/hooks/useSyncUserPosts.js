import { doc, getDoc, getDocs, collection, query, where, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useShowToast from "./useShowToast";

const useSyncUserPosts = () => {
	const showToast = useShowToast();

	const syncUserPosts = async (userId) => {
		try {
			// 1. Obtener todos los posts reales del usuario
			const postsQuery = query(
				collection(firestore, "posts"),
				where("createdBy", "==", userId)
			);
			const postsSnapshot = await getDocs(postsQuery);
			
			// 2. Crear array con los IDs reales
			const realPostIds = [];
			postsSnapshot.forEach((doc) => {
				realPostIds.push(doc.id);
			});

			// 3. Actualizar el documento del usuario con los IDs correctos
			const userRef = doc(firestore, "users", userId);
			await updateDoc(userRef, {
				posts: realPostIds
			});

			showToast("Sincronizado", `Se encontraron ${realPostIds.length} publicaciones`, "success");
			
			return realPostIds;
		} catch (error) {
			showToast("Error", error.message, "error");
			console.error("Error sincronizando posts:", error);
			return null;
		}
	};

	return { syncUserPosts };
};

export default useSyncUserPosts;