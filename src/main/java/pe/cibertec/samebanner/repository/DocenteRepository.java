package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.Docente;

public interface DocenteRepository extends JpaRepository<Docente, Integer> {
}
