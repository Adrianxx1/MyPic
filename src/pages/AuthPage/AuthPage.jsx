import { Container, Flex, VStack, Box, Image, Link } from "@chakra-ui/react";
import AuthForm from "../../components/AuthForm/AuthForm";

const AuthPage = () => {
	return (
		<Flex minH={"100vh"} justifyContent={"center"} alignItems={"center"} px={4}>
			<Container maxW={"container.md"} padding={0}>
				<Flex justifyContent={"center"} alignItems={"center"} gap={10}>
					{/* Left hand-side */}
					<Box display={{ base: "none", md: "block" }}>
						<Image src='/auth.png' h={650} alt='Phone img' />
					</Box>

					{/* Right hand-side */}
					<VStack spacing={1} align={"stretch"}>
						<AuthForm />
						<Box textAlign={"center"} mb={0}>Instala nuestra aplicación.</Box>
						<Flex gap={1} justifyContent={"center"} mt={0}>
							<Link href="https://drive.google.com/drive/folders/1GhJB5NAcGuNSZnTNmtCxuU4blKqE0Owy?usp=sharing" isExternal>
								<Image 
									src='/descarga.png' 
									h={"180"} 
									alt='descarga logo'
									cursor={"pointer"}
									_hover={{ transform: "scale(1.05)", transition: "0.3s" }}
								/>
							</Link>
						</Flex>
					</VStack>
				</Flex>
			</Container>
		</Flex>
	);
};

export default AuthPage;