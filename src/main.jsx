import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import App from "./App";
import "./index.css";
import {mode} from '@chakra-ui/theme-tools'
import { color } from "framer-motion";

const styles = {
  global: (props) => ({
    body:{
      bg:mode("gray.100","#000")(props),
      color:mode("gray.800", "whiteAlpha.900")(props)
    }
  })
}

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: 'false',
} 
const theme = extendTheme({ config,styles })

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);