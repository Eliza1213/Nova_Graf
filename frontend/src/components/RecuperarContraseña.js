import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecuperarContraseña = () => {
  const navigate = useNavigate();
  const [opcion, setOpcion] = useState("correo");

  const handleElegir = () => {
    localStorage.setItem("metodoRecuperacion", opcion);
    navigate("/ingresar-correo");
  };

  return (
    <div className="recuperar-container">
      <h2>Recuperar Contraseña</h2>
      <label>Método de recuperación:</label>
      <select value={opcion} onChange={(e) => setOpcion(e.target.value)}>
        <option value="correo">Enviar código al correo</option>
        <option value="pregunta">Pregunta secreta</option>
      </select>
      <button onClick={handleElegir}>Elegir</button>
    </div>
  );
};

export default RecuperarContraseña;
