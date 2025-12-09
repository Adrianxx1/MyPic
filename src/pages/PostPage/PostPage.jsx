// src/pages/PostPage/PostPage.jsx
import { Box, Container, Flex, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import FeedPost from "../../components/FeedPosts/FeedPost";

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPost = async () => {
      try {
        const postRef = doc(firestore, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() });
        }
      } catch (error) {
        console.error("Error al obtener post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPost();
  }, [postId]);

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!post) {
    return (
      <Container maxW="container.md" py={10}>
        <Text fontSize="xl" textAlign="center">
          Post no encontrado
        </Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={5}>
      <Box>
        <FeedPost post={post} />
      </Box>
    </Container>
  );
};

export default PostPage;