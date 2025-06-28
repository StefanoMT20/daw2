package pe.cibertec.samebanner.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "docentes")
public class Docente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_docente")
    private String codigo_docente;

    private String nombre;
    private String apellido;
    private String email;
    private String especialidad;
    private String departamento;

    @Column(name = "ubicacion_oficina")
    private String ubicacion_oficina;

    @Column(name = "horario_atencion")
    private String horario_atencion;

    @Column(name = "areas_investigacion")
    private String areas_investigacion;

    @Column(name = "grado_academico")
    private String grado_academico;

    private Boolean activo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fecha_creacion;
}
