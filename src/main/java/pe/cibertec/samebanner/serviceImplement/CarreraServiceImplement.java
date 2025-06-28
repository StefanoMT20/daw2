package pe.cibertec.samebanner.serviceImplement;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.cibertec.samebanner.model.Carrera;
import pe.cibertec.samebanner.repository.CarreraRepository;
import pe.cibertec.samebanner.service.ICarreraService;
@Service
public class CarreraServiceImplement implements ICarreraService {

	@Autowired
	private CarreraRepository carreraRepository;
	


	@Override
	public List<Carrera> listaCompletaCarrera() {
		
		return carreraRepository.findAll();
	}



	@Override
    public Carrera buscarCarreraPorId(Integer id) {
        return carreraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carrera no encontrada"));
    }



	@Override
	public Carrera guardarCarrera(Carrera carrera) {
		
		return carreraRepository.save(carrera);
	}



	 @Override
	    public Optional<Carrera> actualizarCarrera(Integer id, Carrera carreraActualizada) {
	        
	        return carreraRepository.findById(id).map(carreraExistente -> {
	        	if (carreraActualizada.getCodigoCarrera() != null) {
	                carreraExistente.setCodigoCarrera(carreraActualizada.getCodigoCarrera());
	            }
	            if (carreraActualizada.getNombre() != null) { 
	                carreraExistente.setNombre(carreraActualizada.getNombre());
	            }
	            if (carreraActualizada.getDescripcion() != null) {
	                carreraExistente.setDescripcion(carreraActualizada.getDescripcion());
	            }
	            if (carreraActualizada.getDuracionCiclos() != null) {
	                carreraExistente.setDuracionCiclos(carreraActualizada.getDuracionCiclos());
	            }
	            if (carreraActualizada.getActiva() != null) {
	                carreraExistente.setActiva(carreraActualizada.getActiva());
	            }
	            // fechaCreacion no se actualiza aquí, ya que @PrePersist la maneja al crear.
	            // El ID tampoco se actualiza.

	           
	            return carreraRepository.save(carreraExistente);
	        });
	        
	    }

	    @Override
	    public void eliminarCarrera(Integer id) {
	        if (!carreraRepository.existsById(id)) {
	            throw new RuntimeException("Carrera con ID " + id + " no encontrada para eliminar");
	        }
	        carreraRepository.deleteById(id);
	    }

	    @Override
	    public boolean existeCarreraPorId(Integer id) {
	      
	        return carreraRepository.existsById(id);
	    }
	}
