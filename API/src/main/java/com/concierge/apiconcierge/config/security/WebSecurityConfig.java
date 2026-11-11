package com.concierge.apiconcierge.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:https://www.atenatruck.com.br,https://atenatruck.com.br,http://localhost:4200,http://127.0.0.1:4200}")
    private String[] corsAllowedOrigins = {"https://www.atenatruck.com.br", "https://atenatruck.com.br", "http://localhost:4200", "http://127.0.0.1:4200"};

    @Bean
    public WebMvcConfigurer corsConfig() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(corsAllowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "OPTIONS")
                        .allowCredentials(true)
                        .allowedHeaders("Authorization", "Content-Type");
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET,"/public/concierge-budgets/{token}/data","/public/concierge-budgets/{token}/file").permitAll()
                        .requestMatchers(HttpMethod.POST,"/public/concierge-budgets/{token}/verify","/public/concierge-budgets/{token}/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET,"/public/proposals/{token}/data","/public/orders/{token}/data").permitAll()
                        .requestMatchers(HttpMethod.POST,"/public/proposals/{token}/verify","/public/orders/{token}/verify","/public/proposals/{token}/signed-upload","/public/orders/{token}/signed-upload","/public/proposals/{token}/confirm","/public/orders/{token}/confirm").permitAll()
                        .requestMatchers(HttpMethod.GET, "/public/orders/{token}", "/public/orders/{token}/file", "/public/orders/{token}/signed").permitAll()
                        .requestMatchers(HttpMethod.POST, "/public/orders/{token}/access", "/public/orders/{token}/approve", "/public/orders/{token}/signed").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/public/proposals/{token}", "/public/proposals/{token}/file", "/public/proposals/{token}/signed").permitAll()
                        .requestMatchers(HttpMethod.POST, "/public/proposals/{token}/access", "/public/proposals/{token}/approve", "/public/proposals/{token}/signed").permitAll()
                        .requestMatchers(HttpMethod.GET, "/vehicle/entry/budget/token/valid/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/vehicle/entry/budget/token/approbation/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
