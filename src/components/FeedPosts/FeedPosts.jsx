import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack } from "@chakra-ui/react";
import FeedPost from "./FeedPost";
import useGetFeedPosts from "../../hooks/useGetFeedPosts";

const FeedPosts = () => {
	const { isLoading, posts, isOnline, fromCache } = useGetFeedPosts();

	return (
		<Container maxW={"container.sm"} py={10} px={2}>
			{/* Indicador offline */}
			{!isOnline && posts.length > 0 && (
				<Box 
					bg="orange.500" 
					color="white" 
					p={3} 
					borderRadius="md" 
					mb={4}
					textAlign="center"
					fontWeight="bold"
				>
					📡 Modo Offline - {posts.length} post{posts.length !== 1 ? 's' : ''} guardado{posts.length !== 1 ? 's' : ''}
				</Box>
			)}

			{/* Skeleton SOLO si está cargando Y NO hay posts todavía */}
			{isLoading && posts.length === 0 &&
				[0, 1, 2].map((_, idx) => (
					<VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
						<Flex gap='2'>
							<SkeletonCircle size='10' />
							<VStack gap={2} alignItems={"flex-start"}>
								<Skeleton height='10px' w={"200px"} />
								<Skeleton height='10px' w={"200px"} />
							</VStack>
						</Flex>
						<Skeleton w={"full"}>
							<Box h={"400px"}>contents wrapped</Box>
						</Skeleton>
					</VStack>
				))}

			{/* Posts - mostrar aunque esté cargando en background */}
			{posts.length > 0 && posts.map((post) => <FeedPost key={post.id} post={post} />)}
			
			{/* Sin posts (solo si terminó de cargar Y no hay posts) */}
			{!isLoading && posts.length === 0 && (
				<>
					<Text fontSize={"md"} color={"red.400"}>
						Vaya.. parece que aun no tienes amigos.
					</Text>
					<Text color={"red.400"}>Comienza a crear nuevas amistades</Text>
				</>
			)}
		</Container>
	);
};

export default FeedPosts;