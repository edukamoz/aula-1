import app from "./app";
import { connectMongo, connectSQLite } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // Inicializa as conexões com os bancos
  await connectSQLite();
  await connectMongo();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🗄️  Banco padrão configurado como: ${process.env.DEFAULT_DB || "sqlite"}`);
  });
};

startServer();
