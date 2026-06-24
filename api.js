// API: Speech Synthesis //
async function leerResumen() {
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

    const mensaje = totalIngresos === 0 && totalGastos === 0
    ? `Bienvenido a Kash. Todavía no registraste ningún ingreso ni gasto este mes.`
    : `Resumen del mes. 
       Ingresaste ${totalIngresos.toLocaleString('es-AR')} pesos. 
       Gastaste ${totalGastos.toLocaleString('es-AR')} pesos. 
       Tu saldo disponible es de ${saldo.toLocaleString('es-AR')} pesos.`;

    
    const utterance = new SpeechSynthesisUtterance(mensaje);
    utterance.lang = 'es-AR';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;    

    const voces = speechSynthesis.getVoices();
    const vozEspanol = voces.find(v => v.lang.includes('es') && v.localService) || 
                       voces.find(v => v.lang.includes('es'));
    if (vozEspanol) utterance.voice = vozEspanol;

    speechSynthesis.cancel();
    setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 100);
}