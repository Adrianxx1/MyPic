import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useNotifications from "../../hooks/useNotifications";

const NotificationsPage = () => {
  const { notifications } = useNotifications();

  // Función para obtener la ruta según el tipo de notificación
  const getNotificationLink = (notification) => {
    if (notification.type === "follow") {
      // Si es un follow, ir al perfil del seguidor
      return `/${notification.senderUsername}`;
    } else if (notification.type === "like" || notification.type === "comment") {
      // Si es like o comentario, ir al post
      return `/posts/${notification.postId}`;
    }
    // Default: ir al perfil
    return `/${notification.senderUsername}`;
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Notificaciones
      </Text>

      {notifications.length === 0 ? (
        <Text color="gray.500">No tienes notificaciones por ahora.</Text>
      ) : (
        notifications.map((n) => (
          <Link key={n.id} to={getNotificationLink(n)} style={{ textDecoration: "none" }}>
            <Flex
              align="center"
              gap={3}
              p={3}
              borderBottom="1px solid"
              borderColor="gray.700"
              _hover={{ bg: "whiteAlpha.200" }}
              cursor="pointer"
              transition="background 0.2s"
            >
              <Avatar src={n.senderPhoto} size="sm" />

              <Box flex="1">
                <Text>
                  <Text as="span" fontWeight="bold">
                    {n.senderUsername}
                  </Text>
                  <Text as="span" color="gray.300" ml={2}>
                    {n.action}
                  </Text>
                </Text>

                {/* Fecha */}
                {n.createdAt?.toDate && (
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    {n.createdAt.toDate().toLocaleString()}
                  </Text>
                )}
              </Box>

              {/* Indicador de no leída (opcional) */}
              {!n.read && (
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg="blue.500"
                  flexShrink={0}
                />
              )}
            </Flex>
          </Link>
        ))
      )}
    </Box>
  );
};

export default NotificationsPage;