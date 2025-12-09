import { Avatar, AvatarGroup, Button, Flex, Text, VStack, useDisclosure, IconButton, Tooltip } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import useUserProfileStore from "../../store/userProfileStore";
import useAuthStore from "../../store/authStore";
import EditProfile from "./EditProfile";
import useFollowUser from "../../hooks/useFollowUser";
import useSyncUserPosts from "../../hooks/useSyncUserPosts";
import { useState } from "react";

const ProfileHeader = () => {
	const { userProfile, setUserProfile } = useUserProfileStore();
	const authUser = useAuthStore((state) => state.user);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(userProfile?.uid);
	const { syncUserPosts } = useSyncUserPosts();
	const [isSyncing, setIsSyncing] = useState(false);
	const visitingOwnProfileAndAuth = authUser && authUser.username === userProfile.username;
	const visitingAnotherProfileAndAuth = authUser && authUser.username !== userProfile.username;

	const handleSync = async () => {
		setIsSyncing(true);
		const realPosts = await syncUserPosts(authUser.uid);
		if (realPosts !== null) {
			// Actualizar el store local
			setUserProfile({
				...userProfile,
				posts: realPosts
			});
		}
		setIsSyncing(false);
	};

	// Asegurarse de que posts es un array válido
	const postsCount = Array.isArray(userProfile?.posts) ? userProfile.posts.length : 0;
	const followersCount = Array.isArray(userProfile?.followers) ? userProfile.followers.length : 0;
	const followingCount = Array.isArray(userProfile?.following) ? userProfile.following.length : 0;

	return (
		<Flex gap={{ base: 4, sm: 10 }} py={10} direction={{ base: "column", sm: "row" }}>
			<AvatarGroup size={{ base: "xl", md: "2xl" }} justifySelf={"center"} alignSelf={"flex-start"} mx={"auto"}>
				<Avatar src={userProfile?.profilePicURL} alt='As a programmer logo' />
			</AvatarGroup>

			<VStack alignItems={"start"} gap={2} mx={"auto"} flex={1}>
				<Flex
					gap={4}
					direction={{ base: "column", sm: "row" }}
					justifyContent={{ base: "center", sm: "flex-start" }}
					alignItems={"center"}
					w={"full"}
				>
					<Text fontSize={{ base: "sm", md: "lg" }}>{userProfile?.username}</Text>
					{visitingOwnProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"white"}
								color={"black"}
								_hover={{ bg: "whiteAlpha.800" }}
								size={{ base: "xs", md: "sm" }}
								onClick={onOpen}
							>
								Editar Perfil
							</Button>
							<Tooltip label="Sincronizar contador de posts" placement="top">
								<IconButton
									icon={<RepeatIcon />}
									size={{ base: "xs", md: "sm" }}
									onClick={handleSync}
									isLoading={isSyncing}
									aria-label="Sincronizar posts"
									variant="ghost"
								/>
							</Tooltip>
						</Flex>
					)}
					{visitingAnotherProfileAndAuth && (
						<Flex gap={4} alignItems={"center"} justifyContent={"center"}>
							<Button
								bg={"blue.500"}
								color={"white"}
								_hover={{ bg: "blue.600" }}
								size={{ base: "xs", md: "sm" }}
								onClick={handleFollowUser}
								isLoading={isUpdating}
							>
								{isFollowing ? "Unfollow" : "Follow"}
							</Button>
						</Flex>
					)}
				</Flex>

				<Flex alignItems={"center"} gap={{ base: 2, sm: 4 }}>
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{postsCount}
						</Text>
						Publicaciones 
					</Text>
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{followersCount}
						</Text>
						Seguidores
					</Text>
					<Text fontSize={{ base: "xs", md: "sm" }}>
						<Text as='span' fontWeight={"bold"} mr={1}>
							{followingCount}
						</Text>
						Siguiendo
					</Text>
				</Flex>
				<Flex alignItems={"center"} gap={4}>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{userProfile?.fullName}
					</Text>
				</Flex>
				<Text fontSize={"sm"}>{userProfile?.bio}</Text>
			</VStack>
			{isOpen && <EditProfile isOpen={isOpen} onClose={onClose} />}
		</Flex>
	);
};

export default ProfileHeader;