const secciones = document.querySelectorAll('.seccion');
const botonesNav = document.querySelectorAll('.nav-btn');

function mostrarSeccion(id){
    secciones.forEach(s => s.classList.remove('activa'));
    botonesNav.forEach(b => b.classList.remove('activo'));

    document.getElementById(id).classList.add('activa');

    const boton = document.querySelector(`.nav-btn[data-section="${id}"]`);
    if (boton) boton.classList.add('activo'); 
}

botonesNav.forEach(boton => {
    boton.addEventListener('click', () => {
        const seccion = boton.getAttribute('data-section');
        mostrarSeccion(seccion);
    });
});


// Tema Oscuro - Claro //

const btnTema = document.getElementById('btn-tema');
const checkTema = document.getElementById('checkTema');

function aplicarTema(oscuro) {
    if (oscuro) {
        document.body.classList.remove('claro');
        btnTema.querySelector('i').className = 'ri-moon-fill';
    } else {
        document.body.classList.add('claro');
        btnTema.querySelector('i').className = 'ri-moon-line';
    }
    if (checkTema) checkTema.checked = oscuro;
}

btnTema.addEventListener('click', () => {
    const estaOscuro = !document.body.classList.contains('claro');
    aplicarTema(!estaOscuro);
    localStorage.setItem('tema', !estaOscuro ? 'claro' : 'oscuro');
});

checkTema.addEventListener('change', () => {
    aplicarTema(checkTema.checked);
    localStorage.setItem('tema', checkTema.checked ? 'oscuro' : 'claro');
});

// Home: Nombre y Saldo //

function cargarNombre(){
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    document.querySelector('.nombre-usuario').textContent = nombre + '!';
}

