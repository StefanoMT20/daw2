package pe.cibertec.samebanner.service;

import pe.cibertec.samebanner.dto.UsuarioRegistroDTO;
import pe.cibertec.samebanner.model.Usuario;

public interface IUsuarioService {

	Usuario registrarUsuario(UsuarioRegistroDTO registroDTO);
}