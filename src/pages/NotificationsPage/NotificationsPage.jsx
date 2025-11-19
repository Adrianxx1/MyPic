import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import useNotifications from "../../hooks/useNotifications";

const NotificationsPage = () => {
  const { notifications } = useNotifications();

  return (
    <Box p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Notificaciones
      </Text>

      {notifications.length === 0 ? (
        <Text color="gray.500">No tienes notificaciones por ahora.</Text>
      ) : (
        notifications.map((n) => (
          <Flex
            key={n.id}
            align="center"
            gap={3}
            p={3}
            borderBottom="1px solid"
            borderColor="gray.700"
          >
            <Avatar src={n.senderPhoto} size="sm" />

            <Box>
              <Text fontWeight="bold">{n.senderUsername}</Text>

              {/* ----------- MOSTRAR ACCIÓN DINÁMICA ----------- */}
              <Text color="gray.300">{n.action}</Text>

              {/* opcional: fecha */}
              {n.createdAt?.toDate && (
                <Text color="gray.500" fontSize="xs">
                  {n.createdAt.toDate().toLocaleString()}
                </Text>
              )}
            </Box>
          </Flex>
        ))
      )}
    </Box>
  );
};

export default NotificationsPage;
