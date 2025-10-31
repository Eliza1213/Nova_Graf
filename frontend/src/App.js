// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Registro from "./components/registro";
import Login from "./components/Login";
import Home from "./components/Home";
import RecuperarContraseña from "./components/RecuperarContraseña";
import VerificarCodigo from "./components/VerificarCodigo";
import CambiarContraseña from "./components/CambiarContraseña";
import RecuperarPregunta from "./components/RecuperarPregunta";
import IngresarCorreo from "./components/IngresarCorreo";
import ActivarCuenta from "./components/ActivarCuenta";


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />
        <Route path="/verificar-codigo" element={<VerificarCodigo />} />
        <Route path="/cambiar-contrasena" element={<CambiarContraseña />} />
        <Route path="/recuperar-pregunta" element={<RecuperarPregunta />} /> 
        <Route path="/ingresar-correo" element={<IngresarCorreo />} />   
        <Route path="/activar-cuenta" element={<ActivarCuenta />} /> 
      </Routes>
    </div>
  );
}

export default App;
