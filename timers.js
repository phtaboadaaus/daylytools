/**
 * LÓGICA DEL TEMPORIZADOR CON SELECTOR MODAL - Daily Tools
 */

let timerInterval = null;
let totalSeconds = 0;
let selectedH = 0, selectedM = 0, selectedS = 0;

// Referencias al DOM
const timerDisplay = document.querySelector('#timer-module #timer-display');
const pickerModalElement = document.getElementById('modal-picker');
let pickerModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar el Modal de Materialize
    pickerModalInstance = M.Modal.init(pickerModalElement, {
        dismissible: true,
        onCloseEnd: () => {
            updateDigitalDisplay();
        }
    });
	
    // Botón LISTO del modal
    const btnClose = document.getElementById('btn-close-picker');
    if (btnClose) {
        btnClose.onclick = () => {
            updateDigitalDisplay(); 
            pickerModalInstance.close(); 
        };
    }

    // 2. Crear las ruedas de scroll
    createWheel('picker-hours', 23);
    createWheel('picker-mins', 59);
    createWheel('picker-secs', 59);

    // 3. Asignar eventos a botones principales
    document.getElementById('timer-start').onclick = startTimer;
    document.getElementById('timer-stop').onclick = stopTimer;
    document.getElementById('timer-reset').onclick = resetTimer;
});

/**
 * Crea las opciones de las ruedas de desplazamiento
 */
function createWheel(id, max) {
    const wheel = document.getElementById(id);
    if (!wheel) return;

    wheel.innerHTML = '';
    for (let i = 0; i <= max; i++) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.innerText = String(i).padStart(2, '0');
        wheel.appendChild(item);
    }

    // Listener de scroll para capturar el valor seleccionado
    wheel.addEventListener('scroll', () => {
        clearTimeout(wheel.scrollTimeout);
        wheel.scrollTimeout = setTimeout(() => {
            const index = Math.round(wheel.scrollTop / 40);
            wheel.scrollTo({ top: index * 40, behavior: 'smooth' });

            // Guardar valores según el ID
            if (id === 'picker-hours') selectedH = index;
            if (id === 'picker-mins') selectedM = index;
            if (id === 'picker-secs') selectedS = index;
        }, 100);
    });
}

/**
 * Actualiza el texto del cronómetro basado en los pickers
 */
function updateDigitalDisplay() {
    totalSeconds = (selectedH * 3600) + (selectedM * 60) + selectedS;
    const h = String(selectedH).padStart(2, '0');
    const m = String(selectedM).padStart(2, '0');
    const s = String(selectedS).padStart(2, '0');
    timerDisplay.innerText = `${h}:${m}:${s}`;
}

/**
 * Inicia el conteo regresivo
 */
function startTimer() {
    if (timerInterval) return; // Evitar múltiples intervalos

    if (totalSeconds <= 0) {
        M.toast({ html: 'Selecciona un tiempo primero', classes: 'rounded' });
        return;
    }

    // Intentar desbloquear canal de audio si la función existe
    if (typeof mantenerAudioActivo === 'function') mantenerAudioActivo();

    timerDisplay.style.color = "#e57373"; // Color activo (rojizo)

    timerInterval = setInterval(() => {
        totalSeconds--;

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerDisplay.innerText = "00:00:00";
            timerDisplay.style.color = "#26a69a"; // Volver al color original
            
            // LANZAR NOTIFICACIÓN
            // IMPORTANTE: Aquí NO llamamos a resetTimer() porque resetTimer() apaga el audio.
            if (typeof notify === "function") {
                notify("timer_notif_title", "timer_notif_ended", "timer");
            } else {
                alert("¡Tiempo agotado!");
            }
            return;
        }

        // Formatear HH:MM:SS
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        timerDisplay.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
}

/**
 * Pausa el temporizador
 */
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerDisplay.style.color = "#26a69a";
        
        // Si paramos el timer manualmente, paramos el audio
        if (typeof detenerAudio === 'function') detenerAudio();
    }
}

/**
 * Reinicia el temporizador a cero
 */
function resetTimer() {
    // Primero detenemos el intervalo
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Detener audio y limpiar notificaciones
    if (typeof detenerAudio === 'function') detenerAudio();

    // Resetear variables y pickers
    selectedH = 0;
    selectedM = 0;
    selectedS = 0;
    totalSeconds = 0;

    const wheels = ['picker-hours', 'picker-mins', 'picker-secs'];
    wheels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    });

    timerDisplay.style.color = "#26a69a";
    updateDigitalDisplay();
}
