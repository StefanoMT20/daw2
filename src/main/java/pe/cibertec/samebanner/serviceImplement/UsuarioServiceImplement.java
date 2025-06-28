package pe.cibertec.samebanner.serviceImplement;

import java.time.LocalDateTime;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import pe.cibertec.samebanner.dto.UsuarioRegistroDTO;
import pe.cibertec.samebanner.model.Usuario;
import pe.cibertec.samebanner.repository.UsuarioRepository;
import pe.cibertec.samebanner.service.IUsuarioService;

@Service
public class UsuarioServiceImplement implements IUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImplement(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Usuario registrarUsuario(UsuarioRegistroDTO registroDTO) {
        if (usuarioRepository.findOneByEmail(registroDTO.getEmail()).isPresent()) {
            throw new RuntimeException("El email '" + registroDTO.getEmail() + "' ya está registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(registroDTO.getNombre());
        nuevoUsuario.setEmail(registroDTO.getEmail());
        nuevoUsuario.setPassword(passwordEncoder.encode(registroDTO.getPassword()));
        nuevoUsuario.setFechaCreacion(LocalDateTime.now());
       

       
        nuevoUsuario.setApellido(registroDTO.getApellido());
        nuevoUsuario.setCodigoEstudiante(registroDTO.getCodigoEstudiante());
        nuevoUsuario.setCarreraId(registroDTO.getCarreraId());
        nuevoUsuario.setCicloActual(registroDTO.getCicloActual());
        nuevoUsuario.setRol(registroDTO.getRol());
        // Fin de las líneas añadidas

        return usuarioRepository.save(nuevoUsuario);
    }
}