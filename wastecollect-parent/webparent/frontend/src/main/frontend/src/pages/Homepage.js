// frontend/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/main.css'; // Your custom CSS for general styling

const HomePage = () => {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 text-center">
      <div className="card p-5 shadow-lg rounded-3 animate__animated animate__fadeInUp" style={{ maxWidth: '700px', width: '100%' }}>
        <h1 className="display-4 text-primary mb-4 fw-bold">Bienvenue sur WasteCollect</h1>
        <p className="lead mb-4 text-secondary">
          Votre plateforme intelligente pour une gestion efficace et durable des déchets à Conakry.
          Nous connectons les ménages aux collecteurs pour un environnement plus propre.
        </p>

        <div className="row justify-content-center mb-4">
          <div className="col-md-5 mb-3 mb-md-0">
            <Link to="/login" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm">
              Se connecter
            </Link>
          </div>
          <div className="col-md-5">
            <Link to="/register" className="btn btn-outline-success btn-lg w-100 rounded-pill shadow-sm">
              S'inscrire
            </Link>
          </div>
        </div>

        <hr className="my-4" />

        <div className="text-muted small">
          <h5 className="mb-3 text-info">Pourquoi WasteCollect ?</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <i className="fas fa-route fa-2x d-block mb-2 text-success"></i>
              <span>Optimisation des collectes</span>
            </div>
            <div className="col-md-4">
              <i className="fas fa-chart-line fa-2x d-block mb-2 text-warning"></i>
              <span>Données en temps réel</span>
            </div>
            <div className="col-md-4">
              <i className="fas fa-leaf fa-2x d-block mb-2 text-info"></i>
              <span>Impact environnemental positif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;