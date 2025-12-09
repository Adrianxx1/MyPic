import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useGetSuggestedUsers = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [suggestedUsers, setSuggestedUsers] = useState([]);
	const authUser = useAuthStore((state) => state.user);
	const showToast = useShowToast();

	useEffect(() => {
		const getSuggestedUsers = async () => {
			setIsLoading(true);
			try {
				const usersRef = collection(firestore, "users");
				
				// Crear lista de usuarios a excluir (máximo 10 para not-in)
				const followingList = authUser.following || [];
				const excludeList = [authUser.uid, ...followingList].slice(0, 10);

				let q;
				
				// Si tenemos menos de 10 usuarios a excluir, usamos not-in
				if (excludeList.length <= 10) {
					q = query(
						usersRef,
						where("uid", "not-in", excludeList),
						orderBy("uid"),
						limit(10) // Pedimos más para filtrar después
					);
				} else {
					// Si tenemos más de 10, obtenemos usuarios y filtramos en el cliente
					q = query(
						usersRef,
						orderBy("uid"),
						limit(20) // Pedimos más para tener suficientes después del filtrado
					);
				}

				const querySnapshot = await getDocs(q);
				const users = [];

				querySnapshot.forEach((doc) => {
					const userData = doc.data();
					// Filtrar manualmente usuarios que ya seguimos o somos nosotros
					if (userData.uid !== authUser.uid && !followingList.includes(userData.uid)) {
						users.push({ ...userData, id: doc.id });
					}
				});

				// Tomar solo los primeros 3
				setSuggestedUsers(users.slice(0, 3));
			} catch (error) {
				showToast("Error", error.message, "error");
				console.error("Error obteniendo usuarios sugeridos:", error);
			} finally {
				setIsLoading(false);
			}
		};

		if (authUser) getSuggestedUsers();
	}, [authUser, showToast]);

	return { isLoading, suggestedUsers };
};

export default useGetSuggestedUsers;