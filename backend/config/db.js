import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Conectado a MongoDB Atlas");

    // 🔍 Prueba: intenta acceder a una colección
    try {
      const test = await mongoose.connection.db.collection("usuarios").findOne({});
      console.log("📦 Acceso a colección 'usuarios':", test);
    } catch (err) {
      console.error("❌ Error al acceder a la colección:", err.message);
    }
  })
  .catch((err) => console.error("❌ Error de conexión a MongoDB:", err.message));

export default mongoose;

