package pe.cibertec.samebanner.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "cursos")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "codigo_curso")
    private String codigoCurso;

    private String nombre;
    private String descripcion;
    private Integer creditos;
    private String ciclo;

    @Column(name = "carrera_id")
    private Integer carreraId;

    @Column(name = "area_conocimiento")
    private String areaConocimiento;

    private String modalidad;
    private String sede;
    private String turno;

    @Column(name = "vacantes_totales")
    private Integer vacantesTotales;

    @Column(name = "vacantes_disponibles")
    private Integer vacantesDisponibles;

    @Column(name = "docente_id")
    private Integer docenteId;

    @Column(name = "horario_dias")
    private String horarioDias;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    private String aula;

    @Column(name = "enlace_virtual")
    private String enlaceVirtual;

    private Boolean activo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
