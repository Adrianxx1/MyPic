import { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { BsGrid3X3, BsSuitHeart } from "react-icons/bs";
import useAuthStore from "../../store/authStore";
import ProfilePosts from "../Profile/ProfilePosts";
import ProfileLikedPosts from "../Profile/ProfileLikedPosts";

const ProfileTabs = ({ user }) => {
  const [activeTab, setActiveTab] = useState("posts");
  const authUser = useAuthStore((state) => state.user);

  return (
    <>
      {/* Tabs */}
      <Flex
        w="full"
        justifyContent="center"
        gap={{ base: 4, sm: 10 }}
        textTransform="uppercase"
        fontWeight="bold"
      >
        {/* Publicaciones */}
        <Flex
          borderTop={activeTab === "posts" ? "2px solid white" : "1px solid gray"}
          alignItems="center"
          p="3"
          gap={1}
          cursor="pointer"
          onClick={() => setActiveTab("posts")}
        >
          <Box fontSize={20}>
            <BsGrid3X3 />
          </Box>
          <Text fontSize={12} display={{ base: "none", sm: "block" }}>
            Publicaciones
          </Text>
        </Flex>

        {/* Me gusta (solo el dueño del perfil) */}
        {authUser?.uid === user?.uid && (
          <Flex
            borderTop={activeTab === "likes" ? "2px solid white" : "1px solid gray"}
            alignItems="center"
            p="3"
            gap={1}
            cursor="pointer"
            onClick={() => setActiveTab("likes")}
          >
            <Box fontSize={20}>
              <BsSuitHeart />
            </Box>
            <Text fontSize={12} display={{ base: "none", sm: "block" }}>
              Me gusta
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Contenido */}
      <Box mt={6}>
        {activeTab === "posts" && <ProfilePosts />}
        {activeTab === "likes" && <ProfileLikedPosts user={user} />}
      </Box>
    </>
  );
};

export default ProfileTabs;
