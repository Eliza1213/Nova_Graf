import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const CambiarContraseña = () => {
  const navigate = useNavigate();
  const correo = localStorage.getItem("correoRecuperacion");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaContraseña !== confirmar) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/actualizar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaContraseña }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (res.status === 200) {
        localStorage.removeItem("correoRecuperacion");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      setMensaje("Error al actualizar la contraseña.");
    }
  };

  return (
    <div className="cambiar-container">
      <h2>Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nueva contraseña:</label>
          <input
            type="password"
            value={nuevaContraseña}
            onChange={(e) => setNuevaContraseña(e.target.value)}
            required
            placeholder="Ingresa la nueva contraseña"
          />
        </div>

        <div className="form-group">
          <label>Confirmar contraseña:</label>
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            placeholder="Repite la nueva contraseña"
          />
        </div>

        <button type="submit">Guardar nueva contraseña</button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default CambiarContraseña;
