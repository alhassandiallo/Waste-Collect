package com.wastecollect.backend.config; // Create a new config package

import com.wastecollect.common.models.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class AuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return Optional.of("system"); // Or a default user for initial creation
            }
            // Assuming your UserDetails object is your User entity
            if (authentication.getPrincipal() instanceof User) {
                return Optional.of(((User) authentication.getPrincipal()).getEmail());
            }
            return Optional.of(authentication.getName()); // Fallback to username
        };
    }
}