async function cargarSaldo(){
    const ingresos = await obtenerTodos('ingresos');
    const gastos = await obtenerTodos('gastos');

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    const ingresosMes = ingresos.filter(i => {
        const fecha = new Date(i.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    const gastosMes = gastos.filter(g => {
        const fecha = new Date(g.fecha);
        return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    });

    const totalIngresos = ingresosMes.reduce((acc, i) => acc + Number(i.monto), 0);
    const totalGastos = gastosMes.reduce((acc, g) => acc + Number(g.monto), 0);
    const saldo = totalIngresos - totalGastos;

    document.querySelector('.saldo-monto').textContent = '$' + saldo.toLocaleString('es-AR');

    const sueldoEstimado = localStorage.getItem('sueldoEstimado') || 0;
    document.querySelector('.saldo-sub').textContent = 'de $' + Number(sueldoEstimado).toLocaleString('es-AR') + ' de sueldo';
}

// Home: Formularios rápidos //

const btnAbrirIngreso = document.getElementById('btnAbrirIngreso');
const btnAbrirGasto = document.getElementById('btnAbrirGasto');
const formIngreso = document.getElementById('formIngreso');
const formGastoRapido = document.getElementById('formGastoRapido');

btnAbrirIngreso.addEventListener('click', () => {
    formIngreso.classList.toggle('activo');
    formGastoRapido.classList.remove('activo');
});

btnAbrirGasto.addEventListener('click', () => {
    formGastoRapido.classList.toggle('activo');
    formIngreso.classList.remove('activo');
});

document.getElementById('btnGuardarIngreso').addEventListener('click', async () => {
    const monto = document.getElementById('inputMontoIngreso').value;
    const descripcion = document.getElementById('inputDescIngreso').value;

    if (!monto || monto <= 0) {
        alert('Ingresá un monto válido');
        return;
    }

    const ingreso = {
        monto: Number(monto),
        descripcion: descripcion || 'Ingreso',
        fecha: new Date().toISOString()
    };

    await guardarDato('ingresos', ingreso);

    document.getElementById('inputMontoIngreso').value = '';
    document.getElementById('inputDescIngreso').value = '';
    formIngreso.classList.remove('activo');

    cargarSaldo();
    cargarUltimasTransacciones();
});

document.getElementById('btnVerResumen').addEventListener('click', () => {
    leerResumen();
    mostrarToast('Leyendo resumen');
});

document.getElementById('btnGuardarGastoRapido').addEventListener('click', async () => {
    const monto = document.getElementById('inputMontoGastoRapido').value;
    const descripcion = document.getElementById('inputDescGastoRapido').value;
    const categoria = document.getElementById('selectCategoriaRapido').value;

    if (!monto || monto <= 0) {
        alert('Ingresá un monto válido');
        return;
    }

    const gasto = {
        monto: Number(monto),
        descripcion: descripcion || 'Gasto',
        categoria: categoria || 'Sin categoría',
        fecha: new Date().toISOString()
    };

    await guardarDato('gastos', gasto);

    document.getElementById('inputMontoGastoRapido').value = '';
    document.getElementById('inputDescGastoRapido').value = '';
    document.getElementById('selectCategoriaRapido').value = '';
    formGastoRapido.classList.remove('activo');

    cargarSaldo();
    cargarUltimasTransacciones();
});

//Home: Últimas transacciones //

async function cargarUltimasTransacciones() {
    const ingresos = await obtenerTodos('ingresos');
    const gastos = await obtenerTodos('gastos');

    const todas = [
        ...ingresos.map(i => ({...i, tipo: 'ingreso'})),
        ...gastos.map(g => ({...g, tipo: 'gasto'}))
    ];
    todas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const ultimas = todas.slice(0, 5);
    const lista = document.getElementById('listaHome');
    lista.innerHTML = '';

    if(ultimas.length === 0) {
        lista.innerHTML = '<li class="empty-msg">No hay transacciones aún</li>';
        return;
    }

    ultimas.forEach(t => {
        const fecha = new Date(t.fecha).toLocaleDateString('es-AR');
        const signo = t.tipo === 'ingreso' ? '+' : '-';
        const color = t.tipo === 'ingreso' ? 'var(--ingreso)' : 'var(--egreso)';
        const detalle = t.tipo === 'ingreso' ? 'Ingreso' : (t.categoria || 'Gasto');

        const li = document.createElement ('li');
        li.innerHTML = `
            <div>
                <p style="font-weight: 600; font-size: 14px;">${t.descripcion}</p>
                <p style="font-size: 12px; color: var(--texto-secundario);">${detalle} · ${fecha}</p>
            </div>
            <p style="font-weight: 700; color: ${color};">${signo}$${Number(t.monto).toLocaleString('es-AR')}</p>
        `;
        lista.appendChild(li);
    });
}

// Gastos //

const modalGasto = document.getElementById('modalGasto');
const btnAbrirModalGasto = document.getElementById('btnAbrirModalGasto');
const btnCerrarModal = document.getElementById('btnCerrarModal');

btnAbrirModalGasto.addEventListener('click', () => {
    modalGasto.classList.add('activo');
});

btnCerrarModal.addEventListener('click', () => {
    modalGasto.classList.remove('activo');
});

modalGasto.addEventListener('click', (e) => {
    if (e.target === modalGasto) modalGasto.classList.remove('activo');
});

document.getElementById('btnAgregarGasto').addEventListener('click', async () => {
    const monto = document.getElementById('inputMonto').value;
    const descripcion = document.getElementById('inputDescripcion').value;
    const categoria = document.getElementById('selectCategoria').value;
    const fecha = document.getElementById('inputFecha').value;

    if (!monto || monto <= 0) {
        alert('Ingresá un monto válido');
        return;
    }

    if (!fecha) {
        alert('Seleccioná una fecha');
        return;
    }

    const gasto = {
        monto: Number(monto),
        descripcion: descripcion || 'Gasto',
        categoria: categoria || 'Sin categoría',
        fecha: new Date(fecha + 'T12:00:00').toISOString()
    };

    await guardarDato('gastos', gasto);

    document.getElementById('inputMonto').value = '';
    document.getElementById('inputDescripcion').value = '';
    document.getElementById('selectCategoria').value = '';
    document.getElementById('inputFecha').value = '';
    modalGasto.classList.remove('activo');

    cargarSaldo();
    cargarUltimasTransacciones();
    cargarGastos();
});

async function cargarGastos() {
    const gastos = await obtenerTodos('gastos');
    const lista = document.getElementById('listaGastos');
    lista.innerHTML = '';

    if (gastos.length === 0) {
        lista.innerHTML = '<li class="empty-msg">No hay gastos aún</li>';
        actualizarGrafico([]);
        return;
    }

    gastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    gastos.forEach(g => {
        const fecha = new Date(g.fecha).toLocaleDateString('es-AR');
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <p class="transaccion-desc">${g.descripcion}</p>
                <p class="transaccion-detalle">${g.categoria} · ${fecha}</p>
            </div>
            <div class="transaccion-acciones">
                <p class="transaccion-monto egreso">-$${Number(g.monto).toLocaleString('es-AR')}</p>
                <button class="btn-eliminar-categoria" data-id="${g.id}" data-store="gastos">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
        lista.appendChild(li);
    });

    document.querySelectorAll('[data-store="gastos"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await eliminarDato('gastos', Number (btn.dataset.id));
            cargarSaldo();
            cargarUltimasTransacciones();
            cargarGastos();
        });
    });

    actualizarGrafico(gastos);
}

// Gastos: Gráfico //

let graficoInstancia = null;

