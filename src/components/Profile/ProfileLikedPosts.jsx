import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebase";
import useAuthStore from "../../store/authStore";
import ProfilePost from "./ProfilePost";

const ProfileLikedPosts = ({ user }) => {
  const authUser = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!authUser || authUser.uid !== user.uid) return;
      setIsLoading(true);
      try {
        const q = query(collection(firestore, "posts"), where("likes", "array-contains", authUser.uid));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLikedPosts(posts);
      } catch (error) {
        console.error("Error al cargar posts con like:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedPosts();
  }, [authUser, user]);

  if (!isLoading && likedPosts.length === 0) {
    return (
      <Flex flexDir="column" textAlign="center" mx="auto" mt={10}>
        <Text fontSize="2xl">Aún no tienes publicaciones con "Me gusta" ❤️</Text>
      </Flex>
    );
  }

  return (
    <Grid
      templateColumns={{
        sm: "repeat(1, 1fr)",
        md: "repeat(3, 1fr)",
      }}
      gap={1}
      columnGap={1}
    >
      {isLoading
        ? [0, 1, 2].map((_, idx) => (
            <VStack key={idx} alignItems="flex-start" gap={4}>
              <Skeleton w="full">
                <Box h="300px">contents wrapped</Box>
              </Skeleton>
            </VStack>
          ))
        : likedPosts.map((post) => <ProfilePost key={post.id} post={post} />)}
    </Grid>
  );
};

export default ProfileLikedPosts;
