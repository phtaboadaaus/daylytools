/**
 * LÓGICA DEL TEMPORIZADOR CON SELECTOR MODAL
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

    // 4. Lógica de Presets (Botones de acceso rápido)
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => {
            stopTimer();
            const mins = parseInt(btn.getAttribute('data-time'));
            selectedH = 0;
            selectedM = mins;
            selectedS = 0;
            
            // Sincronizar las ruedas visualmente
            setWheelValue('picker-hours', 0);
            setWheelValue('picker-mins', mins);
            setWheelValue('picker-secs', 0);
            
            updateDigitalDisplay();
        };
    });
});

/**
 * Abre el modal del selector si el timer no está corriendo
 */
function openTimerPicker() {
    if (timerInterval) return; 
    pickerModalInstance.open();
}

/**
 * Crea la lista de números en la rueda de scroll
 */
function createWheel(id, max) {
    const viewport = document.getElementById(id);
    if (!viewport) return;
    const wheel = viewport.querySelector('.picker-wheel');
    
    wheel.innerHTML = '<div class="picker-spacer" style="height:40px;"></div>'; 
    for (let i = 0; i <= max; i++) {
        const num = document.createElement('div');
        num.className = 'picker-number';
        num.textContent = String(i).padStart(2, '0');
        wheel.appendChild(num);
    }
    wheel.innerHTML += '<div class="picker-spacer" style="height:40px;"></div>';

    // Listener de scroll para detectar el número central
    viewport.addEventListener('scroll', () => {
        if (timerInterval) return;
        const index = Math.round(viewport.scrollTop / 40);
        const numbers = wheel.querySelectorAll('.picker-number');
        
        numbers.forEach(n => n.classList.remove('selected'));
        if (numbers[index]) {
            numbers[index].classList.add('selected');
            const val = parseInt(numbers[index].textContent);
            
            if (id === 'picker-hours') selectedH = val;
            if (id === 'picker-mins') selectedM = val;
            if (id === 'picker-secs') selectedS = val;
            
            updateDigitalDisplay();
        }
    });
}

/**
 * Mueve el scroll de la rueda a una posición específica
 */
function setWheelValue(id, value) {
    const viewport = document.getElementById(id);
    if (viewport) {
        viewport.scrollTo({
            top: value * 40,
            behavior: 'smooth'
        });
    }
}

/**
 * Actualiza el texto HH:MM:SS en el display principal
 */
function updateDigitalDisplay() {
    // Calculamos el total basado en lo que el usuario movió en las ruedas
    totalSeconds = (selectedH * 3600) + (selectedM * 60) + selectedS;
    
    const h = String(selectedH).padStart(2, '0');
    const m = String(selectedM).padStart(2, '0');
    const s = String(selectedS).padStart(2, '0');
    
    if (timerDisplay) {
        timerDisplay.innerText = `${h}:${m}:${s}`;
    }
}
/**
 * Inicia la cuenta atrás y maneja la alarma al finalizar
 */
function startTimer() {
    if (timerInterval) return;

    // Si después de calcular sigue en 0, entonces sí avisamos
    if (totalSeconds <= 0) {
		const lang = localStorage.getItem('lang') || 'es';
		const msg = (window.i18n && i18n[lang] && i18n[lang]['timer_set_time']) 
                    ? i18n[lang]['timer_set_time'] : 'Toca el reloj para ajustar';
        M.toast({ html:msg});
        return;
    }

    // Activamos el canal de audio "fantasma" para que el navegador no bloquee el sonido final
    if (typeof mantenerAudioActivo === 'function') mantenerAudioActivo();

    timerDisplay.style.color = "#e57373";

    timerInterval = setInterval(() => {
        totalSeconds--;

        if (totalSeconds <= 0) {
            // 1. Detenemos el reloj inmediatamente
            clearInterval(timerInterval);
            timerInterval = null;
            timerDisplay.innerText = "00:00:00";
            timerDisplay.style.color = "#26a69a";
            
            // 2. Ejecutamos la notificación con un pequeño retraso de 100ms
            // Esto evita que el audio se corte por procesos residuales del setInterval
            setTimeout(() => {
                if (typeof notify === "function") {
                    notify("timer_notif_title", "timer_notif_ended", "timer");
                }
            }, 300);

            return;
        }

        // Actualización visual del tiempo
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
    // Si paramos el timer manualmente, silenciamos el audio global
    if (typeof detenerAudio === 'function') detenerAudio();
}

/**
 * Reinicia todo a cero y resetea las ruedas
 */
function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (typeof detenerAudio === 'function') detenerAudio();

    selectedH = 0; selectedM = 0; selectedS = 0;
    totalSeconds = 0;

    // Devolvemos los rodillos al inicio visualmente
    ['picker-hours', 'picker-mins', 'picker-secs'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    });

    timerDisplay.style.color = "#26a69a";
    updateDigitalDisplay();
}




