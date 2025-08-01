package com.wastecollect.backend.security;

import com.wastecollect.backend.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT Filter to intercept incoming requests, extract the JWT token,
 * validate the token, and set the authentication in Spring Security's context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // Define paths that should bypass JWT filter entirely
    // This includes authentication endpoints and public endpoints like municipalities
    private static final List<String> EXCLUDED_PATHS = Arrays.asList(
        "/api/v1/auth", // Auth endpoints like login, register, password reset
        "/api/v1/municipalities" // Publicly accessible municipalities endpoint
    );

    /**
     * Determines whether this filter should be applied to the current request.
     * Requests to excluded paths (like authentication or public endpoints) and OPTIONS requests
     * (for CORS preflight) will bypass this JWT filter.
     *
     * @param request The current HttpServletRequest.
     * @return true if the filter should NOT be applied, false otherwise.
     * @throws ServletException if an error occurs.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();

        // Always skip for OPTIONS requests (CORS preflight)
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        // Skip if the path starts with any of the defined EXCLUDED_PATHS
        // This ensures public endpoints do not require JWT processing
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    /**
     * Performs the actual filtering logic for requests that are not excluded.
     * It extracts, validates the JWT, and sets up the Spring Security context if valid.
     *
     * @param request The current HttpServletRequest.
     * @param response The current HttpServletResponse.
     * @param filterChain The filter chain to proceed with.
     * @throws ServletException if a servlet-specific error occurs.
     * @throws IOException if an I/O error occurs.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // Check if Authorization header is present and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Extract the JWT token
            try {
                username = jwtUtil.extractUsername(jwt); // Extract username from token
            } catch (ExpiredJwtException e) {
                System.err.println("JWT Token has expired: " + e.getMessage());
                // Log the exception but do not stop the filter chain.
                // Spring Security's exception handling will take over later if needed.
            } catch (SignatureException e) {
                System.err.println("Invalid JWT signature: " + e.getMessage());
            } catch (MalformedJwtException e) {
                System.err.println("Malformed JWT Token: " + e.getMessage());
            } catch (IllegalArgumentException e) {
                System.err.println("Unable to get JWT Token or JWT claims string is empty: " + e.getMessage());
            }
        }

        // If username is extracted and no authentication is currently set in SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                // Load user details by username (email)
                userDetails = this.userService.loadUserByUsername(username);
            } catch (UsernameNotFoundException e) {
                System.err.println("User not found for username '" + username + "': " + e.getMessage());
                // User not found for the extracted username.
                // Do not throw a 401 here; let the filter chain continue to anonymous processing
                // or eventually reach a secured endpoint's authentication entry point.
                filterChain.doFilter(request, response);
                return; // Important: return after calling filterChain.doFilter to prevent further processing in this filter
            }

            // Validate the token against the user details
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // If token is valid, create an authentication token and set it in the SecurityContext
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            } else {
                System.err.println("Invalid JWT token for user: " + username);
                // Invalid token. Do not throw 401 directly; let the filter chain proceed.
                filterChain.doFilter(request, response);
                return; // Important: return after calling filterChain.doFilter
            }
        }
        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}
