package pe.cibertec.samebanner.util;



import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;



public class Token {
	
	private final static String TOKEN_FIRMA = "aLg3eqbV254pZd9AFiMh4mAcRAt1Y0Jb";//32 caracteres
	private final static Long TOKEN_DURACION = 3_600L;//TIEMPO DE DURACIÓN
	
	public static String crearToken(String user, String email) {
		
		long expiracionTiempo = TOKEN_DURACION * 1_000;//EL TIEMPO ASIGNADO DEBERA DE ESTAR EL MILISEGUNDOS
		Date expiracionFecha = new Date(System.currentTimeMillis() + expiracionTiempo);
		
		Map<String, Object> map = new HashMap<>();
		map.put("nombre", user);
		
		return Jwts.builder()
				.setSubject(email)
				.setExpiration(expiracionFecha)
				.addClaims(map)
				.signWith(Keys.hmacShaKeyFor(TOKEN_FIRMA.getBytes()))
				.compact();
	}
	
	public static UsernamePasswordAuthenticationToken getAuth(String token) {
		
		try {
			
			Claims claims = Jwts.parserBuilder()
					.setSigningKey(TOKEN_FIRMA.getBytes())
					.build()
					.parseClaimsJws(token)
					.getBody();
			
			String email = claims.getSubject();
			return new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
					
			
		} catch (Exception e) {
			System.out.println("Sucedio un error al comprobar el token: " + e.getMessage());
			return null;
		}
		
		
	}

}

