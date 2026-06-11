// ==================== CONFIGURACIÓN ====================
const API_BASE = ''; // Vacío porque usamos el mismo servidor

// Estado de la aplicación
let registros = [];
let paginaActual = 1;
const registrosPorPagina = 10;

// ==================== UTILIDADES ====================

function mostrarMensaje(elemento, mensaje, tipo) {
    elemento.textContent = mensaje;
    elemento.className = `message ${tipo}`;
    elemento.style.display = 'block';
    
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 3000);
}

// ==================== CARGA DE SERVICIOS (CASCADA) ====================

let categoriasData = []; // Almacena los datos de categorías globalmente

async function cargarServicios() {
    const selectCategoria = document.getElementById('categoria');
    const selectServicio = document.getElementById('servicio');
    
    try {
        const response = await fetch(`${API_BASE}/api/servicios`);
        
        if (!response.ok) {
            throw new Error('Error al cargar servicios');
        }
        
        const data = await response.json();
        categoriasData = data.categorias;
        
        // Poblar el select de categorías
        selectCategoria.innerHTML = '<option value="">-- Selecciona una categoría --</option>';
        
        categoriasData.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.nombre;
            option.textContent = categoria.nombre;
            selectCategoria.appendChild(option);
        });
        
        // Evento: al cambiar categoría, poblar servicios
        selectCategoria.addEventListener('change', () => {
            const categoriaSeleccionada = selectCategoria.value;
            
            // Resetear servicio
            selectServicio.innerHTML = '<option value="">-- Selecciona un servicio --</option>';
            
            if (!categoriaSeleccionada) {
                selectServicio.disabled = true;
                return;
            }
            
            // Buscar servicios de la categoría seleccionada
            const categoria = categoriasData.find(c => c.nombre === categoriaSeleccionada);
            
            if (categoria) {
                categoria.servicios.forEach(servicio => {
                    const option = document.createElement('option');
                    option.value = servicio;
                    option.textContent = servicio;
                    selectServicio.appendChild(option);
                });
                selectServicio.disabled = false;
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        selectCategoria.innerHTML = '<option value="">Error al cargar categorías</option>';
    }
}

// ==================== REGISTRO DE PARTICIPANTES ====================

async function registrarParticipante(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const servicio = document.getElementById('servicio').value;
    
    // Validaciones básicas
    if (!nombre || !telefono || !email || !servicio) {
        mostrarMensaje(mensajeDiv, '❌ Por favor, completa todos los campos', 'error');
        return;
    }
    
    const formData = {
        nombre: nombre,
        telefono: telefono,
        email: email,
        servicio: servicio
    };
    
    const mensajeDiv = document.getElementById('mensaje');
    
    try {
        const response = await fetch(`${API_BASE}/api/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarMensaje(mensajeDiv, `✅ ${result.message}`, 'success');
            document.getElementById('registroForm').reset();
            // Volver a bloquear el select de servicio tras el reset
            const selectServicio = document.getElementById('servicio');
            selectServicio.innerHTML = '<option value="">-- Selecciona una categoría primero --</option>';
            selectServicio.disabled = true;
        } else {
            mostrarMensaje(mensajeDiv, `❌ Error: ${result.detail || 'Ocurrió un error'}`, 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje(mensajeDiv, '❌ Error de conexión. Verifica que el servidor esté corriendo', 'error');
    }
}

// ==================== LISTA DE REGISTROS (CON PAGINACIÓN) ====================

async function cargarRegistros() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tablaContainer = document.getElementById('tablaContainer');
    const paginacionDiv = document.getElementById('paginacion');
    
    try {
        // Mostrar loading
        loadingIndicator.style.display = 'block';
        tablaContainer.innerHTML = '';
        
        const response = await fetch(`${API_BASE}/api/registros`);
        
        if (!response.ok) {
            throw new Error('Error al cargar registros');
        }
        
        registros = await response.json();
        
        // Actualizar total de registros
        const totalRegistros = document.getElementById('totalRegistros');
        totalRegistros.textContent = `Total: ${registros.length} participantes`;
        
        // Mostrar tabla con paginación
        mostrarTabla();
        
        // Ocultar loading
        loadingIndicator.style.display = 'none';
        
        // Mostrar paginación si hay más de una página
        const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
        if (totalPaginas > 1) {
            paginacionDiv.style.display = 'flex';
        } else {
            paginacionDiv.style.display = 'none';
        }
        
        actualizarEstadoPaginacion();
        
    } catch (error) {
        console.error('Error:', error);
        loadingIndicator.style.display = 'none';
        tablaContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Error al cargar registros. Verifica la conexión.</p>
            </div>
        `;
    }
}

function mostrarTabla() {
    const tablaContainer = document.getElementById('tablaContainer');
    
    if (registros.length === 0) {
        tablaContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No hay registros aún. Ve a la pestaña "Registro" para agregar participantes.</p>
            </div>
        `;
        return;
    }
    
    // Calcular índices de paginación
    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosPagina = registros.slice(inicio, fin);
    
    // Crear tabla
    let html = `
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Servicio</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    registrosPagina.forEach(registro => {
        html += `
            <tr>
                <td data-label="Nombre">${escapeHtml(registro.nombre)}</td>
                <td data-label="Teléfono">${escapeHtml(registro.telefono)}</td>
                <td data-label="Correo">${escapeHtml(registro.email)}</td>
                <td data-label="Servicio">${escapeHtml(registro.servicio)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    tablaContainer.innerHTML = html;
    
    // Actualizar información de página
    const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
    const paginaInfo = document.getElementById('paginaInfo');
    paginaInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
}

function actualizarEstadoPaginacion() {
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
    
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual === totalPaginas;
}

function paginaAnterior() {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarTabla();
        actualizarEstadoPaginacion();
    }
}

function paginaSiguiente() {
    const totalPaginas = Math.ceil(registros.length / registrosPorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        mostrarTabla();
        actualizarEstadoPaginacion();
    }
}

// ==================== EXPORTAR A EXCEL ====================

async function exportarExcel() {
    try {
        const response = await fetch(`${API_BASE}/api/exportar-excel`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al exportar');
        }
        
        // Crear blob y descargar
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registros_adakademy.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Mostrar mensaje de éxito
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = 'message success';
        mensajeDiv.textContent = '✅ Excel generado y descargado correctamente';
        document.getElementById('tablaContainer').parentElement.insertBefore(mensajeDiv, document.getElementById('paginacion'));
        
        setTimeout(() => {
            mensajeDiv.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al exportar: ' + error.message);
    }
}

// ==================== UTILIDADES DE SEGURIDAD ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== MANEJO DE PESTAÑAS ====================

function inicializarPestanas() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Cambiar clase activa en botones
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar contenido visible
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            const activeContent = document.getElementById(`tab-${tabId}`);
            activeContent.classList.add('active');
            
            // Si es la pestaña de lista, cargar registros
            if (tabId === 'lista') {
                paginaActual = 1; // Resetear paginación
                cargarRegistros();
            }
        });
    });
}

// ==================== EVENTOS ====================

function inicializarEventos() {
    // Formulario de registro
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', registrarParticipante);
    }
    
    // Botón refrescar
    const btnRefrescar = document.getElementById('btnRefrescar');
    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', () => {
            paginaActual = 1;
            cargarRegistros();
        });
    }
    
    // Botón exportar
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarExcel);
    }
    
    // Botones paginación
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    
    if (btnAnterior) {
        btnAnterior.addEventListener('click', paginaAnterior);
    }
    
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', paginaSiguiente);
    }
    
    // Botón limpiar lista
    const btnLimpiar = document.getElementById('btnLimpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarRegistros);
    }
}

// ==================== LIMPIAR REGISTROS ====================

async function limpiarRegistros() {
    const confirmacion = confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los registros?\n\nEsta acción no se puede deshacer.');
    
    if (!confirmacion) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/registros`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Recargar la lista vacía
            paginaActual = 1;
            await cargarRegistros();
            alert('✅ ' + result.message);
        } else {
            alert('❌ Error: ' + (result.detail || 'No se pudo limpiar la lista'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión al intentar limpiar los registros');
    }
}

// ==================== INICIALIZACIÓN ====================

async function init() {
    console.log('🚀 Inicializando Adakademy Registration System...');
    
    inicializarPestanas();
    inicializarEventos();
    await cargarServicios();
    
    console.log('✅ Sistema listo para usar');
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);