function actualizarGrafico(gastos) {
    const periodoActivo = document.querySelector('.periodo-btn.active').dataset.periodo;

    const ahora = new Date();
    const gastosFiltrados = gastos.filter(g => {
        const fecha = new Date(g.fecha);
        if (periodoActivo === 'dia') {
            return fecha.toDateString() === ahora.toDateString();
        } else if (periodoActivo === 'semana') {
            const diff = (ahora - fecha) / (1000 * 60 * 60 * 24);
            return diff <= 7;
        } else {
            return fecha.getMonth() === ahora.getMonth() &&
                   fecha.getFullYear() === ahora.getFullYear();
        }
    });

    const totalesPorCategoria = {};
    gastosFiltrados.forEach(g => {
        const cat = g.categoria || 'Sin categoría';
        totalesPorCategoria[cat] = (totalesPorCategoria[cat] || 0) + Number(g.monto);
    });

    const labels = Object.keys(totalesPorCategoria);
    const datos = Object.values(totalesPorCategoria);
    const total = datos.reduce((acc, v) => acc + v, 0);

    document.getElementById('graficoMontoTotal').textContent = '$' + total.toLocaleString('es-AR');

    const labelPeriodo = { dia: 'Hoy', semana: 'Esta semana', mes: 'Este mes' };
    document.getElementById('graficoFechaLabel').textContent = labelPeriodo[periodoActivo];

    const ctx = document.getElementById('graficoDona').getContext('2d');

    if (graficoInstancia) {
        graficoInstancia.destroy();
    }

    if (labels.length === 0) {
        document.getElementById('graficoMontoTotal').textContent = '$0';
        return;
    }

    graficoInstancia = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: datos,
                backgroundColor: [
                    '#7C5CFC', '#22C55E', '#EF4444',
                    '#F59E0B', '#3B82F6', '#EC4899'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true
        }
    });
}

document.querySelectorAll('.periodo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cargarGastos();
    });
});

// Ahorros //

const modalMeta = document.getElementById('modalMeta');
const btnAbrirModalMeta = document.getElementById('btnAbrirModalMeta');
const btnCerrarModalMeta = document.getElementById('btnCerrarModalMeta');

btnAbrirModalMeta.addEventListener('click', () => {
    modalMeta.classList.add('activo');
});

btnCerrarModalMeta.addEventListener('click', () => {
    modalMeta.classList.remove('activo');
});

modalMeta.addEventListener('click', (e) => {
    if (e.target === modalMeta) modalMeta.classList.remove('activo');
});

document.getElementById('btnGuardarMeta').addEventListener('click', async () => {
    const nombre = document.getElementById('inputNombreMeta').value;
    const monto = document.getElementById('inputMontoMeta').value;
    const fecha = document.getElementById('inputFechaMeta').value;

    if (!nombre) {
        alert('Ingresá un nombre para la meta');
        return;
    }

    if (!monto || monto <= 0) {
        alert('Ingresá un monto válido');
        return;
    }

    const meta = {
        nombre: nombre,
        montoObjetivo: Number(monto),
        montoActual: 0,
        fecha: fecha || null
    };

    await guardarDato('metas', meta);

    document.getElementById('inputNombreMeta').value = '';
    document.getElementById('inputMontoMeta').value = '';
    document.getElementById('inputFechaMeta').value = '';
    modalMeta.classList.remove('activo');

    cargarMetas();
});

let metaSeleccionadaId = null;

async function cargarMetas() {
    const metas = await obtenerTodos('metas');
    const lista = document.getElementById('listaMetas');
    lista.innerHTML = '';

    const totalAhorrado = metas.reduce((acc, m) => acc + m.montoActual, 0);
    document.getElementById('ahorroTotal').textContent = '$' + totalAhorrado.toLocaleString('es-AR');

    if (metas.length === 0) {
        lista.innerHTML = '<p class="empty-msg">No tenés metas de ahorro todavía</p>';
        return;
    }

    metas.forEach(m => {
        const porcentaje = m.montoObjetivo > 0
            ? Math.min((m.montoActual / m.montoObjetivo) * 100, 100)
            : 0;

        const fechaTexto = m.fecha
            ? new Date(m.fecha + 'T12:00:00').toLocaleDateString('es-AR')
            : 'Sin fecha límite';

        const div = document.createElement('div');
        div.classList.add('meta-card');
        div.innerHTML = `
            <div class="meta-card-header">
                <p class="meta-nombre">${m.nombre}</p>
                <div class="meta-acciones">
                    <button class="btn-agregar-ahorro" data-id="${m.id}">
                        <i class="ri-add-circle-line"></i>
                    </button>
                    <button class="btn-eliminar-categoria" data-id="${m.id}" data-store="metas">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
            <p class="meta-montos">$${m.montoActual.toLocaleString('es-AR')} de $${m.montoObjetivo.toLocaleString('es-AR')}</p>
            <div class="meta-barra-fondo">
                <div class="meta-barra-progreso" style="width: ${porcentaje}%"></div>
            </div>
            <p class="meta-proyeccion">${fechaTexto} · ${porcentaje.toFixed(0)}% completado</p>
        `;
        lista.appendChild(div);
    });

    document.querySelectorAll('.btn-agregar-ahorro').forEach(btn => {
        btn.addEventListener('click', () => {
            metaSeleccionadaId = Number(btn.dataset.id);
            document.getElementById('modalAgregarAhorro').classList.add('activo');
        });
    });

    document.querySelectorAll('[data-store="metas"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await eliminarDato('metas', Number(btn.dataset.id));
            cargarMetas();
        });
    });
}

