document.addEventListener('DOMContentLoaded', function() {
    // --- VARIABLES DE ESTADO (ESTAS MANDAN) ---
    let workMinutes = 25;
    let breakMinutes = 5;
    let totalCycles = 4;
    let currentCycle = 0;
    let isWork = true;
    let seconds = 0;
    let remainingMinutes = 25; 
    let pomodoroInterval = null;

    const display = document.getElementById('pomodoro-display');
    const sessionDisplay = document.getElementById('pomodoro-sessions');

    // --- POSICIONADOR DE RODILLOS ---
    function syncPickersToValues(w, b, c) {
        const pW = document.getElementById('picker-pomo-work');
        const pB = document.getElementById('picker-pomo-break');
        const pC = document.getElementById('picker-pomo-cycles');

        if (pW) pW.scrollTop = (w - 1) * 40;
        if (pB) pB.scrollTop = (b - 1) * 40;
        if (pC) pC.scrollTop = (c - 1) * 40;
        
        setTimeout(updateSelectedStyle, 50);
    }

    // --- LECTURA SEGURA DE VALORES ---
    function getVal(id, fallback) {
        const container = document.getElementById(id);
        if (!container) return fallback;
        const index = Math.round(container.scrollTop / 40);
        const divs = container.querySelectorAll('.picker-wheel div');
        const targetDiv = divs[index + 1];
        if (!targetDiv || targetDiv.textContent.trim() === "") return fallback;
        const val = parseInt(targetDiv.textContent);
        return (val && !isNaN(val)) ? val : fallback;
    }

    function initPickers() {
        const wheels = [
            { id: 'picker-pomo-work', max: 60 },
            { id: 'picker-pomo-break', max: 30 },
            { id: 'picker-pomo-cycles', max: 10 }
        ];
        wheels.forEach(w => {
            const el = document.querySelector(`#${w.id} .picker-wheel`);
            if (el) {
                el.innerHTML = '<div></div>';
                for (let i = 1; i <= w.max; i++) {
                    const div = document.createElement('div');
                    div.textContent = i;
                    el.appendChild(div);
                }
                el.appendChild(document.createElement('div'));
            }
        });
    }

    // --- OBSERVER PARA EL MODAL ---
    const modalPomo = document.getElementById('modal-pomodoro-settings');
    if (modalPomo) {
        const observer = new MutationObserver(() => {
            if (window.getComputedStyle(modalPomo).display === 'block') {
                setTimeout(() => syncPickersToValues(workMinutes, breakMinutes, totalCycles), 50);
            }
        });
        observer.observe(modalPomo, { attributes: true, attributeFilter: ['style'] });
    }

    function updateSelectedStyle() {
        ['picker-pomo-work', 'picker-pomo-break', 'picker-pomo-cycles'].forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            const index = Math.round(container.scrollTop / 40) + 1;
            const divs = container.querySelectorAll('.picker-wheel div');
            divs.forEach((d, i) => d.classList.toggle('selected', i === index));
        });
    }

    function updateDisplay() {
        if (display) {
            display.textContent = `${String(remainingMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Cambiar color según la fase
            if (isWork) {
                display.classList.add('timer-work');
                display.classList.remove('timer-break');
            } else {
                display.classList.add('timer-break');
                display.classList.remove('timer-work');
            }
        }
        if (sessionDisplay) sessionDisplay.textContent = currentCycle;
    }
	

  function startPomodoro() {
        if (pomodoroInterval) return;

        if (seconds === 0 && remainingMinutes === workMinutes) {
            remainingMinutes = workMinutes;
        }

        pomodoroInterval = setInterval(() => {
            if (seconds === 0) {
                if (remainingMinutes === 0) {
                    isWork = !isWork;
                    if (!isWork) {
                        remainingMinutes = breakMinutes;
                        // --- AQUÍ LA NOTIFICACIÓN DE DESCANSO ---
                        notify("pomo_notif_title", "pomo_notif_break");
                    } else {
                        currentCycle++;
                        if (currentCycle >= totalCycles) {
                            // --- AQUÍ LA NOTIFICACIÓN DE FIN TOTAL ---
                            notify("pomo_notif_title", "pomo_notif_finished");
                            resetPomodoro();
                            return;
                        }
                        remainingMinutes = workMinutes;
                        // --- AQUÍ LA NOTIFICACIÓN DE TRABAJO ---
                        notify("pomo_notif_title", "pomo_notif_work");
                    }
                    seconds = 0;
                } else {
                    remainingMinutes--;
                    seconds = 59;
                }
            } else {
                seconds--;
            }
            updateDisplay();
        }, 1000);
    }

    function stopPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
    }

    function resetPomodoro() {
        stopPomodoro();
        currentCycle = 0;
        isWork = true; // Al resetear volvemos a fase de trabajo
        seconds = 0;
        workMinutes = 25;
        breakMinutes = 5;
        totalCycles = 4;
        remainingMinutes = 25;
        
        updateDisplay(); // Esto aplicará el color rojo de "trabajo" inmediatamente
        syncPickersToValues(25, 5, 4);
    }

    // Eventos de botones
    document.getElementById('pomodoro-start').onclick = startPomodoro;
    document.getElementById('pomodoro-stop').onclick = stopPomodoro;
    document.getElementById('pomodoro-reset').onclick = resetPomodoro;

    // Configuración de scroll para los contenedores
    ['picker-pomo-work', 'picker-pomo-break', 'picker-pomo-cycles'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('scroll', () => {
            updateSelectedStyle();
            clearTimeout(el.scrollTimeout);
            el.scrollTimeout = setTimeout(() => {
                const targetY = Math.round(el.scrollTop / 40) * 40;
                el.scrollTo({ top: targetY, behavior: 'smooth' });
                
                // Solo actualizamos las variables si el cronómetro NO está corriendo
                if (!pomodoroInterval) {
                    if (id === 'picker-pomo-work') {
                        workMinutes = getVal(id, 25);
                        remainingMinutes = workMinutes;
                        updateDisplay();
                    } else if (id === 'picker-pomo-break') {
                        breakMinutes = getVal(id, 5);
                    } else if (id === 'picker-pomo-cycles') {
                        totalCycles = getVal(id, 4);
                    }
                }
            }, 150);
        });
    });

    // Botón LISTO
    const doneBtn = document.querySelector('#modal-pomodoro-settings .modal-close');
    if (doneBtn) {
        doneBtn.onclick = () => {
            if (!pomodoroInterval) {
                workMinutes = getVal('picker-pomo-work', 25);
                breakMinutes = getVal('picker-pomo-break', 5);
                totalCycles = getVal('picker-pomo-cycles', 4);
                remainingMinutes = workMinutes;
                seconds = 0;
                updateDisplay();
            }
        };
    }

    initPickers();
    setTimeout(resetPomodoro, 200);
});