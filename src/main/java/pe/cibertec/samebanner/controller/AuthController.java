package pe.cibertec.samebanner.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cibertec.samebanner.model.Usuario;
import pe.cibertec.samebanner.repository.UsuarioRepository;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<Object> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No autenticado");
            return ResponseEntity.status(401).body(response);
        }

        Usuario usuario = usuarioRepository.findOneByEmail(authentication.getName())
            .orElse(null);

        if (usuario == null) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usuario no encontrado");
            return ResponseEntity.status(404).body(response);
        }

        return ResponseEntity.ok(usuario);
    }
}
