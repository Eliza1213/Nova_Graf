import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js"; // 👈 Importa la conexión a MongoDB
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas del backend
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
