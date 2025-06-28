-- =============================================
-- CREACIÓN DE LA BASE DE DATOS Y ESTRUCTURA
-- =============================================

-- Eliminar la base de datos si existe y crear una nueva
DROP DATABASE IF EXISTS samebanner;
CREATE DATABASE samebanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE samebanner;

-- =============================================
-- CREACIÓN DE TABLAS
-- =============================================

-- Tabla de carreras
CREATE TABLE carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_carrera VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_ciclos INT NOT NULL COMMENT 'Número total de ciclos académicos',
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de docentes
CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_docente VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    departamento VARCHAR(100) NOT NULL,
    ubicacion_oficina VARCHAR(100),
    horario_atencion VARCHAR(200),
    areas_investigacion TEXT,
    grado_academico VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_estudiante VARCHAR(20) UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    carrera_id INT NOT NULL,
    ciclo_actual ENUM('Ciclo_01', 'Ciclo_02', 'Ciclo_03', 'Ciclo_04', 'Ciclo_05',
                     'Ciclo_06', 'Ciclo_07', 'Ciclo_08', 'Ciclo_09', 'Ciclo_10') NOT NULL,
    rol ENUM('estudiante', 'administrador') NOT NULL DEFAULT 'estudiante',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_curso VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    creditos INT NOT NULL,
    ciclo ENUM('Ciclo_01', 'Ciclo_02', 'Ciclo_03', 'Ciclo_04', 'Ciclo_05',
              'Ciclo_06', 'Ciclo_07', 'Ciclo_08', 'Ciclo_09', 'Ciclo_10') NOT NULL,
    carrera_id INT NOT NULL,
    area_conocimiento VARCHAR(100),
    modalidad ENUM('presencial', 'virtual') NOT NULL DEFAULT 'presencial',
    sede VARCHAR(100),
    turno ENUM('manana', 'tarde', 'noche') NOT NULL,
    vacantes_totales INT NOT NULL,
    vacantes_disponibles INT NOT NULL,
    docente_id INT,
    horario_dias VARCHAR(50) COMMENT 'Días separados por comas: "Lunes,Miércoles"',
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula VARCHAR(20),
    enlace_virtual VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla de proyecciones (una por usuario)
CREATE TABLE proyecciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    ciclo_proyectado ENUM('Ciclo_01', 'Ciclo_02', 'Ciclo_03', 'Ciclo_04', 'Ciclo_05',
                         'Ciclo_06', 'Ciclo_07', 'Ciclo_08', 'Ciclo_09', 'Ciclo_10') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla de relación entre proyecciones y cursos
CREATE TABLE proyeccion_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyeccion_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyeccion_id) REFERENCES proyecciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY (proyeccion_id, curso_id)  -- Evita duplicados
) ENGINE=InnoDB;

-- =============================================
-- ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- =============================================

-- Índices para la tabla cursos
CREATE INDEX idx_cursos_ciclo ON cursos(ciclo);
CREATE INDEX idx_cursos_carrera ON cursos(carrera_id);
CREATE INDEX idx_cursos_docente ON cursos(docente_id);

-- Índices para la tabla usuarios
CREATE INDEX idx_usuarios_carrera ON usuarios(carrera_id);

-- Índices para la tabla proyecciones
CREATE INDEX idx_proyecciones_usuario ON proyecciones(usuario_id);

-- Índices para la tabla proyeccion_cursos
CREATE INDEX idx_proyeccion_cursos_proyeccion ON proyeccion_cursos(proyeccion_id);
CREATE INDEX idx_proyeccion_cursos_curso ON proyeccion_cursos(curso_id);

-- =============================================
-- INSERCIÓN DE DATOS
-- =============================================

use samebanner;

-- 1. Insertar carreras
INSERT INTO carreras (codigo_carrera, nombre, descripcion, duracion_ciclos) VALUES
('ISW-001', 'Ingeniería de Software', 'Carrera enfocada en el desarrollo de sistemas de software de calidad', 10),
('PSI-001', 'Psicología', 'Carrera enfocada en el estudio del comportamiento humano y salud mental', 10),
('DER-001', 'Derecho', 'Carrera enfocada en el marco legal y sistema jurídico', 10);

-- 2. Insertar docentes
-- Docentes para Ingeniería de Software
INSERT INTO docentes (codigo_docente, nombre, apellido, email, especialidad, departamento, ubicacion_oficina, horario_atencion, areas_investigacion, grado_academico) VALUES
('DOC-ISW-01', 'Carlos', 'Mendoza', 'cmendoza@centroeducativo.edu', 'Programación', 'Departamento de Ingeniería de Software', 'Edificio A - Oficina 301', 'Lunes y Miércoles 14:00-16:00, Viernes 10:00-12:00', 'Desarrollo de Software,Arquitecturas Cloud,Metodologías Ágiles,Inteligencia Artificial Aplicada', 'Doctor en Ciencias de la Computación'),
('DOC-ISW-02', 'Ana', 'Torres', 'atorres@centroeducativo.edu', 'Bases de Datos', 'Departamento de Ingeniería de Software', 'Edificio A - Oficina 302', 'Martes y Jueves 15:00-17:00, Viernes 14:00-16:00', 'Bases de Datos NoSQL,Big Data,Data Mining,Sistemas Distribuidos', 'Doctora en Ingeniería de Software'),
('DOC-ISW-03', 'Luis', 'Fernández', 'lfernandez@centroeducativo.edu', 'Ingeniería de Software', 'Departamento de Ingeniería de Software', 'Edificio A - Oficina 303', 'Lunes y Miércoles 10:00-12:00, Jueves 14:00-16:00', 'Patrones de Diseño,Arquitectura de Software,DevOps,Calidad de Software', 'Doctor en Ingeniería de Sistemas');

