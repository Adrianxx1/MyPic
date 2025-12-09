import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";

const useGetUserMessages = () => {
	const [conversations, setConversations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();

	useEffect(() => {
		if (!authUser) return;

		const messagesRef = collection(firestore, "messages");
		const q = query(
			messagesRef,
			where("participants", "array-contains", authUser.uid),
			orderBy("lastMessageTime", "desc")
		);

		const unsubscribe = onSnapshot(
			q,
			async (snapshot) => {
				const conversationsData = [];

				for (const docSnap of snapshot.docs) {
					const data = docSnap.data();
					const otherUserId = data.participants.find((id) => id !== authUser.uid);

					try {
						const userDoc = await getDoc(doc(firestore, "users", otherUserId));
						if (userDoc.exists()) {
							const userData = userDoc.data();
							conversationsData.push({
								uid: otherUserId,
								username: userData.username,
								fullName: userData.fullName,
								profilePicURL: userData.profilePicURL,
								lastMessage: data.lastMessage || "",
								lastMessageTime: data.lastMessageTime?.toMillis() || 0,
								messages: data.messages || [],
							});
						}
					} catch (error) {
						console.error("Error al obtener usuario:", error);
					}
				}

				setConversations(conversationsData);
				setIsLoading(false);
			},
			(error) => {
				console.error("Error en mensajes:", error);
				showToast("Error", error.message, "error");
				setIsLoading(false);
			}
		);

		return () => unsubscribe();
	}, [authUser, showToast]);

	return { conversations, isLoading };
};

export default useGetUserMessages;