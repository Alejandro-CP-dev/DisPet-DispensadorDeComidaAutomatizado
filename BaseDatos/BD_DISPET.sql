-- ============================================================
-- DISPET - Dispensador Automatico de Comida para Mascotas
-- Base de datos: SQL Server
-- Ficha 3232460 - ADSO - SENA
-- ============================================================

CREATE DATABASE DISPET;
GO

USE DISPET;
GO

-- ------------------------------------------------------------
-- Tabla Usuario: el dueno de la mascota que usa la aplicacion
-- ------------------------------------------------------------
CREATE TABLE Usuario (
    IdUsuario   INT IDENTITY(1,1) PRIMARY KEY,
    Nombre      VARCHAR(100) NOT NULL,
    Correo      VARCHAR(100) NOT NULL UNIQUE,
    Clave       VARCHAR(50)  NOT NULL,
    Activo      BIT          NOT NULL DEFAULT 1
);
GO

-- ------------------------------------------------------------
-- Tabla Dispensador: el equipo fisico instalado en la casa.
-- NivelActualGramos simula el concentrado que queda en la tolva.
-- ------------------------------------------------------------
CREATE TABLE Dispensador (
    IdDispensador     INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario         INT NOT NULL,
    Nombre            VARCHAR(100) NOT NULL,
    CapacidadGramos   INT NOT NULL,
    NivelActualGramos INT NOT NULL,
    Conectado         BIT NOT NULL DEFAULT 1,
    BateriaPorcentaje INT NOT NULL DEFAULT 100,
    CONSTRAINT FK_Dispensador_Usuario FOREIGN KEY (IdUsuario)
        REFERENCES Usuario(IdUsuario)
);
GO

-- ------------------------------------------------------------
-- Tabla Mascota
-- ------------------------------------------------------------
CREATE TABLE Mascota (
    IdMascota INT IDENTITY(1,1) PRIMARY KEY,
    IdUsuario INT NOT NULL,
    Nombre    VARCHAR(100)  NOT NULL,
    Especie   VARCHAR(20)   NOT NULL,   -- Perro o Gato
    Raza      VARCHAR(50)   NULL,
    PesoKg    DECIMAL(5,2)  NOT NULL,
    Activo    BIT           NOT NULL DEFAULT 1,
    CONSTRAINT FK_Mascota_Usuario FOREIGN KEY (IdUsuario)
        REFERENCES Usuario(IdUsuario)
);
GO

-- ------------------------------------------------------------
-- Tabla Horario: cada comida programada.
-- Hora se guarda como texto 'HH:mm' para compararla directamente
-- con la hora del sistema sin conversiones de tipo.
-- Los dias de la semana estan normalizados en la tabla HorarioDia
-- (antes se guardaban como texto 'L,M,X,J,V,S,D' en esta misma
-- tabla, lo que violaba primera forma normal).
-- ------------------------------------------------------------
CREATE TABLE Horario (
    IdHorario      INT IDENTITY(1,1) PRIMARY KEY,
    IdMascota      INT NOT NULL,
    IdDispensador  INT NOT NULL,
    Hora           VARCHAR(5)  NOT NULL,
    CantidadGramos INT         NOT NULL,
    Activo         BIT         NOT NULL DEFAULT 1,
    CONSTRAINT FK_Horario_Mascota FOREIGN KEY (IdMascota)
        REFERENCES Mascota(IdMascota),
    CONSTRAINT FK_Horario_Dispensador FOREIGN KEY (IdDispensador)
        REFERENCES Dispensador(IdDispensador)
);
GO

-- ------------------------------------------------------------
-- Tabla HorarioDia: un dia de la semana en que se repite un
-- Horario. Una fila por dia (normalizacion de la columna Dias
-- que antes vivia en Horario como texto separado por comas).
-- ------------------------------------------------------------
CREATE TABLE HorarioDia (
    IdHorarioDia INT IDENTITY(1,1) PRIMARY KEY,
    IdHorario    INT     NOT NULL,
    Dia          CHAR(1) NOT NULL,
    CONSTRAINT FK_HorarioDia_Horario FOREIGN KEY (IdHorario)
        REFERENCES Horario(IdHorario) ON DELETE CASCADE,
    CONSTRAINT CK_HorarioDia_Dia CHECK (Dia IN ('L','M','X','J','V','S','D')),
    CONSTRAINT UQ_HorarioDia UNIQUE (IdHorario, Dia)
);
GO

-- ------------------------------------------------------------
-- Tabla Dispensacion: historial de cada vez que cayo comida
-- ------------------------------------------------------------
CREATE TABLE Dispensacion (
    IdDispensacion INT IDENTITY(1,1) PRIMARY KEY,
    IdMascota      INT NOT NULL,
    IdHorario      INT NULL,              -- NULL cuando fue manual
    FechaHora      DATETIME     NOT NULL,
    CantidadGramos INT          NOT NULL,
    Tipo           VARCHAR(20)  NOT NULL, -- Programada o Manual
    Estado         VARCHAR(20)  NOT NULL, -- Exitosa o Fallida
    CONSTRAINT FK_Dispensacion_Mascota FOREIGN KEY (IdMascota)
        REFERENCES Mascota(IdMascota),
    CONSTRAINT FK_Dispensacion_Horario FOREIGN KEY (IdHorario)
        REFERENCES Horario(IdHorario)
);
GO

-- ============================================================
-- DATOS DE PRUEBA PARA LA DEMOSTRACION DEL PITCH
-- ============================================================

INSERT INTO Usuario (Nombre, Correo, Clave)
VALUES ('Jhon Cardenas', 'admin@dispet.com', '1234');
GO

INSERT INTO Dispensador (IdUsuario, Nombre, CapacidadGramos, NivelActualGramos, Conectado, BateriaPorcentaje)
VALUES (1, 'DISPET Sala', 3000, 2150, 1, 87);
GO

INSERT INTO Mascota (IdUsuario, Nombre, Especie, Raza, PesoKg)
VALUES (1, 'Luna',  'Perro', 'Criolla', 8.50),
       (1, 'Michi', 'Gato',  'Mestizo', 4.20);
GO

INSERT INTO Horario (IdMascota, IdDispensador, Hora, CantidadGramos, Activo)
VALUES (1, 1, '07:00', 150, 1),
       (1, 1, '18:30', 150, 1),
       (2, 1, '08:00',  60, 1);
GO

-- Los 3 horarios de prueba se repiten los 7 dias de la semana
INSERT INTO HorarioDia (IdHorario, Dia)
VALUES (1, 'L'), (1, 'M'), (1, 'X'), (1, 'J'), (1, 'V'), (1, 'S'), (1, 'D'),
       (2, 'L'), (2, 'M'), (2, 'X'), (2, 'J'), (2, 'V'), (2, 'S'), (2, 'D'),
       (3, 'L'), (3, 'M'), (3, 'X'), (3, 'J'), (3, 'V'), (3, 'S'), (3, 'D');
GO

INSERT INTO Dispensacion (IdMascota, IdHorario, FechaHora, CantidadGramos, Tipo, Estado)
VALUES (1, 1, DATEADD(DAY, -1, GETDATE()), 150, 'Programada', 'Exitosa'),
       (2, 3, DATEADD(DAY, -1, GETDATE()),  60, 'Programada', 'Exitosa');
GO

SELECT 'Base de datos DISPET creada correctamente' AS Resultado;
GO
