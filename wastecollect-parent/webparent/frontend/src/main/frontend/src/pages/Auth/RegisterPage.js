// frontend/src/pages/Auth/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../services/api'; // Import your axios instance

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    userType: 'HOUSEHOLD', // Default: household
    address: '',
    numberOfMembers: '',
    housingType: '',
    municipalityName: '', // New field to store selected municipality name
    collectionPreferences: '',
    latitude: '',
    longitude: '',
    status: 'ACTIVE',
  });

  const [municipalities, setMunicipalities] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Fetch municipalities when the component mounts
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await api.get('/v1/municipalities'); // Adjust the endpoint as per your backend
        setMunicipalities(response.data); // Assuming the backend returns an array of municipality names
      } catch (error) {
        console.error('Error fetching municipalities:', error);
        toast.error('Failed to load municipalities. Please try again.');
      }
    };
    fetchMunicipalities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error for the field being changed
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName) errors.firstName = 'Le prénom est requis.';
    if (!formData.lastName) errors.lastName = 'Le nom est requis.';
    if (!formData.email) {
      errors.email = 'L\'email est requis.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide.';
    }
    if (!formData.phoneNumber) errors.phoneNumber = 'Le numéro de téléphone est requis.';
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis.';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    if (!formData.address) errors.address = 'L\'adresse est requise.';

    if (formData.userType === 'HOUSEHOLD' || formData.userType === 'COLLECTOR') {
      if (!formData.municipalityName) {
        errors.municipalityName = 'La sélection de la municipalité est requise.';
      }
    }

    if (formData.userType === 'HOUSEHOLD') {
      if (!formData.numberOfMembers || isNaN(parseInt(formData.numberOfMembers))) {
        errors.numberOfMembers = 'Le nombre de membres est requis et doit être un nombre.';
      }
      if (!formData.housingType) errors.housingType = 'Le type de logement est requis.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    const dataToRegister = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      address: formData.address,
      municipalityName: formData.municipalityName, // Pass the selected municipality name
    };

    if (formData.userType === 'HOUSEHOLD') {
      dataToRegister.numberOfMembers = parseInt(formData.numberOfMembers);
      dataToRegister.housingType = formData.housingType;
      dataToRegister.collectionPreferences = formData.collectionPreferences;
      dataToRegister.latitude = formData.latitude ? parseFloat(formData.latitude) : null;
      dataToRegister.longitude = formData.longitude ? parseFloat(formData.longitude) : null;
    } else if (formData.userType === 'COLLECTOR') {
      dataToRegister.status = formData.status;
    }

    try {
      await register(dataToRegister, formData.userType);
      // Added success message here
      toast.success('Inscription réussie ! Veuillez vous connecter.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="register-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-sm-12">
            <div className="card shadow-lg rounded-3 border-0 p-4 p-md-5 animate__animated animate__fadeInDown">
              <div className="card-body">
                <h2 className="card-title text-center mb-4 text-primary fw-bold">Créer un compte WasteCollect</h2>

                {/* User Type Selection */}
                <div className="mb-4 text-center">
                  <div className="btn-group" role="group" aria-label="User Type">
                    <input
                      type="radio"
                      className="btn-check"
                      name="userType"
                      id="householdRadio"
                      value="HOUSEHOLD"
                      checked={formData.userType === 'HOUSEHOLD'}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-success" htmlFor="householdRadio">
                      Ménage
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="userType"
                      id="collectorRadio"
                      value="COLLECTOR"
                      checked={formData.userType === 'COLLECTOR'}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-success" htmlFor="collectorRadio">
                      Collecteur
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Personal Information */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstNameInput" className="form-label">Prénom</label>
                      <input
                        type="text"
                        className={`form-control rounded-md ${formErrors.firstName ? 'is-invalid' : ''}`}
                        id="firstNameInput"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Votre prénom"
                        required
                      />
                      {formErrors.firstName && <div className="invalid-feedback">{formErrors.firstName}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastNameInput" className="form-label">Nom</label>
                      <input
                        type="text"
                        className={`form-control rounded-md ${formErrors.lastName ? 'is-invalid' : ''}`}
                        id="lastNameInput"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Votre nom"
                        required
                      />
                      {formErrors.lastName && <div className="invalid-feedback">{formErrors.lastName}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="emailInput" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control rounded-md ${formErrors.email ? 'is-invalid' : ''}`}
                      id="emailInput"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="votre.email@example.com"
                      required
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phoneNumberInput" className="form-label">Numéro de téléphone</label>
                    <input
                      type="tel"
                      className={`form-control rounded-md ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                      id="phoneNumberInput"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+224 6XX XX XX XX"
                      required
                    />
                    {formErrors.phoneNumber && <div className="invalid-feedback">{formErrors.phoneNumber}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="addressInput" className="form-label">Adresse</label>
                    <input
                      type="text"
                      className={`form-control rounded-md ${formErrors.address ? 'is-invalid' : ''}`}
                      id="addressInput"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Rue, quartier, ville"
                      required
                    />
                    {formErrors.address && <div className="invalid-feedback">{formErrors.address}</div>}
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label htmlFor="passwordInput" className="form-label">Mot de passe</label>
                      <input
                        type="password"
                        className={`form-control rounded-md ${formErrors.password ? 'is-invalid' : ''}`}
                        id="passwordInput"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 caractères"
                        required
                      />
                      {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="confirmPasswordInput" className="form-label">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        className={`form-control rounded-md ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPasswordInput"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmer votre mot de passe"
                        required
                      />
                      {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                    </div>
                  </div>

                  {/* Municipality Selection */}
                  <div className="mb-3">
                    <label htmlFor="municipalitySelect" className="form-label">Municipalité</label>
                    <select
                      className={`form-control rounded-md ${formErrors.municipalityName ? 'is-invalid' : ''}`}
                      id="municipalitySelect"
                      name="municipalityName"
                      value={formData.municipalityName}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Sélectionner une municipalité...</option>
                      {municipalities.map((municipality) => (
                        <option key={municipality} value={municipality}>
                          {municipality}
                        </option>
                      ))}
                    </select>
                    {formErrors.municipalityName && (
                      <div className="invalid-feedback">{formErrors.municipalityName}</div>
                    )}
                  </div>

                  {/* Household Specific Fields */}
                  {formData.userType === 'HOUSEHOLD' && (
                    <>
                      <hr className="my-4" />
                      <h5 className="mb-3 text-secondary fw-bold">Informations Ménage</h5>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label htmlFor="numberOfMembersInput" className="form-label">Nombre de membres</label>
                          <input
                            type="number"
                            className={`form-control rounded-md ${formErrors.numberOfMembers ? 'is-invalid' : ''}`}
                            id="numberOfMembersInput"
                            name="numberOfMembers"
                            value={formData.numberOfMembers}
                            onChange={handleChange}
                            placeholder="Ex: 4"
                            required
                          />
                          {formErrors.numberOfMembers && <div className="invalid-feedback">{formErrors.numberOfMembers}</div>}
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="housingTypeSelect" className="form-label">Type de logement</label>
                          <select
                            className={`form-select rounded-md ${formErrors.housingType ? 'is-invalid' : ''}`}
                            id="housingTypeSelect"
                            name="housingType"
                            value={formData.housingType}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Sélectionner...</option>
                            <option value="APARTMENT">Appartement</option>
                            <option value="HOUSE">Maison</option>
                          </select>
                          {formErrors.housingType && <div className="invalid-feedback">{formErrors.housingType}</div>}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="collectionPreferencesInput" className="form-label">Préférences de collecte (optionnel)</label>
                        <textarea
                          className="form-control rounded-md"
                          id="collectionPreferencesInput"
                          name="collectionPreferences"
                          value={formData.collectionPreferences}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Ex: Collecte le matin, types de déchets spécifiques..."
                        ></textarea>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <label htmlFor="latitudeInput" className="form-label">Latitude (optionnel)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control rounded-md"
                            id="latitudeInput"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            placeholder="Ex: 9.5379"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="longitudeInput" className="form-label">Longitude (optionnel)</label>
                          <input
                            type="number"
                            step="any"
                            className="form-control rounded-md"
                            id="longitudeInput"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            placeholder="Ex: -13.6773"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Collector Specific Fields */}
                  {formData.userType === 'COLLECTOR' && (
                    <>
                      <hr className="my-4" />
                      <h5 className="mb-3 text-secondary fw-bold">Informations Collecteur</h5>
                      <div className="mb-4">
                        <label htmlFor="statusSelect" className="form-label">Statut</label>
                        <select
                          className={`form-select rounded-md ${formErrors.status ? 'is-invalid' : ''}`}
                          id="statusSelect"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="ACTIVE">Actif</option>
                          <option value="INACTIVE">Inactif</option>
                          <option value="ON_LEAVE">En congé</option>
                        </select>
                        {formErrors.status && <div className="invalid-feedback">{formErrors.status}</div>}
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 btn-lg rounded-pill shadow-sm mt-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                  </button>
                </form>

                {/* Link to login page */}
                <div className="text-center mt-4">
                  <hr className="my-3" />
                  <div>
                    <span className="text-muted small">Déjà un compte ? </span>
                    <Link to="/login" className="text-success text-decoration-none fw-semibold">
                      Se connecter
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Information */}
            <div className="text-center mt-4">
              <div className="row text-muted small">
                <div className="col-12 mb-2">
                  <strong>Pourquoi rejoindre WasteCollect ?</strong>
                </div>
                <div className="col-4">
                  <i className="fas fa-mobile-alt d-block mb-1 text-success"></i>
                  <span>Interface mobile</span>
                </div>
                <div className="col-4">
                  <i className="fas fa-chart-line d-block mb-1 text-success"></i>
                  <span>Suivi en temps réel</span>
                </div>
                <div className="col-4">
                  <i className="fas fa-shield-alt d-block mb-1 text-success"></i>
                  <span>Sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
