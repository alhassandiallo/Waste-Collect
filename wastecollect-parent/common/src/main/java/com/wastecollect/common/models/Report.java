package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un rapport généré dans le système WasteCollect.
 * Stocke les métadonnées des rapports, leur statut et d'autres informations pertinentes.
 */
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Identifiant unique du rapport

    @Column(name = "title", nullable = false, length = 255)
    private String title; // Titre descriptif du rapport

    @Column(name = "report_type", nullable = false, length = 50)
    private String type; // Type de rapport (ex: "performance", "collections", "predictive")

    @Column(name = "period", nullable = false, length = 50)
    private String period; // Période couverte par le rapport (ex: "daily", "monthly", "yearly")

    @Column(name = "generated_date", nullable = false)
    private LocalDateTime generatedDate; // Date et heure de génération du rapport

    @Column(name = "status", nullable = false, length = 20)
    // Statut du rapport (ex: "pending", "processing", "completed", "failed")
    private String status;

    @Column(name = "format", nullable = false, length = 10)
    private String format; // Format du fichier (ex: "pdf", "excel", "both")

    @Column(name = "file_size", length = 50)
    private String fileSize; // Taille du fichier du rapport (ex: "2.3 MB", "En cours...")

    // Optionnel: Nom de la municipalité si le rapport est spécifique à une municipalité
    @Column(name = "municipality_name", length = 100)
    private String municipalityName;

    // Optionnel: Nom ou ID de l'administrateur qui a généré le rapport
    // Idéalement, ceci devrait être une relation @ManyToOne avec l'entité User (Admin)
    @Column(name = "generated_by", length = 100)
    private String generatedBy;

    // Optionnel: Chemin vers le fichier stocké (si les rapports sont stockés localement ou sur un système de fichiers)
    @Column(name = "file_path", length = 500)
    private String filePath;

    // Constructeur par défaut (nécessaire pour JPA)
    public Report() {}

    // Constructeur avec les champs obligatoires
    public Report(String title, String type, String period, LocalDateTime generatedDate, String status, String format) {
        this.title = title;
        this.type = type;
        this.period = period;
        this.generatedDate = generatedDate;
        this.status = status;
        this.format = format;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public LocalDateTime getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(LocalDateTime generatedDate) {
        this.generatedDate = generatedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
