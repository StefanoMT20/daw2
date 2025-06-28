package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findOneByEmail(String email);
}
