// =============================================
//  CONFIGURACIÓN
// =============================================
const API_URL = 'http://localhost:3001/api/usuarios';

// =============================================
//  ESTADO (variables globales)
// =============================================
let usuarios = [];
let cargando = true;
let error = null;

// =============================================
//  REFERENCIAS AL DOM
// =============================================
const DOM = {
    // Lista
    listaUsuarios: document.getElementById('listaUsuarios'),
    contenedorTarjetas: document.getElementById('contenedorTarjetas'),
    spinnerCarga: document.getElementById('spinnerCarga'),
    mensajeVacio: document.getElementById('mensajeVacio'),
    contadorUsuarios: document.getElementById('contadorUsuarios'),

    // Formulario
    formUsuario: document.getElementById('formUsuario'),
    inputNombre: document.getElementById('inputNombre'),
    inputEmail: document.getElementById('inputEmail'),
    btnAgregar: document.getElementById('btnAgregar'),

    // Error
    mensajeError: document.getElementById('mensajeError'),
    textoError: document.getElementById('textoError'),

    // Comparativa
    btnComparar: document.getElementById('btnComparar'),
    cardComparativa: document.getElementById('cardComparativa')
};

// =============================================
//  FUNCIONES DE RENDERIZADO
// =============================================

/**
 * Renderiza la lista de usuarios según el estado actual
 */
function renderizarUsuarios() {
    // 1. Ocultar spinner
    DOM.spinnerCarga.style.display = 'none';

    // 2. Verificar si hay error
    if (error) {
        DOM.mensajeError.classList.add('show');
        DOM.textoError.textContent = error;
        DOM.contenedorTarjetas.innerHTML = '';
        DOM.mensajeVacio.style.display = 'none';
        return;
    }

    // 3. Ocultar error
    DOM.mensajeError.classList.remove('show');

    // 4. Verificar si hay usuarios
    if (usuarios.length === 0) {
        DOM.contenedorTarjetas.innerHTML = '';
        DOM.mensajeVacio.style.display = 'block';
        DOM.contadorUsuarios.textContent = '0 usuarios';
        return;
    }

    // 5. Ocultar mensaje vacío
    DOM.mensajeVacio.style.display = 'none';

    // 6. Actualizar contador
    DOM.contadorUsuarios.textContent = `${usuarios.length} usuarios`;

    // 7. Generar HTML de las tarjetas
    let html = '';
    usuarios.forEach(usuario => {
        const inicial = usuario.nombre.charAt(0).toUpperCase();
        html += `
            <div class="col-12 card-transition">
                <div class="card shadow-sm hover-card">
                    <div class="card-body d-flex align-items-center gap-3">
                        <div class="avatar-circle bg-primary text-white">
                            ${inicial}
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1">${usuario.nombre}</h5>
                            <p class="card-text text-muted mb-0">
                                <i class="bi bi-envelope me-1"></i>
                                ${usuario.email}
                            </p>
                        </div>
                        <span class="badge bg-light text-secondary rounded-pill">
                            #${usuario.id}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });

    DOM.contenedorTarjetas.innerHTML = html;
}

/**
 * Actualiza el estado de carga (spinner)
 */
function setCargando(estado) {
    cargando = estado;
    if (cargando) {
        DOM.spinnerCarga.style.display = 'block';
        DOM.contenedorTarjetas.innerHTML = '';
        DOM.mensajeVacio.style.display = 'none';
        DOM.mensajeError.classList.remove('show');
    } else {
        DOM.spinnerCarga.style.display = 'none';
    }
}

/**
 * Actualiza el estado del botón de agregar
 */
function setEnviando(estado) {
    DOM.btnAgregar.disabled = estado;
    DOM.btnAgregar.innerHTML = estado
        ? `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Agregando...`
        : `<i class="bi bi-plus-circle me-1"></i> Agregar usuario`;
}

// =============================================
//  FUNCIONES DE API
// =============================================

/**
 * Carga los usuarios desde el backend
 */
async function cargarUsuarios() {
    setCargando(true);
    error = null;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            usuarios = data.data;
            error = null;
        } else {
            throw new Error(data.error || 'Error al cargar usuarios');
        }
    } catch (err) {
        console.error('❌ Error:', err);
        error = err.message;
    } finally {
        setCargando(false);
        renderizarUsuarios();
    }
}

/**
 * Agrega un nuevo usuario al backend
 */
async function agregarUsuario(nombre, email) {
    setEnviando(true);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email })
        });

        const data = await response.json();

        if (data.success) {
            // Limpiar formulario
            DOM.inputNombre.value = '';
            DOM.inputEmail.value = '';

            // Recargar la lista
            await cargarUsuarios();

            // Mostrar feedback visual (opcional)
            mostrarFeedback('✅ Usuario agregado correctamente', 'success');
        } else {
            throw new Error(data.error || 'Error al agregar usuario');
        }
    } catch (err) {
        console.error('❌ Error:', err);
        mostrarFeedback(`❌ ${err.message}`, 'danger');
    } finally {
        setEnviando(false);
    }
}

// =============================================
//  FEEDBACK VISUAL (Toast)
// =============================================

/**
 * Muestra un mensaje de feedback (usando Bootstrap Toast o alert)
 */
function mostrarFeedback(mensaje, tipo = 'info') {
    // Crear un toast con Bootstrap
    const toastContainer = document.createElement('div');
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';

    const toastHTML = `
        <div class="toast align-items-center text-white bg-${tipo} border-0 show" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toastContainer.remove();
    }, 3000);
}

// =============================================
//  EVENTOS
// =============================================

// 1. Formulario: Agregar usuario
DOM.formUsuario.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = DOM.inputNombre.value.trim();
    const email = DOM.inputEmail.value.trim();

    if (!nombre || !email) {
        mostrarFeedback('⚠️ Por favor completa todos los campos', 'warning');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        mostrarFeedback('⚠️ Email inválido. Debe contener @ y .', 'warning');
        return;
    }

    agregarUsuario(nombre, email);
});

// 2. Botón: Comparativa
DOM.btnComparar.addEventListener('click', () => {
    const isVisible = DOM.cardComparativa.style.display !== 'none';
    DOM.cardComparativa.style.display = isVisible ? 'none' : 'block';
    DOM.btnComparar.innerHTML = isVisible
        ? '<i class="bi bi-arrows-expand"></i> Ver diferencias'
        : '<i class="bi bi-arrows-collapse"></i> Ocultar diferencias';
});

// 3. Carga inicial: Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App tradicional iniciada');
    console.log('📡 Conectando a:', API_URL);
    cargarUsuarios();
});

// =============================================
//  REGISTRO DE VERSION (para debugging)
// =============================================
console.log('📋 Versión: Tradicional (HTML + JS + CSS)');
console.log('📦 Stack: Bootstrap 5 + Fetch API');
console.log('🔄 Estado inicial:', { usuarios, cargando, error });
