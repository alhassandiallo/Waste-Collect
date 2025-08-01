package com.wastecollect.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Classe principale de l'application Spring Boot pour le backend de Waste Collect.
 * - @SpringBootApplication: Annotation combinant @Configuration, @EnableAutoConfiguration et @ComponentScan.
 * - @EntityScan: Scanne les entités JPA dans le package 'com.wastecollect.common.models'.
 * - @EnableJpaRepositories: Scanne les dépôts JPA dans le package 'com.wastecollect.backend.repositories'.
 * - @EnableCaching: Active la prise en charge du cache dans l'application.
 */
@SpringBootApplication(scanBasePackages = {"com.wastecollect.backend", "com.wastecollect.common"})
@EntityScan("com.wastecollect.common.models")
@EnableJpaRepositories("com.wastecollect.backend.repository")
@EnableCaching
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
