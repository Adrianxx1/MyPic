import { useState } from "react";
import { doc, setDoc, getDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";

const useSendMessage = () => {
	const [isSending, setIsSending] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();

	const sendMessage = async (receiverId, text) => {
		setIsSending(true);
		try {
			// Crear un ID único para la conversación (ordenado alfabéticamente)
			const conversationId =
				authUser.uid < receiverId
					? `${authUser.uid}_${receiverId}`
					: `${receiverId}_${authUser.uid}`;

			const messageRef = doc(firestore, "messages", conversationId);
			const messageDoc = await getDoc(messageRef);

			const newMessage = {
				senderId: authUser.uid,
				text,
				createdAt: Date.now(),
			};

			if (messageDoc.exists()) {
				// Actualizar conversación existente
				await setDoc(
					messageRef,
					{
						messages: arrayUnion(newMessage),
						lastMessage: text,
						lastMessageTime: serverTimestamp(),
					},
					{ merge: true }
				);
			} else {
				// Crear nueva conversación
				await setDoc(messageRef, {
					participants: [authUser.uid, receiverId],
					messages: [newMessage],
					lastMessage: text,
					lastMessageTime: serverTimestamp(),
					createdAt: serverTimestamp(),
				});
			}

			showToast("Éxito", "Mensaje enviado", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsSending(false);
		}
	};

	return { sendMessage, isSending };
};

export default useSendMessage;