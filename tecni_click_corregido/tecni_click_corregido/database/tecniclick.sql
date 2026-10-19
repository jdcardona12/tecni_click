CREATE DATABASE IF NOT EXISTS tecniclick
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tecniclick;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tecnicos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  especialidad VARCHAR(120) NULL,
  password VARCHAR(255) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS solicitudes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  tecnico_id INT UNSIGNED NULL,
  electrodomestico VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  estado ENUM('pendiente','en_proceso','completado','cancelado') NOT NULL DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_solicitudes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_solicitudes_tecnico FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL,
  INDEX idx_solicitudes_usuario (usuario_id),
  INDEX idx_solicitudes_tecnico (tecnico_id),
  INDEX idx_solicitudes_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS calificaciones (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT UNSIGNED NOT NULL UNIQUE,
  tecnico_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  puntuacion TINYINT UNSIGNED NOT NULL,
  comentario TEXT NULL,
  fecha_calificacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_calificacion_puntuacion CHECK (puntuacion BETWEEN 1 AND 5),
  CONSTRAINT fk_calificaciones_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id),
  CONSTRAINT fk_calificaciones_tecnico FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id),
  CONSTRAINT fk_calificaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_calificaciones_tecnico (tecnico_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pagos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT UNSIGNED NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  metodo_pago ENUM('efectivo','tarjeta','transferencia','nequi','daviplata') NOT NULL,
  estado ENUM('pendiente','pagado','rechazado','reembolsado') NOT NULL DEFAULT 'pendiente',
  fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pago_monto CHECK (monto > 0),
  CONSTRAINT fk_pagos_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id),
  INDEX idx_pagos_solicitud (solicitud_id)
) ENGINE=InnoDB;
