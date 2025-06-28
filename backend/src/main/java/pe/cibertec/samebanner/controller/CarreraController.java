package pe.cibertec.samebanner.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import pe.cibertec.samebanner.model.Carrera;
import pe.cibertec.samebanner.repository.CarreraRepository;
import pe.cibertec.samebanner.service.ICarreraService;
import pe.cibertec.samebanner.serviceImplement.CarreraServiceImplement;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

	@Autowired
	private ICarreraService service; 

    
    @GetMapping
    public ResponseEntity<List<Carrera>> listar() {
        try {
            List<Carrera> carreras = service.listaCompletaCarrera();

            if (carreras.isEmpty()) {
                
                return ResponseEntity.notFound().build();
            } else {
                return ResponseEntity.ok(carreras); 
            }
        } catch (Exception e) {
           
            return ResponseEntity.internalServerError().build(); 
        }
    }

   
    @GetMapping("/{id}")
    public ResponseEntity<Carrera> getCarrera(@PathVariable Integer id) {
        try {
            Carrera carrera = service.buscarCarreraPorId(id);
            return ResponseEntity.ok(carrera); 
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); 
        }
    }

   
   /* @PostMapping
    public ResponseEntity<Carrera> guardarCarrera(@RequestBody Carrera carrera) {
        try {
            Carrera nuevaCarrera = service.guardarCarrera(carrera);
           
            return new ResponseEntity<>(nuevaCarrera, HttpStatus.CREATED);
        } catch (Exception e) {
           
            return ResponseEntity.internalServerError().build(); 
        }
    }

   
    @PutMapping("/{id}")
    public ResponseEntity<Carrera> actualizarCarrera(@PathVariable Integer id, @RequestBody Carrera carrera) {
        try {
            Optional<Carrera> carreraActualizada = service.actualizarCarrera(id, carrera);
            if (carreraActualizada.isPresent()) {
               
                return ResponseEntity.ok(carreraActualizada.get());
            } else {
               
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
           
            return ResponseEntity.internalServerError().build();
        }
    }

   
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCarrera(@PathVariable Integer id) {
        try {
            service.eliminarCarrera(id);
          
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) { 
           
            return ResponseEntity.notFound().build(); 
        }
    }*/
}