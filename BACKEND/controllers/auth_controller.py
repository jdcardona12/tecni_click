import hashlib
from database import conectar

def encriptar_contrasena(contrasena: str) -> str:
    # Encriptación simple para nivel estudiante (no es para producción real)
    return hashlib.sha256(contrasena.encode()).hexdigest()

def registrar_usuario(nombre: str, correo: str, contrasena: str):
    conexion = conectar()
    cursor = conexion.cursor()

    # Verificar si el correo ya existe
    cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (correo,))
    if cursor.fetchone():
        cursor.close()
        conexion.close()
        return {"error": "Ese correo ya está registrado"}

    contrasena_encriptada = encriptar_contrasena(contrasena)
    cursor.execute(
        "INSERT INTO usuarios (nombre, correo, contrasena) VALUES (%s, %s, %s)",
        (nombre, correo, contrasena_encriptada)
    )
    conexion.commit()
    cursor.close()
    conexion.close()
    return {"mensaje": "Usuario registrado exitosamente"}

def iniciar_sesion(correo: str, contrasena: str):
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)

    cursor.execute("SELECT * FROM usuarios WHERE correo = %s", (correo,))
    usuario = cursor.fetchone()
    cursor.close()
    conexion.close()

    if not usuario:
        return {"error": "Usuario no encontrado"}

    if usuario["contrasena"] != encriptar_contrasena(contrasena):
        return {"error": "Contraseña incorrecta"}

    return {"mensaje": "Inicio de sesión exitoso", "nombre": usuario["nombre"]}