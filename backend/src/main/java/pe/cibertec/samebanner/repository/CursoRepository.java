package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.Curso;
import java.util.List;
import java.util.Optional;

public interface CursoRepository extends JpaRepository<Curso, Integer> {
    List<Curso> findByCarreraIdAndCiclo(Integer carreraId, String ciclo);
    Optional<Curso> findByCodigoCurso(String codigoCurso);
}
