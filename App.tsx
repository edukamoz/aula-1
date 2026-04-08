import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Forms } from "./src/components/Forms";
import {
  Banco,
  createTable,
  deletaUsuario,
  exibirUsuarioPorId,
  exibirUsuarios,
} from "./src/config/bd";

export interface Usuario {
  NOME_US: string;
  EMAIL_US: string;
  ID_US: number;
}

export default function App() {
  useEffect(() => {
    async function Main() {
      const rbd = await Banco();
      await createTable(rbd);
      // await inserirUsuario(rbd, "Jorge", "jorge@gmail.com");
      const campos = await exibirUsuarios(rbd);
      for (const reg of campos as Usuario[]) {
        console.log(reg.NOME_US, reg.EMAIL_US, reg.ID_US);
      }
      const camposId = await exibirUsuarioPorId(rbd, 3);
      console.log(camposId?.NOME_US, camposId?.EMAIL_US, camposId?.ID_US);

      await deletaUsuario(rbd, 1);
    }
    Main();
  }, []);

  return (
    <SafeAreaProvider>
      <Forms />
      <Toast />
    </SafeAreaProvider>
  );
}
