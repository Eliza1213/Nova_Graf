import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
const IngresarCorreo = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const metodo = localStorage.getItem("metodoRecuperacion");
   

const handleVolver = () => {
    navigate("/login");
  };  
  const handleEnviar = async (e) => {
    e.preventDefault();
    localStorage.setItem("correoRecuperacion", correo);

    if (metodo === "correo") {
      try {
        const res = await fetch("https://novagraf-production.up.railway.app/api/auth/recuperar-contrasenia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, opcion: "correo" }),
        });
        const data = await res.json();
        setMensaje(data.message);
        if (res.status === 200) navigate("/verificar-codigo");
      } catch (err) {
        setMensaje("Error al enviar el código.");
      }
    } else if (metodo === "pregunta") {
      navigate("/recuperar-pregunta");
    }
  };

  return (
    <div className="recuperar-container">
      <h2>Ingresa tu correo</h2>
      <form onSubmit={handleEnviar}>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          placeholder="Ingresa tu correo"
        />
        <button type="submit">Continuar</button>
      </form>
      
      {mensaje && <p>{mensaje}</p>}

      <div className="volver-link">
        <span onClick={handleVolver}>
          <FaArrowLeft style={{ marginRight: '8px' }} />
          Volver al inicio de sesión
        </span>
      </div>

    </div>
  );
};

export default IngresarCorreo;
