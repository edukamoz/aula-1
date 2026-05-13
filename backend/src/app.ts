import express from "express";
import addressesRoutes from "./routes/addresses.routes";

const app = express();

app.use(express.json());

// Rotas
app.use("/addresses", addressesRoutes);

export default app;
