package com.wastecollect.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact; // Import this
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License; // Import this
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info().title("Waste Collect API")
                        .description("Documentation des API REST pour la plateforme Waste Collect. This API supports waste collection management, household requests, collector management, and administrative functions.")
                        .version("1.0")
                        .contact(new Contact().name("Support Team").email("support@wastecollect.com")) // Added contact info
                        .license(new License().name("Apache 2.0").url("http://www.apache.org/licenses/LICENSE-2.0.html"))) // Added license info
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token in the format 'Bearer <token>' to access authenticated endpoints. Obtain token from /api/auth/login")));
    }
}