import { Box, Flex, Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AiOutlineMessage } from "react-icons/ai";

const Messages = () => {
	return (
		<Tooltip
			hasArrow
			label={"Mensajes"}
			placement="right"
			ml={1}
			openDelay={500}
			display={{ base: "block", md: "none" }}
		>
			<Link to={"/messages"}>
				<Flex
					alignItems={"center"}
					gap={4}
					_hover={{ bg: "whiteAlpha.400" }}
					borderRadius={6}
					p={2}
					w={{ base: 10, md: "full" }}
					justifyContent={{ base: "center", md: "flex-start" }}
				>
					<AiOutlineMessage size={25} />
					<Box display={{ base: "none", md: "block" }}>Mensajes</Box>
				</Flex>
			</Link>
		</Tooltip>
	);
};

export default Messages;