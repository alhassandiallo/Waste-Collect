/**
 * Fichier d'utilitaires pour l'application WasteCollect
 * Contient des fonctions helper réutilisables pour le frontend React
 */

// ============================================================================
// FORMATAGE DES DATES ET HEURES
// ============================================================================

/**
 * Formate une date au format français (DD/MM/YYYY)
 * @param {Date|string} date - Date à formater
 * @returns {string} Date formatée ou chaîne vide si invalide
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return '';
  }
};

/**
 * Formate une date et heure au format français (DD/MM/YYYY HH:MM)
 * @param {Date|string} datetime - Date et heure à formater
 * @returns {string} Date et heure formatées
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  
  try {
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return '';
    
    const dateStr = formatDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${dateStr} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date/heure:', error);
    return '';
  }
};

/**
 * Calcule le temps écoulé depuis une date donnée
 * @param {Date|string} date - Date de référence
 * @returns {string} Temps écoulé en format lisible
 */
export const getTimeAgo = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Erreur lors du calcul du temps écoulé:', error);
    return '';
  }
};

// ============================================================================
// FORMATAGE DES MONTANTS ET DEVISES
// ============================================================================

/**
 * Formate un montant en francs guinéens (GNF)
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté avec devise
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 GNF';
  
  return new Intl.NumberFormat('fr-GN', {
    style: 'currency',
    currency: 'GNF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number} number - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('fr-FR').format(number);
};

// ============================================================================
// VALIDATION DES DONNÉES
// ============================================================================

/**
 * Valide un numéro de téléphone guinéen
 * @param {string} phone - Numéro de téléphone
 * @returns {boolean} True si valide
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  
  // Format guinéen: +224 ou 224 suivi de 8 ou 9 chiffres
  const phoneRegex = /^(\+224|224)?[67]\d{7}$/;
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Valide une adresse email
 * @param {string} email - Adresse email
 * @returns {boolean} True si valide
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide qu'un champ n'est pas vide
 * @param {string} value - Valeur à valider
 * @returns {boolean} True si non vide
 */
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && String(value).trim().length > 0;
};

/**
 * Valide qu'un montant est positif
 * @param {number} amount - Montant à valider
 * @returns {boolean} True si positif
 */
export const isPositiveAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) > 0;
};

// ============================================================================
// MANIPULATION DES CHAÎNES DE CARACTÈRES
// ============================================================================

/**
 * Met en forme un nom (première lettre en majuscule)
 * @param {string} name - Nom à formater
 * @returns {string} Nom formaté
 */
export const capitalizeName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Tronque un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué avec "..."
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Génère un identifiant unique simple
 * @returns {string} Identifiant unique
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ============================================================================
// GESTION DES STATUTS ET BADGES
// ============================================================================

/**
 * Retourne la classe CSS Bootstrap pour un statut de demande
 * @param {string} status - Statut de la demande
 * @returns {string} Classe CSS Bootstrap
 */
export const getRequestStatusClass = (status) => {
  const statusClasses = {
    'PENDING': 'badge-warning',
    'ACCEPTED': 'badge-info',
    'IN_PROGRESS': 'badge-primary',
    'COMPLETED': 'badge-success',
    'CANCELLED': 'badge-danger',
    'REJECTED': 'badge-secondary'
  };
  
  return statusClasses[status] || 'badge-secondary';
};

/**
 * Retourne le libellé français d'un statut de demande
 * @param {string} status - Statut de la demande
 * @returns {string} Libellé en français
 */
export const getRequestStatusLabel = (status) => {
  const statusLabels = {
    'PENDING': 'En attente',
    'ACCEPTED': 'Acceptée',
    'IN_PROGRESS': 'En cours',
    'COMPLETED': 'Terminée',
    'CANCELLED': 'Annulée',
    'REJECTED': 'Rejetée'
  };
  
  return statusLabels[status] || status;
};

/**
 * Retourne la classe CSS Bootstrap pour un statut de paiement
 * @param {string} status - Statut du paiement
 * @returns {string} Classe CSS Bootstrap
 */
export const getPaymentStatusClass = (status) => {
  const statusClasses = {
    'PENDING': 'badge-warning',
    'COMPLETED': 'badge-success',
    'FAILED': 'badge-danger',
    'REFUNDED': 'badge-info'
  };
  
  return statusClasses[status] || 'badge-secondary';
};

/**
 * Retourne le libellé français d'un statut de paiement
 * @param {string} status - Statut du paiement
 * @returns {string} Libellé en français
 */
export const getPaymentStatusLabel = (status) => {
  const statusLabels = {
    'PENDING': 'En attente',
    'COMPLETED': 'Payé',
    'FAILED': 'Échec',
    'REFUNDED': 'Remboursé'
  };
  
  return statusLabels[status] || status;
};

// ============================================================================
// GESTION DES ERREURS ET MESSAGES
// ============================================================================

/**
 * Extrait le message d'erreur d'une réponse API
 * @param {Error|Object} error - Erreur à traiter
 * @returns {string} Message d'erreur lisible
 */
