package pe.cibertec.samebanner.service;

import java.util.List;
import java.util.Optional;

import pe.cibertec.samebanner.model.Carrera;

public interface ICarreraService {
	
	public List<Carrera> listaCompletaCarrera();
	Carrera buscarCarreraPorId(Integer id);
	Carrera guardarCarrera(Carrera carrera);
	Optional<Carrera> actualizarCarrera(Integer id, Carrera carreraActualizada);
	void eliminarCarrera(Integer id);
	boolean existeCarreraPorId(Integer id);

}
