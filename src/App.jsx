import { Button, HStack } from "@chakra-ui/react";

export default function App() {
  return (
    <HStack spacing={4} justify="center" mt={10}>
      <Button colorScheme="teal">Botón 1</Button>
      <Button colorScheme="blue">Botón 2</Button>
    </HStack>
  );
}