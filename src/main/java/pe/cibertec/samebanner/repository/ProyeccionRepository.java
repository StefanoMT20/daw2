package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.Proyeccion;
import java.util.Optional;

public interface ProyeccionRepository extends JpaRepository<Proyeccion, Integer> {
    Optional<Proyeccion> findByUsuarioId(Integer usuarioId);
}
