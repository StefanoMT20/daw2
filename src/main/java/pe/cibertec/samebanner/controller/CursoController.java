package pe.cibertec.samebanner.controller;

import org.springframework.web.bind.annotation.*;
import pe.cibertec.samebanner.model.Curso;
import pe.cibertec.samebanner.repository.CursoRepository;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CursoController {
    private final CursoRepository cursoRepository;

    public CursoController(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    @GetMapping
    public List<Curso> getCursos(
            @RequestParam(required = false) Integer careerId,
            @RequestParam(required = false) String cycle) {
        if (careerId != null && cycle != null) {
            return cursoRepository.findByCarreraIdAndCiclo(careerId, cycle);
        }
        return cursoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Curso getCurso(@PathVariable Integer id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    @PostMapping
    public Curso createCurso(@RequestBody Curso curso) {
        return cursoRepository.save(curso);
    }

    @PutMapping("/{id}")
    public Curso updateCurso(@PathVariable Integer id, @RequestBody Curso curso) {
        curso.setId(id);
        return cursoRepository.save(curso);
    }

    @DeleteMapping("/{id}")
    public void deleteCurso(@PathVariable Integer id) {
        cursoRepository.deleteById(id);
    }
}
