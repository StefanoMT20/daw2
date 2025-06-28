package pe.cibertec.samebanner.controller;

import org.springframework.web.bind.annotation.*;
import pe.cibertec.samebanner.model.Docente;
import pe.cibertec.samebanner.repository.DocenteRepository;
import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class DocenteController {
    private final DocenteRepository docenteRepository;

    public DocenteController(DocenteRepository docenteRepository) {
        this.docenteRepository = docenteRepository;
    }

    @GetMapping("/{id}")
    public Docente getDocente(@PathVariable Integer id) {
        return docenteRepository.findById(id)
                .orElse(null);
    }

    @GetMapping
    public List<Docente> getDocentes() {
        return docenteRepository.findAll();
    }
}
