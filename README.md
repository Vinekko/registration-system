# 🤖 Adakademy Registration System

Un sistema web ligero y responsivo diseñado para gestionar el registro de participantes a diferentes servicios, cursos y eventos de Adakademy.

## 🌟 Características Principales

*   **Registro Intuitivo**: Formulario de inscripción con menús desplegables en cascada (Categorías -> Servicios) para facilitar la selección.
*   **Gestión de Lista**: Visualización en tiempo real de todos los participantes registrados con una tabla responsiva y paginación.
*   **Exportación a Excel**: Posibilidad de exportar todos los datos recolectados directamente a un archivo `.xlsx` con formato y estilos.
*   **Auto-descubrimiento en Red**: Al iniciar el servidor, detecta y muestra automáticamente la dirección IP local para que otros dispositivos (como tablets) en la misma red WiFi puedan acceder al sistema.
*   **Almacenamiento Local**: Guarda los registros localmente en un archivo JSON (`data/data.json`), sin necesidad de configurar bases de datos complejas.
*   **Limpieza de Datos**: Botón con confirmación de seguridad para vaciar la base de datos de manera rápida.

## 🛠️ Tecnologías Utilizadas

*   **Backend**: Python, FastAPI, Uvicorn, Pydantic, OpenPyXL.
*   **Frontend**: HTML5, Vanilla JavaScript, Vanilla CSS (Variables, Flexbox, y diseño Responsive para tablets/móviles).
*   **Almacenamiento**: Archivos estáticos JSON (`data/data.json` y `data/servicios.json`).

## 🚀 Cómo Ejecutar el Proyecto

1.  Asegúrate de tener instalado Python 3.
2.  Crea e inicia tu entorno virtual:
    ```bash
    python -m venv .venv
    # En Windows:
    .venv\Scripts\activate
    ```
3.  Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```
4.  Inicia el servidor:
    ```bash
    python -m backend.main
    ```
5.  El servidor se iniciará y la consola te mostrará dos enlaces:
    *   **Local**: `http://localhost:8000` (Para usar en la misma computadora).
    *   **Red WiFi**: `http://192.168.x.x:8000` (Para compartir con otras computadoras, teléfonos o tablets conectados a la misma red WiFi).

## 📁 Estructura del Proyecto

*   `backend/`: Lógica del servidor, modelos de datos, manejador de base de datos JSON y generador de reportes Excel.
*   `data/`: Archivos JSON que actúan como base de datos (`data.json` para registros, `servicios.json` para las opciones del formulario).
*   `static/`: Archivos estáticos como la hoja de estilos (`css/style.css`) y el script principal del lado del cliente (`js/app.js`).
*   `templates/`: Plantillas HTML (`index.html`).