-- Docentes para Psicología
INSERT INTO docentes (codigo_docente, nombre, apellido, email, especialidad, departamento, ubicacion_oficina, horario_atencion, areas_investigacion, grado_academico) VALUES
('DOC-PSI-01', 'María', 'Gómez', 'mgomez@centroeducativo.edu', 'Psicología Clínica', 'Departamento de Psicología', 'Edificio B - Oficina 201', 'Lunes y Miércoles 09:00-11:00, Viernes 15:00-17:00', 'Terapia Cognitivo-Conductual,Trastornos de Ansiedad,Psicología de la Salud', 'Doctora en Psicología Clínica'),
('DOC-PSI-02', 'Roberto', 'Silva', 'rsilva@centroeducativo.edu', 'Psicología Organizacional', 'Departamento de Psicología', 'Edificio B - Oficina 202', 'Martes y Jueves 11:00-13:00, Viernes 09:00-11:00', 'Comportamiento Organizacional,Selección de Personal,Desarrollo de Talento', 'Doctor en Psicología Organizacional'),
('DOC-PSI-03', 'Sofía', 'Castro', 'scastro@centroeducativo.edu', 'Psicología Educativa', 'Departamento de Psicología', 'Edificio B - Oficina 203', 'Lunes y Miércoles 14:00-16:00, Jueves 10:00-12:00', 'Aprendizaje y Desarrollo,Necesidades Educativas Especiales,Psicología del Adolescente', 'Doctora en Psicología Educativa');

-- Docentes para Derecho
INSERT INTO docentes (codigo_docente, nombre, apellido, email, especialidad, departamento, ubicacion_oficina, horario_atencion, areas_investigacion, grado_academico) VALUES
('DOC-DER-01', 'Jorge', 'Ramírez', 'jramirez@centroeducativo.edu', 'Derecho Civil', 'Departamento de Derecho', 'Edificio C - Oficina 101', 'Lunes y Miércoles 11:00-13:00, Viernes 15:00-17:00', 'Derecho de Contratos,Responsabilidad Civil,Derecho de Familia', 'Doctor en Derecho'),
('DOC-DER-02', 'Elena', 'Vargas', 'evargas@centroeducativo.edu', 'Derecho Penal', 'Departamento de Derecho', 'Edificio C - Oficina 102', 'Martes y Jueves 09:00-11:00, Viernes 14:00-16:00', 'Derecho Penal Económico,Criminología,Derecho Procesal Penal', 'Doctora en Derecho Penal'),
('DOC-DER-03', 'Pedro', 'Díaz', 'pdiaz@centroeducativo.edu', 'Derecho Internacional', 'Departamento de Derecho', 'Edificio C - Oficina 103', 'Lunes y Miércoles 15:00-17:00, Jueves 11:00-13:00', 'Derecho Internacional Público,Derechos Humanos,Derecho Comercial Internacional', 'Doctor en Derecho Internacional');

-- 3. Insertar usuarios (estudiantes y administrador)
-- Administrador del sistema
INSERT INTO usuarios (codigo_estudiante, email, password_hash, nombre, apellido, carrera_id, ciclo_actual, rol) VALUES
('ADM-001', 'admin@centroeducativo.edu', '$2a$10$J3Q2Q0OmV/.3zDhyZzC9O.VySYRxBoto52VWT1TIVdCccop6tBXqy', 'Admin', 'Sistema', 1, 'Ciclo_01', 'administrador');

-- Estudiantes de Ingeniería de Software
INSERT INTO usuarios (codigo_estudiante, email, password_hash, nombre, apellido, carrera_id, ciclo_actual) VALUES
('ISW-2025-001', 'michael.vairo@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Michael', 'Vairo', 1, 'Ciclo_01'),
('ISW-2025-002', 'omar.ruiz@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Omar', 'Ruiz', 1, 'Ciclo_03'),
('ISW-2025-003', 'patrick.munante@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Patrick', 'Munante', 1, 'Ciclo_05');

