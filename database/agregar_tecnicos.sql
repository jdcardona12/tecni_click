USE tecniclick;
-- Contraseña de estos técnicos: Tecnico123
INSERT INTO tecnicos (nombre, telefono, email, especialidad, password)
SELECT * FROM (
  SELECT 'Laura Gómez' AS nombre, '3105550142' AS telefono, 'laura.gomez@tecniclick.com' AS email, 'neveras y refrigeradores' AS especialidad, '$2b$10$fQjiBEyow6ec2m6ADBhkcetSXHcvVqR9p6WGEtdlSPQ1404Ml.1vS' AS password
  UNION ALL
  SELECT 'Andrés Rojas', '3112223344', 'andres.rojas@tecniclick.com', 'estufas y hornos', '$2b$10$fQjiBEyow6ec2m6ADBhkcetSXHcvVqR9p6WGEtdlSPQ1404Ml.1vS'
) t
WHERE NOT EXISTS (SELECT 1 FROM tecnicos x WHERE x.email = t.email);
