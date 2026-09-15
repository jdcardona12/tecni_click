CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT NOT NULL,
  tecnico_id INT NOT NULL,
  usuario_id INT NOT NULL,
  puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id),
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE KEY unico_por_solicitud (solicitud_id)
);

CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitud_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata') NOT NULL,
  estado ENUM('pendiente', 'pagado', 'rechazado', 'reembolsado') DEFAULT 'pendiente',
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id)
);
