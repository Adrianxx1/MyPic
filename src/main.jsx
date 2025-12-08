import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { BrowserRouter } from "react-router-dom";

const styles = {
	global: (props) => ({
		body: {
			bg: mode("gray.100", "#000")(props),
			color: mode("gray.800", "whiteAlpha.900")(props),
		},
	}),
};

const config = {
	initialColorMode: "dark",
	useSystemColorMode: false,
};

// extend the theme
const theme = extendTheme({ config, styles });

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</BrowserRouter>
	</React.StrictMode>
);

// ==========================
//   PWA SERVICE WORKER ULTRA-ROBUSTO
// ==========================

if ("serviceWorker" in navigator) {
	window.addEventListener("load", async () => {
		try {
			// Registrar el Service Worker con configuración agresiva
			const registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none", // ⚠️ CRÍTICO: Nunca cachear el SW
			});

			console.log("✅ Service Worker registrado:", registration.scope);

			// Forzar actualización inmediata del SW
			registration.update();

			// Si hay un SW esperando, activarlo inmediatamente
			if (registration.waiting) {
				registration.waiting.postMessage({ type: "SKIP_WAITING" });
			}

			// Esperar a que el SW esté completamente activo
			await navigator.serviceWorker.ready;
			console.log("✅ Service Worker listo y controlando la página");

			// Detectar cuando hay una nueva versión del SW
			registration.addEventListener("updatefound", () => {
				const newWorker = registration.installing;
				
				newWorker.addEventListener("statechange", () => {
					// Si el nuevo SW está instalado y hay un SW anterior activo
					if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
						console.log("🔄 Nueva versión disponible");
						
						// Opcional: Mostrar notificación al usuario
						if (confirm("Nueva versión disponible. ¿Recargar ahora?")) {
							newWorker.postMessage({ type: "SKIP_WAITING" });
							window.location.reload();
						}
					}
				});
			});

			// Recargar automáticamente cuando el SW cambie
			let refreshing = false;
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				if (refreshing) return;
				refreshing = true;
				console.log("🔄 Service Worker actualizado, recargando...");
				window.location.reload();
			});

			// Pre-cachear contenido importante cuando sea necesario
			// Puedes llamar esto cuando el usuario visite posts específicos
			window.precacheContent = async (urls) => {
				if (navigator.serviceWorker.controller) {
					navigator.serviceWorker.controller.postMessage({
						type: "CACHE_URLS",
						urls: urls,
					});
				}
			};

		} catch (error) {
			console.error("❌ Error registrando Service Worker:", error);
		}
	});

	// Detectar cambios de conexión
	window.addEventListener("online", () => {
		console.log("🌐 Conexión restaurada");
		// Actualizar el SW cuando vuelva la conexión
		navigator.serviceWorker.ready.then((registration) => {
			registration.update();
		});
	});

	window.addEventListener("offline", () => {
		console.log("📡 Sin conexión - Modo offline activado");
	});
}

// Opcional: Mostrar estado de conexión en consola al inicio
console.log(`🌐 Estado inicial: ${navigator.onLine ? "Online" : "Offline"}`);