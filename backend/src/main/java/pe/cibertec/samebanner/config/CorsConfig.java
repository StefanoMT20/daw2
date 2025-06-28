package pe.cibertec.samebanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Permitir cualquier origen
        config.addAllowedOrigin("http://localhost:4200");

        // Permitir cualquier header
        config.addAllowedHeader("*");

        // Permitir cualquier método (GET, POST, etc.)
        config.addAllowedMethod("*");

        // Permitir credenciales
        config.setAllowCredentials(true);

        // Aplicar esta configuración a todas las rutas
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
