import {
	Box,
	Container,
	Flex,
	Text,
	Avatar,
	VStack,
	HStack,
	Button,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useFollowUser from "../../hooks/useFollowUser";
import useAuthStore from "../../store/authStore";

const FollowersPage = () => {
	const { username } = useParams();
	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userProfile, setUserProfile] = useState(null);
	const showToast = useShowToast();
	const authUser = useAuthStore((state) => state.user);

	useEffect(() => {
		const getFollowData = async () => {
			setIsLoading(true);
			try {
				// Obtener perfil del usuario
				const usersRef = collection(firestore, "users");
				const userQuery = query(usersRef, where("username", "==", username));
				const userSnapshot = await getDocs(userQuery);

				if (userSnapshot.empty) {
					showToast("Error", "Usuario no encontrado", "error");
					return;
				}

				const userData = userSnapshot.docs[0].data();
				setUserProfile(userData);

				// Obtener seguidores
				if (userData.followers && userData.followers.length > 0) {
					const followersQuery = query(
						usersRef,
						where(documentId(), "in", userData.followers.slice(0, 10))
					);
					const followersSnapshot = await getDocs(followersQuery);
					const followersData = followersSnapshot.docs.map((doc) => ({
						...doc.data(),
						id: doc.id,
					}));
					setFollowers(followersData);

					// Si hay más de 10, hacer más queries
					if (userData.followers.length > 10) {
						for (let i = 10; i < userData.followers.length; i += 10) {
							const batch = userData.followers.slice(i, i + 10);
							const batchQuery = query(usersRef, where(documentId(), "in", batch));
							const batchSnapshot = await getDocs(batchQuery);
							const batchData = batchSnapshot.docs.map((doc) => ({
								...doc.data(),
								id: doc.id,
							}));
							setFollowers((prev) => [...prev, ...batchData]);
						}
					}
				}

				// Obtener seguidos
				if (userData.following && userData.following.length > 0) {
					const followingQuery = query(
						usersRef,
						where(documentId(), "in", userData.following.slice(0, 10))
					);
					const followingSnapshot = await getDocs(followingQuery);
					const followingData = followingSnapshot.docs.map((doc) => ({
						...doc.data(),
						id: doc.id,
					}));
					setFollowing(followingData);

					// Si hay más de 10, hacer más queries
					if (userData.following.length > 10) {
						for (let i = 10; i < userData.following.length; i += 10) {
							const batch = userData.following.slice(i, i + 10);
							const batchQuery = query(usersRef, where(documentId(), "in", batch));
							const batchSnapshot = await getDocs(batchQuery);
							const batchData = batchSnapshot.docs.map((doc) => ({
								...doc.data(),
								id: doc.id,
							}));
							setFollowing((prev) => [...prev, ...batchData]);
						}
					}
				}
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};

		getFollowData();
	}, [username, showToast]);

	if (isLoading) {
		return (
			<Flex justify="center" align="center" h="80vh">
				<Spinner size="xl" />
			</Flex>
		);
	}

	return (
		<Container maxW="container.md" py={5}>
			<VStack spacing={6} align="stretch">
				{/* Header */}
				<Flex align="center" gap={4}>
					<Avatar size="lg" src={userProfile?.profilePicURL} name={userProfile?.fullName} />
					<Box>
						<Text fontSize="xl" fontWeight="bold">
							{userProfile?.fullName}
						</Text>
						<Text fontSize="sm" color="gray.500">
							@{userProfile?.username}
						</Text>
					</Box>
				</Flex>

				{/* Tabs */}
				<Tabs colorScheme="blue">
					<TabList>
						<Tab>
							<Text fontWeight="semibold">
								Seguidores ({followers.length})
							</Text>
						</Tab>
						<Tab>
							<Text fontWeight="semibold">
								Siguiendo ({following.length})
							</Text>
						</Tab>
					</TabList>

					<TabPanels>
						{/* Seguidores */}
						<TabPanel px={0}>
							<VStack spacing={4} align="stretch">
								{followers.length === 0 ? (
									<Text textAlign="center" color="gray.500" py={8}>
										Sin seguidores aún
									</Text>
								) : (
									followers.map((user) => <UserItem key={user.id} user={user} />)
								)}
							</VStack>
						</TabPanel>

						{/* Siguiendo */}
						<TabPanel px={0}>
							<VStack spacing={4} align="stretch">
								{following.length === 0 ? (
									<Text textAlign="center" color="gray.500" py={8}>
										No sigue a nadie aún
									</Text>
								) : (
									following.map((user) => <UserItem key={user.id} user={user} />)
								)}
							</VStack>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</VStack>
		</Container>
	);
};

// Componente para cada usuario
const UserItem = ({ user }) => {
	const authUser = useAuthStore((state) => state.user);
	const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user.uid);
	const isOwnProfile = authUser?.uid === user.uid;

	return (
		<Flex justify="space-between" align="center" p={3} borderRadius="md" _hover={{ bg: "whiteAlpha.100" }}>
			<HStack spacing={3} as={RouterLink} to={`/${user.username}`} flex={1}>
				<Avatar size="md" src={user.profilePicURL} name={user.fullName} />
				<Box>
					<Text fontWeight="semibold" fontSize="sm">
						{user.fullName}
					</Text>
					<Text fontSize="xs" color="gray.400">
						@{user.username}
					</Text>
				</Box>
			</HStack>

			{authUser && !isOwnProfile && (
				<Button
					size="sm"
					colorScheme={isFollowing ? "gray" : "blue"}
					onClick={handleFollowUser}
					isLoading={isUpdating}
				>
					{isFollowing ? "Siguiendo" : "Seguir"}
				</Button>
			)}
		</Flex>
	);
};

export default FollowersPage;