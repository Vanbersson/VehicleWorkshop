package com.concierge.apiconcierge.config.security;
import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
class WebSecurityCorsTest {
 static class Registry extends CorsRegistry { Map<String,CorsConfiguration> configurations(){return getCorsConfigurations();} }
 @Test void credentialedCorsHasExplicitOriginsAndIsValid(){var registry=new Registry();new WebSecurityConfig().corsConfig().addCorsMappings(registry);var cors=registry.configurations().get("/**");assertDoesNotThrow(cors::validateAllowCredentials);assertEquals(Boolean.TRUE,cors.getAllowCredentials());assertFalse(cors.getAllowedOrigins().contains("*"));assertEquals("http://localhost:4200",cors.checkOrigin("http://localhost:4200"));assertEquals("https://www.atenatruck.com.br",cors.checkOrigin("https://www.atenatruck.com.br"));assertNull(cors.checkOrigin("https://untrusted.example"));}
}
