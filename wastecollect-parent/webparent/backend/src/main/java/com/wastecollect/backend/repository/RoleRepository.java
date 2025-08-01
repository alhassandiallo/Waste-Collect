package com.wastecollect.backend.repository;

import com.wastecollect.common.utils.RoleName;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.wastecollect.common.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

	Optional<Role> findByName(RoleName name);

}
