package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.Payment;
import com.wastecollect.common.utils.PaymentMethod;
import com.wastecollect.common.utils.PaymentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Find payments by collector via ServiceRequest join
    @Query("SELECT p FROM Payment p JOIN p.serviceRequest sr WHERE sr.collector.id = :collectorId")
    List<Payment> findByCollectorId(Long collectorId);
    
    long countByStatus(PaymentStatus status);

    // Custom query with dynamic filtering for household payments
    @Query("SELECT p FROM Payment p WHERE " +
           "(:householdId IS NULL OR p.household.id = :householdId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) AND " +
           "(:startDate IS NULL OR p.paymentDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.paymentDate <= :endDate) AND " +
           "(:searchReference IS NULL OR p.transactionReference LIKE %:searchReference%)")
    Page<Payment> findByHouseholdIdAndFilters(
            @Param("householdId") Long householdId,
            @Param("status") PaymentStatus status,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("searchReference") String searchReference,
            Pageable pageable
    );

	/**
     * Finds all payments associated with a specific collector.
     * This method is crucial for calculating a collector's total revenue.
     *
     * @param collector The Collector entity.
     * @return A list of Payment entities associated with the given collector.
     */
    List<Payment> findByCollector(Collector collector);

    /**
     * Finds payments associated with a specific collector within a given date range.
     * Useful for calculating revenue over a specific period (e.g., monthly, weekly).
     *
     * @param collector The Collector entity.
     * @param startDate The start date and time of the period.
     * @param endDate The end date and time of the period.
     * @return A list of Payment entities for the collector within the date range.
     */
    List<Payment> findByCollectorAndPaymentDateBetween(Collector collector, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Calculates the sum of amounts for payments associated with a specific collector
     * within a given date range.
     * @param collector The Collector entity.
     * @param startDate The start date and time of the period.
     * @param endDate The end date and time of the period.
     * @return The sum of payment amounts, or 0.0 if no payments found.
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.collector = :collector AND p.paymentDate BETWEEN :startDate AND :endDate")
    Double sumAmountByCollectorAndPaymentDateBetween(@Param("collector") Collector collector, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Calculates the sum of amounts for all payments within a given date range.
     * @param startDate The start date and time of the period.
     * @param endDate The end date and time of the period.
     * @return The sum of payment amounts, or 0.0 if no payments found.
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    Double sumAmountByPaymentDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
