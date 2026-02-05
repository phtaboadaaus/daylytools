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
    
    // Abrir modal al hacer click en el display
    timerDisplay.onclick = () => {
        if (!timerInterval) pickerModalInstance.open();
    };
});

/**
 * Crea las opciones de las ruedas de desplazamiento y gestiona el estilo
 */
function createWheel(id, max) {
    const wheel = document.getElementById(id);
    if (!wheel) return;

    wheel.innerHTML = '';
    // Espacio vacío arriba para centrar el primer número
    const spacerTop = document.createElement('div');
    spacerTop.style.height = "80px";
    wheel.appendChild(spacerTop);

    for (let i = 0; i <= max; i++) {
        const item = document.createElement('div');
        item.className = 'wheel-item';
        item.innerText = String(i).padStart(2, '0');
        wheel.appendChild(item);
    }

    // Espacio vacío abajo
    const spacerBottom = document.createElement('div');
    spacerBottom.style.height = "80px";
    wheel.appendChild(spacerBottom);

    wheel.addEventListener('scroll', () => {
        clearTimeout(wheel.scrollTimeout);
        wheel.scrollTimeout = setTimeout(() => {
            const index = Math.round(wheel.scrollTop / 40);
            const targetY = index * 40;
            
            wheel.scrollTo({ top: targetY, behavior: 'smooth' });

            if (id === 'picker-hours') selectedH = index;
            if (id === 'picker-mins') selectedM = index;
            if (id === 'picker-secs') selectedS = index;

            updateSelectedStyle(wheel);
        }, 150);
    });
}

function updateSelectedStyle(wheel) {
    const items = wheel.querySelectorAll('.wheel-item');
    const centerIndex = Math.round(wheel.scrollTop / 40);
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === centerIndex);
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
    if (timerInterval) return;

    if (totalSeconds <= 0) {
        M.toast({ html: 'Selecciona un tiempo', classes: 'rounded' });
        return;
    }

    // Desbloquear audio
    if (typeof mantenerAudioActivo === 'function') mantenerAudioActivo();

    timerDisplay.style.color = "#e57373";

    timerInterval = setInterval(() => {
        totalSeconds--;

        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerDisplay.innerText = "00:00:00";
            timerDisplay.style.color = "#26a69a";
            
            // --- EL ARREGLO ESTÁ AQUÍ ---
            // Lanzamos la notificación
            if (typeof notify === "function") {
                notify("timer_notif_title", "timer_notif_ended", "timer");
            }
            // NO llamamos a resetTimer() para que no se apague el sonido
            return;
        }

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
    }
    // Si el usuario le da a STOP, entendemos que quiere silenciar la alarma también
    if (typeof detenerAudio === 'function') detenerAudio();
}

/**
 * Reinicia el temporizador
 */
function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (typeof detenerAudio === 'function') detenerAudio();

    selectedH = 0; selectedM = 0; selectedS = 0;
    totalSeconds = 0;

    const wheels = ['picker-hours', 'picker-mins', 'picker-secs'];
    wheels.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    });

    timerDisplay.style.color = "#26a69a";
    updateDigitalDisplay();
}
