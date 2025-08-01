    package com.wastecollect.common.models;

    import com.wastecollect.common.utils.RoleName;
    import jakarta.persistence.*;
    import org.springframework.data.annotation.CreatedBy;
    import org.springframework.data.annotation.CreatedDate;
    import org.springframework.data.annotation.LastModifiedBy;
    import org.springframework.data.annotation.LastModifiedDate;
    import org.springframework.data.jpa.domain.support.AuditingEntityListener;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;

    import java.time.LocalDateTime;
    import java.util.Collection;
    import java.util.HashSet;
    import java.util.Set;
    import java.util.stream.Collectors;

    @Entity
    @Table(name = "users")
    @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
    @DiscriminatorColumn(name = "user_type")
    @EntityListeners(AuditingEntityListener.class)
    public class User implements UserDetails {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "first_name", nullable = false)
        private String firstName;

        @Column(name = "last_name", nullable = false)
        private String lastName;

        @Column(name = "email", unique = true, nullable = false)
        private String email;

        @Column(name = "password", nullable = false)
        private String password;

        @Column(name = "phone_number")
        private String phoneNumber;

        @Column(name = "address")
        private String address;

        // Add auditing fields
        @CreatedDate
        @Column(name = "creation_date", nullable = false, updatable = false)
        private LocalDateTime creationDate;

        @LastModifiedDate
        @Column(name = "last_modified_date")
        private LocalDateTime lastModifiedDate;

        @CreatedBy
        @Column(name = "created_by")
        private String createdBy; // Store username or ID of creator

        @LastModifiedBy
        @Column(name = "last_modified_by")
        private String lastModifiedBy; // Store username or ID of last modifier

        @ManyToMany(fetch = FetchType.EAGER)
        @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
        )
        private Set<Role> roles = new HashSet<>();

        // --- NEW FIELDS FOR USERDETAILS PROPERTIES ---
        @Column(name = "enabled", nullable = false)
        private boolean enabled = true; // Default to true

        @Column(name = "account_non_expired", nullable = false)
        private boolean accountNonExpired = true; // Default to true

        @Column(name = "account_non_locked", nullable = false)
        private boolean accountNonLocked = true; // Default to true

        @Column(name = "credentials_non_expired", nullable = false)
        private boolean credentialsNonExpired = true; // Default to true
        // --- END NEW FIELDS ---

        // Constructors
        public User() {
        }

        public User(String firstName, String lastName, String email, String password, String phoneNumber, String address) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.password = password;
            this.phoneNumber = phoneNumber;
            this.address = address;
            // Defaults for new users, can be overridden if needed
            this.enabled = true;
            this.accountNonExpired = true;
            this.accountNonLocked = true;
            this.credentialsNonExpired = true;
        }

        // --- Getters and Setters (existing) ---
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public Set<Role> getRoles() {
            return roles;
        }

        public void setRoles(Set<Role> roles) {
            this.roles = roles;
        }

        public boolean hasRole(RoleName roleName) {
            return this.roles != null && this.roles.stream()
                .anyMatch(role -> role.getName() == roleName);
        }

        // --- New getters for auditing fields ---
        public LocalDateTime getCreationDate() {
            return creationDate;
        }

        public void setCreationDate(LocalDateTime creationDate) {
            this.creationDate = creationDate;
        }

        public LocalDateTime getLastModifiedDate() {
            return lastModifiedDate;
        }

        public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
            this.lastModifiedDate = lastModifiedDate;
        }

        public String getCreatedBy() {
            return createdBy;
        }

        public void setCreatedBy(String createdBy) {
            this.createdBy = createdBy;
        }

        public String getLastModifiedBy() {
            return lastModifiedBy;
        }

        public void setLastModifiedBy(String lastModifiedBy) {
            this.lastModifiedBy = lastModifiedBy;
        }

        // --- NEW GETTERS/SETTERS FOR USERDETAILS PROPERTIES ---
        public boolean getEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public boolean getAccountNonExpired() {
            return accountNonExpired;
        }

        public void setAccountNonExpired(boolean accountNonExpired) {
            this.accountNonExpired = accountNonExpired;
        }

        public boolean getAccountNonLocked() {
            return accountNonLocked;
        }

        public void setAccountNonLocked(boolean accountNonLocked) {
            this.accountNonLocked = accountNonLocked;
        }

        public boolean getCredentialsNonExpired() {
            return credentialsNonExpired;
        }

        public void setCredentialsNonExpired(boolean credentialsNonExpired) {
            this.credentialsNonExpired = credentialsNonExpired;
        }
        // --- END NEW GETTERS/SETTERS ---

        // UserDetails interface implementations (now using the actual fields)
        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                    .collect(Collectors.toList());
        }

        @Override
        public String getUsername() {
            return email;
        }

        @Override
        public boolean isAccountNonExpired() {
            return this.accountNonExpired; // Now returns the field's value
        }

        @Override
        public boolean isAccountNonLocked() {
            return this.accountNonLocked; // Now returns the field's value
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return this.credentialsNonExpired; // Now returns the field's value
        }

        @Override
        public boolean isEnabled() {
            return this.enabled; // Now returns the field's value
        }
    }
    