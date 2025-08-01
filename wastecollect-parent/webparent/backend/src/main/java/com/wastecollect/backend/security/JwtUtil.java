package com.wastecollect.backend.security;

import com.wastecollect.common.models.User; // Assuming User model has roles
import com.wastecollect.common.utils.Constants;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    // The secret key for signing JWTs, loaded from Constants
    private final String SECRET_KEY = Constants.JWT_SECRET;
    // The expiration time for JWTs in milliseconds, loaded from Constants
    private final long jwtExpirationInMs = Constants.JWT_EXPIRATION_MS;
    // The signing key derived from the secret key
    private final Key key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
    

    /**
     * Extracts the username (subject) from a JWT token.
     * @param token The JWT token.
     * @return The username.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from a JWT token.
     * @param token The JWT token.
     * @return The expiration date.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from a JWT token using a claims resolver function.
     * @param token The JWT token.
     * @param claimsResolver The function to resolve the desired claim.
     * @param <T> The type of the claim.
     * @return The extracted claim.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from a JWT token.
     * @param token The JWT token.
     * @return All claims from the token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    /**
     * Checks if a JWT token is expired.
     * @param token The JWT token.
     * @return True if the token is expired, false otherwise.
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Generates a JWT token for a given user.
     * @param userPrincipal The UserDetails object representing the user.
     * @return The generated JWT token.
     */
    public String generateToken(UserDetails userPrincipal) {
        Map<String, Object> claims = new HashMap<>();

        // Add roles to claims
        // Check if the userPrincipal is an instance of your custom User entity
        if (userPrincipal instanceof User) {
            User user = (User) userPrincipal;
            claims.put("roles", user.getRoles().stream()
                    // CORRECTED LINE: Access the RoleName enum via getName() and then its name() method
                    .map(role -> "ROLE_" + role.getName().name()) 
                    .collect(Collectors.toList()));
        } else {
            // Fallback for generic UserDetails, if roles are not directly accessible via User model
            claims.put("roles", userPrincipal.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toList()));
        }

        // Build the JWT token
        return Jwts.builder()
                .setClaims(claims) // Set the custom claims (roles)
                .setSubject(userPrincipal.getUsername()) // Set the subject (username/email)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set the issue date
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMs)) // Set the expiration date
                .signWith(key, SignatureAlgorithm.HS256) // Sign the token with the secret key and algorithm
                .compact(); // Compact the token into a string
    }

    /**
     * Validates a JWT token against user details.
     * @param token The JWT token.
     * @param userDetails The UserDetails object to validate against.
     * @return True if the token is valid for the given user, false otherwise.
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}