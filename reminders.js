/**
 * LÓGICA DE RECORDATORIOS (REMINDERS.JS)
 */
let reminders = JSON.parse(localStorage.getItem('reminders')) || [];
const remindersListEl = document.getElementById('reminders-list');

/**
 * Guarda los recordatorios en el almacenamiento local
 */
function saveReminders() { 
    localStorage.setItem('reminders', JSON.stringify(reminders)); 
}

/**
 * Dibuja la lista de recordatorios con el detalle central editable
 */
function renderReminders() {
    remindersListEl.innerHTML = '';
    const lang = localStorage.getItem('lang') || 'es';
    
    // Traducciones locales para el selector de periodicidad
    const texts = {
        es: { once: '1 vez', min5: '5 min', daily: 'Diario' },
        en: { once: 'Once', min5: '5 min', daily: 'Daily' },
        it: { once: '1 volta', min5: '5 min', daily: 'Quotidiano' }
    };
    const t = texts[lang] || texts['es'];

    reminders.forEach((r, i) => {
        const li = document.createElement('li');
        li.className = 'reminder-item card-panel grey lighten-4';
        // Diseño flex optimizado: Periodicidad | Detalle (flexible) | Hora | Borrar
        li.style = "display: flex; align-items: center; padding: 10px; gap: 15px; margin-bottom: 10px; flex-wrap: nowrap;";

        // 1. Selector de Frecuencia
        const selectRepeat = document.createElement('select');
        selectRepeat.className = 'browser-default';
        selectRepeat.style = "width: 90px; border: 1px solid #ddd; border-radius: 4px; padding: 2px; background: white;";
        const options = [
            {v: 'once', txt: t.once},
            {v: '5min', txt: t.min5},
            {v: 'daily', txt: t.daily}
        ];
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.v;
            o.textContent = opt.txt;
            if(r.repeat === opt.v) o.selected = true;
            selectRepeat.appendChild(o);
        });
        selectRepeat.onchange = () => { 
            r.repeat = selectRepeat.value; 
            r.notified = false; 
            saveReminders(); 
        };

        // 2. Detalle del Recordatorio (Editable y Flexible)
        const inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.value = r.text;
        // flex-grow: 1 permite que el texto ocupe todo el espacio disponible
        inputText.style = "margin: 0; border-bottom: 1px solid #ccc; flex-grow: 1; padding: 5px; background: transparent;";
        inputText.onchange = () => { 
            r.text = inputText.value; 
            saveReminders(); 
        };

        // 3. Hora (Editable mediante Timepicker)
        const inputTime = document.createElement('input');
        inputTime.type = 'text';
        inputTime.value = r.time;
        inputTime.style = "width: 65px; margin: 0; text-align: center; cursor: pointer; border: none; font-weight: bold; background: transparent; color: #26a69a;";
        inputTime.readOnly = true;

        // 4. Botón Borrar
        const del = document.createElement('button');
        del.className = 'btn-flat waves-effect waves-red';
        del.style = "padding: 0 5px;";
        del.innerHTML = '<i class="material-icons red-text text-lighten-2">delete</i>';
        del.onclick = () => { 
            reminders.splice(i, 1); 
            saveReminders(); 
            renderReminders(); 
        };

        // Construir el elemento en orden
        li.appendChild(selectRepeat);
        li.appendChild(inputText);
        li.appendChild(inputTime);
        li.appendChild(del);
        remindersListEl.appendChild(li);

        // Inicializar el Timepicker para la edición de hora en la lista
        M.Timepicker.init(inputTime, {
            twelveHour: false,
            container: 'body',
            onSelect: (h, m) => {
                r.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                r.notified = false;
                saveReminders();
                renderReminders();
            }
        });
    });
}

/**
 * Agrega un nuevo recordatorio desde el formulario
 */
function addReminder() {
    const textInput = document.getElementById('reminder-text');
    const timeInput = document.getElementById('reminder-time');
    const repeat = document.getElementById('reminder-repeat').value;
    const lang = localStorage.getItem('lang') || 'es';
    
    if (!textInput.value.trim() || !timeInput.value) {
        const errorMsg = (window.i18n && i18n[lang]) ? i18n[lang]['reminder_error'] : 'Completa los campos';
        M.toast({html: errorMsg});
        return;
    }

    reminders.push({ 
        text: textInput.value.trim(), 
        time: timeInput.value, 
        repeat, 
        notified: false, 
        lastNotifiedDay: null,
        lastTimestamp: Date.now() 
    });

    saveReminders();
    renderReminders();
    
    // Limpiar campos del formulario
    textInput.value = '';
    timeInput.value = '';
}

/**
 * Bucle de verificación de alarmas (cada 10 segundos)
 */
setInterval(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toDateString();
    let changed = false;

    reminders.forEach(r => {
        if (r.time === hhmm) {
            let shouldNotify = false;

            if (r.repeat === 'once' && !r.notified) { 
                shouldNotify = true; 
                r.notified = true; 
            } else if (r.repeat === 'daily' && r.lastNotifiedDay !== today) { 
                shouldNotify = true; 
                r.lastNotifiedDay = today; 
            } else if (r.repeat === '5min') {
                const lastTs = r.lastTimestamp || 0;
                if (Date.now() - lastTs > 300000) { 
                    shouldNotify = true; 
                    r.lastTimestamp = Date.now(); 
                }
            }

            if (shouldNotify) {
                // USAMOS EL SERVICIO GLOBAL CENTRALIZADO notify.js
                if (typeof notify === "function") {
                    notify("reminder_notif_title", r.text, "reminders");
                }
                changed = true;
            }
        }
    });
    if (changed) saveReminders();
}, 10000);

/**
 * Inicialización al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Timepicker del formulario principal
    const timeElems = document.querySelectorAll('.timepicker');
    M.Timepicker.init(timeElems, { 
        twelveHour: false, 
        container: 'body',
        doneText: 'OK',
        cancelText: 'Cerrar'
    });
    
    renderReminders();
});