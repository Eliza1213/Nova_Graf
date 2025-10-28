import express from 'express';
import bcrypt from 'bcrypt';
import poolPromise from '../db.js';

const router = express.Router();

router.post("/registro", async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, correo, contraseña, telefono, pregunta_secreta } = req.body;

  if (!nombre || !apellido_paterno || !correo || !contraseña) {
    return res.status(400).send({ message: "Faltan campos obligatorios" });
  }

  try {
    const hashed = await bcrypt.hash(contraseña, 10);
    const pool = await poolPromise;

    await pool.request()
      .input("nombre", nombre)
      .input("apellido_paterno", apellido_paterno)
      .input("apellido_materno", apellido_materno)
      .input("correo", correo)
      .input("contraseña", hashed)
      .input("telefono", telefono)
      .input("pregunta_secreta", pregunta_secreta)
      .query(`
        INSERT INTO Usuarios (nombre, apellido_paterno, apellido_materno, correo, contraseña, telefono, pregunta_secreta)
        VALUES (@nombre, @apellido_paterno, @apellido_materno, @correo, @contraseña, @telefono, @pregunta_secreta)
      `);

    res.send({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error interno del servidor" });
  }
});


// ================= LOGIN =================

router.post("/login", async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).send({ message: "Faltan campos obligatorios" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("correo", correo)
      .query("SELECT * FROM Usuarios WHERE correo = @correo");

    const user = result.recordset[0];
    if (!user) return res.status(404).send({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) return res.status(401).send({ message: "Contraseña incorrecta" });

    res.send({ message: "Login exitoso", user: { id: user.id, nombre: user.nombre, correo: user.correo } });
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    res.status(500).send({ message: "Error interno del servidor" });
  }
});

export default router;
