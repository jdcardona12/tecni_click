from fastapi import APIRouter
from pydantic import BaseModel

from controllers import calificacion_controller


router = APIRouter()


class Calificacion(BaseModel):
    cliente_id: int
    tecnico_id: int
    calificacion: int
    comentario: str


@router.post("/calificaciones")
def crear_calificacion(data: Calificacion):

    return calificacion_controller.calificar_tecnico(
        data.cliente_id,
        data.tecnico_id,
        data.calificacion,
        data.comentario
    )


@router.get("/calificaciones/tecnico/{tecnico_id}")
def obtener_calificaciones(tecnico_id: int):

    return calificacion_controller.consultar_calificaciones(
        tecnico_id
    )