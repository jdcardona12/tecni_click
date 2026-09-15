from fastapi import FastAPI

from routers import auth
from routers import calificacion


app = FastAPI()


app.include_router(auth.router)
app.include_router(calificacion.router)


@app.get("/")
def inicio():
    return {
        "mensaje": "API de TecniClick funcionando"
    }
