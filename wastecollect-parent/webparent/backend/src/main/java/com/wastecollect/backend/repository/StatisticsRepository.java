package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Statistics;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // Import Param
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime; // Use LocalDateTime for date parameters
import java.util.List;
import java.util.Optional;

@Repository
public interface StatisticsRepository extends JpaRepository<Statistics, Long> {

    // Changed return type to Optional<Statistics> for single latest, and use derived query
    // If multiple "latest" for the same date are possible and needed, then List<Statistics> and Pageable is better.
    // For a single latest, `findTopByOrderByStartDateDescIdDesc()` is the most idiomatic Spring Data JPA way.
    // So, removing the `@Query` version and keeping the derived one.
    Optional<Statistics> findTopByOrderByStartDateDescIdDesc();

    // Changed return type to Optional for safety
    @Query("SELECT s FROM Statistics s WHERE s.municipality IS NULL")
    Optional<Statistics> findGlobalStatistics();

    // Changed parameter types to LocalDateTime for proper date handling
    @Query("SELECT s FROM Statistics s WHERE s.periodType = :periodType AND s.startDate >= :startDate AND s.endDate <= :endDate")
    List<Statistics> findByPeriod(@Param("periodType") String periodType, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // This derived query is now the primary way to get the single latest statistic
    // Optional<Statistics> findTopByOrderByStartDateDescIdDesc(); // Already above

    // This method is for getting a list of latest statistics, if needed (e.g., for different municipalities or types)
    @Query("SELECT s FROM Statistics s ORDER BY s.startDate DESC, s.id DESC")
    List<Statistics> findLatestStatistics(Pageable pageable);

    @Query("SELECT s FROM Statistics s ORDER BY s.startDate DESC")
    List<Statistics> findRecentStatistics();
}
