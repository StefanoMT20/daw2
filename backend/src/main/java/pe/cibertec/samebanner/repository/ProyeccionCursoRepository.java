package pe.cibertec.samebanner.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cibertec.samebanner.model.ProyeccionCurso;
import pe.cibertec.samebanner.model.Proyeccion;
import java.util.List;

public interface ProyeccionCursoRepository extends JpaRepository<ProyeccionCurso, Integer> {
    List<ProyeccionCurso> findByProyeccion(Proyeccion proyeccion);
    void deleteByProyeccion(Proyeccion proyeccion);
}
