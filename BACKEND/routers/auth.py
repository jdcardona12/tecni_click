from fastapi import APIRouter
from pydantic import BaseModel
from controllers import auth_controller

router = APIRouter()

class Registro(BaseModel):
    nombre: str
    correo: str
    contrasena: str

class Login(BaseModel):
    correo: str
    contrasena: str

@router.post("/registrar")
def registrar(data: Registro):
    return auth_controller.registrar_usuario(data.nombre, data.correo, data.contrasena)

@router.post("/login")
def login(data: Login):
    return auth_controller.iniciar_sesion(data.correo, data.contrasena)