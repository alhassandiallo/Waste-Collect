package com.wastecollect.backend.repository;

import com.wastecollect.common.models.PasswordResetToken;
import com.wastecollect.common.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);
    
    // Optional: if you want to find a token by user
    Optional<PasswordResetToken> findByUser(User user); 
}