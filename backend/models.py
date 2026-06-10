from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class RegistroCreate(BaseModel):
    """Modelo para crear un nuevo registro"""
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    telefono: str = Field(..., min_length=6, max_length=20, description="Número de teléfono")
    email: str = Field(..., description="Correo electrónico")
    servicio: str = Field(..., min_length=3, description="Servicio seleccionado")

class RegistroResponse(BaseModel):
    """Modelo para responder con datos de un registro"""
    id: int
    nombre: str
    telefono: str
    email: str
    servicio: str
    fecha_registro: str

class DataContainer(BaseModel):
    """Contenedor de todos los registros"""
    registros: list = []