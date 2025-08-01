// File: com/wastecollect/backend/repository/UserRepository.java
package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Role; // Assuming Role model exists
import com.wastecollect.common.models.User; // Assuming User model exists
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
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Find users by roles (for AdminService.getAllUsers and NotificationService.sendNotifications)
    List<User> findByRolesContaining(Role role); // Returns a List, not a Page.
    Page<User> findByRolesContaining(Role role, Pageable pageable);


    // For admin dashboard recent activities
    List<User> findTopNByOrderByCreationDateDesc(Pageable pageable);

    // For general user search/filter
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String searchTerm, String searchTerm2, String searchTerm3, Pageable pageable);

    // For NotificationService to find any unread notification of type ALERT
    @Query("SELECT n FROM Notification n WHERE n.isRead = false ORDER BY n.createdAt DESC")
    Optional<User> findTopByIsReadFalseOrderByCreatedAtDesc();

}
