package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.Carrera;

public interface CarreraRepository extends JpaRepository<Carrera, Integer> {
}
