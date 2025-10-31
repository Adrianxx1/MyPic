import {
  Container,
  Flex,
  Link,
  Skeleton,
  SkeletonCircle,
  Text,
  VStack,
} from "@chakra-ui/react";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import useGetUserProfileByUsername from "../../hooks/useGetUserProfileByUsername";
import { useParams, Link as RouterLink } from "react-router-dom";

const ProfilePage = () => {
  const { username } = useParams();
  const { isLoading, userProfile } = useGetUserProfileByUsername(username);

  const userNotFound = !isLoading && !userProfile;
  if (userNotFound) return <UserNotFound />;

  return (
    <Container maxW="container.lg" py={5}>
      {/* Header del perfil */}
      <Flex
        py={10}
        px={4}
        pl={{ base: 4, md: 10 }}
        w="full"
        mx="auto"
        flexDirection="column"
      >
        {!isLoading && userProfile && <ProfileHeader user={userProfile} />}
        {isLoading && <ProfileHeaderSkeleton />}
      </Flex>

      {/* Tabs del perfil */}
      <Flex
        px={{ base: 2, sm: 4 }}
        maxW="full"
        mx="auto"
        borderTop="1px solid"
        borderColor="whiteAlpha.300"
        direction="column"
      >
        {!isLoading && userProfile && <ProfileTabs user={userProfile} />}
      </Flex>
    </Container>
  );
};

export default ProfilePage;

// Skeleton para el encabezado del perfil
const ProfileHeaderSkeleton = () => {
  return (
    <Flex
      gap={{ base: 4, sm: 10 }}
      py={10}
      direction={{ base: "column", sm: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <SkeletonCircle size="24" />
      <VStack
        alignItems={{ base: "center", sm: "flex-start" }}
        gap={2}
        mx="auto"
        flex={1}
      >
        <Skeleton height="12px" width="150px" />
        <Skeleton height="12px" width="100px" />
      </VStack>
    </Flex>
  );
};

// Vista de usuario no encontrado
const UserNotFound = () => {
  return (
    <Flex flexDir="column" textAlign="center" mx="auto">
      <Text fontSize="2xl">Usuario no encontrado 😕</Text>
      <Link
        as={RouterLink}
        to="/"
        color="blue.400"
        w="max-content"
        mx="auto"
        mt={3}
      >
        Volver al inicio
      </Link>
    </Flex>
  );
};
