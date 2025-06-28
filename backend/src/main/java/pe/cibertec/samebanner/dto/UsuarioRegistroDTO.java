package pe.cibertec.samebanner.dto;





import lombok.Data; 

@Data 
public class UsuarioRegistroDTO {
    private String nombre;
    private String email;
    private String password;
    private String apellido;         
    private String codigoEstudiante; 
    private Integer carreraId;       
    private String cicloActual;      
    private String rol;              
}

