import mysql.connector

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",        # en XAMPP normalmente no tiene contraseña
        database="tecniclick"
    )