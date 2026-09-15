from database import conectar


def calificar_tecnico(cliente_id: int, tecnico_id: int, calificacion: int, comentario: str):
    if calificacion < 1 or calificacion > 5:
        return {
            "error": "La calificación debe estar entre 1 y 5"
        }

    conexion = conectar()
    cursor = conexion.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO calificaciones
            (cliente_id, tecnico_id, calificacion, comentario)
            VALUES (%s, %s, %s, %s)
            """,
            (cliente_id, tecnico_id, calificacion, comentario)
        )

        conexion.commit()

        return {
            "mensaje": "Técnico calificado exitosamente"
        }

    except Exception as error:
        conexion.rollback()

        return {
            "error": str(error)
        }

    finally:
        cursor.close()
        conexion.close()


def consultar_calificaciones(tecnico_id: int):
    conexion = conectar()
    cursor = conexion.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                cliente_id,
                tecnico_id,
                calificacion,
                comentario
            FROM calificaciones
            WHERE tecnico_id = %s
            ORDER BY id DESC
            """,
            (tecnico_id,)
        )

        calificaciones = cursor.fetchall()

        return {
            "tecnico_id": tecnico_id,
            "calificaciones": calificaciones
        }

    except Exception as error:
        return {
            "error": str(error)
        }

    finally:
        cursor.close()
        conexion.close()