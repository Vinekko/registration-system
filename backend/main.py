from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from backend.models import RegistroCreate
from backend.data_manager import DataManager
from backend.excel_generator import ExcelGenerator

# Inicializar FastAPI
app = FastAPI(title="Adakademy Registration System", version="1.0.0")

# Configurar CORS (para tablets en la red WiFi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, limitar a IPs específicas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar DataManager
data_manager = DataManager()

# Servir archivos estáticos
static_path = Path("static")
if static_path.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# ==================== ENDPOINTS API ====================

@app.get("/api/status")
async def get_status():
    """Indica que el servidor está corriendo"""
    return {"status": "ok", "message": "El servidor está corriendo correctamente"}

@app.get("/api/servicios")
async def get_servicios():
    """Devuelve la lista de servicios con categorías"""
    try:
        servicios = data_manager.get_servicios()
        return servicios
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar servicios: {str(e)}")

@app.post("/api/registrar")
async def registrar_participante(registro: RegistroCreate):
    """Registra un nuevo participante"""
    try:
        # Convertir a dict para guardar
        registro_dict = registro.model_dump()
        
        # Guardar en data.json
        nuevo_registro = data_manager.add_registro(registro_dict)
        
        return {
            "success": True,
            "message": "¡Registro exitoso!",
            "registro": nuevo_registro
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar: {str(e)}")

@app.get("/api/registros")
async def get_registros():
    """Obtiene todos los registros"""
    try:
        registros = data_manager.get_all_registros()
        # Ordenar por ID descendente (más reciente primero)
        registros.sort(key=lambda x: x.get("id", 0), reverse=True)
        return registros
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener registros: {str(e)}")

@app.get("/api/exportar-excel")
async def exportar_excel():
    """Exporta todos los registros a Excel"""
    try:
        registros = data_manager.get_all_registros()
        
        if not registros:
            raise HTTPException(status_code=404, detail="No hay registros para exportar")
        
        excel_file = ExcelGenerator.generate_registros_excel(registros)
        
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=registros_adakademy.xlsx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar Excel: {str(e)}")

# ==================== SERVIDOR HTML ====================

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Sirve la página principal"""
    index_path = Path("templates/index.html")
    if index_path.exists():
        return index_path.read_text(encoding="utf-8")
    return "<h1>Error: index.html no encontrado</h1>"

# ==================== INICIO ====================
def get_local_ip():
    """Obtiene la IP local de la red WiFi/LAN"""
    import socket
    try:
        # Crea un socket UDP y se conecta a una IP pública (no envía datos)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    import uvicorn
    
    PORT = 8000
    local_ip = get_local_ip()
    
    print("=" * 50)
    print("🚀 Servidor Adakademy Registration System")
    print("=" * 50)
    print(f"📁 Datos guardados en: data/data.json")
    print(f"📋 Servicios cargados desde: data/servicios.json")
    print()
    print(f"🖥️  Local:   http://localhost:{PORT}")
    print(f"📱 Red WiFi: http://{local_ip}:{PORT}")
    print()
    print("👆 Comparte el enlace de Red WiFi con otros dispositivos")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")