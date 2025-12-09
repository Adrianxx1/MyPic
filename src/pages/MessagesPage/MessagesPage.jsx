import {
	Box,
	Flex,
	Text,
	Input,
	Avatar,
	InputGroup,
	InputLeftElement,
	VStack,
	HStack,
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { SearchIcon } from "@chakra-ui/icons";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import useGetUserMessages from "../../hooks/useGetUserMessages";
import useSendMessage from "../../hooks/useSendMessage";
import useAuthStore from "../../store/authStore";

const MessagesPage = () => {
	const [selectedUser, setSelectedUser] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [messageText, setMessageText] = useState("");
	const [searchUsers, setSearchUsers] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const authUser = useAuthStore((state) => state.user);
	const { conversations, isLoading } = useGetUserMessages();
	const { sendMessage, isSending } = useSendMessage();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const handleSendMessage = async () => {
		if (!messageText.trim() || !selectedUser) return;
		await sendMessage(selectedUser.uid, messageText);
		setMessageText("");
	};

	const handleSearchUsers = async (searchTerm) => {
		if (!searchTerm.trim()) {
			setSearchUsers([]);
			return;
		}

		setIsSearching(true);
		try {
			const usersRef = collection(firestore, "users");
			const q = query(
				usersRef,
				where("username", ">=", searchTerm.toLowerCase()),
				where("username", "<=", searchTerm.toLowerCase() + "\uf8ff"),
				limit(10)
			);
			const querySnapshot = await getDocs(q);
			const users = [];
			querySnapshot.forEach((doc) => {
				if (doc.id !== authUser.uid) {
					users.push({ uid: doc.id, ...doc.data() });
				}
			});
			setSearchUsers(users);
		} catch (error) {
			console.error("Error buscando usuarios:", error);
		}
		setIsSearching(false);
	};

	const handleSelectNewUser = (user) => {
		setSelectedUser({
			uid: user.uid,
			username: user.username,
			fullName: user.fullName,
			profilePicURL: user.profilePicURL,
			messages: [],
		});
		onClose();
		setSearchUsers([]);
	};

	const filteredConversations = conversations.filter((conv) =>
		conv.username?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<Flex h="100vh" maxW="1200px" mx="auto" px={4} py={4}>
			{/* Panel izquierdo - Conversaciones */}
			<Box
				w={{ base: "100%", md: "350px" }}
				display={{ base: selectedUser ? "none" : "block", md: "block" }}
				borderWidth="1px"
				borderColor="whiteAlpha.300"
				borderRadius="lg"
				overflow="hidden"
			>
				<VStack spacing={0} align="stretch" h="100%">
					{/* Header */}
					<Flex justify="space-between" align="center" p={4} borderBottomWidth="1px" borderColor="whiteAlpha.300">
						<Text fontSize="xl" fontWeight="bold">
							Mensajes
						</Text>
						<Button colorScheme="blue" size="sm" onClick={onOpen}>
							+ Nuevo
						</Button>
					</Flex>

					{/* Buscador */}
					<Box p={4} borderBottomWidth="1px" borderColor="whiteAlpha.300">
						<InputGroup size="sm">
							<InputLeftElement>
								<SearchIcon color="gray.300" />
							</InputLeftElement>
							<Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</InputGroup>
					</Box>

					{/* Lista de conversaciones */}
					<VStack spacing={0} align="stretch" flex={1} overflowY="auto">
						{isLoading ? (
							<Text textAlign="center" color="gray.500" py={4}>
								Cargando...
							</Text>
						) : filteredConversations.length === 0 ? (
							<VStack py={8} spacing={3}>
								<Text color="gray.500">No hay conversaciones</Text>
								<Button colorScheme="blue" size="sm" onClick={onOpen}>
									Iniciar chat
								</Button>
							</VStack>
						) : (
							filteredConversations.map((conv) => (
								<Box
									key={conv.uid}
									p={3}
									cursor="pointer"
									_hover={{ bg: "whiteAlpha.200" }}
									bg={selectedUser?.uid === conv.uid ? "whiteAlpha.300" : "transparent"}
									onClick={() => setSelectedUser(conv)}
									borderBottomWidth="1px"
									borderColor="whiteAlpha.100"
								>
									<HStack spacing={3}>
										<Avatar size="sm" src={conv.profilePicURL} name={conv.fullName} />
										<Box flex={1} minW={0}>
											<Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
												{conv.fullName}
											</Text>
											<Text fontSize="xs" color="gray.400" noOfLines={1}>
												{conv.lastMessage || "Nuevo chat"}
											</Text>
										</Box>
									</HStack>
								</Box>
							))
						)}
					</VStack>
				</VStack>
			</Box>

			{/* Panel derecho - Chat */}
			<Box
				flex={1}
				ml={{ base: 0, md: 4 }}
				display={{ base: selectedUser ? "block" : "none", md: "block" }}
				borderWidth="1px"
				borderColor="whiteAlpha.300"
				borderRadius="lg"
				overflow="hidden"
			>
				{selectedUser ? (
					<Flex direction="column" h="100%">
						{/* Header del chat */}
						<HStack p={4} borderBottomWidth="1px" borderColor="whiteAlpha.300" bg="whiteAlpha.50">
							<Button
								size="sm"
								variant="ghost"
								display={{ base: "flex", md: "none" }}
								onClick={() => setSelectedUser(null)}
							>
								← Atrás
							</Button>
							<Avatar size="sm" src={selectedUser.profilePicURL} name={selectedUser.fullName} />
							<Text fontWeight="semibold">{selectedUser.fullName}</Text>
						</HStack>

						{/* Mensajes */}
						<VStack flex={1} p={4} spacing={3} align="stretch" overflowY="auto" bg="blackAlpha.200">
							{selectedUser.messages?.length > 0 ? (
								selectedUser.messages.map((msg, idx) => (
									<Flex key={idx} justify={msg.senderId === authUser.uid ? "flex-end" : "flex-start"}>
										<Box
											maxW="70%"
											bg={msg.senderId === authUser.uid ? "blue.500" : "whiteAlpha.300"}
											px={4}
											py={2}
											borderRadius="lg"
										>
											<Text fontSize="sm">{msg.text}</Text>
											<Text fontSize="xs" color="whiteAlpha.700" mt={1}>
												{new Date(msg.createdAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Text>
										</Box>
									</Flex>
								))
							) : (
								<Flex flex={1} align="center" justify="center">
									<Text color="gray.500">Envía el primer mensaje</Text>
								</Flex>
							)}
						</VStack>

						{/* Input */}
						<HStack p={4} borderTopWidth="1px" borderColor="whiteAlpha.300" bg="whiteAlpha.50">
							<Input
								placeholder="Escribe un mensaje..."
								value={messageText}
								onChange={(e) => setMessageText(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
							/>
							<Button colorScheme="blue" onClick={handleSendMessage} isLoading={isSending} isDisabled={!messageText.trim()}>
								Enviar
							</Button>
						</HStack>
					</Flex>
				) : (
					<Flex h="100%" align="center" justify="center" direction="column" gap={4}>
						<Text fontSize="xl" color="gray.500">
							Selecciona una conversación
						</Text>
						<Text fontSize="sm" color="gray.600">
							Elige un chat de la lista o crea uno nuevo
						</Text>
						<Button colorScheme="blue" onClick={onOpen}>
							+ Nuevo mensaje
						</Button>
					</Flex>
				)}
			</Box>

			{/* Modal buscar usuarios */}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent bg="black" borderWidth="1px" borderColor="whiteAlpha.300">
					<ModalHeader>Nuevo mensaje</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4} align="stretch">
							<InputGroup>
								<InputLeftElement>
									<SearchIcon color="gray.300" />
								</InputLeftElement>
								<Input placeholder="Buscar usuarios por username..." onChange={(e) => handleSearchUsers(e.target.value)} />
							</InputGroup>

							<VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
								{isSearching ? (
									<Text textAlign="center" py={4} color="gray.500">
										Buscando...
									</Text>
								) : searchUsers.length > 0 ? (
									searchUsers.map((user) => (
										<Box
											key={user.uid}
											p={3}
											cursor="pointer"
											borderRadius="md"
											_hover={{ bg: "whiteAlpha.200" }}
											onClick={() => handleSelectNewUser(user)}
										>
											<HStack spacing={3}>
												<Avatar size="sm" src={user.profilePicURL} name={user.fullName} />
												<Box>
													<Text fontWeight="semibold" fontSize="sm">
														{user.fullName}
													</Text>
													<Text fontSize="xs" color="gray.400">
														@{user.username}
													</Text>
												</Box>
											</HStack>
										</Box>
									))
								) : (
									<Text textAlign="center" py={8} color="gray.500" fontSize="sm">
										Escribe un username para buscar
									</Text>
								)}
							</VStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
};

export default MessagesPage;