-- Estudiantes de Psicología
INSERT INTO usuarios (codigo_estudiante, email, password_hash, nombre, apellido, carrera_id, ciclo_actual) VALUES
('PSI-2025-001', 'carlos.lopez@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Carlos', 'López', 2, 'Ciclo_03'),
('PSI-2025-002', 'ana.martinez@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Ana', 'Martínez', 2, 'Ciclo_05'),
('PSI-2025-003', 'felipe.gutierrez@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Felipe', 'Gutierrez', 2, 'Ciclo_07');
-- Estudiantes de Derecho
INSERT INTO usuarios (codigo_estudiante, email, password_hash, nombre, apellido, carrera_id, ciclo_actual) VALUES
('DER-2025-001', 'luis.rodriguez@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Luis', 'Rodríguez', 3, 'Ciclo_07'),
('DER-2025-002', 'sofia.sanchez@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Sofía', 'Sánchez', 3, 'Ciclo_09'),
('DER-2025-003', 'gerald.oment@centroeducativo.edu', '$2a$10$kTo1Fb/IorWJttQA2shdSOuem/lWzu42qKC.5RQvKYQ0pyHA5pQGu', 'Gerald', 'Oment', 3, 'Ciclo_10');
-- 4. Insertar cursos
-- Cursos de Ingeniería de Software (Carrera ID 1)
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
-- Ciclo 01
('ISW-C01-01', 'Aprendizaje Estratégico y Liderazgo', 'Desarrollo de habilidades de liderazgo', 4, 'Ciclo_01', 1, 'Desarrollo Personal', 'presencial', 'Campus Central - Edificio A', 'manana', 30, 30, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'A-101'),
('ISW-C01-02', 'Crítica y Comunicación', 'Desarrollo de habilidades comunicativas y pensamiento crítico', 3, 'Ciclo_01', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio A', 'manana', 30, 30, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'A-102'),
('ISW-C01-03', 'Introducción a los Algoritmos', 'Fundamentos de programación y algoritmos básicos', 5, 'Ciclo_01', 1, 'Programación', 'presencial', 'Campus Central - Edificio B', 'tarde', 25, 25, 1, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'B-101'),
('ISW-C01-04', 'Matemática Básica', 'Fundamentos matemáticos para ingeniería', 4, 'Ciclo_01', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio B', 'tarde', 25, 25, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'B-102'),
('ISW-C01-05', 'Pensamiento Crítico Aplicado', 'Desarrollo de habilidades de análisis crítico', 3, 'Ciclo_01', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio A', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'A-103'),
('ISW-C01-06', 'Sistemas y Sociedad', 'Impacto de los sistemas en la sociedad', 3, 'Ciclo_01', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio A', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'A-104'),

-- Ciclo 02
('ISW-C02-01', 'Algoritmos', 'Estructuras de datos y algoritmos avanzados', 5, 'Ciclo_02', 1, 'Programación', 'presencial', 'Campus Central - Edificio B', 'manana', 25, 25, 1, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'B-201'),
('ISW-C02-02', 'Aplicaciones de Ingeniería de Software', 'Desarrollo de aplicaciones básicas', 4, 'Ciclo_02', 1, 'Programación', 'presencial', 'Campus Central - Edificio B', 'manana', 25, 25, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'B-202'),
('ISW-C02-03', 'Cálculo I', 'Cálculo diferencial e integral', 4, 'Ciclo_02', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio C', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'C-201'),
('ISW-C02-04', 'Organización y Dirección de Empresas', 'Fundamentos de administración empresarial', 3, 'Ciclo_02', 1, 'Administración', 'presencial', 'Campus Central - Edificio C', 'tarde', 25, 25, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'C-202'),
('ISW-C02-05', 'Seminario de Investigación Académica I', 'Metodologías de investigación', 3, 'Ciclo_02', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio B', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'B-203'),

-- Ciclo 03
('ISW-C03-01', 'Diseño y Patrones de Software', 'Patrones de diseño de software', 5, 'Ciclo_03', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio C', 'manana', 20, 20, 3, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'C-301'),
('ISW-C03-V01', 'Diseño y Patrones de Software', 'Patrones de diseño de software', 5, 'Ciclo_03', 1, 'Ingeniería de Software', 'virtual', 'Virtual', 'manana', 20, 20, 3, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'Virtual'),
('ISW-C03-02', 'Estructuras de Datos Avanzadas', 'Estructuras de datos complejas', 5, 'Ciclo_03', 1, 'Programación', 'presencial', 'Campus Central - Edificio C', 'manana', 20, 20, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'C-302'),
('ISW-C03-V02', 'Estructuras de Datos Avanzadas', 'Estructuras de datos complejas', 5, 'Ciclo_03', 1, 'Programación', 'virtual', 'Virtual', 'manana', 20, 20, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'Virtual'),
('ISW-C03-03', 'Física I', 'Fundamentos de física para ingeniería', 4, 'Ciclo_03', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio D', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'D-301'),
('ISW-C03-V03', 'Física I', 'Fundamentos de física para ingeniería', 4, 'Ciclo_03', 1, 'Ciencias Básicas', 'virtual', 'Virtual', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'Virtual'),
('ISW-C03-04', 'Ingeniería de Requisitos', 'Recolección y análisis de requisitos', 4, 'Ciclo_03', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio D', 'tarde', 20, 20, 3, 'Martes,Jueves', '14:00:00', '16:00:00', 'D-302'),
('ISW-C03-V04', 'Ingeniería de Requisitos', 'Recolección y análisis de requisitos', 4, 'Ciclo_03', 1, 'Ingeniería de Software', 'virtual', 'Virtual', 'tarde', 20, 20, 3, 'Martes,Jueves', '14:00:00', '16:00:00', 'Virtual'),
('ISW-C03-05', 'Matemática Discreta', 'Matemáticas discretas para computación', 4, 'Ciclo_03', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio C', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'C-303'),
('ISW-C03-V05', 'Matemática Discreta', 'Matemáticas discretas para computación', 4, 'Ciclo_03', 1, 'Ciencias Básicas', 'virtual', 'Virtual', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'Virtual'),

-- Ciclo 04
('ISW-C04-01', 'Arquitectura de Computadoras', 'Diseño de arquitecturas de computadoras', 5, 'Ciclo_04', 1, 'Sistemas', 'presencial', 'Campus Central - Edificio D', 'manana', 20, 20, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'D-401'),
('ISW-C04-02', 'Base de Datos', 'Diseño e implementación de bases de datos', 5, 'Ciclo_04', 1, 'Bases de Datos', 'presencial', 'Campus Central - Edificio D', 'manana', 20, 20, 2, 'Martes,Jueves', '08:00:00', '10:00:00', 'D-402'),
('ISW-C04-03', 'Física II', 'Continuación de física para ingeniería', 4, 'Ciclo_04', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio E', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'E-401'),
('ISW-C04-04', 'HCI for UX Design', 'Diseño de interfaces usuario', 4, 'Ciclo_04', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio E', 'tarde', 20, 20, 3, 'Martes,Jueves', '14:00:00', '16:00:00', 'E-402'),
('ISW-C04-05', 'Matemática Computacional', 'Matemáticas aplicadas a computación', 4, 'Ciclo_04', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio D', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'D-403'),

-- Ciclo 05
('ISW-C05-01', 'Aplicaciones para Plataformas Web', 'Desarrollo web avanzado', 5, 'Ciclo_05', 1, 'Programación', 'presencial', 'Campus Central - Edificio E', 'manana', 20, 20, 1, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'E-501'),
('ISW-C05-02', 'Desarrollo de Aplicaciones Open Source', 'Desarrollo con tecnologías open source', 4, 'Ciclo_05', 1, 'Programación', 'presencial', 'Campus Central - Edificio E', 'manana', 20, 20, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'E-502'),
('ISW-C05-03', 'Cálculo II', 'Cálculo multivariable', 4, 'Ciclo_05', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio F', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'F-501'),
('ISW-C05-04', 'Sistemas Operativos', 'Fundamentos de sistemas operativos', 4, 'Ciclo_05', 1, 'Sistemas', 'presencial', 'Campus Central - Edificio F', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'F-502'),

-- Ciclo 06
('ISW-C06-01', 'Aplicaciones para Plataformas Móviles', 'Desarrollo de aplicaciones móviles', 5, 'Ciclo_06', 1, 'Programación', 'presencial', 'Campus Central - Edificio F', 'manana', 20, 20, 1, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'F-601'),
('ISW-C06-02', 'Complejidad Algoritmica', 'Análisis de complejidad de algoritmos', 4, 'Ciclo_06', 1, 'Programación', 'presencial', 'Campus Central - Edificio F', 'manana', 20, 20, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'F-602'),
('ISW-C06-03', 'Estadística Aplicada I', 'Estadística para ingeniería de software', 4, 'Ciclo_06', 1, 'Ciencias Básicas', 'presencial', 'Campus Central - Edificio G', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'G-601'),
('ISW-C06-04', 'Redes y Comunicaciones de Datos', 'Fundamentos de redes computacionales', 4, 'Ciclo_06', 1, 'Sistemas', 'presencial', 'Campus Central - Edificio G', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'G-602'),

-- Ciclo 07
('ISW-C07-01', 'Arquitecturas de Software', 'Diseño de arquitecturas software', 5, 'Ciclo_07', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio G', 'manana', 20, 20, 3, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'G-701'),
('ISW-C07-02', 'Desarrollo de Soluciones IoT', 'Internet de las cosas', 4, 'Ciclo_07', 1, 'Programación', 'presencial', 'Campus Central - Edificio G', 'manana', 20, 20, 1, 'Martes,Jueves', '08:00:00', '10:00:00', 'G-702'),
('ISW-C07-03', 'Diseño de Experimentos de Ingeniería de Software', 'Metodologías de experimentación', 4, 'Ciclo_07', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio H', 'tarde', 20, 20, 3, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'H-701'),
('ISW-C07-04', 'Tecnologías e Ingeniería Financiera', 'Aplicaciones financieras', 4, 'Ciclo_07', 1, 'Aplicaciones', 'presencial', 'Campus Central - Edificio H', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'H-702'),

-- Ciclo 08
('ISW-C08-01', 'Arquitecturas de Software en Tecnologías Emergentes', 'Arquitecturas modernas', 5, 'Ciclo_08', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio H', 'manana', 20, 20, 3, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'H-801'),
('ISW-C08-02', 'Fundamentos de Investigación Académica', 'Metodología de investigación', 4, 'Ciclo_08', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio H', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'H-802'),
('ISW-C08-03', 'Gerencia de Proyectos en Computación', 'Gestión de proyectos TI', 4, 'Ciclo_08', 1, 'Administración', 'presencial', 'Campus Central - Edificio I', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'I-801'),
('ISW-C08-04', 'Tópicos de Investigación Aplicada', 'Investigación aplicada', 4, 'Ciclo_08', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio I', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'I-802'),

-- Ciclo 09
('ISW-C09-01', 'Calidad y Mejora de Procesos de Software', 'Control de calidad en software', 5, 'Ciclo_09', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio I', 'manana', 20, 20, 3, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'I-901'),
('ISW-C09-02', 'Desarrollo Agile de Productos de Software', 'Metodologías ágiles', 4, 'Ciclo_09', 1, 'Ingeniería de Software', 'presencial', 'Campus Central - Edificio I', 'manana', 20, 20, 3, 'Martes,Jueves', '08:00:00', '10:00:00', 'I-902'),
('ISW-C09-03', 'Trabajo de Investigación I', 'Proyecto de investigación', 4, 'Ciclo_09', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio J', 'tarde', 15, 15, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'J-901'),

-- Ciclo 10
('ISW-C10-01', 'CTI Trabajo de Investigación II', 'Proyecto final de investigación', 5, 'Ciclo_10', 1, 'Humanidades', 'presencial', 'Campus Central - Edificio J', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'J-1001');

-- Cursos Electivos para Ingeniería de Software
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
('ISW-ELEC-01', 'Inteligencia Artificial', 'Fundamentos de IA', 4, 'Ciclo_09', 1, 'Programación', 'presencial', 'Campus Central - Edificio J', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'J-902'),
('ISW-ELEC-02', 'Seguridad Informática', 'Principios de seguridad', 4, 'Ciclo_09', 1, 'Sistemas', 'presencial', 'Campus Central - Edificio J', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'J-903'),
('ISW-ELEC-03', 'Big Data', 'Manejo de grandes volúmenes de datos', 4, 'Ciclo_10', 1, 'Bases de Datos', 'presencial', 'Campus Central - Edificio J', 'tarde', 20, 20, 2, 'Martes,Jueves', '14:00:00', '16:00:00', 'J-1002'),
('ISW-ELEC-04', 'Cloud Computing', 'Computación en la nube', 4, 'Ciclo_10', 1, 'Sistemas', 'presencial', 'Campus Central - Edificio J', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'J-1003');

-- Cursos de Psicología (Carrera ID 2)
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
-- Ciclo 01
('PSI-C01-01', 'Aprendizaje Estratégico y Liderazgo', 'Desarrollo de habilidades de liderazgo', 4, 'Ciclo_01', 2, 'Desarrollo Personal', 'presencial', 'Campus Norte - Edificio P', 'manana', 30, 30, 4, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'P-101'),
('PSI-C01-02', 'Crítica y Comunicación', 'Habilidades comunicativas y pensamiento crítico', 3, 'Ciclo_01', 2, 'Humanidades', 'presencial', 'Campus Norte - Edificio P', 'manana', 30, 30, 4, 'Martes,Jueves', '08:00:00', '10:00:00', 'P-102'),
('PSI-C01-03', 'Pensamiento Crítico Aplicado', 'Desarrollo de análisis crítico', 3, 'Ciclo_01', 2, 'Humanidades', 'presencial', 'Campus Norte - Edificio P', 'tarde', 25, 25, 4, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'P-103'),
('PSI-C01-04', 'Procesos Psicológicos Básicos', 'Cognición y percepción', 5, 'Ciclo_01', 2, 'Psicología Cognitiva', 'presencial', 'Campus Norte - Edificio P', 'tarde', 25, 25, 4, 'Martes,Jueves', '14:00:00', '16:00:00', 'P-104'),
('PSI-C01-05', 'Sistemas y Sociedad', 'Impacto de sistemas en la sociedad', 3, 'Ciclo_01', 2, 'Humanidades', 'presencial', 'Campus Norte - Edificio P', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'P-105'),
('PSI-C01-06', 'Introducción a la Psicología', 'Bases de la psicología', 4, 'Ciclo_01', 2, 'Psicología General', 'presencial', 'Campus Norte - Edificio P', 'noche', 20, 20, 4, 'Martes,Jueves', '18:00:00', '20:00:00', 'P-106'),

-- Ciclo 02
('PSI-C02-01', 'Estilos de Vida, Medio Ambiente y Salud', 'Relación entre estilo de vida y salud', 4, 'Ciclo_02', 2, 'Psicología de la Salud', 'presencial', 'Campus Norte - Edificio Q', 'manana', 25, 25, 5, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'Q-201'),
('PSI-C02-02', 'Inteligencia Artificial y Gestión de la Interrupción Científica', 'Tecnología y psicología', 3, 'Ciclo_02', 2, 'Psicología Tecnológica', 'presencial', 'Campus Norte - Edificio Q', 'manana', 25, 25, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'Q-202'),
('PSI-C02-03', 'Pensamiento Crítico Aplicado', 'Desarrollo de análisis crítico', 3, 'Ciclo_02', 2, 'Humanidades', 'presencial', 'Campus Norte - Edificio Q', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'Q-203'),
('PSI-C02-04', 'Desarrollo Humano en la Infancia y Adolescencia', 'Psicología del desarrollo', 4, 'Ciclo_02', 2, 'Psicología Evolutiva', 'presencial', 'Campus Norte - Edificio Q', 'tarde', 25, 25, 5, 'Martes,Jueves', '14:00:00', '16:00:00', 'Q-204'),
('PSI-C02-05', 'Bases Estructurales y Funcionales del Comportamiento Humano', 'Bases biológicas del comportamiento', 4, 'Ciclo_02', 2, 'Psicología Biológica', 'presencial', 'Campus Norte - Edificio Q', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'Q-205'),
('PSI-C02-06', 'Bases De Evaluación Psicológica', 'Fundamentos de evaluación psicológica', 4, 'Ciclo_02', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio Q', 'noche', 20, 20, 4, 'Martes,Jueves', '18:00:00', '20:00:00', 'Q-206'),

-- Ciclo 03
('PSI-C03-01', 'Bases Biológicas del Comportamiento Humano', 'Neuropsicología básica', 5, 'Ciclo_03', 2, 'Psicología Biológica', 'presencial', 'Campus Norte - Edificio R', 'manana', 20, 20, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'R-301'),
('PSI-C03-02', 'Estadística Aplicada', 'Estadística para psicología', 4, 'Ciclo_03', 2, 'Metodología', 'presencial', 'Campus Norte - Edificio R', 'manana', 25, 25, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'R-302'),
('PSI-C03-03', 'Realidad Social Peruana', 'Contexto social peruano', 4, 'Ciclo_03', 2, 'Psicología Social', 'presencial', 'Campus Norte - Edificio R', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'R-303'),
('PSI-C03-04', 'Desarrollo Humano del Adulto y Adulto Mayor', 'Psicología del desarrollo adulto', 4, 'Ciclo_03', 2, 'Psicología Evolutiva', 'presencial', 'Campus Norte - Edificio R', 'tarde', 25, 25, 5, 'Martes,Jueves', '14:00:00', '16:00:00', 'R-304'),
('PSI-C03-05', 'Procesos Psicopatológicos en la Infancia y Adolescencia', 'Psicopatología infantil', 4, 'Ciclo_03', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio R', 'noche', 20, 20, 4, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'R-305'),
('PSI-C03-06', 'Técnicas e Instrumentos de Evaluación Psicológica', 'Herramientas de evaluación', 4, 'Ciclo_03', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio R', 'noche', 20, 20, 4, 'Martes,Jueves', '18:00:00', '20:00:00', 'R-306'),

-- Ciclo 04
('PSI-C04-01', 'Trabajo, Subjetividad y Salud Mental', 'Psicología laboral', 5, 'Ciclo_04', 2, 'Psicología Organizacional', 'presencial', 'Campus Norte - Edificio S', 'manana', 20, 20, 5, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'S-401'),
('PSI-C04-02', 'Psicoanálisis', 'Teorías psicoanalíticas', 4, 'Ciclo_04', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio S', 'manana', 20, 20, 4, 'Martes,Jueves', '08:00:00', '10:00:00', 'S-402'),
('PSI-C04-03', 'Psicopatología del Adulto', 'Trastornos psicológicos en adultos', 4, 'Ciclo_04', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio S', 'tarde', 20, 20, 4, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'S-403'),
('PSI-C04-04', 'Intervenciones Sociales Comunitarias', 'Trabajo comunitario', 4, 'Ciclo_04', 2, 'Psicología Social', 'presencial', 'Campus Norte - Edificio S', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'S-404'),
('PSI-C04-05', 'Intervenciones en Contextos Educativos', 'Psicología educativa', 4, 'Ciclo_04', 2, 'Psicología Educativa', 'presencial', 'Campus Norte - Edificio S', 'noche', 20, 20, 6, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'S-405'),
('PSI-C04-06', 'Salud Publica', 'Psicología y salud pública', 4, 'Ciclo_04', 2, 'Psicología de la Salud', 'presencial', 'Campus Norte - Edificio S', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'S-406'),

-- Ciclo 05
('PSI-C05-01', 'Psicología de la Conducta', 'Teorías conductuales', 5, 'Ciclo_05', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio T', 'manana', 20, 20, 4, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'T-501'),
('PSI-C05-02', 'Metodología de la Investigación', 'Métodos de investigación', 4, 'Ciclo_05', 2, 'Metodología', 'presencial', 'Campus Norte - Edificio T', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'T-502'),
('PSI-C05-03', 'Externado en Procesos Educativos', 'Prácticas educativas', 4, 'Ciclo_05', 2, 'Psicología Educativa', 'presencial', 'Campus Norte - Edificio T', 'tarde', 15, 15, 6, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'T-503'),
('PSI-C05-04', 'Intervenciones en Contextos Laborales', 'Psicología organizacional', 4, 'Ciclo_05', 2, 'Psicología Organizacional', 'presencial', 'Campus Norte - Edificio T', 'tarde', 20, 20, 5, 'Martes,Jueves', '14:00:00', '16:00:00', 'T-504'),
('PSI-C05-05', 'Intervenciones en Salud', 'Psicología clínica en salud', 4, 'Ciclo_05', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio T', 'noche', 20, 20, 4, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'T-505'),
('PSI-C05-06', 'Procesos de Evaluación Psicológica', 'Evaluación psicológica avanzada', 4, 'Ciclo_05', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio T', 'noche', 20, 20, 4, 'Martes,Jueves', '18:00:00', '20:00:00', 'T-506'),

-- Ciclo 06
('PSI-C06-01', 'Especialidad 1', 'Curso de especialización 1', 5, 'Ciclo_06', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio U', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'U-601'),
('PSI-C06-02', 'Intervenciones Conductuales', 'Terapias conductuales', 4, 'Ciclo_06', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio U', 'manana', 20, 20, 4, 'Martes,Jueves', '08:00:00', '10:00:00', 'U-602'),
('PSI-C06-03', 'Externado en Procesos Sociales y Promoción de la Salud', 'Prácticas sociales', 4, 'Ciclo_06', 2, 'Psicología Social', 'presencial', 'Campus Norte - Edificio U', 'tarde', 15, 15, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'U-603'),
('PSI-C06-04', 'Intervenciones Psicológicas en la Infancia y Adolescencia', 'Terapia infantil', 4, 'Ciclo_06', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio U', 'tarde', 20, 20, 4, 'Martes,Jueves', '14:00:00', '16:00:00', 'U-604'),

-- Ciclo 07
('PSI-C07-01', 'Especialidad 2', 'Curso de especialización 2', 5, 'Ciclo_07', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio U', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'U-701'),
('PSI-C07-02', 'Intervenciones Psicoanalíticas', 'Terapias psicoanalíticas', 4, 'Ciclo_07', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio U', 'manana', 20, 20, 4, 'Martes,Jueves', '08:00:00', '10:00:00', 'U-702'),
('PSI-C07-03', 'Investigación Científica', 'Metodología de investigación avanzada', 4, 'Ciclo_07', 2, 'Metodología', 'presencial', 'Campus Norte - Edificio V', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'V-701'),
('PSI-C07-04', 'Rotaciones en Prácticas Psicológicas 1', 'Prácticas profesionales', 4, 'Ciclo_07', 2, 'Prácticas', 'presencial', 'Campus Norte - Edificio V', 'tarde', 10, 10, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'V-702'),

-- Ciclo 08
('PSI-C08-01', 'Especialidad 3', 'Curso de especialización 3', 5, 'Ciclo_08', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio V', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'V-801'),
('PSI-C08-02', 'Abordajes Psicológicos Contemporáneos', 'Enfoques modernos', 4, 'Ciclo_08', 2, 'Psicología Clínica', 'presencial', 'Campus Norte - Edificio V', 'manana', 20, 20, 4, 'Martes,Jueves', '08:00:00', '10:00:00', 'V-802'),
('PSI-C08-03', 'Rotaciones en Prácticas Psicológicas 2', 'Prácticas profesionales avanzadas', 4, 'Ciclo_08', 2, 'Prácticas', 'presencial', 'Campus Norte - Edificio W', 'tarde', 10, 10, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'W-801'),
('PSI-C08-04', 'Electivo', 'Curso electivo', 4, 'Ciclo_08', 2, 'Electivo', 'presencial', 'Campus Norte - Edificio W', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'W-802'),

-- Ciclo 09
('PSI-C09-01', 'Especialidad 4', 'Curso de especialización 4', 5, 'Ciclo_09', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio W', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'W-901'),
('PSI-C09-02', 'Producción de Conocimiento Científico en Psicología', 'Investigación científica', 4, 'Ciclo_09', 2, 'Metodología', 'presencial', 'Campus Norte - Edificio W', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'W-902'),
('PSI-C09-03', 'Rotaciones en Prácticas Psicológicas de Especialidad', 'Prácticas especializadas', 4, 'Ciclo_09', 2, 'Prácticas', 'presencial', 'Campus Norte - Edificio X', 'tarde', 10, 10, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'X-901'),
('PSI-C09-04', 'Electivo', 'Curso electivo', 4, 'Ciclo_09', 2, 'Electivo', 'presencial', 'Campus Norte - Edificio X', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'X-902'),

-- Ciclo 10
('PSI-C10-01', 'CTI y Seminarios Integradores', 'Trabajo final integrador', 5, 'Ciclo_10', 2, 'Integración', 'presencial', 'Campus Norte - Edificio X', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'X-1001'),
('PSI-C10-02', 'Rotaciones en Prácticas Psicológicas de Especialidad 3', 'Prácticas finales', 4, 'Ciclo_10', 2, 'Prácticas', 'presencial', 'Campus Norte - Edificio X', 'manana', 10, 10, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'X-1002'),
('PSI-C10-03', 'Electivo', 'Curso electivo final', 4, 'Ciclo_10', 2, 'Electivo', 'presencial', 'Campus Norte - Edificio Y', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'Y-1001');

-- Cursos Electivos para Psicología
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
('PSI-ELEC-01', 'Psicología Forense', 'Aplicaciones legales de la psicología', 4, 'Ciclo_08', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio W', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'W-803'),
('PSI-ELEC-02', 'Neuropsicología Clínica', 'Evaluación neuropsicológica', 4, 'Ciclo_08', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio W', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'W-804'),
('PSI-ELEC-03', 'Psicología del Deporte', 'Aplicaciones en el deporte', 4, 'Ciclo_09', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio X', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'X-903'),
('PSI-ELEC-04', 'Terapia Familiar', 'Enfoque sistémico', 4, 'Ciclo_10', 2, 'Especialización', 'presencial', 'Campus Norte - Edificio Y', 'noche', 20, 20, 4, 'Martes,Jueves', '18:00:00', '20:00:00', 'Y-1002');

-- Cursos de Derecho (Carrera ID 3)
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
-- Ciclo 01
('DER-C01-01', 'Aprendizaje Estratégico y Liderazgo', 'Desarrollo de habilidades de liderazgo', 4, 'Ciclo_01', 3, 'Desarrollo Personal', 'presencial', 'Campus Sur - Edificio D', 'manana', 30, 30, 7, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'D-101'),
('DER-C01-02', 'Crítica y Comunicación', 'Habilidades comunicativas y pensamiento crítico', 3, 'Ciclo_01', 3, 'Humanidades', 'presencial', 'Campus Sur - Edificio D', 'manana', 30, 30, 7, 'Martes,Jueves', '08:00:00', '10:00:00', 'D-102'),
('DER-C01-03', 'Historia Sociedad y Derecho', 'Evolución histórica del derecho', 4, 'Ciclo_01', 3, 'Derecho Histórico', 'presencial', 'Campus Sur - Edificio D', 'tarde', 25, 25, 7, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'D-103'),
('DER-C01-04', 'Instituciones del Derecho', 'Fundamentos institucionales', 4, 'Ciclo_01', 3, 'Derecho General', 'presencial', 'Campus Sur - Edificio D', 'tarde', 25, 25, 7, 'Martes,Jueves', '14:00:00', '16:00:00', 'D-104'),
('DER-C01-05', 'Pensamiento Crítico Aplicado', 'Desarrollo de análisis crítico', 3, 'Ciclo_01', 3, 'Humanidades', 'presencial', 'Campus Sur - Edificio D', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'D-105'),
('DER-C01-06', 'Sistemas y Sociedad', 'Impacto de sistemas en la sociedad', 3, 'Ciclo_01', 3, 'Humanidades', 'presencial', 'Campus Sur - Edificio D', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'D-106'),

-- Ciclo 02
('DER-C02-01', 'Derecho de las Personas', 'Derecho civil sobre personas', 5, 'Ciclo_02', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio E', 'manana', 25, 25, 7, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'E-201'),
('DER-C02-02', 'Economía Política', 'Relación entre economía y política', 4, 'Ciclo_02', 3, 'Economía', 'presencial', 'Campus Sur - Edificio E', 'manana', 25, 25, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'E-202'),
('DER-C02-03', 'Filosofía', 'Fundamentos filosóficos del derecho', 4, 'Ciclo_02', 3, 'Humanidades', 'presencial', 'Campus Sur - Edificio E', 'tarde', 25, 25, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'E-203'),
('DER-C02-04', 'Lógica', 'Pensamiento lógico aplicado al derecho', 4, 'Ciclo_02', 3, 'Humanidades', 'presencial', 'Campus Sur - Edificio E', 'tarde', 25, 25, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'E-204'),
('DER-C02-05', 'Razonamiento e Investigación Jurídica', 'Metodología de investigación jurídica', 4, 'Ciclo_02', 3, 'Metodología', 'presencial', 'Campus Sur - Edificio E', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'E-205'),
('DER-C02-06', 'Temas de Historia del Perú', 'Historia peruana y derecho', 4, 'Ciclo_02', 3, 'Historia', 'presencial', 'Campus Sur - Edificio E', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'E-206'),

-- Ciclo 03
('DER-C03-01', 'Contabilidad para Abogados', 'Fundamentos contables', 5, 'Ciclo_03', 3, 'Contabilidad', 'presencial', 'Campus Sur - Edificio F', 'manana', 20, 20, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'F-301'),
('DER-C03-02', 'Derechos de Propiedad', 'Derechos reales y propiedad', 4, 'Ciclo_03', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio F', 'manana', 20, 20, 7, 'Martes,Jueves', '08:00:00', '10:00:00', 'F-302'),
('DER-C03-03', 'Fundamentos de la Contratación I', 'Teoría general de contratos', 4, 'Ciclo_03', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio F', 'tarde', 20, 20, 7, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'F-303'),
('DER-C03-04', 'Fundamentos de la Gerencia', 'Gestión empresarial para abogados', 4, 'Ciclo_03', 3, 'Administración', 'presencial', 'Campus Sur - Edificio F', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'F-304'),
('DER-C03-05', 'Microeconomía', 'Fundamentos microeconómicos', 4, 'Ciclo_03', 3, 'Economía', 'presencial', 'Campus Sur - Edificio F', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'F-305'),
('DER-C03-06', 'Teoría Constitucional y Política', 'Bases constitucionales', 4, 'Ciclo_03', 3, 'Derecho Constitucional', 'presencial', 'Campus Sur - Edificio F', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'F-306'),

-- Ciclo 04
('DER-C04-01', 'Derecho de Familia y Sucesiones', 'Derecho familiar y sucesorio', 5, 'Ciclo_04', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio G', 'manana', 20, 20, 7, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'G-401'),
('DER-C04-02', 'Derecho Laboral', 'Legislación laboral', 4, 'Ciclo_04', 3, 'Derecho Laboral', 'presencial', 'Campus Sur - Edificio G', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'G-402'),
('DER-C04-03', 'Derechos Fundamentales', 'Protección de derechos fundamentales', 4, 'Ciclo_04', 3, 'Derecho Constitucional', 'presencial', 'Campus Sur - Edificio G', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'G-403'),
('DER-C04-04', 'Fundamentos de la Contratación II', 'Contratos especiales', 4, 'Ciclo_04', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio G', 'tarde', 20, 20, 7, 'Martes,Jueves', '14:00:00', '16:00:00', 'G-404'),
('DER-C04-05', 'Organización del Estado', 'Estructura estatal', 4, 'Ciclo_04', 3, 'Derecho Constitucional', 'presencial', 'Campus Sur - Edificio G', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'G-405'),
('DER-C04-06', 'Responsabilidad Civil', 'Teoría de la responsabilidad civil', 4, 'Ciclo_04', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio G', 'noche', 20, 20, 7, 'Martes,Jueves', '18:00:00', '20:00:00', 'G-406'),

-- Ciclo 05
('DER-C05-01', 'Contratos I', 'Teoría general de contratos', 5, 'Ciclo_05', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio H', 'manana', 20, 20, 7, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'H-501'),
('DER-C05-02', 'Derecho Societario y Corporativo', 'Derecho de sociedades', 4, 'Ciclo_05', 3, 'Derecho Comercial', 'presencial', 'Campus Sur - Edificio H', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'H-502'),
('DER-C05-03', 'Garantías', 'Derecho de garantías', 4, 'Ciclo_05', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio H', 'tarde', 20, 20, 7, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'H-503'),
('DER-C05-04', 'Ley Penal y Teoría del Delito', 'Teoría del delito', 4, 'Ciclo_05', 3, 'Derecho Penal', 'presencial', 'Campus Sur - Edificio H', 'tarde', 20, 20, 8, 'Martes,Jueves', '14:00:00', '16:00:00', 'H-504'),
('DER-C05-05', 'Seminario de Negociación y Conciliación', 'Resolución alternativa de conflictos', 4, 'Ciclo_05', 3, 'Derecho Procesal', 'presencial', 'Campus Sur - Edificio H', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'H-505'),
('DER-C05-06', 'Teoría de los Tributos', 'Derecho tributario básico', 4, 'Ciclo_05', 3, 'Derecho Tributario', 'presencial', 'Campus Sur - Edificio H', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'H-506'),

-- Ciclo 06
('DER-C06-01', 'Contratos II', 'Contratos especiales', 5, 'Ciclo_06', 3, 'Derecho Civil', 'presencial', 'Campus Sur - Edificio I', 'manana', 20, 20, 7, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'I-601'),
('DER-C06-02', 'Delitos Económicos y Empresariales', 'Delitos contra el patrimonio', 4, 'Ciclo_06', 3, 'Derecho Penal', 'presencial', 'Campus Sur - Edificio I', 'manana', 20, 20, 8, 'Martes,Jueves', '08:00:00', '10:00:00', 'I-602'),
('DER-C06-03', 'Derecho Administrativo', 'Derecho administrativo general', 4, 'Ciclo_06', 3, 'Derecho Administrativo', 'presencial', 'Campus Sur - Edificio I', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'I-603'),
('DER-C06-04', 'Derecho Procesal Civil I', 'Proceso civil ordinario', 4, 'Ciclo_06', 3, 'Derecho Procesal', 'presencial', 'Campus Sur - Edificio I', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'I-604'),
('DER-C06-05', 'Finanzas para Abogados', 'Conceptos financieros básicos', 4, 'Ciclo_06', 3, 'Finanzas', 'presencial', 'Campus Sur - Edificio I', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'I-605'),
('DER-C06-06', 'Legislación Tributaria', 'Normativa tributaria', 4, 'Ciclo_06', 3, 'Derecho Tributario', 'presencial', 'Campus Sur - Edificio I', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'I-606'),

-- Ciclo 07
('DER-C07-01', 'Análisis Económico del Derecho', 'Enfoque económico del derecho', 5, 'Ciclo_07', 3, 'Derecho Económico', 'presencial', 'Campus Sur - Edificio J', 'manana', 20, 20, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'J-701'),
('DER-C07-02', 'Contratación con el Estado', 'Contratos estatales', 4, 'Ciclo_07', 3, 'Derecho Administrativo', 'presencial', 'Campus Sur - Edificio J', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'J-702'),
('DER-C07-03', 'Derecho de la Competencia', 'Defensa de la competencia', 4, 'Ciclo_07', 3, 'Derecho Comercial', 'presencial', 'Campus Sur - Edificio J', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'J-703'),
('DER-C07-04', 'Derecho Procesal Civil II', 'Procesos especiales', 4, 'Ciclo_07', 3, 'Derecho Procesal', 'presencial', 'Campus Sur - Edificio J', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'J-704'),
('DER-C07-05', 'Seminario Integrado de Investigación', 'Metodología de investigación avanzada', 4, 'Ciclo_07', 3, 'Metodología', 'presencial', 'Campus Sur - Edificio J', 'noche', 20, 20, NULL, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'J-705'),

-- Ciclo 08
('DER-C08-01', 'Arbitraje', 'Resolución alternativa de conflictos', 5, 'Ciclo_08', 3, 'Derecho Procesal', 'presencial', 'Campus Sur - Edificio K', 'manana', 20, 20, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'K-801'),
('DER-C08-02', 'Derecho Internacional Privado', 'Conflictos de leyes', 4, 'Ciclo_08', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio K', 'manana', 20, 20, 9, 'Martes,Jueves', '08:00:00', '10:00:00', 'K-802'),
('DER-C08-03', 'Derecho Procesal Penal', 'Proceso penal ordinario', 4, 'Ciclo_08', 3, 'Derecho Procesal', 'presencial', 'Campus Sur - Edificio K', 'tarde', 20, 20, 8, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'K-803'),
('DER-C08-04', 'Investigación Jurídica I', 'Metodología de investigación jurídica', 4, 'Ciclo_08', 3, 'Metodología', 'presencial', 'Campus Sur - Edificio K', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'K-804'),

-- Ciclo 09
('DER-C09-01', 'Derecho Internacional Público', 'Derecho entre estados', 5, 'Ciclo_09', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio L', 'manana', 20, 20, 9, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'L-901'),
('DER-C09-02', 'Economía y Finanzas Internacionales', 'Sistema financiero internacional', 4, 'Ciclo_09', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio L', 'manana', 20, 20, NULL, 'Martes,Jueves', '08:00:00', '10:00:00', 'L-902'),
('DER-C09-03', 'Estado Mercado y Derecho', 'Relación estado-mercado', 4, 'Ciclo_09', 3, 'Derecho Económico', 'presencial', 'Campus Sur - Edificio L', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'L-903'),
('DER-C09-04', 'Regulación Financiera', 'Marco regulatorio financiero', 4, 'Ciclo_09', 3, 'Derecho Financiero', 'presencial', 'Campus Sur - Edificio L', 'tarde', 20, 20, NULL, 'Martes,Jueves', '14:00:00', '16:00:00', 'L-904'),

-- Ciclo 10
('DER-C10-01', 'CTI Investigación Jurídica II', 'Trabajo final de investigación', 5, 'Ciclo_10', 3, 'Metodología', 'presencial', 'Campus Sur - Edificio M', 'manana', 15, 15, NULL, 'Lunes,Miércoles', '08:00:00', '10:00:00', 'M-1001'),
('DER-C10-02', 'Derecho del Comercio Internacional', 'Normativa comercial internacional', 4, 'Ciclo_10', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio M', 'manana', 20, 20, 9, 'Martes,Jueves', '08:00:00', '10:00:00', 'M-1002'),
('DER-C10-03', 'Procesos Constitucionales y Contencioso-Administrativo', 'Procesos constitucionales', 4, 'Ciclo_10', 3, 'Derecho Constitucional', 'presencial', 'Campus Sur - Edificio M', 'tarde', 20, 20, NULL, 'Lunes,Miércoles', '14:00:00', '16:00:00', 'M-1003');

-- Cursos Electivos para Derecho
INSERT INTO cursos (codigo_curso, nombre, descripcion, creditos, ciclo, carrera_id, area_conocimiento, modalidad, sede, turno, vacantes_totales, vacantes_disponibles, docente_id, horario_dias, hora_inicio, hora_fin, aula) VALUES
('DER-ELEC-01', 'Derecho Ambiental', 'Legislación ambiental', 4, 'Ciclo_07', 3, 'Derecho Especializado', 'presencial', 'Campus Sur - Edificio J', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'J-706'),
('DER-ELEC-02', 'Derechos Humanos', 'Protección internacional de DDHH', 4, 'Ciclo_08', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio K', 'noche', 20, 20, 9, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'K-805'),
('DER-ELEC-03', 'Derecho de Propiedad Intelectual', 'Protección de creaciones intelectuales', 4, 'Ciclo_09', 3, 'Derecho Comercial', 'presencial', 'Campus Sur - Edificio L', 'noche', 20, 20, NULL, 'Martes,Jueves', '18:00:00', '20:00:00', 'L-905'),
('DER-ELEC-04', 'Derecho Marítimo', 'Legislación marítima internacional', 4, 'Ciclo_10', 3, 'Derecho Internacional', 'presencial', 'Campus Sur - Edificio M', 'noche', 20, 20, 9, 'Lunes,Miércoles', '18:00:00', '20:00:00', 'M-1004');
