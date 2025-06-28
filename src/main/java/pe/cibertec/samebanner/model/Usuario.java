package pe.cibertec.samebanner.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String codigoEstudiante;
    private String email;
    @Column(name = "password_hash")
    private String password;
    private String nombre;
    private String apellido;
    private Integer carreraId;
    private String cicloActual;
    private String rol;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
