package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Import this
import org.springframework.stereotype.Repository;

/**
 * Interface de dépôt pour l'entité Report.
 * Fournit des méthodes CRUD et de recherche pour les rapports générés.
 * Extends JpaSpecificationExecutor for dynamic query building using Specifications.
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long>, JpaSpecificationExecutor<Report> {
    // Vous pouvez ajouter des méthodes de requête personnalisées ici si nécessaire,
    // par exemple:
    // List<Report> findByStatus(String status);
    // List<Report> findByTypeAndPeriod(String type, String period);
}
