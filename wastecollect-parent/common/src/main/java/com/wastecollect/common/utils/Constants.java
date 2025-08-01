package com.wastecollect.common.utils;

/**
 * Classe pour les constantes globales de l'application.
 */
public class Constants {

    public static final String API_BASE_URL = "/api/v1"; // Préfixe pour toutes les API REST

    // Messages d'erreur courants
    public static final String USER_NOT_FOUND = "Utilisateur non trouvé avec l'ID : ";
    public static final String EMAIL_ALREADY_EXISTS = "Cet email est déjà enregistré.";

    // Autres constantes...
    public static final int JWT_EXPIRATION_MS = 86400000; // 24 heures en millisecondes
    public static final String JWT_SECRET = "VotreCleSecreteTresLongueEtComplexePourJWTQuiDoitEtreStockeeDeManiereSecurisee"; // À changer en production !
}