document.getElementById('btnCerrarModalAhorro').addEventListener('click', () => {
    document.getElementById('modalAgregarAhorro').classList.remove('activo');
});

document.getElementById('btnConfirmarAhorro').addEventListener('click', async () => {
    const monto = document.getElementById('inputMontoAhorro').value;

    if (!monto || monto <= 0) {
        mostrarToast('Ingresá un monto válido');
        return;
    }

    const metas = await obtenerTodos('metas');
    const meta = metas.find(m => m.id === metaSeleccionadaId);

    if (meta) {
    meta.montoActual += Number(monto);
    await modificarDato('metas', meta);
    
    if (meta.montoActual >= Number(meta.montoObjetivo)) {
        mostrarToast('¡Felicitaciones! Completaste tu meta');
    } else {
        mostrarToast('Ahorro agregado');
    }
}

    document.getElementById('inputMontoAhorro').value = '';
    document.getElementById('modalAgregarAhorro').classList.remove('activo');
    cargarMetas();
});

// Utilidades //

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

// Ajustes //

document.getElementById('btnGuardarPerfil').addEventListener('click', () => {
    const nombre = document.getElementById('inputNombreUsuario').value;
    const sueldo = document.getElementById('inputSueldoEstimado').value;

    if (nombre) localStorage.setItem('nombre', nombre);
    if (sueldo) localStorage.setItem('sueldoEstimado', sueldo);

    cargarNombre();
    cargarSaldo();
    mostrarToast('Perfil guardado');
});

function cargarPerfil() {
    const nombre = localStorage.getItem('nombre') || '';
    const sueldo = localStorage.getItem('sueldoEstimado') || '';
    document.getElementById('inputNombreUsuario').value = nombre;
    document.getElementById('inputSueldoEstimado').value = sueldo;
}

async function cargarCategorias() {
    let categorias = await obtenerTodos('categorias');

    if (categorias.length === 0) {
        const porDefecto = ['Alquiler', 'Comida', 'Transporte', 'Salud', 'Entretenimiento', 'Ropa'];
        for (const nombre of porDefecto) {
            await guardarDato('categorias', { nombre });
        }
        categorias = await obtenerTodos('categorias');
    }

    const lista = document.getElementById('listaCategorias');
    lista.innerHTML = '';

    categorias.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${cat.nombre}</span>
            <button class="btn-eliminar-categoria" data-id="${cat.id}" data-store="categorias">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        lista.appendChild(li);
    });

    document.querySelectorAll('[data-store="categorias"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await eliminarDato('categorias', Number(btn.dataset.id));
            cargarCategorias();
        });
    });

    llenarSelectsCategorias(categorias);
}

function llenarSelectsCategorias(categorias) {
    const selects = [
        document.getElementById('selectCategoria'),
        document.getElementById('selectCategoriaRapido')
    ];

    selects.forEach(select => {
        if (!select) return;
        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccioná una categoría</option>';
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.nombre;
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
        select.value = valorActual;
    });
}

document.getElementById('btnAgregarCategoria').addEventListener('click', async () => {
    const input = document.getElementById('inputNuevaCategoria');
    const nombre = input.value.trim();

    if (!nombre) {
        alert('Ingresá un nombre para la categoría');
        return;
    }

    await guardarDato('categorias', { nombre });
    input.value = '';
    cargarCategorias();
});

// Offline - Online //

function actualizarEstadoConexion() {
    const banner = document.getElementById('offlineBanner');
    if (navigator.onLine) {
        banner.classList.remove('activo');
    } else {
        banner.classList.add('activo');
    }
}

window.addEventListener('online', actualizarEstadoConexion);
window.addEventListener('offline', actualizarEstadoConexion);



// Inicialización //

function init(){
    mostrarSeccion('home');

    const temaGuardado = localStorage.getItem('tema');
    aplicarTema(temaGuardado !== 'claro');

    cargarNombre();
    cargarSaldo();
    cargarUltimasTransacciones();
    cargarGastos();
    cargarMetas();
    cargarPerfil();
    cargarCategorias();
    actualizarEstadoConexion();
}

