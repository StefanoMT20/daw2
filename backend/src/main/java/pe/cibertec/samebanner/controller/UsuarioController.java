package pe.cibertec.samebanner.controller;


import lombok.AllArgsConstructor;
import pe.cibertec.samebanner.dto.UsuarioRegistroDTO;
import pe.cibertec.samebanner.model.Usuario;
import pe.cibertec.samebanner.service.IUsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuario") 

@AllArgsConstructor 
public class UsuarioController {

    private final IUsuarioService usuarioService; 

    @PostMapping 
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody UsuarioRegistroDTO registroDTO) {
        try {
            Usuario nuevoUsuario = usuarioService.registrarUsuario(registroDTO);
            
            return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED); // Retorna 201 Created
        } catch (RuntimeException e) {
            
            System.err.println("Error al registrar usuario: " + e.getMessage()); 
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); 
        }
    }
}