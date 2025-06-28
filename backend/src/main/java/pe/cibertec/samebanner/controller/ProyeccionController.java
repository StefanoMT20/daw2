package pe.cibertec.samebanner.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import pe.cibertec.samebanner.model.Proyeccion;
import pe.cibertec.samebanner.model.ProyeccionCurso;
import pe.cibertec.samebanner.model.Curso;
import pe.cibertec.samebanner.repository.ProyeccionRepository;
import pe.cibertec.samebanner.repository.ProyeccionCursoRepository;
import pe.cibertec.samebanner.repository.CursoRepository;
import pe.cibertec.samebanner.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping(value = "/api/student/projections", produces = MediaType.APPLICATION_JSON_VALUE)
public class ProyeccionController {
    private final ProyeccionRepository proyeccionRepository;
    private final ProyeccionCursoRepository proyeccionCursoRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProyeccionController(
            ProyeccionRepository proyeccionRepository,
            ProyeccionCursoRepository proyeccionCursoRepository,
            CursoRepository cursoRepository,
            UsuarioRepository usuarioRepository) {
        this.proyeccionRepository = proyeccionRepository;
        this.proyeccionCursoRepository = proyeccionCursoRepository;
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<?> getProyeccion(Authentication authentication) {
        try {
            Integer usuarioId = usuarioRepository.findOneByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                    .getId();

            Optional<Proyeccion> proyeccion = proyeccionRepository.findByUsuarioId(usuarioId);
            return proyeccion.map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener la proyección: " + e.getMessage());
        }
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createProyeccion(@RequestBody ProyeccionRequest request, Authentication authentication) {
        try {
            String cicloProyectado = validarFormatoCiclo(request.getCicloProyectado());

            Integer usuarioId = usuarioRepository.findOneByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"))
                    .getId();

            // Eliminar proyección existente
            proyeccionRepository.findByUsuarioId(usuarioId).ifPresent(existingProyeccion -> {
                proyeccionCursoRepository.deleteByProyeccion(existingProyeccion);
                proyeccionRepository.delete(existingProyeccion);
                proyeccionRepository.flush();
            });

            // Crear nueva proyección
            Proyeccion proyeccion = new Proyeccion();
            proyeccion.setUsuarioId(usuarioId);
            proyeccion.setCicloProyectado(cicloProyectado);
            proyeccion = proyeccionRepository.save(proyeccion);

            // Agregar cursos
            for (String codigoCurso : request.getCodigosCursos()) {
                Curso curso = cursoRepository.findByCodigoCurso(codigoCurso)
                        .orElseThrow(() -> new RuntimeException("Curso no encontrado: " + codigoCurso));

                ProyeccionCurso proyeccionCurso = new ProyeccionCurso();
                proyeccionCurso.setProyeccion(proyeccion);
                proyeccionCurso.setCurso(curso);
                proyeccionCursoRepository.save(proyeccionCurso);
            }

            // Recargar la proyección para obtener los cursos
            Proyeccion proyeccionCompleta = proyeccionRepository.findById(proyeccion.getId())
                    .orElseThrow(() -> new RuntimeException("Error al recargar la proyección"));

            return ResponseEntity.ok(proyeccionCompleta);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error de integridad de datos: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear la proyección: " + e.getMessage());
        }
    }

    private String validarFormatoCiclo(String ciclo) {
        if (ciclo == null || ciclo.trim().isEmpty()) {
            throw new IllegalArgumentException("El ciclo no puede estar vacío");
        }

        if (ciclo.matches("^Ciclo_\\d{2}$")) {
            int numero = Integer.parseInt(ciclo.substring(6));
            if (numero >= 1 && numero <= 10) {
                return ciclo;
            }
        }

        try {
            String numeroStr = ciclo.replaceAll("\\D+", "");
            int numero = Integer.parseInt(numeroStr);

            if (numero >= 1 && numero <= 10) {
                return String.format("Ciclo_%02d", numero);
            }
            throw new IllegalArgumentException("Número de ciclo inválido: debe estar entre 1 y 10");
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Formato de ciclo inválido: " + ciclo);
        }
    }
}

class ProyeccionRequest {
    private String cicloProyectado;
    private List<String> codigosCursos;

    public String getCicloProyectado() {
        return cicloProyectado;
    }

    public void setCicloProyectado(String cicloProyectado) {
        this.cicloProyectado = cicloProyectado;
    }

    public List<String> getCodigosCursos() {
        return codigosCursos;
    }

    public void setCodigosCursos(List<String> codigosCursos) {
        this.codigosCursos = codigosCursos;
    }
}
