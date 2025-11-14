// src/components/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaSearch, 
  FaUser, 
  FaShoppingCart, 
  FaPalette,
  FaPrint,
  FaTags,
  FaDownload,
  FaShieldAlt,
  FaRocket,
  FaAward,
  FaSignInAlt,
  FaUserPlus
} from 'react-icons/fa';

import "../inicio.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleServiceClick = (service) => {
    // Redirigir al login si intentan acceder a servicios sin estar logueados
    navigate("/login");
  };

  return (
    <div className="landing-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="logo-nav">
            <h1>Nova Graf</h1>
          </div>
          <ul className="nav-menu">
            <li>Nosotros</li>
            <li>Etiqueta Empresarial</li>
            <li>Impresión Digital</li>
            <li>Diseño Gráfico</li>
            <li>Contacto</li>
          </ul>
          <div className="nav-icons">
            <FaSearch className="nav-icon" title="Buscar" />
            <FaUser className="nav-icon" title="Mi cuenta" onClick={handleLogin} />
            <FaShoppingCart className="nav-icon" title="Carrito de compras" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Nova Graf</h1>
          <p className="hero-subtitle">
            Descubre un mundo de posibilidades en diseño e impresión. 
            Donde la creatividad se encuentra con la tecnología para dar vida a tus ideas.
          </p>
          
          {/* Botones de Autenticación */}
          <div className="auth-buttons">
            <button className="btn-primary" onClick={handleLogin}>
              <FaSignInAlt className="btn-icon" />
              Iniciar Sesión
            </button>
            <button className="btn-secondary" onClick={handleRegister}>
              <FaUserPlus className="btn-icon" />
              Registrarse
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Nuestros Servicios Destacados</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaPalette className="feature-icon" />
              <h3>Diseño Personalizado</h3>
              <p>Crea diseños únicos que reflejen la esencia de tu marca con nuestras herramientas avanzadas.</p>
              <button className="feature-btn" onClick={() => handleServiceClick("Diseño")}>
                Explorar
              </button>
            </div>
            
            <div className="feature-card">
              <FaPrint className="feature-icon" />
              <h3>Impresión de Calidad</h3>
              <p>Obtén resultados impecables con nuestra tecnología de impresión de última generación.</p>
              <button className="feature-btn" onClick={() => handleServiceClick("Impresión")}>
                Ver Opciones
              </button>
            </div>
            
            <div className="feature-card">
              <FaTags className="feature-icon" />
              <h3>Etiquetas Profesionales</h3>
              <p>Desarrolla etiquetas que destaquen tus productos y comuniquen tu valor profesional.</p>
              <button className="feature-btn" onClick={() => handleServiceClick("Etiquetas")}>
                Crear Etiqueta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          <h2 className="section-title">¿Qué Ofrecemos?</h2>
          <div className="services-grid">
            <div className="service-item">
              <FaDownload className="service-icon" />
              <h3>Material Descargable</h3>
              <p>Plantillas y recursos listos para usar</p>
            </div>
            
            <div className="service-item">
              <FaShieldAlt className="service-icon" />
              <h3>Branding Corporativo</h3>
              <p>Desarrollo completo de identidad visual</p>
            </div>
            
            <div className="service-item">
              <FaRocket className="service-icon" />
              <h3>Soluciones Rápidas</h3>
              <p>Entrega express para proyectos urgentes</p>
            </div>
            
            <div className="service-item">
              <FaAward className="service-icon" />
              <h3>Calidad Premium</h3>
              <p>Materiales y acabados de primera calidad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">¿Listo para comenzar?</h2>
          <p className="cta-text">
            Únete a miles de creativos que ya están transformando sus ideas en realidad con Nova Graf
          </p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={handleRegister}>
              Crear Cuenta Gratis
            </button>
            <button className="btn-cta-secondary" onClick={handleLogin}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Nova Graf</h3>
            <p>Líderes en soluciones gráficas innovadoras para empresas y profesionales.</p>
          </div>
          
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Email: info@novagraf.com</p>
            <p>Teléfono: +1 234 567 890</p>
            <p>Dirección: Av. Principal 123</p>
          </div>
          
          <div className="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="#services">Servicios</a></li>
              <li><a href="#about">Nosotros</a></li>
              <li><a href="#portfolio">Portafolio</a></li>
              <li><a href="#contact">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Nova Graf. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;