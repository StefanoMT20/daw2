package pe.cibertec.samebanner.security;


import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import com.fasterxml.jackson.databind.ObjectMapper;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pe.cibertec.samebanner.model.Auth;
import pe.cibertec.samebanner.serviceImplement.UserDetailImplement;
import pe.cibertec.samebanner.util.Token;

public class JWTAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException {

        Auth authCredenciales = new Auth();
        
        //System.out.println("Intentando autenticación para: " + request.getRequestURI());
        //System.out.println("Content-Type de la solicitud: " + request.getContentType());

        try {
            authCredenciales = new ObjectMapper().readValue(request.getReader(), Auth.class);
            //System.out.println("Credenciales leídas: Email='" + authCredenciales.getEmail() + "', Password='" + authCredenciales.getPassword() + "'");
            
            // --- NUEVO CHEQUEO ---
            if (authCredenciales.getEmail() == null || authCredenciales.getPassword() == null) {
                System.err.println("ERROR: Email o Password son nulos después de deserializar JSON.");
                throw new BadCredentialsException("Email o password no proporcionados en el JSON.");
            }
            // --- FIN NUEVO CHEQUEO ---

        } catch (IOException e) {
            System.err.println("Error al leer las credenciales del login (JSON): " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Formato de credenciales inválido o error de lectura", e);
        }
        
        UsernamePasswordAuthenticationToken userPat = new UsernamePasswordAuthenticationToken(
                authCredenciales.getEmail(),
                authCredenciales.getPassword(),
                Collections.emptyList()
                );
        
        //System.out.println("Creando UsernamePasswordAuthenticationToken para: " + authCredenciales.getEmail());
        
        return getAuthenticationManager().authenticate(userPat);
    }
	
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
            Authentication authResult) throws IOException, ServletException {

        org.springframework.security.core.userdetails.User userSpringSecurity = 
                (org.springframework.security.core.userdetails.User) authResult.getPrincipal();
        
        String token = Token.crearToken(userSpringSecurity.getUsername(), userSpringSecurity.getUsername());
        
        response.setContentType("application/json");
        response.getWriter().write("{\"token\":\"" + token + "\"}");
        response.getWriter().flush();
    }
}

