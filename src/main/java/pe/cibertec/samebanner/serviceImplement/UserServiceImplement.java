package pe.cibertec.samebanner.serviceImplement;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import pe.cibertec.samebanner.model.Usuario;
import pe.cibertec.samebanner.repository.UsuarioRepository;



@Service
public class UserServiceImplement implements UserDetailsService {
    
	@Autowired
	private UsuarioRepository usuarioRepository;

	@Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        //System.out.println("UserDetailImplement: Intentando cargar usuario con email: " + email);

        // Busca el usuario por email
        Usuario usuario = usuarioRepository.findOneByEmail(email)
                                         .orElseThrow(() -> {
         //                                    System.err.println("UserDetailImplement: Usuario no encontrado: " + email);
                                             return new UsernameNotFoundException("Usuario no encontrado con email: " + email);
                                         });

        //System.out.println("UserDetailImplement: Usuario encontrado: " + usuario.getEmail());
        //System.out.println("UserDetailImplement: Password hash del usuario: " + usuario.getPassword());

        
        return new User(usuario.getEmail(),
                        usuario.getPassword(), 
                        Collections.emptyList()); 
    }
}
