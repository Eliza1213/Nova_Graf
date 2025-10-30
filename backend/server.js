import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js"; // 👈 Importa la conexión a MongoDB
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`)
);
