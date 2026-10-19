# Tecni-Click API (versión corregida)

API REST para gestionar clientes, técnicos, solicitudes de reparación, calificaciones y pagos con Node.js, Express y MySQL/MariaDB.

## Requisitos
- Node.js 18 o superior.
- MySQL o MariaDB ejecutándose (por ejemplo, desde XAMPP).
- Base de datos creada con `database/tecniclick.sql`.

## Instalación
1. Abre la carpeta del proyecto en VS Code.
2. En la terminal ejecuta `npm install`.
3. Copia `.env.example` y crea un archivo `.env` en la raíz.
4. Ajusta `DB_USER`, `DB_PASSWORD` y demás datos a tu instalación.
5. Cambia `JWT_SECRET` por una cadena privada larga (mínimo 32 caracteres).
6. En phpMyAdmin importa `database/tecniclick.sql`.
7. Inicia el servidor con `npm run dev`.
8. Comprueba `http://localhost:3000/api/health`.

## Endpoints

Todos los cuerpos y respuestas usan JSON. Excepto registro e inicio de sesión, los endpoints protegidos requieren la cabecera `Authorization: Bearer <token>`.

### Autenticación
- `POST /api/auth/register` — registrar cliente. JSON: `{ "nombre":"Santiago", "telefono":"3001234567", "email":"santiago@example.com", "password":"ClaveSegura123" }`
- `POST /api/auth/register-tecnico` — registrar técnico. JSON: `{ "nombre", "telefono", "email", "especialidad", "password" }`
- `POST /api/auth/login` — iniciar sesión de cliente.
- `POST /api/auth/login-tecnico` — iniciar sesión de técnico.

### Usuarios
- `GET /api/usuarios/actual` — perfil del usuario autenticado.
- `GET /api/usuarios` — listado solo para administrador.
- `GET /api/usuarios/:id` — consultar usuario propio o administrador.
- `PUT /api/usuarios/:id` — actualizar usuario propio o administrador. JSON: `{ "nombre":"Nombre", "telefono":"3001234567", "email":"correo@example.com" }`
- `DELETE /api/usuarios/:id` — eliminar usuario propio o administrador.

### Técnicos
- `GET /api/tecnicos` — listado público de técnicos activos/inactivos (sin contraseñas).
- `GET /api/tecnicos/:id` — detalle público de técnico (sin contraseña).
- `GET /api/tecnicos/actual` — perfil del técnico autenticado.
- `POST /api/tecnicos` — crear técnico; solo administrador. Incluye `nombre`, `email`, `password`; opcionales `telefono`, `especialidad`.
- `PUT /api/tecnicos/:id` — actualizar; administrador o técnico autenticado (revisar que el ID corresponda al propio técnico).
- `DELETE /api/tecnicos/:id` — eliminar; solo administrador.

### Solicitudes
- `POST /api/solicitudes` — cliente autenticado crea solicitud. JSON: `{ "electrodomestico":"Lavadora", "descripcion":"No enciende" }`. El usuario se toma del token.
- `GET /api/solicitudes/:id` — consultar solicitud propia, técnico o administrador.
- `GET /api/solicitudes/usuario/:id` — solicitudes propias o administrador.
- `PUT /api/solicitudes/:id/estado` — técnico o administrador cambia estado; JSON: `{ "estado":"en_proceso" }`.

Estados permitidos: `pendiente`, `en_proceso`, `completado`, `cancelado`.

### Calificaciones
- `POST /api/calificaciones` — cliente autenticado califica una solicitud completada. JSON: `{ "solicitud_id":1, "tecnico_id":1, "puntuacion":5, "comentario":"Buen servicio" }`.
- `GET /api/calificaciones/:id` — consultar calificación.
- `GET /api/calificaciones/tecnico/:id` — calificaciones y promedio del técnico.
- `GET /api/calificaciones/solicitud/:id` — calificación de una solicitud.

### Pagos
- `POST /api/pagos` — cliente autenticado registra pago. JSON: `{ "solicitud_id":1, "monto":85000, "metodo_pago":"transferencia" }`.
- `GET /api/pagos/:id` — consultar pago.
- `GET /api/pagos/solicitud/:id` — pagos de una solicitud.
- `PUT /api/pagos/:id/estado` — administrador actualiza estado. JSON: `{ "estado":"pagado" }`.

Métodos válidos: `efectivo`, `tarjeta`, `transferencia`, `nequi`, `daviplata`. Estados de pago: `pendiente`, `pagado`, `rechazado`, `reembolsado`.

## Probar en Postman
1. Ejecuta registro o login y copia `token`.
2. En Authorization elige Bearer Token y pega el token.
3. Prueba crear una solicitud y consultar `GET /api/solicitudes/usuario/ID_DEL_TOKEN`.
4. Los errores responden JSON con `ok:false` y un mensaje.

## Importante
- No se incluye un usuario administrador predeterminado. Debe crearse manualmente en la base de datos y asignársele `tipo_usuario='admin'`; nunca permitas que el registro público elija ese rol.
- La API no procesa pagos reales; solo registra su estado.
- Para producción, añade pruebas automatizadas, validación de propiedad de técnico asignado en solicitudes, transacciones para operaciones relacionadas y políticas de borrado de datos.


### Solicitudes para técnicos (nuevo)
- `GET /api/solicitudes/disponibles` — solicitudes pendientes sin técnico (técnico/admin).
- `GET /api/solicitudes/tecnico/:id` — solicitudes que aceptó ese técnico.
- `PUT /api/solicitudes/:id/aceptar` — el técnico autenticado acepta la solicitud (pasa a `en_proceso`).
