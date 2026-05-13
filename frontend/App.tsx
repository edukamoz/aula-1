import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Navigator } from "./src/navigation/Navigator";

export default function App() {
  useEffect(() => {
    console.log("🚀 App iniciando...");
    console.log("📱 Verificando banco de dados...");
  }, []);

  return (
    <SafeAreaProvider>
      <Navigator />
      <Toast />
    </SafeAreaProvider>
  );
}
