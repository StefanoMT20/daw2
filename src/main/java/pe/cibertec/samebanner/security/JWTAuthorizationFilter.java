package pe.cibertec.samebanner.security;



import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import pe.cibertec.samebanner.util.Token; 
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTAuthorizationFilter extends OncePerRequestFilter{

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
	        throws ServletException, IOException {
	    String bearerToken = request.getHeader("Authorization");
	    if( bearerToken != null && bearerToken.startsWith("Bearer ")) {
	        String token = bearerToken.replace("Bearer ", "");
	        UsernamePasswordAuthenticationToken userPat = Token.getAuth(token);
	        SecurityContextHolder.getContext().setAuthentication(userPat);
	    }
	    filterChain.doFilter(request, response); // Siempre llama a doFilter
	}
		
	}

	
	

