package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Dispute;
import com.wastecollect.common.models.Role; // This import might not be needed if Role isn't used elsewhere
import com.wastecollect.common.utils.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    // Find disputes by the associated user's ID
    @Query("SELECT d FROM Dispute d WHERE d.user.id = :userId")
    List<Dispute> findByUserId(Long userId);	

    /**
     * Counts disputes with a specific status created after a certain date.
     * @param status The status of the dispute.
     * @param createdAt The date and time from which to count.
     * @return The count of matching disputes.
     */
    long countByStatusAndCreatedAtAfter(DisputeStatus status, LocalDateTime createdAt);

    /**
     * Finds the top 5 disputes with a specific status, ordered by creation date descending.
     * This method was corrected to return `List<Dispute>` and use `status` as the parameter name.
     * @param status The status of the dispute (e.g., DisputeStatus.OPEN).
     * @return A list of the top 5 (or fewer) matching Dispute entities.
     */
    List<Dispute> findTop5ByStatusOrderByCreatedAtDesc(DisputeStatus status);
}