export const getErrorMessage = (error) => {
  if (!error) return 'Une erreur inconnue s\'est produite';
  
  // Si c'est une réponse d'API avec un message
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  
  // Si c'est une erreur avec un message direct
  if (error.message) {
    return error.message;
  }
  
  // Si c'est une chaîne de caractères
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Une erreur s\'est produite lors de l\'opération';
};

/**
 * Affiche une notification toast (nécessite une librairie de toast)
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, warning, info)
 */
export const showToast = (message, type = 'info') => {
  // Cette fonction dépend d'une librairie de toast comme react-toastify
  // À adapter selon la librairie utilisée
  console.log(`[${type.toUpperCase()}] ${message}`);
};

// ============================================================================
// UTILITAIRES POUR LES TABLEAUX ET OBJETS
// ============================================================================

/**
 * Filtre un tableau d'objets par une propriété et une valeur
 * @param {Array} array - Tableau à filtrer
 * @param {string} property - Propriété à utiliser pour le filtre
 * @param {any} value - Valeur à rechercher
 * @returns {Array} Tableau filtré
 */
export const filterByProperty = (array, property, value) => {
  if (!Array.isArray(array)) return [];
  
  return array.filter(item => 
    item && item[property] && 
    String(item[property]).toLowerCase().includes(String(value).toLowerCase())
  );
};

/**
 * Trie un tableau d'objets par une propriété
 * @param {Array} array - Tableau à trier
 * @param {string} property - Propriété à utiliser pour le tri
 * @param {string} direction - Direction du tri ('asc' ou 'desc')
 * @returns {Array} Tableau trié
 */
export const sortByProperty = (array, property, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    let aVal = a[property];
    let bVal = b[property];
    
    // Gestion des dates
    if (aVal instanceof Date || (typeof aVal === 'string' && !isNaN(Date.parse(aVal)))) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    } else {
      return aVal > bVal ? 1 : -1;
    }
  });
};

/**
 * Pagine un tableau
 * @param {Array} array - Tableau à paginer
 * @param {number} page - Numéro de page (commence à 1)
 * @param {number} pageSize - Taille de la page
 * @returns {Object} Objet contenant les données paginées et les métadonnées
 */
export const paginateArray = (array, page = 1, pageSize = 10) => {
  if (!Array.isArray(array)) return { data: [], totalPages: 0, currentPage: 1, totalItems: 0 };
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = array.slice(startIndex, endIndex);
  const totalPages = Math.ceil(array.length / pageSize);
  
  return {
    data,
    totalPages,
    currentPage: page,
    totalItems: array.length,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// ============================================================================
// UTILITAIRES POUR LE STOCKAGE LOCAL (si nécessaire)
// ============================================================================

/**
 * Sauvegarde une valeur dans le localStorage
 * @param {string} key - Clé de stockage
 * @param {any} value - Valeur à sauvegarder
 */
export const saveToLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

/**
 * Récupère une valeur du localStorage
 * @param {string} key - Clé de stockage
 * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
 * @returns {any} Valeur récupérée ou valeur par défaut
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erreur lors de la récupération depuis localStorage:', error);
    return defaultValue;
  }
};

/**
 * Supprime une valeur du localStorage
 * @param {string} key - Clé de stockage à supprimer
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la suppression depuis localStorage:', error);
  }
};

// ============================================================================
// UTILITAIRES POUR LA GÉOLOCALISATION
// ============================================================================

/**
 * Calcule la distance approximative entre deux points géographiques (en km)
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lon1 - Longitude du premier point
 * @param {number} lat2 - Latitude du second point
 * @param {number} lon2 - Longitude du second point
 * @returns {number} Distance en kilomètres
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance en km
  
  return Math.round(d * 100) / 100; // Arrondi à 2 décimales
};

// ============================================================================
// UTILITAIRES POUR L'INTERFACE UTILISATEUR
// ============================================================================

/**
 * Détermine si l'appareil est mobile
 * @returns {boolean} True si mobile
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Fait défiler la page vers un élément
 * @param {string} elementId - ID de l'élément
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

/**
 * Copie du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} Promesse indiquant le succès de l'opération
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
};

// Export par défaut d'un objet contenant toutes les fonctions
export default {
  // Formatage
  formatDate,
  formatDateTime,
  getTimeAgo,
  formatCurrency,
  formatNumber,
  
  // Validation
  isValidPhoneNumber,
  isValidEmail,
  isNotEmpty,
  isPositiveAmount,
  
  // Manipulation de chaînes
  capitalizeName,
  truncateText,
  generateId,
  
  // Statuts
  getRequestStatusClass,
  getRequestStatusLabel,
  getPaymentStatusClass,
  getPaymentStatusLabel,
  
  // Gestion d'erreurs
  getErrorMessage,
  showToast,
  
  // Tableaux et objets
  filterByProperty,
  sortByProperty,
  paginateArray,
  
  // Stockage local
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  
  // Géolocalisation
  calculateDistance,
  
  // Interface utilisateur
  isMobile,
  scrollToElement,
  copyToClipboard
};